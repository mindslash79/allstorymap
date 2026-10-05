# August 26–27, 2026 source history: Story Maker and experience-review loop

This historical source note records a design stage for Story Maker and DevReview. It belongs to canonical Story Maker ownership under AllStory Map. It does not assert current implementation state or copy private life/business context into the public product.

## Five-stage visible production flow

Heesoo proposed a Google Sheets control surface modelled on the visibility of his business automation:

`0 Control → 1 Story → 2 Map → 3 Asset → 4 Event`

The system should preserve raw source conversations/inputs separately from structured story data. Story data included a **Story + Payload** pair: the narrative and the value/experience intended for the player. It then expanded through beginning/middle/end, places, scenes, character states, and a composed target experience. Experience weights could be explicit and sum to ten, while the overall game should preserve the value-bearing portion rather than optimizing every individual scene in isolation.

The durable source-of-truth decision was that structured data should live in the project's own data store (at the time discussed as Supabase), with GitHub for version history and RPG Maker as renderer/runtime. Reverse-reading a built RPG Maker project was useful as semantic playtest and diagnosis, not as a reliable replacement for source specifications.

The assistant later reported a working `GAME_002` story generation result and an intent score/revision snapshot. Those operational claims were not independently inspected during this import. The conversation did identify an important consistency defect: revising a Scene without propagating the change back to Structure could leave higher-level story data stale.

## Creation Loop + Review Loop

The review design connected two directions:

- **Creation Engine:** intent → story → map/world → characters → assets → RPG Maker build
- **Experience Engine:** game → play → recording/comment → review → diagnosis → revision

At the top, a `Game Constitution` would preserve Core Value, Payload, desired player experience, emotional arc, aesthetic/tempo principles, and prohibited distortions. Each Scene could carry a Design Intent ID connecting its source purpose to a concrete map/event. Feedback was to be treated as observation rather than an automatic command. Review would compare intended experience with actual experience, diagnose the correct source layer, revise there, and regenerate downstream artifacts when required.

Three review modes were proposed:

- **Standalone:** no Creation data; review current game, recording, audio, and comments directly.
- **Spec-Grounded:** use Constitution/Payload/Scene intent as source-of-truth constraints.
- **Hybrid:** use available specification data and label inferred legacy mappings until the creator approves them.

The Google Sheet `Game Review Flow` was reported created with projects, sessions, map reviews, comments, findings, changes, creation context, settings, and dashboard tabs. The assistant also reported registering **너울 속 아이** as the first Standalone project and creating a Drive `VisualReview` folder. The reusable recorder plugin and end-to-end playtest were still the next steps at the end of the selected path.

## Provenance and boundary

- Source: `conversations-024.json`
- Conversations: `6a8ef183-ce00-83ea-9711-2af4c8858d09` and `6a904d56-94b8-83e9-b3d1-b78a29e5c2f8`
- Important messages: `87a62f61-536b-4121-b8ec-fde1a17f6313`, `b1236ab8-06b3-4c70-a18c-0c3f812befbb`, `fcec5a24-0774-4c78-b1c3-9e51a9e9268d`, `0953790c-adea-452e-b995-a95b5c0f5385`, `27ff93b4-1338-4e8b-b9d3-471a538f96a7`, `349122c7-5d7b-44e8-ab2a-0ce6d954f30a`, `bbb21ecd-84fd-49a0-a685-b5e3ae19611e`, `bbb219ad-470f-4c22-9688-4c2c69fe1836`, and `bbb21a69-b9dd-46ad-9645-208a57be3c06`
- Personal story source, private recordings, business/customer data, and credentials do not belong in this public repository. This note contains only reusable product/tooling design and source IDs.
- Scope: selected current-node parent-chain user/assistant string text; Drive/Sheet contents, generated artifacts, attachments, and alternate branches remain unreviewed.
