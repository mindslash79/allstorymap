# 2025-12-20 to 2026-01-10 AllStory Map evolution evidence

Recorded from the GPT export on 2026-10-03.

## Status and boundary

This is historical product evidence, not current implementation truth. It continues `2025-12-19-allstory-map-product-origin.md`.

The source mixed user decisions, open questions, assistant proposals, and user-reported implementation milestones. Only the user's own statements are treated as evidence of intent or historical progress. Assistant architecture, pricing, health, legal, market, and AI claims are not promoted as facts.

## Product boundary reached on 2025-12-20

The user initially chose a small web MVP built around:

- a map, place pin, text, and up to three photos;
- a list of one's own pins;
- a lightweight resonance action rather than popularity ranking;
- visually distinct own/other pins;
- Korean and English UI;
- explicit public-posting safety confirmation;
- image optimization and EXIF-location removal;
- soft deletion followed by permanent deletion after 30 days;
- an anonymous one-to-one feedback channel with the operator;
- no recommendation feed, rankings, follows, conventional profile performance, or public copy metrics.

Historical copy and privacy decisions included:

- copy through a button rather than ordinary drag-copy;
- source information appended at the end;
- a public pin identifier shaped like `PINXXXXXXXX`;
- no per-user copy tracking;
- copy counts visible only operationally;
- exact stored coordinates, with other people's textual coordinates reduced to two decimals.

The user also selected the save confirmation:

- Korean: “이 순간은 이제 당신의 기억을 넘어 기록으로 남아 있습니다.”
- English: “This moment now lives on as a record, beyond your memory.”

These were product decisions at that time, not proof of current code.

## Time as remembered, not forced precision

The user wanted a person to record time only as precisely as remembered: a month without a day, a season without a month, a decade, or an approximate relative period.

The intended MVP interaction was free text plus light parsing. The original expression would remain intact; the system would extract only what it could safely recognize for ordering. The user later requested that examples show only formats the parser could actually understand.

This supported a larger value proposition: place and time together can make life review easier because locations naturally divide a life into chapters.

## Archive-first correction

After considering comments, messenger, references, and game mechanics, the user explicitly corrected the near-term target to an **archive stage**: first make personal life recording work safely and comfortably. Connection, reference, and world layers should sit on top of a stable archive rather than replace it.

The user removed two earlier ideas from the MVP:

- the mandatory private “intent” line;
- immutable post content.

Instead, pins could be edited and show created and last-edited times.

## Connection and reference lineage

The user believed connection would eventually be central because people write more easily when they expect to be read and can converse. The proposed later-stage design was:

- conversation begins from a pin, not a profile;
- eligibility is gated by configurable account age/activity and resonance signals;
- identity remains hidden by default;
- after trust accumulates across multiple pin conversations, parties may mutually choose to reveal a persistent identifier and open a person-level thread.

A separate reference idea allowed pins to link into stories. For the early design, the user rejected forced preservation of deleted or superseded text. A reference would show its creation time, while the source pin showed created/edited times; snapshot/version preservation was deliberately deferred.

On 2026-01-10 the input model evolved further: write continuously first, then let the system propose place/time splits into multiple pins. Pins born from the same narrative could remain connected like thread. This reframed the core insight as: people write stories first; pins can emerge afterward.

## Builder and world metaphors

The user explored a non-literal future layer in which:

- the map is a source of reality-grounded materials;
- pins are materials;
- the person is a builder/architect rather than only a storyteller;
- life chapters become buildings or structures;
- a personal world or planet reveals identity through accumulated structure;
- interaction leaves traces on materials or structures rather than encouraging argument around profiles.

The user considered text-game language and a few reusable pixel-style visual symbols as a low-cost way to hint at this world without building a full game. Competitive points, rankings, winning, and avatar-display competition remained outside the intended direction.

He later separated three motivations that could share one data core:

1. archive/preservation;
2. connection/exchange;
3. construction/meaning.

The archive was to remain the base. Connection and construction were optional layers, not separate incompatible products.

## Stars, constellations, galaxies, and dedication

A later future-world metaphor moved from map/ground to sky:

- one person's accumulated existence could be represented as a star;
- recurring close relationships could form constellations;
- people sharing a time/place context could form a galaxy;
- the map-to-sky transition represented event-to-meaning and individual-to-collective memory.

