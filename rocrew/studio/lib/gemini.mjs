// Gemini: image generation for Splash (icons, thumbnails) and Frame (UI art),
// plus a plain text call for second opinions.

import fs from "node:fs";
import path from "node:path";

const API = "https://generativelanguage.googleapis.com/v1beta/models";

async function generate({ apiKey, model, body }) {
  if (!apiKey) throw new Error("Add a Gemini API key in Settings (or set GEMINI_API_KEY) first.");
  const res = await fetch(`${API}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Gemini ${model} failed (${res.status}): ${json.error?.message ?? JSON.stringify(json).slice(0, 300)}`);
  return json;
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

/**
 * Generates one image and writes it to `out`. Reference images (paths) steer style or content.
 * Returns { file, text } where text is any commentary the model returned.
 */
export async function generateImage({ apiKey, model, prompt, aspect = "1:1", refs = [], out }) {
  const parts = [{ text: prompt }];
  for (const ref of refs) {
    const mime = MIME[path.extname(ref).toLowerCase()];
    if (!mime) throw new Error(`Reference image must be png, jpg or webp: ${ref}`);
    parts.push({ inlineData: { mimeType: mime, data: fs.readFileSync(ref).toString("base64") } });
  }
  const json = await generate({
    apiKey,
    model,
    body: {
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: aspect } },
    },
  });
  const outParts = json.candidates?.[0]?.content?.parts ?? [];
  const image = outParts.find((p) => p.inlineData?.data);
  const text = outParts.filter((p) => p.text).map((p) => p.text).join("\n").trim();
  if (!image) {
    const reason = json.candidates?.[0]?.finishReason ?? json.promptFeedback?.blockReason ?? "no image returned";
    throw new Error(`Gemini returned no image (${reason}).${text ? ` It said: ${text.slice(0, 300)}` : ""}`);
  }
  const ext = image.inlineData.mimeType === "image/jpeg" ? ".jpg" : ".png";
  const file = path.extname(out) ? out : `${out}${ext}`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(image.inlineData.data, "base64"));
  return { file, text };
}

export async function askGemini({ apiKey, model, prompt, images = [] }) {
  const parts = [{ text: prompt }];
  for (const img of images) {
    const mime = MIME[path.extname(img).toLowerCase()];
    if (mime) parts.push({ inlineData: { mimeType: mime, data: fs.readFileSync(img).toString("base64") } });
  }
  const json = await generate({ apiKey, model, body: { contents: [{ role: "user", parts }] } });
  return (json.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
}
