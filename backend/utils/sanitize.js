// Shared input-sanitization helpers.
//
// Real-time socket messages are broadcast to other connected clients and may be
// rendered as HTML by a receiving client, so untrusted message content must be
// length-bounded and HTML-escaped before it leaves the server. This is the
// distilled, server-side ideal form of the "Socket.IO XSS" / "secure socket
// message handlers with input validation" want.

const DEFAULT_MAX_MESSAGE_LENGTH = 2000;

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"'`]/g, (ch) => HTML_ESCAPES[ch]);
}

// Strip ASCII control characters (except tab/newline/carriage-return) that have
// no place in a chat message and can be used to smuggle terminal/formatting
// escape sequences.
function stripControlChars(value) {
  // eslint-disable-next-line no-control-regex
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

/**
 * Sanitize an untrusted real-time message.
 *
 * @param {*} input - raw value from the socket payload
 * @param {object} [opts]
 * @param {number} [opts.maxLength] - hard cap on length (default 2000)
 * @returns {{ ok: boolean, value: string, reason?: string }}
 */
function sanitizeMessage(input, opts = {}) {
  const maxLength = opts.maxLength || DEFAULT_MAX_MESSAGE_LENGTH;

  if (typeof input !== 'string') {
    return { ok: false, value: '', reason: 'MESSAGE_NOT_STRING' };
  }

  const stripped = stripControlChars(input).trim();
  if (stripped.length === 0) {
    return { ok: false, value: '', reason: 'MESSAGE_EMPTY' };
  }

  const bounded = stripped.slice(0, maxLength);
  return { ok: true, value: escapeHtml(bounded) };
}

module.exports = {
  DEFAULT_MAX_MESSAGE_LENGTH,
  escapeHtml,
  stripControlChars,
  sanitizeMessage,
};