The user also imagined stars or dedicated story spaces for children, family, friends, companion animals, or deceased loved ones. This converged with the named **Honor Space** idea: select and order pins into a private or shared dedication, and eventually a printed book or gift.

This was future vision, not an MVP commitment.

## Pseudonym safety idea

The user proposed a private, editable pseudonym dictionary. Real names could be written naturally while drafting, then replaced at save/publish time with consistent pseudonyms explicitly marked as such. This was meant to reduce accidental disclosure while preserving writing flow. The source did not settle the final storage/encryption policy.

## Historical implementation self-reports

The user reported:

- Node.js installation on 2025-12-24;
- by 2026-01-04, an MVP-like archive already displayed a map, created pins with time/story text, listed pins, navigated to pins, edited/deleted pins, and searched on the map.

These are self-reports only. They do not verify repository commits, deployment, security, or current behavior.

## December 24–27 implementation sequence

A follow-on conversation documented the user's step-by-step local implementation work. These are historical self-reports, not current implementation truth.

The user reported that:

- a Next.js project was created and run locally;
- a Supabase project was created in the U.S. East region;
- project environment variables and a Supabase client were added;
- Google OAuth was configured and a login completed successfully;
- the authenticated user appeared in Supabase Auth;
- SQL for `pins`, `felt_events`, and `copy_events`, related count triggers, and row-level-security policies was executed;
- the local app structure was consolidated around `src/app` after duplicate root and `src` application directories caused routing and import confusion.

The conversation also recorded several troubleshooting steps: an accidentally created parent-directory npm workspace interfered with Next.js root detection; missing root routes, layout markup, and `globals.css` caused 404 or build errors; and OAuth initially failed because of a redirect URI mismatch.

By the end of the selected path, the user's reported state was: local Next.js running, login page visible, Google login successful, a Supabase user created, database tables/triggers/RLS applied, and product implementation still before the main map, pin CRUD, storage, resonance/copy, and feedback features. The historical assistant estimated progress percentages several times; those estimates are not treated as evidence.

A Google OAuth client secret and a public Supabase key appeared in the historical conversation. Credential values are intentionally not retained here. The assistant advised secret rotation repeatedly, but the reviewed path did not confirm whether rotation occurred. No current credential state should be inferred from this history.

### Additional provenance

- Source file: `conversations-011.json`
- Source index: 52
- Conversation ID: `694c60bb-c458-832c-bb3c-ef1d5c28bc57`
- Title: `AllStory Map 2: MVP 1. Next Supa 30%`
- Key user message IDs:
  - `c27b069a-aba8-4724-b5f0-ae99289c9da3`
  - `7600879b-f390-437c-98ce-e690eba3ae22`
  - `ddcb22ff-2c42-4bc6-b050-e8ed55fdd181`
  - `91458056-0813-4cf6-a479-65e71dfb0427`
  - `ab080cdd-733b-410f-8064-24819195e3af`
  - `6b5523b5-2480-4d88-ad30-f131b3c155bd`
  - `0049cdad-0c02-48f3-99e6-ee0d15857bd8`
  - `68331713-5a72-4100-b5c6-bad0bf644dec`
  - `98c5abec-04c2-4ff8-9b15-a3abc824c19a`
  - `063b4e96-977f-4d88-ab5f-94f610604d5c`
  - `cddb0325-c0e8-4b74-9902-583e4331b3b5`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachments/screenshots, external pages, live Supabase state, or local source files


## December 27–January 1 map implementation and recovery sequence

The next selected-path conversation records a concrete but unstable local implementation sequence. These are user-reported historical milestones, not verification of current repository behavior.

The user reported that:

- the OAuth callback/page conflict was resolved and the protected `/map` route worked after login;
- on 2025-12-29 the actual Google map rendered, then clicking the map produced a single temporary marker that moved to the latest click;
- he created `src/types/pin.ts` and `src/components/PinCreateModal.tsx`, and attempted to extend `GoogleMap.tsx` toward Supabase create/read plus a pin-list panel;
- development then became blocked by repeated Next.js/Turbopack failures on Windows, including a panic log reporting access denial while reading generated `.next` chunks and a later Node out-of-memory crash;
- he copied the project from the Desktop path to `C:\\Dev\\allstorymap\\allstory-mvp`, rebooted, and on 2026-01-01 eventually regained a rendered map and click-to-marker behavior;
- at the end of the selected path, actual Supabase pin insertion, reload persistence, and pin-list synchronization were still explicitly unconfirmed.

