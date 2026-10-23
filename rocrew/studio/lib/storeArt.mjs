// Store art in one step: icons and thumbnails that get clicked and don't look AI-made.
//
// The look comes from the game itself: Splash stages the shot in Studio and captures it, and
// Gemini only *finishes* that capture (light, materials, background) in several variants, each
// changing one thing. Text is set with ffmpeg, never drawn by the model, so it's never garbled.
// A cheap Gemini judge scores every candidate at real phone size, and the set goes to the
// owner as one Review. Claude spends a couple of tool calls; Gemini does the heavy lifting.

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { generateImage, askGemini } from "./gemini.mjs";

export const ENDINGS = {
  icon:
    "Square Roblox game icon, finished like top front-page Roblox promo art: a polished, hand-finished 3D render of chunky Roblox characters and props, matte toy-plastic surfaces with soft roughness and crisp small bevels, hand-painted highlights. One subject fills about 70% of the frame, slightly off-center with the head tilted toward the viewer, and its big expressive face and silhouette read instantly at 64 pixels. One warm key light from the upper left, a bright cool rim light from behind, soft contact shadows. The background is a clean two-tone gradient in a contrasting hue. Important parts stay away from corners. Clean, wordless image: no text, logos or UI.",
  thumb:
    "Widescreen 16:9 Roblox game thumbnail, finished like top front-page Roblox promo art (stylized and exaggerated, never a realistic terrain or landscape shot): a polished, hand-finished 3D render of chunky Roblox characters and props, matte toy-plastic surfaces, crisp small bevels, hand-painted highlights, bold but controlled colors (one dominant hue, one accent). The hero sits on the left or right third, face in the upper third, with the hero item large and close to the camera. One warm key light, a strong cool rim light, grounded contact shadows. Clear depth: a sharp subject, a simpler mid-ground, and a background of a few big, softly blurred shapes. The top corner opposite the hero stays calm; the bottom fifth stays plain. No text, logos or UI.",
  pass:
    "Square Roblox game pass or developer product icon: one bold hero item or reward (a pet, a sword, a stack of coins, a speed boot) as a chunky stylized 3D render, matte toy-plastic surfaces with soft roughness and crisp bevels, hand-painted highlights, filling about 75% of the frame and centered for a circular crop. Very saturated, high-contrast colors with one dominant hue and a clean radial-gradient background in a contrasting hue. One warm key light, a bright rim light, a soft contact shadow. Simple, smooth shapes: no stud textures, no brick or LEGO look, no extra sparkles, lens flares or particles. Reads instantly at 64 pixels. No text, numbers or logos.",
  edit:
    "Finish image 1, a real Roblox Studio capture, into premium Roblox promo art. Image 1 is the exact layout: keep every character, pose, blocky Roblox proportion, face, outfit, item and the camera angle identical. Add no new limbs, fingers, characters or objects. Image 2, when present, shows the hero's exact look. Change only finish and light: matte toy-plastic materials with soft roughness, hand-painted highlights, one warm key light from the upper left, a bright cool rim light from behind, soft contact shadows, a richer but controlled color grade, the background simplified into a few big softly blurred shapes, and a gentle glow on the hero item only. Clean, wordless image: no text or UI.",
};

/**
 * Proven Roblox thumbnail formats. Top thumbnails aren't realistic terrain shots: they're
 * stylized, saturated, exaggerated promises. Each format adds its composition to the prompt
 * and, for split formats, its two labels (set with ffmpeg, never drawn by the model).
 */
export const FORMATS = {
  "day1-vs-day999": {
    prompt: "Split composition, left half vs right half divided by a bold diagonal line: on the left the player's tiny, weak, sad starting state (small base, one basic item, dull colors); on the right the same character's huge, maxed-out, triumphant late-game state (giant base, legendary glowing item, gold and rainbow accents, crowd of pets or loot). Strong contrast between the halves.",
    labels: ["DAY 1", "DAY 999"],
  },
  "before-after": {
    prompt: "Split composition, left half vs right half divided by a bold diagonal line: a poor, plain 'before' state on the left and a rich, upgraded 'after' state on the right, same character and camera.",
    labels: ["NOOB", "PRO"],
  },
  "1-vs-100": {
    prompt: "One lone hero character in the foreground facing a huge crowd or army of 100 enemies or players filling the background, dramatic low camera angle, hero brightly lit, crowd darker.",
    labels: ["1 VS 100"],
  },
  "giant-item": {
    prompt: "A massively oversized hero item (pet, egg, sword or reward) towering over a tiny amazed player character, exaggerated scale contrast, the item glowing with rarity color.",
    labels: [],
  },
  reaction: {
    prompt: "Close-up of a Roblox character with a huge shocked, open-mouthed expression reacting to a glowing legendary reward bursting out next to them, the reward taking a third of the frame.",
    labels: [],
  },
  "rarity-reveal": {
    prompt: "A hatching or unboxing moment: an egg or crate cracking open with a burst of rainbow and gold light revealing a legendary pet or item, the player character leaning in with wide eyes.",
    labels: ["SECRET"],
  },
};

