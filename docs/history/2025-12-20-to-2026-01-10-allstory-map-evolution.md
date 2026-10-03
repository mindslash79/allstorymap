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