The durable engineering lesson in this history is the user's own request to stop repeating broad replacement instructions and return to the last known working slice. The closing handoff placed the next verification boundary at: database insert, reload/read, marker rendering from persisted rows, then list/map selection synchronization. Historical assistant code, version advice, causal diagnoses of the toolchain failures, and progress percentages are not treated as repository facts.

### Additional provenance

- Source file: `conversations-011.json`
- Source index: 54
- Conversation ID: `695026dd-4370-832d-9a8c-3c412f33c1c2`
- Title: `AllStory Map 3: MVP 2. Map 더하기`
- Key user message IDs:
  - authenticated map route working: `5123d16e-7d61-4a6f-9bbe-a008e02a0dbb`
  - first map render: `82e6c0b0-f94c-4e3d-adff-55f5fa96353c`
  - click-to-marker working: `b7f7d608-f63c-45e5-ac24-fd4f45bb7e06`
  - one moving temporary marker and no repetition: `efb0a938-4a96-4871-b900-4b0a27b7d960`
  - request to proceed to create/read: `335a72b6-fe3e-4e64-a935-93278601927d`
  - first full integration attempt: `6f0d61dc-61fe-4716-92c3-d8bc1aef7b5f`
  - user flags repeated loop: `ea33d0e8-8e28-4a72-a951-494670994c9c`
  - Windows-path move: `c38287f2-0cd0-4eb3-b410-85655baa2d01`
  - Node memory error: `9c5a32f7-247c-49ed-8df9-e3ee19b60c0a`
  - map restored: `0723b614-a296-4a12-a5e2-a850a826a2ea`
  - final handoff request: `2c00d51c-1e19-40ef-a6b8-b883270f69e1`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachments/screenshots, panic-log attachment contents as primary files, external pages, live Supabase state, or local source files


## January 1–12 persistence, search, and Place design

A further selected-path conversation records the point at which the local map prototype crossed the previously unverified persistence boundary. These remain dated user self-reports, not verification of the present repository, Supabase schema, deployment, or security posture.

On 2026-01-01 the user reported that:

- a duplicate `default export` in `src/app/map/page.tsx` was corrected and the intended page/component path was confirmed;
- the map and create flow became visible again;
- database/application mismatches surfaced through missing-column and enum errors, including `note`, `user_id`, and the invalid visibility value `public`;
- the actual visibility values reported by the user were `public_with_author`, `public_anonymous`, and `private`;
- after aligning the working flow around the database-facing fields, pin creation and Supabase persistence worked;
- the right-hand white panel displayed accumulated pins with time and story text.

The historical exchange repeatedly alternated between `user_id`/`owner_id` and `note`/`body`. Because attached schema exports were not reviewed as primary files and assistant replacement code was inconsistent, those column names are **not** promoted here as current schema truth. The durable lesson is to compare the application payload, live table columns/types/defaults, enum labels, and RLS policies before changing either side.

On 2026-01-02 the user reported that logout redirected to the login screen and blocked map access, and that Google Places search worked. The user also asked that programming answers address only the current question because repeated prior material caused confusion and increased loading time.

The same conversation then fixed the next product direction:

- time should be a start/end range, with the end initially copied from the start but editable;
- precision should be explicit from year through second, with unspecified lower units filled by a deterministic minimum for ordering;
- display text may later be generated, while structured time remains the stable source for sorting and filtering;
- owners should be able to edit and delete their pins, and each pin should visibly expose its stable identifier;
- search movement should use both exact `geometry.location` and `geometry.viewport` when available;
- a first-class Place object should contain multiple pins and have a name, time range, and a `Current` end option;
- Place visibility should use the same three meanings: private, public without author identity, and public with author identity;
- if a Place is private, its child pins should not become publicly visible; a public Place may still contain private pins.

