export const TILE = 32;
export const ROWS = 16;
export const GROUND_TOP = 13;

export const LEVELS = [
  {
    id: 1, phase: 'Requirements Gathering', icon: '🗣️', seed: 11, bug: 'Vague Requirement',
    theme: { sky: ['#7ec8ff', '#d8f1ff'], ground: '#8a5a2b', grass: '#4cc24c', accent: '#ffb703' },
    goal: 'Find out what to build, and for whom, before writing a line of code.',
    lessons: [
      { title: 'Talk to real stakeholders', text: 'Interview users, customers, support and business owners. Requirements come from people, not from assumptions.' },
      { title: 'Write user stories', text: '"As a <role>, I want <goal>, so that <benefit>." Stories keep the focus on user value instead of implementation.' },
      { title: 'Acceptance criteria & MoSCoW', text: 'Define "done" with testable criteria (Given/When/Then) and prioritise: Must, Should, Could, Won\'t have.' },
    ],
    summary: {
      deliverables: ['Stakeholder map', 'User stories & personas', 'Prioritised backlog', 'Acceptance criteria'],
      tools: ['Interviews & workshops', 'Miro / FigJam', 'Jira / GitHub Issues', 'Surveys'],
      risk: 'Scope creep and misunderstood needs are the #1 cause of project failure.',
    },
  },
  {
    id: 2, phase: 'Analysis & Feasibility', icon: '🔍', seed: 22, bug: 'Hidden Assumption',
    theme: { sky: ['#9be0c8', '#e2fff3'], ground: '#6b5b3e', grass: '#2fa86d', accent: '#ef476f' },
    goal: 'Validate that the idea is viable, then turn raw needs into precise specifications.',
    lessons: [
      { title: 'Feasibility study', text: 'Check technical, economic, operational, legal and schedule feasibility before committing budget.' },
      { title: 'Functional vs non-functional', text: 'What the system does (features) versus how well it does it (performance, security, accessibility, availability).' },
      { title: 'Risk & gap analysis', text: 'List risks with likelihood and impact. Compare the current state with the target state to find the gaps.' },
    ],
    summary: {
      deliverables: ['Feasibility report', 'SRS / requirements spec', 'Use-case & flow diagrams', 'Risk register'],
      tools: ['UML / BPMN', 'Cost-benefit analysis', 'SWOT', 'Spikes & proofs of concept'],
      risk: 'Skipping analysis turns cheap questions into expensive rewrites later.',
    },
  },
  {
    id: 3, phase: 'Planning', icon: '🗺️', seed: 33, bug: 'Missed Deadline',
    theme: { sky: ['#ffd29d', '#fff1dc'], ground: '#7a4e2d', grass: '#8bc34a', accent: '#118ab2' },
    goal: 'Decide how, when and with whom the work will be delivered.',
    lessons: [
      { title: 'Pick a methodology', text: 'Waterfall suits fixed, well-known scope. Agile (Scrum/Kanban) suits change and fast feedback. Many teams blend both.' },
      { title: 'Break down and estimate', text: 'Use a work breakdown structure, story points or t-shirt sizes. Estimate as ranges and track velocity.' },
      { title: 'Roadmap, milestones, risks', text: 'Plan releases around outcomes. Define a Definition of Done, assign owners and keep a living risk register.' },
    ],
    summary: {
      deliverables: ['Roadmap & milestones', 'Sprint backlog', 'Resource plan', 'Definition of Done'],
      tools: ['GitHub Projects / Jira', 'Gantt & burndown charts', 'Planning poker', 'Team calendar'],
      risk: 'Plans are guesses. The value is in re-planning quickly as you learn.',
    },
  },
  {
    id: 4, phase: 'Architecture & Design', icon: '🏗️', seed: 44, bug: 'Tight Coupling',
    theme: { sky: ['#a8b5ff', '#e9ecff'], ground: '#4a4a6a', grass: '#7b6cf6', accent: '#06d6a0' },
    goal: 'Shape the structure of the system: components, data, interfaces and the UX.',
    lessons: [
      { title: 'Choose an architecture', text: 'Monolith, modular monolith, microservices, serverless or event-driven. Pick based on team size, scale and complexity, not hype.' },
      { title: 'Document decisions', text: 'Use C4 diagrams for structure and ADRs (Architecture Decision Records) to capture why a trade-off was made.' },
      { title: 'Design APIs, data & UX', text: 'Contract-first APIs (OpenAPI), normalised data models, and wireframes/prototypes validated with users.' },
    ],
    summary: {
      deliverables: ['C4 / system diagrams', 'ADRs', 'API contracts (OpenAPI)', 'DB schema & wireframes'],
      tools: ['draw.io / Mermaid', 'Figma', 'OpenAPI / Swagger', 'dbdiagram.io'],
      risk: 'Every architecture is a set of trade-offs. Write them down.',
    },
  },
  {
    id: 5, phase: 'Development', icon: '💻', seed: 55, bug: 'Off-by-One',
    theme: { sky: ['#2b2d42', '#4a4e69'], ground: '#22223b', grass: '#00b4d8', accent: '#ffd60a' },
    goal: 'Turn the design into clean, working, version-controlled code.',
    lessons: [
      { title: 'Version control & branching', text: 'Git with small, focused commits. Trunk-based development or GitHub Flow keeps integration painless.' },
      { title: 'Clean code & SOLID', text: 'Readable names, small functions, single responsibility, DRY. Code is read far more often than it is written.' },
      { title: 'Build incrementally', text: 'Ship thin vertical slices behind feature flags. TDD and pair programming reduce defects early.' },
    ],
    summary: {
      deliverables: ['Working increments', 'Source code in Git', 'Technical docs & README', 'Feature-flagged releases'],
      tools: ['VS Code', 'Git & GitHub', 'GitHub Copilot', 'Linters & formatters'],
      risk: 'Untested, undocumented code is technical debt the day it is merged.',
    },
  },
  {
    id: 6, phase: 'Code Review & CI', icon: '🔁', seed: 66, bug: 'Merge Conflict',
    theme: { sky: ['#ffafcc', '#ffe5ec'], ground: '#6d4c41', grass: '#f06292', accent: '#3a86ff' },
    goal: 'Keep quality high with peer review and automated pipelines.',
    lessons: [
      { title: 'Pull requests & reviews', text: 'Small PRs, clear descriptions and kind, specific feedback. Reviews spread knowledge and catch defects.' },
      { title: 'Continuous Integration', text: 'Every push builds, lints and tests automatically. A red build is fixed first, before new work.' },
      { title: 'Quality gates', text: 'Coverage thresholds, static analysis and required checks protect the main branch from regressions.' },
    ],
    summary: {
      deliverables: ['Reviewed & merged PRs', 'CI pipeline', 'Build artifacts', 'Quality gate reports'],
      tools: ['GitHub Actions', 'ESLint / SonarQube', 'CODEOWNERS', 'Branch protection'],
      risk: 'Long-lived branches and giant PRs hide bugs and slow everyone down.',
    },
  },
  {
    id: 7, phase: 'Testing', icon: '🧪', seed: 77, bug: 'Regression',
    theme: { sky: ['#b8f2e6', '#f0fffb'], ground: '#5e503f', grass: '#2ec4b6', accent: '#e63946' },
    goal: 'Prove that the software works, and keeps working.',
    lessons: [
      { title: 'The test pyramid', text: 'Many fast unit tests, fewer integration tests, a handful of end-to-end tests. Fast feedback wins.' },
      { title: 'Beyond functional', text: 'Performance, load, accessibility, usability and compatibility tests protect the non-functional requirements.' },
      { title: 'UAT & regression', text: 'Users confirm acceptance criteria in UAT. Automated regression suites make sure old bugs stay dead.' },
    ],
    summary: {
      deliverables: ['Test plan & cases', 'Automated test suites', 'Bug reports', 'UAT sign-off'],
      tools: ['Jest / node:test / pytest', 'Playwright / Cypress', 'k6 / JMeter', 'axe (a11y)'],
      risk: 'Testing shows the presence of bugs, never their absence. Test the risky parts first.',
    },
  },
  {
    id: 8, phase: 'Security & Compliance', icon: '🛡️', seed: 88, bug: 'SQL Injection',
    theme: { sky: ['#1b263b', '#415a77'], ground: '#0d1b2a', grass: '#e63946', accent: '#90e0ef' },
    goal: 'Build security in from the start instead of bolting it on at the end.',
    lessons: [
      { title: 'Threat modelling', text: 'Use STRIDE to ask "what can go wrong?" per component. Fix design flaws before they become code.' },
      { title: 'OWASP Top 10', text: 'Validate input, encode output, use parameterised queries, strong auth and least privilege.' },
      { title: 'Shift-left & secrets', text: 'Run SAST/DAST and dependency scans in CI. Never commit secrets. Keep dependencies patched.' },
    ],
    summary: {
      deliverables: ['Threat model', 'Vulnerability scan reports', 'Pen-test findings', 'Compliance evidence'],
      tools: ['CodeQL / Dependabot', 'OWASP ZAP', 'Secret scanning', 'Vault / Key management'],
      risk: 'A single leaked credential can undo every other good practice.',
    },
  },
  {
    id: 9, phase: 'Deployment & Release', icon: '🚀', seed: 99, bug: 'Works On My Machine',
    theme: { sky: ['#ff9e7d', '#ffe3d3'], ground: '#5a3825', grass: '#ff7043', accent: '#4361ee' },
    goal: 'Get working software safely into the hands of users.',
    lessons: [
      { title: 'Continuous Delivery', text: 'Automate build, test and release so deploying is a boring, repeatable, one-click event.' },
      { title: 'Safe release strategies', text: 'Blue-green, canary and rolling releases limit blast radius. Always have a tested rollback plan.' },
      { title: 'Infrastructure as Code', text: 'Containers (Docker) and IaC (Terraform) make environments reproducible: dev, staging and production match.' },
    ],
    summary: {
      deliverables: ['Release notes', 'Deployed environments', 'Runbooks', 'Rollback plan'],
      tools: ['GitHub Actions / Pages', 'Docker & Kubernetes', 'Terraform', 'Feature flags'],
      risk: 'Manual deployments are slow, error-prone and scary. Automate them.',
    },
  },
  {
    id: 10, phase: 'Operations & Monitoring', icon: '📡', seed: 110, bug: '3 AM Outage',
    theme: { sky: ['#14213d', '#274472'], ground: '#0b132b', grass: '#fca311', accent: '#06d6a0' },
    goal: 'Keep the lights on and know what the system is doing in production.',
    lessons: [
      { title: 'Observability', text: 'Logs, metrics and traces tell you what is happening. Dashboards should answer questions before users ask.' },
      { title: 'SLIs, SLOs & alerting', text: 'Define reliability targets, alert on symptoms users feel, and keep on-call sustainable.' },
      { title: 'Incident response', text: 'Detect, triage, mitigate, communicate, then run a blameless post-mortem to learn and prevent repeats.' },
    ],
    summary: {
      deliverables: ['Dashboards & alerts', 'SLOs / SLAs', 'Incident reports', 'Post-mortems'],
      tools: ['Grafana / Datadog', 'Prometheus', 'OpenTelemetry', 'PagerDuty'],
      risk: 'If you cannot measure it in production, you cannot improve it.',
    },
  },
  {
    id: 11, phase: 'Maintenance & Support', icon: '🛠️', seed: 121, bug: 'Legacy Code',
    theme: { sky: ['#cdb4db', '#f3e8ff'], ground: '#5c4b51', grass: '#a06cd5', accent: '#fb8500' },
    goal: 'Support real users and keep the product healthy over time.',
    lessons: [
      { title: 'Triage and support tiers', text: 'Classify issues by severity and impact. L1 handles FAQs, L2 investigates, L3 engineers fix root causes.' },
      { title: 'Four kinds of maintenance', text: 'Corrective (bugs), adaptive (environment), perfective (improvements) and preventive (refactoring and debt).' },
      { title: 'Close the feedback loop', text: 'Analytics, tickets and user research feed the next backlog. Keep docs and dependencies current.' },
    ],
    summary: {
      deliverables: ['Patches & hotfixes', 'Updated documentation', 'Knowledge base', 'Customer feedback reports'],
      tools: ['Zendesk / GitHub Issues', 'Dependabot', 'Feature analytics', 'Changelogs'],
      risk: 'Most of a product\'s lifetime cost is maintenance. Design for it.',
    },
  },
  {
    id: 12, phase: 'Evolution & Retirement', icon: '🏁', seed: 132, bug: 'End of Life',
    theme: { sky: ['#ffe066', '#fff9d6'], ground: '#6b4423', grass: '#ffb703', accent: '#e63946' },
    goal: 'Iterate, learn, and eventually retire software responsibly. Then the cycle starts again.',
    lessons: [
      { title: 'Retrospectives', text: 'Inspect and adapt: what went well, what did not, what will we change? Improve the process, not just the product.' },
      { title: 'Plan the sunset', text: 'Announce deprecations early, offer migration paths, archive data per policy and shut down cleanly.' },
      { title: 'The cycle never ends', text: 'Great teams treat the SDLC as a loop: every release feeds new requirements. Keep learning and keep shipping.' },
    ],
    summary: {
      deliverables: ['Retrospective actions', 'Deprecation notices', 'Data migration/archival', 'Lessons-learned report'],
      tools: ['Retro boards', 'Migration scripts', 'Status pages', 'Archive policies'],
      risk: 'Zombie systems nobody owns become security and cost liabilities.',
    },
  },
];

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds a deterministic tile map for a level.
 * Tiles: ' ' air, '#' ground, 'B' brick, '?' lesson block, 'c' coin,
 * '^' spikes, 'E' enemy spawn, 'P' player start, 'F' flag.
 */
