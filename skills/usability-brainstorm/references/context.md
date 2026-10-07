# Context → consequences — the Fit family; read only the sections the context sheet touches

Each row is a fact the brief may contain, what follows from it for design, and what to check in
the code to see whether it's handled. Use the rows the context sheet supports. An idea that comes
from an *assumed* row is an assumed idea, and says so.

These are starting points, not a checklist: the brief's own facts usually suggest consequences
that no table lists. Ask what else follows.

## Devices and input

| Fact | Consequences | Check in code |
|---|---|---|
| Phones or tablets | targets sized for a thumb; nothing reachable only by hover, right-click or double-click; the on-screen keyboard hides the lower half, so the primary action stays reachable; the right keyboard per field | `:hover`-only menus, info only in `onMouseEnter` tooltips, `contextmenu`, `dblclick`; `type` and `inputmode` on inputs |
| Gloves, wet hands, one hand busy | bigger targets still, no precise gestures, scanning or picking over typing | drag as the only way, small icon buttons |
| Barcode or RFID scanner | scanners type fast and end with Enter: a focused field that takes the scan and acts on Enter, focus returning there after each item, no dialog stealing focus | `autoFocus`, Enter handling, focus after submit |
| Keyboard-heavy desk work | the whole frequent flow without a mouse; Tab order follows the work; Enter or Ctrl+Enter submits; custom selects operable by keyboard | key handlers, `tabIndex`, custom dropdowns built from `div`s |
| Small laptops, browser zoom at 125–150% | sticky headers and footers eat the viewport; dialogs taller than the screen hide their buttons | fixed heights, dialogs without `max-height` and scroll |
| Several monitors, many tabs | links open where expected; state lives in the URL; tabs don't overwrite each other | `window.open`, view state outside the URL (D4), no cross-tab sync |
| Printing (labels, invoices, pick lists) | a print layout without the app's navigation; page breaks that don't split a row | `@media print`, a print route |

## Browsers and setup

| Fact | Consequences | Check in code |
|---|---|---|
| Safari, iOS | date and time inputs look and behave differently; `100vh` jumps with the toolbar; script-writable storage can be cleared after seven days without a visit, so drafts in `localStorage` can vanish | `100vh`, `type="date"`, drafts only in `localStorage` |
| Locked-down corporate browsers | old versions, popups blocked, third-party cookies off, extensions injecting into pages, proxies that break websockets | `window.open` after an `await` (blocked as a popup), third-party auth iframes, websockets with no fallback, newer APIs used without a check |
| Password managers and autofill | standard `autocomplete` values on login, address and payment fields; validation driven by key events never sees an autofilled value | `autocomplete=`, validation on `keyup` rather than `input` or `change` |
| Page translation by the browser (non-native speakers) | translators rewrite text nodes, and some frameworks — React notably — can throw when they re-render the changed nodes | a crash report mentioning `removeChild` or `insertBefore`; text nodes that are direct siblings of conditionally rendered elements |
| Ad and privacy blockers | analytics-named scripts and endpoints blocked, and features that depend on them break | features that wait on an analytics or tracking call |

## Network

| Fact | Consequences | Check in code |
|---|---|---|
| Flaky or offline (field, warehouse, transport) | offline told apart from a server error; writes queued and retried; nothing typed is lost | `navigator.onLine`, a service worker, retry logic, what an error handler does to the form |
| Slow VPN, high latency | optimistic updates on repeated actions; fewer round trips; no request waterfalls | chained `await`s with no data dependency (`interaction-cost.md` I3) |

## Work environment and rhythm

| Fact | Consequences | Check in code |
|---|---|---|
| Frequent interruptions (clinics, support, shops) | drafts, resume, status readable at a glance | `interaction-cost.md` D2 (input lost on navigation), A4 (re-entry after a session boundary) |
| Shared workstations, shifts | fast user switching, short sessions that keep work, the signed-in user visible | session length, logout handling, drafts keyed by user |
| Customer present (counter, phone) | the user talks while typing: search by what the customer says — name, phone, the last digits of a number; no mandatory free text | which fields search can match |
| Peaks (month-end close, holiday rush, morning dispatch) | the flow at its busiest: fewest decisions, bulk actions, nothing slow on the critical path | — |
| Noise, glare, distance from the screen | states shown by more than color; nothing that relies on sound | status shown only as a color |
| Regulated or high stakes (medical, finance, legal) | prevention and an audit trail come before speed; deliberate friction stays; undo where the rules allow | audit log, who-and-when fields |

## People

| Fact | Consequences | Check in code |
|---|---|---|
| Occasional users (once a month or less) | recognition over recall; defaults and examples; nothing depends on remembering last month | free-text fields that expect known codes |
| All-day experts | the Accelerate family | — |
| Several roles on the same records | role-specific defaults and views; denied actions explained rather than hidden; signals at handoffs | permission checks that hide controls with no explanation |
| Non-native speakers, several UI languages | plain words; layouts that survive strings 30% longer; the translation row above | hard-coded strings, fixed widths on labels and buttons |
| Accessibility needs | the logic-dependent WCAG criteria in `flow-checks.md`; zoom to 200% without loss | — |

## Locale and data

| Fact | Consequences | Check in code |
|---|---|---|
| Decimal comma, other date and number formats | parse and display by locale; accept "1,5" | `parseFloat`, `toFixed`, hard-coded format strings |
| Cyrillic or other non-Latin scripts | sorting by the locale's collation; search that treats е and ё as one letter, and ignores case | `.sort()` with no collator, search by `toLowerCase` and `includes` alone |
| Personal names | patronymics, a single name, very long names, non-Latin names; one field may serve better than three | name fields in the schemas, length limits |
| Time zones, distributed teams | deadlines in whose time; date-only versus date-time | `new Date(` on date strings, times shown without a zone |
| Real data volume | lists, pickers and exports that survive the largest real customer | lists with no pagination or virtualization, `list_all` queries |