On 2026-01-03 the user reported that the time/edit/delete work and search-related fixes were functioning after a TypeScript callback correction. A full Place SQL/RLS/type/component plan was then generated for later execution, but the selected path contains no user confirmation that Place was applied successfully. On 2026-01-12 the next user message only asked how to restart the local dev server. Place therefore remains a historical planned next step in this evidence, not a completed feature.

### Additional provenance

- Source file: `conversations-011.json`
- Source index: 62
- Conversation ID: `6956eb31-755c-8333-835d-64f8113e0099`
- Title: `AllStory Map 4: MVP 3. Pin에 데이터 붙이기`
- Key user message IDs:
  - runtime-path and duplicate-export resolution: `e0e395cdb-e821-4540-bc18-511a3dac2871`
  - schema comparison request: `4f4fc05f-c319-41cb-9d6d-2809a3c67d64`, `e436bc03-c4f3-4097-96a9-b3b63f661ef2`
  - authenticated-only public visibility requirement: `a6585834-cbb2-4801-a14d-40fe00ecafec`
  - actual visibility enum labels: `47b10c39-6829-47a2-b1df-261abd79138a`
  - save/persistence confirmation: `6571dfc2-e74a-4468-8685-273d57e56691`, `eb20264d-3f1e-4b16-88e0-59f57424d44f`
  - logout and map-access requirement: `a50f2731-b8e1-4e74-a5cb-4701a679fe6e`
  - search working: `aea22a00-1393-4ab5-b9ae-d925c37648c7`
  - time, edit/delete, search, and Place requirements: `c8746269-db10-4452-a749-2246422b34c1`, `b59968e8-888f-4d20-bc3b-6fa172387433`
  - post-fix working confirmation: `d26de997-6e7e-4a7c-ad09-a7b2a9963fb2`, `1a72ace6-7b8c-4c3c-aa32-a369915a7bba`
  - request for the Place implementation handoff: `a4abb82a-5860-423d-8713-6210fc7027c4`
  - later dev-server restart request: `6199ca70-9a36-411c-9e26-a659555bd1c6`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachment or screenshot contents as primary files, live Supabase state, live local source files, or current deployment



## Post-January-10 addendum: memoir, LivingFlow, and equal existence

A January 2 conversation added one concise extension: the user saw a printed autobiography or memoir as a natural service derived from accumulated AllStory records. This was a user idea only; the assistant's proposed service levels, pricing assumptions, target segments, and production model were not accepted as product facts.

From January 5 through 17, the user consolidated and extended the concept further. The important user-authored lineage was:

- **Story-first capture:** people should be able to write continuously without first choosing pins. After saving, the system may propose time/place/scene splits, while the writer retains authority to merge, divide, or edit them.
- **Thread continuity:** pins produced from one narrative should remain visibly connected, so a story is not fragmented by spatial indexing.
- **Life drawing and LivingFlow:** a person's time-ordered pins could form a symbolic drawing. The user imagined time as a possible third axis, then preferred a less literal, fog-like moving flow over exact routes.
- **Collective memory as art:** anonymized individual flows could overlap around a theme or era and become a field-like artwork rather than a leaderboard or profile spectacle.
- **Theme and listening layers:** themes could gather memories at risk of disappearing. A quiet lullaby/listening mode could read selected stories without engagement-maximizing or highly activating content.
- **Installation horizon:** the user imagined a large three-dimensional or holographic LivingFlow installation in which the flow associated with a narrated story quietly brightens. This is a long-horizon artistic direction, not a current implementation commitment.
- **Creative aim:** the user did not primarily want maximal mass appeal. He wanted a work that could remain deeply and constructively present in a smaller number of people's lives.
- **Equal-existence rule:** even a famous participant should remain structurally equal to every other participant—one person, one existence, one star. The platform should not turn celebrity participation into a special section, ranking, badge, or consumption loop.

The user's own origin account connected LivingFlow to the emotional impression left by fictional collective-memory worlds such as Final Fantasy VII's Lifestream and Avatar's Eywa. His stated question was whether traces of lives could be connected **while people are living**, rather than only imagined as a posthumous realm. This records personal inspiration, not a legal conclusion, marketing recommendation, or claim of independent copyright clearance. The historical assistant's copyright assurances are explicitly not treated as authoritative.

The durable design test emerging from this period is:

