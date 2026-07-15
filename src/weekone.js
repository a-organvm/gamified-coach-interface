// Week-one packet renderer — the daily-engine L2 artifact on the coach surface.
//
// The packet (week-one.json) is produced by organvm/daily-engine's
// tools/render_week.py: 7 predicate-checked day-cards plus intake snapshot and
// verbatim stop signals. This module renders it read-only for the coach.
//
// Two laws carried from the engine:
//  - REFUSAL, NOT PARTIALS: a malformed packet throws WeekOneFormatError and
//    nothing renders — a partial plan is never shown as if it were whole.
//  - UNTRUSTED INPUT: packets arrive by drag-drop from disk, so every field is
//    escaped before it touches HTML. Pure string construction, no DOM needed
//    (which also keeps it unit-testable without a browser).

export class WeekOneFormatError extends Error {}

export function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function validateWeekOne(packet) {
    if (!packet || typeof packet !== 'object' || Array.isArray(packet)) {
        throw new WeekOneFormatError('packet is not an object');
    }
    if (packet.schema_version !== 1) {
        throw new WeekOneFormatError(`unsupported schema_version: ${packet.schema_version}`);
    }
    if (typeof packet.start_date !== 'string' || !packet.start_date) {
        throw new WeekOneFormatError('missing start_date');
    }
    if (!Array.isArray(packet.stop_signals) || packet.stop_signals.length === 0) {
        throw new WeekOneFormatError('missing stop_signals — safety rails must travel with the plan');
    }
    if (!Array.isArray(packet.days) || packet.days.length !== 7) {
        throw new WeekOneFormatError(`expected exactly 7 checked days, got ${Array.isArray(packet.days) ? packet.days.length : 'none'}`);
    }
    for (const [i, day] of packet.days.entries()) {
        if (!day || typeof day !== 'object' || !day.day || !Array.isArray(day.blocks) || !day.duration) {
            throw new WeekOneFormatError(`day ${i + 1} is not a complete day-card`);
        }
    }
    return packet;
}

const BLOCK_LABELS = {
    cardio_warmup: 'WARM-UP I // CARDIO',
    movement_prep: 'WARM-UP II // MOVEMENT PREP',
    main_block: 'MAIN BLOCK',
    skill_accessory: 'SKILL / ACCESSORY',
    cardio_cooldown: 'COOL-DOWN // CARDIO',
    mobility_cooldown: 'COOL-DOWN // MOBILITY',
};

function doseLine(item) {
    const sets = item.sets ?? 1;
    if (item.hold_seconds) return `${sets} × ${item.hold_seconds}s hold`;
    if (item.reps) return `${sets} × ${item.reps} reps`;
    if (item.duration_seconds) return `${item.duration_seconds}s`;
    return '';
}

function renderItem(item) {
    const dose = doseLine(item);
    const cue = item.cue ? `<div class="wk-cue">${escapeHtml(item.cue)}</div>` : '';
    return `
        <li class="wk-item">
            <span class="wk-item-name">${escapeHtml(item.name ?? item.exercise_id ?? 'movement')}</span>
            ${dose ? `<span class="wk-item-dose">${escapeHtml(dose)}</span>` : ''}
            ${item.instruction ? `<div class="wk-instruction">${escapeHtml(item.instruction)}</div>` : ''}
            ${cue}
        </li>`;
}

function renderBlock(block) {
    if (!Array.isArray(block.items) || block.items.length === 0) return '';
    const label = BLOCK_LABELS[block.kind] ?? String(block.kind ?? 'block').toUpperCase();
    return `
        <div class="wk-block">
            <div class="wk-block-label">${escapeHtml(label)}</div>
            <ul class="wk-items">${block.items.map(renderItem).join('')}</ul>
        </div>`;
}

function renderDay(day, index) {
    const minutes = Math.round((day.duration.computed_seconds ?? 0) / 60);
    const d = day.day;
    return `
        <div class="data-packet wk-day">
            <div class="packet-header">
                <span class="packet-id">DAY ${index + 1} // ${escapeHtml(d.name ?? '')} [${escapeHtml(d.position ?? '')}]</span>
                <span class="packet-timestamp">${escapeHtml(day.date ?? '')} · ~${minutes} min</span>
            </div>
            <div class="packet-content">${day.blocks.map(renderBlock).join('')}</div>
        </div>`;
}

function snapshotRow(label, value) {
    if (value === undefined || value === null || value === '') return '';
    const text = Array.isArray(value) ? value.join(', ') : String(value);
    return `<div class="wk-snap-row"><span class="wk-snap-label">${escapeHtml(label)}:</span> ${escapeHtml(text)}</div>`;
}

// packet -> full panel HTML. Throws WeekOneFormatError on a malformed packet —
// callers render the error state instead; never a partial plan.
export function renderWeekOne(packet, sourceLabel = 'DEMO') {
    validateWeekOne(packet);
    const intake = packet.intake ?? {};
    const header = `
        <div class="data-packet">
            <div class="packet-header">
                <span class="packet-id">WEEK-ONE // ${escapeHtml(packet.start_date)} <span class="wk-badge">${escapeHtml(sourceLabel)}</span></span>
                <span class="packet-timestamp">context: ${escapeHtml(packet.context ?? '')}</span>
            </div>
            <div class="packet-content">
                <div class="wk-snapshot">
                    ${snapshotRow('Goal', intake.goal)}
                    ${snapshotRow('Experience', intake.experience)}
                    ${snapshotRow('Equipment', intake.equipment)}
                    ${snapshotRow('Schedule', intake.schedule)}
                </div>
                <div class="wk-stops">
                    <div class="wk-block-label" style="color: var(--danger-red);">STOP SIGNALS — ON EVERY CARD</div>
                    <ul class="wk-items">
                        ${packet.stop_signals.map((s) => `<li class="wk-item wk-stop">STOP on: ${escapeHtml(s)}</li>`).join('')}
                    </ul>
                    <div class="wk-cue">The engine gives training structure, never medical advice — any pain question goes to the coach.</div>
                </div>
            </div>
        </div>`;
    return header + packet.days.map(renderDay).join('');
}

export function renderWeekOneError(error) {
    return `
        <div class="data-packet" style="border-color: var(--danger-red);">
            <div class="packet-content" style="color: var(--danger-red);">
WEEK-ONE PACKET REFUSED

${escapeHtml(error && error.message ? error.message : String(error))}

A partial plan is never rendered — fix or regenerate the packet
(daily-engine: tools/render_week.py refuses to emit unchecked weeks).
            </div>
        </div>`;
}
