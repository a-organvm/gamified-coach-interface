const { sanitizeMessage, escapeHtml, stripControlChars } = require('../../utils/sanitize');

describe('sanitizeMessage', () => {
  it('escapes HTML so socket messages cannot inject markup/script', () => {
    const res = sanitizeMessage('<script>alert("xss")</script>');
    expect(res.ok).toBe(true);
    expect(res.value).not.toContain('<script>');
    expect(res.value).toContain('&lt;script&gt;');
  });

  it('escapes attribute-breaking characters', () => {
    const res = sanitizeMessage(`hi" onmouseover='x'`);
    expect(res.ok).toBe(true);
    expect(res.value).not.toContain('"');
    expect(res.value).not.toContain("'");
    expect(res.value).toContain('&quot;');
    expect(res.value).toContain('&#x27;');
  });

  it('rejects non-string payloads (type safety)', () => {
    expect(sanitizeMessage({ evil: true }).ok).toBe(false);
    expect(sanitizeMessage(42).ok).toBe(false);
    expect(sanitizeMessage(null).ok).toBe(false);
    expect(sanitizeMessage(undefined).ok).toBe(false);
  });

  it('rejects empty / whitespace-only messages', () => {
    expect(sanitizeMessage('').ok).toBe(false);
    expect(sanitizeMessage('    ').ok).toBe(false);
    expect(sanitizeMessage('\u0000\u0007').ok).toBe(false);
  });

  it('caps message length to prevent broadcast DoS', () => {
    const res = sanitizeMessage('a'.repeat(5000), { maxLength: 100 });
    expect(res.ok).toBe(true);
    expect(res.value.length).toBeLessThanOrEqual(100);
  });

  it('strips control characters', () => {
    expect(stripControlChars('a\u0000b\u0007c')).toBe('abc');
  });

  it('escapeHtml is idempotent-safe on plain text', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});