> Does a feature make an already-famous person more famous, or does it allow that person to remain simply one human existence among others?

### Additional provenance

- Source file: `conversations-011.json`
- Source index 63:
  - Conversation ID: `6957bcba-81a0-832c-bba0-d6e19ab0e0d6`
  - Title: `AllStory Map 자서전 서비스`
  - Key user message ID: `bbb21749-4faa-44a3-bb86-9c2d4fed0ec6`
- Source index 65:
  - Conversation ID: `695bcbb8-1d08-8326-8e30-09be4c90272c`
  - Title: `AllStory 개념 정리 1.5`
  - Key user message IDs:
    - story-first writing and suggested pin splitting: `bbb212f5-3e37-4dd8-b80c-0622bc37953f`
    - time as a third axis: `bbb21629-d52a-4898-87d1-85c267117de8`
    - fog-like collective flow: `bbb2114a-547c-4ec7-a446-b64f3869a8f5`
    - inspiration and living traces: `bbb2137f-5054-4356-968b-b10f12e2df7d`
    - integrated concept request: `bbb21f8c-db6e-436c-9655-03c6079d1485`
    - holographic installation idea: `bbb216b7-8fd1-4ead-bb38-08273fe2d964`
    - long-lasting rather than universal appeal: `bbb218bf-29ec-4066-ad99-fcc5b4c6609d`
    - celebrity participation idea and caution: `bbb21889-1cd6-4a63-bf7a-67c437f5718c`, `bbb21e4f-b2d1-4cdf-822f-c6914ace0065`
    - equal-existence declaration: `bbb219ab-5972-4409-86e1-1d61596ced41`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachments, generated images, external pages, live implementation, or current legal/IP status


## Relationship to current direction

Current repository state owns Allstory map/platform and Story Maker implementation. Use this evidence as lineage, not as an instruction to replace present `CURRENT.md`.

Durable lineage:

- preserve ordinary lived experience through place and remembered time;
- archive first, optional connection and meaning layers later;
- profiles and engagement metrics remain subordinate to pins and lived context;
- continuous writing may precede spatial/temporal structuring;
- future collective meaning can emerge from shared place/time without ranking people;
- dedication and pseudonym safety are meaningful future design threads.

## Provenance

- Source file: `conversations-011.json`
- Source index: 42
- Conversation ID: `6946b2f3-3914-832a-94cc-d5d10678d12c`
- Title: `AllStory Map 1: 기본 철학과 MVP 그리고 Messenger와 ref`
- Key user message IDs:
  - MVP scope and web decision: `6ad99845-f6b8-46a6-94bf-15056f4f0f6d`, `41256c20-3b45-4c1e-8ee1-09158a28ac5e`
  - copy/privacy/feedback decisions: `e1ffcbc4-d322-495a-8d9e-300091592a43`, `ae8b9a34-ee4f-40be-b583-2a5196c41c35`, `09388453-8dba-4408-bce3-153707357878`
  - remembered-time model: `bbb21778-9d85-4394-b06f-878e7f4ea37b`
  - connection and pin-first conversation: `bbb21675-a641-4b6d-a396-f2ada1a590fb`, `bbb21cc8-b650-4cfb-822f-4c1df5000123`, `bbb2124f-8ac5-49ce-8d48-a26b54fa1c82`
  - reference/edit boundary: `bbb212d2-64b2-4505-9964-46392fcba531`, `bbb21179-29d3-4c70-9cc5-3c3be1bf90e1`
  - builder/world and archive-first decision: `bbb21f6f-8075-4912-aebb-9c5eabe616de`, `bbb21566-a66d-48b0-ac0d-5ee432520c57`, `bbb21141-cffd-49d5-8118-145036ed3202`
  - sky/collective-memory layer: `bbb215e9-6f06-47c6-a697-ea8abf8dd752`
  - continuous writing to linked pins: `bbb21692-659d-4bf7-a778-2ab358789b67`
  - dedication/Honor Space and pseudonyms: `bbb21d28-4a1a-41e3-b6e5-7c12dab62e0c`, `bbb21d30-bcae-4593-a81f-178f6fc58d81`, `bbb21306-dc50-4496-80cb-a15717c15ec5`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachments, external pages, cited search results, or image content
