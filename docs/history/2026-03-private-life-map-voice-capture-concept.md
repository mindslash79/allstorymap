# March 2026 private life-map / voice-capture concept

Status: historical product-design evidence  
Source cutoff: 2026-03-01  
Recovered: 2026-10-04

This document preserves product decisions from the selected current-node parent-chain of two ChatGPT export conversations. It is not evidence that the product was built or launched. Later repository direction and current implementation state take precedence.

## User-stated purpose

The proposed AllStory Map experience connects:

- a person's short voice or text records;
- a time and, where available, a place;
- optional photos and categories;
- later listening or reading for self-understanding;
- a private personal-history map that can reveal gaps by time and life domain.

The user described the central goal as **self-reflection / self-understanding**. The product should let a person record many short moments during the day, then revisit their own life instead of defaulting to social feeds or video platforms.

A related experience is a **personal trip**: revisit an important place, walk, recall events and relationships, and make short categorized voice pins. A place that cannot be revisited physically may still receive a map pin. The longer-term value proposed by the user was a personal history that could, by deliberate sharing, become a legacy for trusted people or descendants.

## Explicit user decisions in the historical conversation

These were stated or selected by the user:

- initial use should be private;
- the growth sequence imagined was self first, then similar people, then wider use;
- a one-week MVP could be tested by the user and two or three close friends;
- Android should support text and audio capture;
- the web surface should support text writing, without web audio capture;
- recording should begin immediately from a large central button;
- stopping should save immediately;
- the desired pattern was frequent daily visits and many short recordings;
- a simple personal “movie” could combine the user's records, map and uploaded photos with licensed or pre-made music.

The user also proposed a first personal-trip test: ask a friend to choose one especially memorable place, visit it together, and create short categorized voice pins there.

## Assistant-originated proposals, not user facts

The assistant suggested, among other ideas:

- a three-tab Record / Timeline / YourTube structure;
- AI-generated titles, one-line “echoes,” and a nightly audio recap;
- a warm but restrained narrator;
- an undo window after automatic saving;
- Expo / React Native plus Supabase;
- a one-week scope built around authentication, an entries table, storage, an Android recorder and web text entry;
- deferring maps, TTS, background recording and heavier AI work.

These are preserved as historical design candidates. They were not proof of implementation, launch, feasibility, current technical direction or current user preference.

## Experience model worth retaining

The two conversations suggest a compact loop:

```text
live or revisit a meaningful moment
→ capture a short voice/text record
→ bind it to time, place and category
→ review patterns and blank areas
→ revisit memory, gratitude and relationships
→ return to present life with more context
```

The product opportunity is not only archiving. It is helping someone encounter a life through time, place, voice and later reinterpretation.

## March 26 refinement: meaning and choice at a place

In a later conversation, Heesoo returned to the idea after feeling that visiting a particular place could help him complete an internal process. The personal event itself is not retained in this public repository. The product refinement was:

- bind a memory to a physical place and time;
- prompt the person to record its meaning;
- prompt how the moment relates to a choice;
- allow a later revisit to reveal how meaning or choice changed.

This adds a stronger agency layer to the earlier archive concept:

```text
place + time
→ remembered experience
→ user-authored meaning
→ user-authored choice
→ later revisit and reinterpretation
```

The source assistant proposed additional mandatory fields, “before/after” identity language, and automated comparison. Those were assistant-originated design suggestions, not confirmed user decisions.

## Privacy boundary

The concept assumes private-by-default personal material and selective sharing. Product tooling may be public, but real voice notes, family history, exact locations and other personal content do not belong in this public repository.

## Provenance

Source file: `conversations-013.json`

Conversation 1:
- title: `AllStory Map 정리`
- conversation_id: `69a39d38-6124-832f-8700-3c8f3348f5cd`
- selected-path messages reviewed: 0–86
- important user message_ids: `bbb21f01-ae8f-409d-a261-15348bd4a9d0`, `bbb21002-18fa-42a6-8ac6-6fcf1b13f15b`, `bbb21064-4d35-48a1-af61-fb5b51a2c505`, `bbb21d94-5349-4e3e-ab9e-f260050a3a7d`, `bbb210b4-61d1-4660-b869-cc72e0957746`, `bbb21bbf-d95a-469f-89c7-4a19fdc1f597`, `bbb21b22-8854-4c08-9c21-9415806864ee`, `bbb2128a-543d-4375-b3ac-e50d158bce58`, `bbb21e90-28a5-4b8d-bcfa-40e40bed5495`, `f5870c86-b0cf-46aa-855c-b96ea0a47bcb`