export const JUDGE = `You judge Roblox store art. The image shows candidates labeled A-D left to right at real phone size, with grayscale copies below.
For each candidate score CTR 1-10: would a 9-14-year-old on a phone tap it over 20 neighbors? Reward one big subject, one clear emotion, a visible game fantasy or action, strong grayscale value contrast, and a palette distinct from typical Roblox icons.
Score AI_CLEAN 1-10, where 10 means it reads as hand-made studio promo art.
Deduct AI_CLEAN for: garbled or misspelled text, extra or fused limbs or fingers, proportions that are not blocky Roblox, waxy plastic sheen everywhere, glow everywhere, light from several directions, mushy background pseudo-objects, uniform detail with no focal point, dead-center symmetry, floating objects without contact shadows, clone characters.
Copy any visible text letter by letter into text_seen (empty if none); never correct the spelling.
Name the single worst problem in worst.
Give one concrete fix of 15 words or fewer in fix, written as an instruction we can paste into an image-edit prompt.
Be strict: 7 means ready for the owner, most first drafts score 4-6, and extra detail earns nothing by itself.
Output only JSON lines, one per candidate, no prose:
{"id":"A","ctr":0,"ai_clean":0,"text_seen":"","worst":"","fix":""}`;

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function run(cmd, args) {
  return new Promise((resolve, reject) => execFile(cmd, args, { windowsHide: true, maxBuffer: 1 << 24 }, (err, stdout, stderr) => (err ? reject(new Error(stderr?.toString().split("\n").filter(Boolean).slice(-2).join(" ") || err.message)) : resolve(stdout))));
}

/** A bold system font for ffmpeg text (escaped for its filter syntax). */
export function titleFont() {
  const candidates = [
    "C:/Windows/Fonts/impact.ttf",
    "C:/Windows/Fonts/ariblk.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Impact.ttf",
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
  ];
  const found = candidates.find((f) => fs.existsSync(f));
  return found ? found.replace(/:/g, "\\:") : null;
}

