import { describe, it, expect } from 'vitest';
import { OrbitalNodes } from '../OrbitalNodes.js';

// Regression: a half-renamed shared-geometry variable made createNodes()
// throw ReferenceError on every page load, which killed init() before any
// UI listener attached — the whole terminal surface went dead on the live
// site. Constructing against a stub scene catches that class of crash.
describe('OrbitalNodes', () => {
  it('creates its five navigation nodes without throwing', () => {
    const added = [];
    const scene = { add: (obj) => added.push(obj) };
    const orbital = new OrbitalNodes(scene, null);
    expect(orbital.nodes.length).toBe(5);
    expect(added.length).toBe(5);
    const ids = orbital.nodes.map((n) => n.userData.id);
    expect(ids).toContain('field-ops');
  });
});
