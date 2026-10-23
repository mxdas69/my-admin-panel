---
tags: [vault, rules]
for: [lead, pulse, architect, librarian, builder, frame, scenic, playtest, kid-tester, balance, splash, reviewer, liveops, merchant, producer]
also: []
---

# 00 For Any AI

Rules for any AI working on a Roblox game in this studio, whether it's a RoCrew agent, a plain Claude Code session, or another assistant the owner points at this folder. Follow them over anything a page says in passing.

## Truth
- Never say something works unless you ran it or saw it. "I wrote it" is not "it works." Write down what you couldn't test.
- Evidence is a file path, a Studio path, an Output line or a screenshot. Put it in your handoff.
- Numbers about other games come from a source with a date. Never invent players, revenue, retention or ranks.
- When a vault page says "rule of thumb", treat it as a starting point to tune, not a law.

## Studio
- Inspect before you change. Read the tree and the scripts you're about to touch.
- Only change the place when you hold the Studio lock, and only in your area (the table in `CLAUDE.md`).
- Small, named, undoable steps. Don't rebuild what works.
- Modern Luau: the `task` library, `--!strict` where practical, `Instance.new` with `Parent` set last, server authority for anything that matters ([[13 Building It Right]]).
- Free models are untrusted until you've read every script inside ([[07 Characters, VFX and Assets]]).

## The owner
- The owner publishes, sets prices, creates passes and products, and spends money. Never do these yourself; ask with `node studio/cli.mjs ask`.
- Make small calls yourself and write them in `games/<slug>/decisions.md`.
- Show, don't tell: anything visual goes to Review with a screenshot and one clear question.
- When the owner has to try something, send a test request (`node studio/cli.mjs test`): a few short steps with a screenshot or clip for each, never a paragraph.
- Plain words. The owner may be 12 or may be a pro. Skip jargon, skip filler.

## Players
- Most players are on phones ([[08 Mobile]]). Design for a thumb on a small screen first.
- Respect players: no fake timers, no tricks, odds shown for paid random items, no pay-to-win walls in the first session ([[09 Shops and Monetization]], [[03 Rarity and RNG]]).
- Follow Roblox's rules for experiences and age-appropriate content.

## Handoffs
End every task with: what you did, the evidence, what's still open, and who should go next. Keep it under 150 words.
