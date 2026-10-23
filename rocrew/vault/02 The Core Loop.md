---
tags: [vault, core-loop]
read_by: [lead, pulse, architect, builder, frame, librarian, balance, kid-tester, playtest, producer, merchant, liveops]
---

# 02 The Core Loop

The core loop is the cycle a player repeats for most of their time in the game. A satisfying loop survives rough edges; a broken one cannot be rescued by content, UI or monetization. Every feature RoCrew builds should strengthen one step of the loop, and every pitch, plan and review should start by restating it in one sentence.

## The basic shape

`action -> reward -> upgrade -> bigger action`

- **Action:** what the player does with their hands: click, swing, jump, place, roll, drive, fight.
- **Reward:** what the action gives right away: currency, XP, an item, stage progress, a knockout.
- **Upgrade:** what the reward buys: a better tool, more storage, a new zone, a new tower, more luck.
- **Bigger action:** the same verb, visibly stronger or in a new place, with bigger numbers.

Every arrow must be visible. The player sees the reward land, sees the next upgrade they can afford, and feels the upgrade the moment they buy it.

## Loop layers

| Layer | Time scale | Example (simulator) | Job |
|---|---|---|---|
| Micro | 1-5 seconds | Swing, coin pops out, `+3` | Moment-to-moment fun and feedback |
| Short | 1-5 minutes | Fill backpack, sell, buy a better shovel | Frequent small goals and upgrades |
| Session | 15-60 minutes | Unlock the next zone, rebirth, hatch a rare pet | A reason to keep playing tonight |
| Long | days and weeks | Collection index, rebirth tiers, events, leaderboards | A reason to come back ([[10 Retention and Social]]) |

- At any moment the player has a micro action available, a short goal on screen and a session goal they know about.
- Each layer feeds the one above: micro rewards fund short goals, short goals unlock session goals.
- New content mostly extends the session and long layers. It rarely fixes a weak micro loop, so fix that first.

## The one-sentence loop statement

Write it before building and put it at the top of `plan.md`. Template:

> Players **[verb] [thing]** to earn **[reward]**, which they spend on **[upgrade]** so they can **[bigger verb / new place]**.

- Players **dig sand** to earn **coins**, which they spend on **shovels and backpacks** so they can **dig rarer sand on new islands**.
- Players **collect from droppers** to earn **cash**, which they spend on **more droppers and base parts** so they can **build a bigger tycoon and rebirth**.
- Players **roll** for **auras**, using **luck boosts** so they can **chase rarer auras and fill the index**.

If the team cannot write the sentence, or writes two, the design is not ready. If a proposed feature touches no part of the sentence, question it.

## Genre loops

| Genre | Micro loop | Short / session loop | Watch out for |
|---|---|---|---|
| Simulator | Click/swing to gather | Sell, buy tool/backpack/pet, unlock zone, rebirth | Upgrades that only change a hidden number |
| Tycoon | Collect from droppers, step on buy buttons | Next button always in sight; floors, upgraders, rebirth | Stretches with nothing to buy; confusing base layout |
| Obby | Jump, land, reach checkpoint | Stage counter, new themed section, finish a world | Difficulty spikes, unclear next platform, lost progress |
| Tower defense | Place and upgrade towers mid-wave | Win a match, earn currency, unlock or summon units | Slow early waves, placement that doesn't matter |
| RNG / collection | Roll, reveal | Better rolls through luck, index completion, crafting | Long reveals, top tiers nobody ever sees ([[03 Rarity and RNG]]) |
| Battlegrounds / fighting | Combo, dodge, ability, hit reaction | Knockouts, streaks, new characters or movesets | Weak hit feedback, new players beaten instantly |
| Delivery / job | Take a job, travel, drop off | Get paid, buy vehicle/tools/house, unlock better routes | Long travel with nothing happening |

## Feedback and juice

Every action gets feedback on the client within a frame or two. Layer several channels:

- **Sound:** short and punchy, with slight pitch variation (randomize `PlaybackSpeed` around 0.9-1.1) so repeats don't grate.
- **Particles:** a `ParticleEmitter:Emit(n)` burst at the hit point ([[07 Characters, VFX and Assets]]).
- **Numbers:** a floating `+5` that rises and fades; the HUD counter pops via UIScale.
- **Motion:** squash and stretch with tweens, a brief Highlight flash on hit, small camera shake for big moments only.
- **Escalation:** bigger rewards get bigger effects: rarity color, louder sound, a screen-wide burst for a legendary.

Feedback is cosmetic and may start before the server answers. The reward itself is always decided and granted by the server.

