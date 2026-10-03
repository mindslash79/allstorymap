# Story Maker

Canonical ownership surface for Story Maker.

## Purpose
Story Maker turns creator input into structured narrative design data for RPG/game production, including:
- story and payload
- audience
- character bibles
- narrative structure
- important locations
- scenes
- character-state continuity
- player-experience composition
- validation
- final Scene/Location handoff

## Canonical ownership
**Design ownership belongs here: `mindslash79/allstorymap/story-maker/`.**

## Transitional deployment dependency
A larger base pipeline currently also exists at:

`mindslash79/rpg-character-factory/apps-script-deploy/StoryMaker.gs`

That file currently depends on the existing RPG Character Factory Apps Script project and shared Script Properties. It is therefore a **transitional deployment/runtime dependency**, not the conceptual owner of Story Maker.

Do not delete or independently redesign that deployment copy until:
1. the complete active Story Maker source/dependency chain is reconciled;
2. a dedicated or otherwise explicit deployment path exists;
3. the current Google Sheet/Apps Script runtime is verified after separation.

## Current source situation
This directory contains the historical/evolving Story Maker patch series, including runtime patches through v10.

The portfolio boundary is now clear even though deployment consolidation is not yet complete:
- Allstory Map owns Story Maker direction.
- RPG Character Factory owns character/visual asset tooling.
- Temporary deployment coupling may remain until safely removed.

See `CURRENT.md` at repository root.


## Library game production direction

For Story Library's short psychological/playable stories, the current direction is **agent-first production rather than building a universal compiler first**.

Story Maker acts as the Creative Director / structured production brief. A Library Game Builder should read that output, copy/read a small RPG Maker base project, directly edit the required RPG Maker JSON/JavaScript/assets, run tests and browser verification, repair failures, and produce a playable preview.

Only patterns that repeat across real games should later be extracted into deterministic helpers/templates/compiler-like tooling.

See:
- `2026-10-02-agent-first-library-game-production.md`
