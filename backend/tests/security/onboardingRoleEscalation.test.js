jest.mock('../../config/database', () => ({
  sequelize: { query: jest.fn() },
}));

jest.mock('../../middleware/errorHandler', () => {
  class AppError extends Error {
    constructor(message, statusCode, code = null) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.isOperational = true;
    }
  }
  return { AppError };
});

jest.mock('../../models/User', () => ({
  findByPk: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn(),
}));

jest.mock('../../services/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

const User = require('../../models/User');
const { saveOnboarding } = require('../../controllers/gamificationController');

function mockReqResNext(body = {}) {
  const req = { user: { id: 'user-123' }, body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('saveOnboarding privilege-escalation prevention', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does NOT let a user promote themselves to admin via the onboarding body', async () => {
    const user = {
      id: 'user-123', role: 'user', save: jest.fn().mockResolvedValue(true),
    };
    User.findByPk.mockResolvedValue(user);
    const { req, res, next } = mockReqResNext({ role: 'admin', gamificationStyle: 'rpg' });

    await saveOnboarding(req, res, next);

    expect(user.role).toBe('user');            // role untouched
    expect(user.gamification_style).toBe('rpg'); // preferences still applied
    expect(next).not.toHaveBeenCalled();
    // response must not echo an escalated role
    const payload = res.json.mock.calls[0][0];
    expect(payload.data.user.role).toBe('user');
  });

  it('completes onboarding and persists gamification preferences', async () => {
    const user = { id: 'user-123', role: 'user', save: jest.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);
    const { req, res } = mockReqResNext({ gamificationStyle: 'military', gamificationTheme: 'dark' });

    await saveOnboarding(req, res, jest.fn());

    expect(user.gamification_style).toBe('military');
    expect(user.gamification_theme).toBe('dark');
    expect(user.onboarding_completed).toBe(true);
    expect(user.save).toHaveBeenCalled();
  });
});