```lua
-- Server: validate the action and grant the reward; the client only asks
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Remotes = ReplicatedStorage.Remotes

local lastSwing: {[Player]: number} = {}

Remotes.Swing.OnServerEvent:Connect(function(player: Player)
	local now = os.clock()
	if now - (lastSwing[player] or 0) < Config.SwingCooldown then return end
	lastSwing[player] = now
	local gain = Config.BaseGain * (player:GetAttribute("Multiplier") or 1)
	-- add `gain` to the player's server-side data here, then tell the client
	Remotes.CurrencyGained:FireClient(player, gain)
end)

Players.PlayerRemoving:Connect(function(player) lastSwing[player] = nil end)
```

```lua
-- Client: pop the counter and float the number the server reported
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local POP = TweenInfo.new(0.08, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, true) -- plays back in reverse
local RISE = TweenInfo.new(0.7, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local hud = Players.LocalPlayer:WaitForChild("PlayerGui"):WaitForChild("HUD")
local coinScale = hud:WaitForChild("Coins"):WaitForChild("UIScale") :: UIScale

local function floatText(at: BasePart, text: string)
	local gui = Instance.new("BillboardGui")
	gui.Size = UDim2.fromScale(4, 1.5) -- Scale is in studs for BillboardGuis
	gui.StudsOffset = Vector3.new(0, 2, 0)
	gui.AlwaysOnTop = true
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = Color3.fromRGB(255, 220, 70)
	label.Text = text
	label.Parent = gui
	gui.Parent = at
	TweenService:Create(gui, RISE, { StudsOffset = Vector3.new(0, 5, 0) }):Play()
	TweenService:Create(label, RISE, { TextTransparency = 1 }):Play()
	task.delay(RISE.Time, gui.Destroy, gui)
end

ReplicatedStorage.Remotes.CurrencyGained.OnClientEvent:Connect(function(amount: number)
	coinScale.Scale = 1
	TweenService:Create(coinScale, POP, { Scale = 1.15 }):Play()
	local root = Players.LocalPlayer.Character and Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
	if root then floatText(root :: BasePart, "+" .. amount) end
end)
```

## Spotting a broken loop

| Symptom (playtest or analytics) | Likely cause | Fix |
|---|---|---|
| Players quit right after the first upgrade | The upgrade isn't felt | Make it visible: bigger model, faster animation, bigger numbers |
| "What do I do now?" | No visible next goal | Always show the next affordable thing and the objective |
| Long idle gaps between purchases | Costs outpace income | Retune growth, add mid-tier upgrades ([[04 Progression and Economy]]) |
| Players go AFK instead of playing | Passive income beats active play | Active play clearly better; passive income is a bonus |
| Everyone farms one spot or trick | One action dominates | Rebalance reward per effort, add diminishing returns |
| Rebirth ignored or feared | The reset feels like a loss | Preview the gain, keep pets/cosmetics, make the next run visibly faster |
| Players avoid the main verb | The verb itself is dull | Fix micro feedback before adding content |
| Sessions end at the same point for everyone | A wall: no reachable goal | Add a goal within ~10 minutes of that point |

**The three-question test:** stop a playtester at a random moment. They should answer within a few seconds: What am I doing? Why? What's next? Any "don't know" is a loop or UI bug.

## Checklist

- [ ] `plan.md` opens with a one-sentence loop statement, and only one
- [ ] Each layer (micro, short, session, long) has a named mechanic in the plan
- [ ] The micro action works with one tap on mobile and gives feedback on the same frame
- [ ] Every reward has at least sound + visual + number feedback
- [ ] The next upgrade and its price are visible on screen at all times
- [ ] Buying an upgrade visibly changes the action (model, speed, effect or numbers)
- [ ] All rewards are computed and granted on the server; remotes have cooldowns
- [ ] Bigger rewards trigger bigger effects (rarity colors, louder sounds)
- [ ] A playtester passes the three-question test at three random moments
- [ ] No stretch longer than ~10 minutes without a reachable goal (check the economy sim)

## Common mistakes

- Building content (zones, pets, maps) before the micro loop feels good.
- Upgrades that only change a stat the player never sees.
- Two or three competing loops with separate currencies and no clear main one.
- Juice that is all visuals and no sound, or the same sound at the same pitch every time.
- Reward amounts chosen by the client, or remotes with no rate limit.
- Passive or AFK income that out-earns playing.
- Copying a genre's loop without its feedback: the numbers but none of the feel.
- Long reveal or celebration animations that can't be skipped once they repeat.

## Related

[[00 Start Here]] · [[01 The First Five Minutes]] · [[03 Rarity and RNG]] · [[04 Progression and Economy]] · [[07 Characters, VFX and Assets]] · [[09 Shops and Monetization]] · [[10 Retention and Social]] · [[12 Live Ops and Launch]] · [[13 Building It Right]]
