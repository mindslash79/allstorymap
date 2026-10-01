# Allstory Map

Allstory map/platform and creative tooling repository.

## Role
This repository owns:
- Allstory map/platform application work
- map-related web UI and Supabase integration
- **canonical Story Maker ownership**

The root app is a Next.js project. Story Maker tooling lives under `story-maker/`.

## Story Maker boundary
Story Maker belongs conceptually to this repository because it designs narrative structure, locations, scenes, experience flow, and handoff data for downstream map/game construction.

A transitional deployment/runtime copy currently exists in:

`mindslash79/rpg-character-factory/apps-script-deploy/StoryMaker.gs`

That copy currently shares the RPG Character Factory Apps Script deployment environment. It must not be deleted until deployment coupling is safely separated.

New Story Maker design direction should be treated as owned here, not by RPG Character Factory.

See:
- `story-maker/README.md`
- `CURRENT.md`

## Development
Typical Next.js commands:

```bash
npm install
npm run dev
```

Do not infer Story Maker ownership from where an Apps Script deployment copy happens to live.

## Public repository boundary

This repository is public product/tooling source. Keep private personal, business, health, client, credential, and account-specific operational context out of durable Git content here.

A fresh AI session should use this repository only for Allstory map/platform and Story Maker work. Cross-domain personal or business context belongs in its own canonical repository and should be retrieved only when materially necessary.
