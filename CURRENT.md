# CURRENT

Updated: 2026-10-05

## Role
Allstory map/platform and canonical Story Maker ownership.

## Status
Active.

The repository contains the Next.js map/platform work and a Story Maker patch history through v10.

## Story Maker boundary
Canonical design ownership: `story-maker/`.

A larger base Story Maker pipeline currently remains in `mindslash79/rpg-character-factory/apps-script-deploy/StoryMaker.gs` as a transitional deployment/runtime dependency.

Do not delete or independently diverge the deployment copy until the full active source/deployment chain is reconciled and verified.

## Library game production direction

For Story Library's small psychological games, Story Maker is now treated as the **creative-director / structured narrative layer**. Initial end-to-end production should be agent-first: an AI Game Agent directly creates or edits a small RPG Maker project from Story Maker output and verifies the playable result.

Do not build a universal game compiler first. Use:

```text
Agent first → make real games → observe repetition → extract deterministic helpers/templates
```

Reference: `story-maker/2026-10-02-agent-first-library-game-production.md`.

## Historical product evidence

- `docs/history/2026-03-private-life-map-voice-capture-concept.md` preserves the March 2026 private voice/text life-map and personal-trip concept, plus April–May origin and narrow user-confirmed drawer evidence. It is source history, not current implementation status; private user data remains outside this public repository.

## Next
Treat Story Maker direction here. Prove one end-to-end Library Game Builder flow from Story Maker output to a small playable RPG Maker preview, while preserving the current deployment boundary. Separate deployment coupling only when doing so has a concrete operational benefit and can be verified safely.