const escText = (t) => String(t).replace(/\\/g, "\\\\").replace(/'/g, "\u2019").replace(/:/g, "\\:").replace(/%/g, "\\%");

/** Final file: thumbnails 1920x1080 JPG (under Roblox's 3 MB), icons 512x512 PNG, optional title text. */
async function finish(src, out, kind, text, labels = []) {
  const font = text || labels.length ? titleFont() : null;
  const scale = kind === "icon" ? "scale=512:512:flags=lanczos" : "scale=1920:1080:flags=lanczos";
  const size = kind === "icon" ? 78 : 160;
  // Split formats get their two labels at the top of each half, in yellow with a heavy outline.
  const labelDraw = font && labels.length
    ? labels.map((l, i) => `,drawtext=fontfile='${font}':text='${escText(l)}':fontsize=${labels.length === 1 ? 190 : 170}:fontcolor=0xFFE14D:borderw=16:bordercolor=0x161616:shadowy=10:shadowcolor=black@0.6:x=${labels.length === 1 ? "(w-text_w)/2" : i === 0 ? "w*0.25-text_w/2" : "w*0.75-text_w/2"}:y=h*0.06`).join("")
    : "";
  const draw = labelDraw || !text ? labelDraw : font ? `,drawtext=fontfile='${font}':text='${escText(text.toUpperCase())}':fontsize=${size}:fontcolor=white:borderw=${kind === "icon" ? 7 : 14}:bordercolor=0x161616:shadowy=${kind === "icon" ? 5 : 10}:shadowcolor=black@0.55:x=${kind === "icon" ? "(w-text_w)/2" : "w*0.06"}:y=h*0.07` : "";
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", scale + draw, ...(kind === "icon" ? [] : ["-q:v", "3"]), out]);
  return out;
}

/** One contact sheet at real phone size with a grayscale row, for the judge (and the owner). */
async function contactSheet(files, kind, out) {
  const [w, h] = kind === "icon" ? [150, 150] : [480, 270];
  const inputs = files.flatMap((f) => ["-i", f]);
  const scaled = files.map((_, i) => `[${i}]scale=${w}:${h}[s${i}]`).join(";");
  const filter = `${scaled};${files.map((_, i) => `[s${i}]`).join("")}hstack=${files.length},split[c1][c2];[c2]hue=s=0[g];[c1][g]vstack`;
  await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", files.length > 1 ? filter : `[0]scale=${w}:${h},split[c1][c2];[c2]hue=s=0[g];[c1][g]vstack`, out]);
  return out;
}

export function parseJudge(text) {
  const out = {};
  for (const line of String(text).split("\n")) {
    const m = /\{.*\}/.exec(line);
    if (!m) continue;
    try {
      const j = JSON.parse(m[0]);
      if (j.id) out[String(j.id).toUpperCase()] = j;
    } catch {}
  }
  return out;
}

/**
 * Make a set of icons or thumbnails.
 * @param {object} o
 * @param {"icon"|"thumb"} o.kind
 * @param {string[]} o.variants   one line per variant; each changes one thing (background hue, grade, crop, effects)
 * @param {string[]} o.refs       Studio captures: the shot first, the hero close-up second
 * @param {string} o.dir          where to write (games/<slug>/art/<kind>s-<date>)
 * @param {string} [o.text]       1-3 words of title text, set with ffmpeg
 */
export async function makeStoreArt({ apiKey, imageModel, textModel, kind, variants, refs = [], dir, text = "", format = "", hasFfmpeg, generate = generateImage, ask = askGemini }) {
  if (!["icon", "thumb", "pass"].includes(kind)) throw new Error('kind must be "icon", "thumb" or "pass".');
  const list = variants.map((v) => v.trim()).filter(Boolean).slice(0, 6);
  if (!list.length) throw new Error("Give at least one variant line.");
  if (text && text.trim().split(/\s+/).length > 3) throw new Error("Keep title text to 3 words or fewer; it has to read at phone size.");
  fs.mkdirSync(dir, { recursive: true });
  const square = kind !== "thumb";
  const fmt = format ? FORMATS[format] : null;
  if (format && !fmt) throw new Error(`Unknown format "${format}". Formats: ${Object.keys(FORMATS).join(", ")}`);
  if (fmt && kind !== "thumb") throw new Error("Formats are for thumbnails.");
  const ending = refs.length ? `${ENDINGS.edit} ${square ? ENDINGS[kind] : ""}` : ENDINGS[kind];
  const aspect = square ? "1:1" : "16:9";

  const raw = await Promise.all(
    list.map(async (line, i) => {
      const id = LETTERS[i];
      try {
        const { file } = await generate({ apiKey, model: imageModel, prompt: `${fmt ? `${fmt.prompt} ` : ""}${line} ${ending}`, aspect, refs, out: path.join(dir, `${kind}_${id}_raw`) });
        return { id, line, raw: file };
      } catch (err) {
        return { id, line, error: err.message };
      }
    }),
  );
  const ok = raw.filter((r) => r.raw);
  if (!ok.length) throw new Error(`Gemini made no images: ${raw[0]?.error ?? "unknown error"}`);

  const canFinish = await hasFfmpeg();
  for (const r of ok) {
    r.file = canFinish ? await finish(r.raw, path.join(dir, `${kind}_${r.id}.${square ? "png" : "jpg"}`), square ? "icon" : "thumb", kind === "pass" ? "" : text, fmt?.labels ?? []).catch(() => r.raw) : r.raw;
  }

  let sheet = null;
  let scores = {};
  if (canFinish) {
    sheet = await contactSheet(ok.map((r) => r.file), square ? "icon" : "thumb", path.join(dir, `${kind}_sheet.png`)).catch(() => null);
    if (sheet) {
      const verdict = await ask({ apiKey, model: textModel, prompt: JUDGE, images: [sheet] }).catch(() => "");
      scores = parseJudge(verdict);
    }
  }
  for (const r of ok) {
    r.score = scores[r.id] ?? null;
    if (text && r.score?.text_seen && r.score.text_seen.replace(/\W/g, "").toUpperCase() !== text.replace(/\W/g, "").toUpperCase()) r.score.textMismatch = true;
  }
  return { kind, dir, sheet, candidates: raw.map((r) => ok.find((x) => x.id === r.id) ?? r), finished: canFinish };
}
