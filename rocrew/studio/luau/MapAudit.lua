--!strict
-- RoCrew map audit: finds visual problems that screenshots miss, by geometry instead of pixels.
-- Run it in Studio (command bar, or the Studio MCP run-code tool). It changes nothing; it prints
-- a report. Set ROOT to the folder to check (default: workspace.Map, else all of workspace).
--   1. Z-fighting: two visible faces on the same plane that overlap (they flicker in game).
--   2. Floating parts: anchored, visible parts touching nothing and with nothing just below.
--   3. Holes: spots in the play area where a player falling straight down hits nothing.

local ROOT: Instance = workspace:FindFirstChild("Map") or workspace
local PLANE_EPS = 0.02 -- studs: faces closer than this flicker
local MIN_OVERLAP = 0.05 -- studs²: ignore touching edges
local MAX_PARTS = 25000
local HOLE_STEP = 8 -- studs between hole probes

local function visible(p: BasePart): boolean
	return p.Transparency < 0.95 and p:IsA("Part") and (p :: Part).Shape == Enum.PartType.Block
end

-- The 6 faces of a block: centre, normal, and its two in-plane axes with half sizes.
type Face = { c: Vector3, n: Vector3, u: Vector3, v: Vector3, hu: number, hv: number }
local function faces(p: BasePart): { Face }
	local cf, s = p.CFrame, p.Size
	local axes = { cf.RightVector, cf.UpVector, cf.LookVector }
	local half = { s.X / 2, s.Y / 2, s.Z / 2 }
	local out = {}
	for i = 1, 3 do
		local j, k = i % 3 + 1, (i + 1) % 3 + 1
		for _, sign in { 1, -1 } do
			table.insert(out, { c = cf.Position + axes[i] * half[i] * sign, n = axes[i] * sign, u = axes[j], v = axes[k], hu = half[j], hv = half[k] })
		end
	end
	return out
end

-- Overlap area of face b projected onto face a's rectangle (exact for aligned faces, close otherwise).
local function overlap(a: Face, b: Face): number
	local minU, maxU, minV, maxV = math.huge, -math.huge, math.huge, -math.huge
	for _, su in { 1, -1 } do
		for _, sv in { 1, -1 } do
			local corner = b.c + b.u * b.hu * su + b.v * b.hv * sv - a.c
			local cu, cv = corner:Dot(a.u), corner:Dot(a.v)
			minU, maxU = math.min(minU, cu), math.max(maxU, cu)
			minV, maxV = math.min(minV, cv), math.max(maxV, cv)
		end
	end
	local w = math.min(maxU, a.hu) - math.max(minU, -a.hu)
	local h = math.min(maxV, a.hv) - math.max(minV, -a.hv)
	return (w > 0 and h > 0) and w * h or 0
end

local parts: { BasePart } = {}
for _, d in ROOT:GetDescendants() do
	if d:IsA("BasePart") and d.Transparency < 0.95 then
		table.insert(parts, d)
		if #parts >= MAX_PARTS then break end
	end
end

local zfight, floating, seen = {}, {}, {}
local params = OverlapParams.new()
params.FilterType = Enum.RaycastFilterType.Include
params.FilterDescendantsInstances = { ROOT }

for _, p in parts do
	local near = workspace:GetPartBoundsInBox(p.CFrame, p.Size + Vector3.new(0.2, 0.2, 0.2), params)
	local touching = false
	for _, q in near do
		if q ~= p and q.Transparency < 0.95 then
			touching = true
			if visible(p) and visible(q) then
				local key = p:GetDebugId() < q:GetDebugId() and p:GetDebugId() .. q:GetDebugId() or q:GetDebugId() .. p:GetDebugId()
				if not seen[key] then
					seen[key] = true
					for _, fa in faces(p) do
						for _, fb in faces(q) do
							if fa.n:Dot(fb.n) > 0.999 and math.abs(fa.n:Dot(fb.c - fa.c)) < PLANE_EPS then
								local area = overlap(fa, fb)
								if area > MIN_OVERLAP then
									table.insert(zfight, string.format("%s  <->  %s  (%.1f studs² at %s)", p:GetFullName(), q:GetFullName(), area, tostring(fa.c)))
								end
							end
						end
					end
				end
			end
		end
	end
	if not touching and p.Anchored and not p:GetAttribute("Floating") then
		local down = workspace:Raycast(p.Position - Vector3.new(0, p.Size.Y / 2, 0), Vector3.new(0, -1, 0))
		if not down then table.insert(floating, p:GetFullName()) end
	end
end

-- Holes: probe a grid over the map's footprint from above.
local holes = {}
local ok, cf, size = pcall(function()
	local model = ROOT:IsA("Model") and ROOT or nil
	if model then return (model :: Model):GetBoundingBox() end
	local mn, mx = Vector3.new(math.huge, math.huge, math.huge), Vector3.new(-math.huge, -math.huge, -math.huge)
	for _, p in parts do mn = mn:Min(p.Position - p.Size / 2); mx = mx:Max(p.Position + p.Size / 2) end
	return CFrame.new((mn + mx) / 2), mx - mn
end)
if ok and size and size.Magnitude < 1e5 then
	local top = cf.Position.Y + size.Y / 2 + 5
	for x = -size.X / 2, size.X / 2, HOLE_STEP do
		for z = -size.Z / 2, size.Z / 2, HOLE_STEP do
			local origin = Vector3.new(cf.Position.X + x, top, cf.Position.Z + z)
			if not workspace:Raycast(origin, Vector3.new(0, -(size.Y + 500), 0)) then
				table.insert(holes, string.format("(%d, %d)", math.round(origin.X), math.round(origin.Z)))
			end
		end
	end
end

local function list(title: string, items: { string }, max: number)
	print(string.format("[MapAudit] %s: %d", title, #items))
	for i = 1, math.min(#items, max) do print("   " .. items[i]) end
	if #items > max then print(string.format("   …and %d more", #items - max)) end
end
print(string.format("[MapAudit] Checked %d visible parts under %s", #parts, ROOT:GetFullName()))
list("Z-fighting pairs (fix: move one face 0.01-0.05 studs, resize, or merge)", zfight, 60)
list("Floating parts (fix: ground them, or set attribute Floating=true if intended)", floating, 40)
list("Holes with nothing below (fix: fill, or add an invisible catch/kill floor)", holes, 40)
