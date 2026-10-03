# 2025-12-19 AllStory Map product-origin evidence

Recorded from the GPT export on 2026-10-03.

## Status and boundary

This is historical product evidence, not a claim about current implementation.

Only public-safe product principles are recorded here. The private autobiographical circumstances in which the idea was discussed remain in `mindslash79/life-review`.

## Product premise

On 2025-12-19 the user described a map-based place-and-time memory layer:

- a person places a pin;
- attaches a time;
- adds text, photo, or video;
- preserves an ordinary lived moment at that place.

The object of attention is the **moment**, not the popularity or profile of the person who posted it.

The user emphasized older adults' stories and ordinary experiences that might otherwise disappear. The intended design was self-authorship: people record their own moments rather than becoming material gathered by an interviewer or curator.

## Core interaction principles

### 1. Preserve moments without ranking people

- Pins should have equal visual weight.
- The product should not rank contributors.
- The core should avoid follows, recommendation feeds, popularity ladders, notification pressure, and infinite scroll.
- The default experience begins from place, especially current location, rather than from a social graph.

### 2. Reaction without comment threads

The user proposed a single lightweight reaction, expressed as **“I feel this.”**

He did not want conventional comments. If a person wished to respond meaningfully, the response should be a new, independently authored moment or story rather than a subordinate comment attached to someone else's post.

### 3. Identity remains optional and locally controlled

- Default identity could be an anonymous numeric ID.
- A display name could be added later.
- Visibility of the identifier could be controlled per post.

This supports continuity without making personal profile performance the center of the experience.

### 4. Text should not be artificially compressed

The user rejected a normal short text limit. An extreme abuse/systems cap may exist, but the product should not force lived experience into social-media brevity.

### 5. Public contribution requires explicit disclosure

The user understood the map layer as public data and wanted that fact made clear to contributors. Consent and privacy design remain implementation requirements; this historical discussion did not settle the full policy.

## Core versus derived experiences

The user separated two layers:

### Core preservation layer

- quiet;
- non-addictive;
- minimally interpretive;
- optimized for keeping moments and letting them exist.

### Derived layers

Separate products or experiences may read public contributions through a read-only API for:

- art;
- city interpretation;
- research;
- connection;
- other transformations.

The core should not absorb these functions if doing so would turn preservation into engagement optimization.

This separation anticipated a durable product boundary:

> keep the source experience simple and dignified; let analysis, connection, and monetization happen in separate derived surfaces.

## Sustainability idea

The historical discussion proposed a pay-what-you-can model for the core, with a suggested amount around CAD 5 and higher voluntary contributions helping keep access available for others.

Derived applications and API use were considered possible monetization surfaces. This was an idea, not a finalized pricing decision.

## Historical implementation self-reports

On 2025-12-24 the user reported:

- setting up Node.js;
- creating a Supabase account and project.

On 2025-12-27 the user estimated that an MVP was about 25% complete.

These are user-reported milestones. They do not verify commit history, deploy state, current architecture, or current product direction.

## Relationship to current repository direction

Current `CURRENT.md` defines this repository as the canonical Allstory map/platform and Story Maker implementation source. The evidence above predates the later Story Library/Story Maker evolution.

Use it as design lineage:

- place + time + lived story;
- dignity and self-authorship;
- meaning over ranking;
- a quiet source layer;
- clear handoffs to derived experiences.

Do not treat every historical detail as a present requirement without reconciling it with current product direction.

## Provenance

- Source file: `conversations-011.json`
- Conversation ID: `69453d32-7d5c-8329-bb02-c614e6b80d04`
- Title: `신경대화 9: 차오름과 연료`
- Key user message IDs:
  - initial map idea: `bbb21fee-2e4c-46d8-a7c9-93894d22ac50`
  - ordinary moments and older adults: `bbb21951-8f35-4266-9aaa-553d9d033135`, `bbb213ec-2d75-4a7e-8d36-11824f152771`
  - self-authorship: `bbb21be5-2ded-40e6-94db-7cdd04397864`
  - moment rather than person: `bbb21188-97b6-4a6a-bcff-689bf0c86f9c`
  - no comments / “I feel this”: `bbb21389-9275-4e9c-880c-9793bf79edbf`, `bbb21ed7-1b51-4885-a0c7-d162d1c66a1c`
  - numeric identity and per-post visibility: `bbb21d7d-6673-469f-870c-bd81156964a7`, `bbb21974-0c30-4389-bed8-6c8250b805e5`
  - pay what you can: `bbb2122f-9c5e-47cb-ae8f-2c639d556eac`
  - core/derived separation and API: `bbb21690-ba43-49d4-b129-7c0348b5b546`, `bbb21b1a-e1ab-4dc5-83fa-d40bc311933f`, `bbb2182f-4efe-4585-a7e9-cdd08e83dcc0`
  - text-limit correction: `bbb212a7-4d10-4008-9404-db3feb229a56`
  - setup and MVP self-reports: `bbb2144e-5535-48e3-8884-0fed0045b262`, `bbb214cd-cf51-417a-bc44-6fa71515fdb7`
- Review method: selected `current_node` parent-chain user/assistant text
- Not reviewed: alternate branches, attachments, or external source content
