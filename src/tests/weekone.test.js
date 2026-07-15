import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderWeekOne, renderWeekOneError, validateWeekOne, WeekOneFormatError } from '../weekone.js';

const demoPath = fileURLToPath(new URL('../../public/data/demo/week-one.json', import.meta.url));
const demo = () => JSON.parse(readFileSync(demoPath, 'utf-8'));

describe('week-one renderer', () => {
  it('renders the committed demo packet: header + exactly 7 day sections', () => {
    const html = renderWeekOne(demo(), 'DEMO — SYNTHETIC');
    expect((html.match(/wk-day/g) ?? []).length).toBe(7);
    expect(html).toContain('WEEK-ONE // 2030-06-02');
    expect(html).toContain('DEMO — SYNTHETIC');
  });

  it('carries every stop signal — safety rails travel with the plan', () => {
    const packet = demo();
    const html = renderWeekOne(packet);
    expect(packet.stop_signals.length).toBeGreaterThan(0);
    for (const signal of packet.stop_signals) {
      expect(html).toContain(`STOP on: ${signal}`);
    }
  });

  it('refuses a partial week — never renders 6 days as if whole', () => {
    const packet = demo();
    packet.days = packet.days.slice(0, 6);
    expect(() => renderWeekOne(packet)).toThrow(WeekOneFormatError);
  });

  it('refuses a packet whose stop signals were stripped', () => {
    const packet = demo();
    packet.stop_signals = [];
    expect(() => validateWeekOne(packet)).toThrow(WeekOneFormatError);
  });

  it('refuses wrong schema versions and non-objects', () => {
    expect(() => validateWeekOne({ ...demo(), schema_version: 2 })).toThrow(WeekOneFormatError);
    expect(() => validateWeekOne(null)).toThrow(WeekOneFormatError);
    expect(() => validateWeekOne([1, 2, 3])).toThrow(WeekOneFormatError);
  });

  it('escapes packet fields — drag-dropped files are untrusted input', () => {
    const packet = demo();
    packet.intake.goal = '<script>alert("xss")</script>';
    const html = renderWeekOne(packet);
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  it('error state names the refusal and escapes the message', () => {
    const html = renderWeekOneError(new WeekOneFormatError('bad <thing>'));
    expect(html).toContain('WEEK-ONE PACKET REFUSED');
    expect(html).toContain('bad &lt;thing&gt;');
  });
});