Conversation 2:
- title: `추억의 순례와 의식`
- conversation_id: `69a3bad0-8598-832c-9f99-85a12ca6dafe`
- selected-path messages reviewed: 0–13
- important user message_ids: `bbb21f02-7856-45a7-8335-5f83a0b5d056`, `bbb21978-8509-4cbe-8b1f-ed3451a1dd43`, `bbb21894-fe24-4cbb-89e3-38f43e58a473`, `bbb21e3f-eb0e-4327-a0a9-a48d6636352f`, `bbb21da7-0aaf-46b2-8383-cb5865b25d10`

Source file: `conversations-014.json`

Conversation 3:
- source index: 45
- title: `장소와 기억의 연관성`
- conversation_id: `69c55765-8428-8333-a359-1721870535b8`
- selected-path messages reviewed: 0–7
- important user message_ids: `bbb213cd-13b6-4ee0-b414-adbef6e192bf`, `bbb21029-6c38-4746-99ca-0b4af0e63bea`

Review boundary: selected current-node parent-chain user/assistant string text only. Alternate branches and attachment contents were not reviewed.

## March 27 audience-mind refinement

Heesoo described the audience member's mind as the actual canvas. The creator should understand who the audience may be and create conditions in which an experience can arise, rather than dictating a single required emotion.

He connected this to mature audiences carrying both new desires and old, memorable emotions. The product implication is a restrained experience-design principle:

```text
understand the audience context
→ create conditions for encounter
→ leave interpretive space
→ let meaning arise in the person
```

This is historical product philosophy, not evidence of a validated audience model, market segment or implemented feature. The assistant's market and psychological generalizations are excluded.

Additional provenance:
- source file: `conversations-014.json`
- source index 60, conversation `69c74a63-a5e0-8325-a3c2-ca493fd3039d`, title `고객의 마음 상태`, user messages `bbb21b9e-19d1-47d6-a187-c29dad394838`, `bbb21ac3-5cd0-4f3a-9e24-c31704519e41`
- source index 61, conversation `69c74d96-c28c-8328-ba74-ee972ec9ba8e`, title `경험 설계의 중요성`, user messages `bbb21a4c-b87e-49ca-bf74-ff4e625053b6`, `bbb21f6a-7335-4cca-9a44-34e05469af10`


## April–May 2026 origin and implementation evidence

A later source conversation clarified the product origin without changing the privacy boundary above. Heesoo said he began AllStory Map for himself and after hearing an older neighbour's Toronto stories. The public-safe product insight is that place- and time-bound memories can keep a person's stories from disappearing and can help later generations understand what the person experienced, valued and felt. At that point he reported that the product could show a Google Map and record pins. This is historical self-report, not verification of the repository's current feature set.

A separate April 2026 troubleshooting conversation preserves a narrow user-confirmed implementation result:

- Heesoo wanted the map to remain full width while a My Pins drawer opened over it from the right;
- after several unsuccessful iterations, he confirmed success after changing the drawer's opening `<aside>` so it was fixed and right-anchored;
- immediately afterward he reported that the map search field was missing;
- the selected path ended after the assistant proposed restoring the search as a fixed overlay, so that restoration is **not user-confirmed**.

The failed intermediate diagnoses and assistant-generated replacement code are not promoted as current repository facts. Only the user's explicit success report for the right-side drawer is retained as implementation evidence.

Additional provenance:

- source file: `conversations-016.json`
- source index 0, conversation `69e98300-8590-83ea-84a1-92039e2ec9db`, title `Git을 이용한 업데이트 방법`, selected-path messages 0–41; important user messages `b66d7ec3-99cc-4a11-97ad-2ca21fa11c57`, `1981565a-ae1f-43dd-aa6f-441e07813b42`, `30e3d985-5c34-4e3f-a312-8af2e2f508cb`, `a166c695-3949-4eb0-aed8-476c502a745f`
- source index 83, conversation `69f80a5f-bfd8-83ea-8e2d-30a59b03885d`, title `AllStory Map 아이디어`, selected-path messages 0–1; important user message `bbb21e32-3b54-46b1-95d2-30061824207e`

Review boundary: selected current-node parent-chain user/assistant string text only. Alternate branches and attachment contents remain pending. The neighbour's identity, exact locations and private memories are intentionally omitted from this public repository.
