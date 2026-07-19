const jwt = require('jsonwebtoken');

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../../models/User', () => ({
  findByPk: jest.fn(),
}));

jest.mock('../../services/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

const User = require('../../models/User');
const { refreshToken } = require('../../controllers/authController');

const REFRESH_SECRET = 'test-refresh-secret';

function mockReqResNext(body = {}) {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('refreshToken account-status enforcement', () => {
  beforeAll(() => {
    process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function tokenFor(userId) {
    return jwt.sign({ userId }, REFRESH_SECRET);
  }

  it('blocks a suspended user from refreshing their access token', async () => {
    User.findByPk.mockResolvedValue({ id: 'u1', status: 'suspended', role: 'user' });
    const { req, res, next } = mockReqResNext({ refreshToken: tokenFor('u1') });

    await refreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'ACCOUNT_INACTIVE' })
    );
    expect(res.json).not.toHaveBeenCalled();
  });

  it('blocks an inactive/deleted user just like login does', async () => {
    User.findByPk.mockResolvedValue({ id: 'u2', status: 'deleted', role: 'user' });
    const { req, res, next } = mockReqResNext({ refreshToken: tokenFor('u2') });

    await refreshToken(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, code: 'ACCOUNT_INACTIVE' })
    );
  });

  it('still issues a new token for an active user', async () => {
    User.findByPk.mockResolvedValue({
      id: 'u3', status: 'active', role: 'user', email: 'a@b.c', username: 'u3',
    });
    const { req, res, next } = mockReqResNext({ refreshToken: tokenFor('u3') });

    await refreshToken(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.objectContaining({ token: expect.any(String) }) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
