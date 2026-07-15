import { SceneManager } from './SceneManager.js';
import { renderWeekOne, renderWeekOneError } from './weekone.js';

/**
 * Main Application Entry Point
 * Handles boot sequence, UI interactions, and API integration
 */

class LegionCommandCenter {
    constructor() {
        this.sceneManager = null;
        this.currentTerminal = null;
        this.geminiApiKey = null;

        this.init();
    }

    async init() {
        // Start boot sequence
        await this.bootSequence();

        // Initialize 3D scene
        this.initializeScene();

        // Setup UI event listeners
        this.setupUIListeners();

        // Check for API key in localStorage
        this.geminiApiKey = localStorage.getItem('gemini_api_key');
    }

    async bootSequence() {
        const bootScreen = document.getElementById('boot-screen');
        const bootBar = document.getElementById('boot-bar');

        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;

                bootBar.style.width = progress + '%';

                if (progress === 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        bootScreen.classList.add('hidden');
                        resolve();
                    }, 500);
                }
            }, 200);
        });
    }

    initializeScene() {
        const container = document.getElementById('scene-container');
        this.sceneManager = new SceneManager(container);

        // Listen for node activation events
        window.addEventListener('node-activated', (event) => {
            this.handleNodeActivation(event.detail.nodeId);
        });
    }

    setupUIListeners() {
        // Node hint buttons
        const nodeHints = document.querySelectorAll('.node-hint');
        nodeHints.forEach(hint => {
            hint.addEventListener('click', () => {
                const nodeId = hint.getAttribute('data-node');
                this.handleNodeActivation(nodeId);

                // Update active state
                nodeHints.forEach(h => h.classList.remove('active'));
                hint.classList.add('active');
            });
        });

        // Close terminal button
        const closeBtn = document.getElementById('close-terminal');
        closeBtn.addEventListener('click', () => {
            this.closeTerminal();
        });

        // Close terminal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTerminal();
            }
        });
    }

    handleNodeActivation(nodeId) {
        this.currentTerminal = nodeId;
        this.openTerminal(nodeId);
    }

    openTerminal(nodeId) {
        // Store the last focused element to restore later
        this.lastFocusedElement = document.activeElement;

        const modal = document.getElementById('terminal-modal');
        const title = document.getElementById('terminal-title');
        const content = document.getElementById('terminal-content');

        // Get terminal configuration
        const terminalConfig = this.getTerminalConfig(nodeId);

        // Set title
        title.textContent = terminalConfig.title;

        // Set content
        content.innerHTML = terminalConfig.content;

        // Show modal
        modal.classList.add('active');

        // Move focus to the close button for accessibility
        const closeBtn = document.getElementById('close-terminal');
        if (closeBtn) {
            closeBtn.focus();
        }

        // Setup terminal-specific event listeners
        this.setupTerminalListeners(nodeId);
    }

    closeTerminal() {
        const modal = document.getElementById('terminal-modal');
        modal.classList.remove('active');

        // Deactivate node
        this.sceneManager.getOrbitalNodes().deactivateNode();

        // Reset core state
        this.sceneManager.setCoreStat('idle');

        // Clear active hint
        const nodeHints = document.querySelectorAll('.node-hint');
        nodeHints.forEach(h => h.classList.remove('active'));

        // Restore focus to the element that opened the terminal
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    getTerminalConfig(nodeId) {
        const configs = {
            'target-analysis': {
                title: 'TARGET ANALYSIS // STRATEGY FORGE',
                content: this.getStrategyForgeContent()
            },
            'intel-viz': {
                title: 'INTEL VISUALIZATION // DATA MAP',
                content: this.getIntelVizContent()
            },
            'field-ops': {
                title: 'FIELD OPERATIONS // DASHBOARD',
                content: this.getFieldOpsContent()
            },
            'training': {
                title: 'TRAINING PROTOCOLS // SIMULATOR',
                content: this.getTrainingContent()
            },
            'archive': {
                title: 'DATA ARCHIVE // FIELD MANUAL',
                content: this.getArchiveContent()
            }
        };

        return configs[nodeId] || configs['target-analysis'];
    }

    getStrategyForgeContent() {
        return `
            <div class="hologram-input-container">
                <label class="hologram-label" for="target-avatar">TARGET AVATAR PARAMETERS</label>
                <textarea
                    class="hologram-textarea"
                    id="target-avatar"
                    placeholder="Describe your ideal client/fitness warrior...
Example: High-stress tech workers aged 28-40, desk-bound professionals seeking transformation"
                ></textarea>
            </div>

            <div class="hologram-input-container">
                <label class="hologram-label" for="transformation-goals">TRANSFORMATION OBJECTIVES</label>
                <textarea
                    class="hologram-textarea"
                    id="transformation-goals"
                    placeholder="What transformation will you guide them through?
Example: From sedentary to strength athlete in 90 days"
                ></textarea>
            </div>

            <div class="hologram-input-container">
                <label class="hologram-label" for="unique-method">UNIQUE METHODOLOGY</label>
                <textarea
                    class="hologram-textarea"
                    id="unique-method"
                    placeholder="What makes your approach different?
Example: Gamified progressive overload with RPG-style leveling system"
                ></textarea>
            </div>

            <button class="hologram-button" id="analyze-strategy">
                INITIATE STRATEGIC ANALYSIS
            </button>

            <div id="strategy-results"></div>
        `;
    }

    getIntelVizContent() {
        return `
            <div class="data-packet">
                <div class="packet-header">
                    <span class="packet-id">INTEL-MAP-001</span>
                    <span class="packet-timestamp">${new Date().toISOString()}</span>
                </div>
                <div class="packet-content">
STRATEGIC INTELLIGENCE VISUALIZATION

This module provides visual mapping of:
- Market landscape analysis
- Competitive positioning
- Customer journey mapping
- Revenue stream visualization

[ MODULE UNDER DEVELOPMENT ]

Current Focus: Strategy Forge completion
Next Phase: Interactive data visualization tools
                </div>
            </div>
        `;
    }

    getFieldOpsContent() {
        return `
            <div class="data-packet">
                <div class="packet-header">
                    <span class="packet-id">FIELD-OPS // WEEK-ONE VIEWER</span>
                    <span class="packet-timestamp">${new Date().toISOString()}</span>
                </div>
                <div class="packet-content">
The week-one packet is generated and predicate-checked by the daily engine
(organvm/daily-engine): 7 day-cards that provably satisfy the safety and
progression invariants. The coach personalizes and delivers it by hand.

Below: the committed SYNTHETIC demo. Load a real packet from disk — it
renders in this browser only. Nothing is uploaded, nothing is stored,
client packets never enter any repo.
                </div>
            </div>
            <div class="hologram-input-container" id="week-one-dropzone">
                <label class="hologram-label" for="week-one-file">LOAD WEEK-ONE PACKET (drag &amp; drop or pick week-one.json — stays in this browser)</label>
                <input type="file" id="week-one-file" accept=".json,application/json" />
            </div>
            <div id="week-one-container">
                <div class="loading-indicator active">
                    <div class="loading-dots">LOADING DEMO PACKET...</div>
                </div>
            </div>
        `;
    }

    getTrainingContent() {
        return `
            <div class="data-packet">
                <div class="packet-header">
                    <span class="packet-id">TRAINING-001</span>
                    <span class="packet-timestamp">${new Date().toISOString()}</span>
                </div>
                <div class="packet-content">
TRAINING PROTOCOLS // KNOWLEDGE BASE

Available Training Modules:
□ Foundation Training: Business Model Design
□ Advanced Tactics: Client Acquisition
□ Elite Operations: Scaling Strategies
□ Special Forces: Community Building

[ TRAINING SIMULATOR COMING SOON ]

Recommended Start: Complete Strategy Forge analysis first
This will generate your personalized training path
                </div>
            </div>
        `;
    }

    getArchiveContent() {
        return `
            <div class="data-packet">
                <div class="packet-header">
                    <span class="packet-id">ARCHIVE-001</span>
                    <span class="packet-timestamp">${new Date().toISOString()}</span>
                </div>
                <div class="packet-content">
DATA ARCHIVE // STRATEGIC DOCUMENTS

Classified Documents Available:
├─ Blueprint for Niche Fitness Coaching Enterprise
├─ The Gamified Life Model (Formal & Casual)
├─ The Legion of Fitness: Battle Plan
└─ Gym Chimera: Advanced Concepts

Document Analysis: COMPLETE
Key Themes Extracted:
- Gamification mechanics
- Business model frameworks
- Client transformation protocols
- Community building strategies

[ FULL ARCHIVE ACCESS COMING SOON ]

Access Level: COMMANDER
Clearance: ALL DOCUMENTS
                </div>
            </div>
        `;
    }

    setupTerminalListeners(nodeId) {
        if (nodeId === 'target-analysis') {
            const analyzeBtn = document.getElementById('analyze-strategy');
            if (analyzeBtn) {
                analyzeBtn.addEventListener('click', () => this.runStrategyAnalysis());
            }
        }
        if (nodeId === 'field-ops') {
            this.initWeekOneViewer();
        }
    }

    initWeekOneViewer() {
        const container = document.getElementById('week-one-container');
        if (!container) return;

        const show = (packet, sourceLabel) => {
            try {
                container.innerHTML = renderWeekOne(packet, sourceLabel);
            } catch (error) {
                container.innerHTML = renderWeekOneError(error);
            }
        };

        // The committed synthetic demo (public/data/demo/ — see its README).
        fetch(`${import.meta.env.BASE_URL}data/demo/week-one.json`)
            .then((r) => {
                if (!r.ok) throw new Error(`demo packet fetch failed: HTTP ${r.status}`);
                return r.json();
            })
            .then((packet) => show(packet, 'DEMO — SYNTHETIC'))
            .catch((error) => {
                container.innerHTML = renderWeekOneError(error);
            });

        // Real packets load from disk and never leave the browser.
        const loadFile = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    show(JSON.parse(reader.result), 'LOADED — LOCAL ONLY');
                } catch (error) {
                    container.innerHTML = renderWeekOneError(error);
                }
            };
            reader.readAsText(file);
        };

        const input = document.getElementById('week-one-file');
        if (input) {
            input.addEventListener('change', () => loadFile(input.files[0]));
        }
        const dropzone = document.getElementById('week-one-dropzone');
        if (dropzone) {
            dropzone.addEventListener('dragover', (e) => e.preventDefault());
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                loadFile(e.dataTransfer.files[0]);
            });
        }
    }

    async runStrategyAnalysis() {
        const targetAvatar = document.getElementById('target-avatar').value;
        const transformationGoals = document.getElementById('transformation-goals').value;
        const uniqueMethod = document.getElementById('unique-method').value;
        const resultsContainer = document.getElementById('strategy-results');
        const analyzeBtn = document.getElementById('analyze-strategy');

        // Validate inputs
        if (!targetAvatar || !transformationGoals || !uniqueMethod) {
            resultsContainer.innerHTML = `
                <div class="data-packet" style="border-color: var(--danger-red);">
                    <div class="packet-content" style="color: var(--danger-red);">
ERROR: INSUFFICIENT DATA

All parameters must be provided for strategic analysis.
Please complete all fields and retry.
                    </div>
                </div>
            `;
            return;
        }

        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.classList.add('analyzing');
        analyzeBtn.textContent = 'ANALYZING...';

        // Activate core animation
        this.sceneManager.setCoreStat('analyzing');

        resultsContainer.innerHTML = `
            <div class="loading-indicator active">
                <div class="loading-dots">PROCESSING STRATEGIC INTELLIGENCE...</div>
            </div>
        `;

        try {
            // Check for API key
            if (!this.geminiApiKey) {
                this.geminiApiKey = prompt(
                    'Enter your Gemini API key to enable AI analysis:\n(It will be saved locally for future sessions)'
                );
                if (this.geminiApiKey) {
                    localStorage.setItem('gemini_api_key', this.geminiApiKey);
                } else {
                    throw new Error('API key required for analysis');
                }
            }

            // Call Gemini API
            const analysis = await this.callGeminiAPI(targetAvatar, transformationGoals, uniqueMethod);

            // Success state
            this.sceneManager.setCoreStat('success');

            // Display results
            resultsContainer.innerHTML = `
                <div class="data-packet">
                    <div class="packet-header">
                        <span class="packet-id">STRATEGY-ANALYSIS-${Date.now()}</span>
                        <span class="packet-timestamp">${new Date().toISOString()}</span>
                    </div>
                    <div class="packet-content">${analysis}</div>
                </div>
            `;
        } catch (error) {
            console.error('Analysis error:', error);

            // Error state
            this.sceneManager.setCoreStat('idle');

            resultsContainer.innerHTML = `
                <div class="data-packet" style="border-color: var(--danger-red);">
                    <div class="packet-content" style="color: var(--danger-red);">
ANALYSIS FAILED

Error: ${error.message}

Using fallback strategic analysis generator...
                    </div>
                </div>
                <div class="data-packet">
                    <div class="packet-header">
                        <span class="packet-id">FALLBACK-ANALYSIS</span>
                        <span class="packet-timestamp">${new Date().toISOString()}</span>
                    </div>
                    <div class="packet-content">${this.generateFallbackAnalysis(targetAvatar, transformationGoals, uniqueMethod)}</div>
                </div>
            `;
        } finally {
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('analyzing');
            analyzeBtn.textContent = 'INITIATE STRATEGIC ANALYSIS';
        }
    }

    async callGeminiAPI(targetAvatar, transformationGoals, uniqueMethod) {
        const prompt = `You are a strategic business analyst for a gamified fitness coaching enterprise called "The Legion of Fitness".

Analyze the following business concept and provide detailed strategic recommendations:

TARGET AVATAR: ${targetAvatar}

TRANSFORMATION OBJECTIVES: ${transformationGoals}

UNIQUE METHODOLOGY: ${uniqueMethod}

Provide a comprehensive strategic analysis covering:
1. Market positioning and unique value proposition
2. Initial monetization strategy (free offering + premium tiers)
3. Client acquisition tactics specific to this avatar
4. Gamification mechanics that would resonate
5. First 90-day action plan with specific milestones

Format your response in a clear, tactical style suitable for a military command briefing.`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + this.geminiApiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }

        const data = await response.json();
        const analysisText = data.candidates[0].content.parts[0].text;

        return analysisText;
    }

    generateFallbackAnalysis(targetAvatar, transformationGoals, uniqueMethod) {
        return `STRATEGIC ANALYSIS // FALLBACK MODE

TARGET AVATAR PROFILE:
${targetAvatar}

TRANSFORMATION MISSION:
${transformationGoals}

TACTICAL ADVANTAGE:
${uniqueMethod}

===[ STRATEGIC RECOMMENDATIONS ]===

PHASE 1: FOUNDATION (Days 1-30)
├─ Establish core brand identity around gamified fitness
├─ Create free lead magnet (PDF guide or assessment tool)
├─ Set up basic communication channel (email + community)
└─ Define 3-tier offering structure

PHASE 2: INITIAL DEPLOYMENT (Days 31-60)
├─ Launch beta cohort with founding members
├─ Implement gamification mechanics (XP, levels, quests)
├─ Develop signature transformation protocol
└─ Gather testimonials and case studies

PHASE 3: SCALE OPERATIONS (Days 61-90)
├─ Refine offering based on beta feedback
├─ Implement automated onboarding sequences
├─ Build community engagement systems
└─ Establish consistent content rhythm

MONETIZATION FRAMEWORK:
├─ FREE: Lead magnet + assessment
├─ TIER 1: Self-guided program ($47-97)
├─ TIER 2: Group coaching ($197-497/mo)
└─ TIER 3: 1-on-1 elite coaching ($997+/mo)

CLIENT ACQUISITION TACTICS:
- Content marketing targeting pain points
- Gamification hooks in marketing (level up, boss battles)
- Community-driven referral mechanics
- Strategic partnerships with complementary services

NEXT IMMEDIATE ACTIONS:
1. Create detailed avatar interview questions
2. Design your free offering (week 1)
3. Map out your signature transformation journey
4. Set up basic tech stack (email, payment, community)
5. Recruit 5 beta testers for validation

===[ END STRATEGIC ANALYSIS ]===

Note: This is a fallback analysis. For AI-powered strategic insights,
configure your Gemini API key and retry the analysis.`;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.legionCC = new LegionCommandCenter();
});