export function buildLevel(def) {
  const rand = rng(def.seed);
  const diff = def.id / LEVELS.length;
  const cols = [];
  const grid = Array.from({ length: ROWS }, () => []);
  let x = 0;

  const ensure = (n) => { for (const row of grid) while (row.length < n) row.push(' '); };
  const set = (cx, cy, ch) => { ensure(cx + 1); grid[cy][cx] = ch; };
  const ground = (cx, top) => { for (let y = top; y < ROWS; y++) set(cx, y, '#'); cols[cx] = top; };
  const gap = (cx) => { ensure(cx + 1); cols[cx] = null; };
  const flat = (n) => { for (let i = 0; i < n; i++) ground(x + i, GROUND_TOP); };
  const pick = (a, b) => a + Math.floor(rand() * (b - a + 1));

  flat(8);
  set(2, GROUND_TOP - 1, 'P');
  x = 8;

  const flatRun = (withEnemy) => {
    const n = pick(5, 8);
    flat(n);
    if (withEnemy) set(x + Math.floor(n / 2), GROUND_TOP - 1, 'E');
    for (let i = 1; i < n - 1; i += 2) if (rand() < 0.5) set(x + i, GROUND_TOP - 2, 'c');
    x += n;
  };
  const gapSeg = () => {
    const n = pick(2, Math.min(3, 2 + Math.floor(diff * 2)));
    for (let i = 0; i < n; i++) gap(x + i);
    for (let i = 0; i < n; i++) set(x + i, GROUND_TOP - 4, i === Math.floor(n / 2) ? 'c' : ' ');
    x += n;
  };
  const spikeSeg = () => {
    const n = 6;
    flat(n);
    set(x + 3, GROUND_TOP - 1, '^');
    set(x + 3, GROUND_TOP - 3, 'c');
    x += n;
  };
  const stairsSeg = () => {
    const h = pick(2, 3);
    for (let i = 1; i <= h; i++) ground(x + i - 1, GROUND_TOP - i);
    const top = GROUND_TOP - h;
    const plateau = pick(2, 4);
    for (let i = 0; i < plateau; i++) ground(x + h + i, top);
    if (rand() < 0.6) set(x + h, top - 1, 'E');
    for (let i = 0; i < plateau; i++) if (i % 2 === 0) set(x + h + i, top - 3, 'c');
    for (let i = 1; i <= h; i++) ground(x + h + plateau + i - 1, top + i);
    x += h * 2 + plateau;
  };
  const blockSeg = () => {
    const n = 8;
    flat(n);
    const kinds = ['B', '?', 'B'];
    for (let i = 0; i < 3; i++) set(x + 2 + i, GROUND_TOP - 3, kinds[i]);
    set(x + 3, GROUND_TOP - 6, 'c');
    if (diff > 0.4 && rand() < 0.6) set(x + 6, GROUND_TOP - 1, 'E');
    x += n;
  };

  const hazards = [() => flatRun(true), gapSeg, spikeSeg, stairsSeg];
  def.lessons.forEach(() => {
    const count = 1 + (rand() < diff ? 1 : 0);
    for (let i = 0; i < count; i++) {
      hazards[pick(0, hazards.length - 1)]();
      flatRun(false);
    }
    blockSeg();
  });
  flatRun(true);
  for (let i = 0; i < pick(1, 2); i++) { hazards[pick(0, hazards.length - 1)](); flatRun(false); }

  const h = 4;
  for (let i = 1; i <= h; i++) ground(x + i - 1, GROUND_TOP - i);
  const top = GROUND_TOP - h;
  for (let i = 0; i < 7; i++) ground(x + h + i, top);
  for (let i = 1; i <= 4; i++) set(x + h + 3, top - i, 'F');
  x += h + 7;
  ensure(x);

  const width = grid[0].length;
  return { width, rows: grid.map((r) => r.join('').padEnd(width, ' ')), cols };
}
