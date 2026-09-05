// Client-side pre-flight quality check. Runs before upload so a frame that
// cannot support a reading is caught before it costs a credit and before it
// enters the validation sample.

export type QualityVerdict = "good" | "warn" | "block";

export interface QualityFlag {
  code: "low_resolution" | "blurry" | "too_dark" | "too_bright" | "flat_frame";
  message: string;
  severity: "warn" | "block";
}

export interface QualityReport {
  verdict: QualityVerdict;
  scorePct: number;
  flags: QualityFlag[];
}

const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
const BLUR_BLOCK = 40;
const BLUR_WARN = 110;
const DARK_BLOCK = 32;
const DARK_WARN = 55;
const BRIGHT_WARN = 225;
const FLAT_WARN = 16;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image"));
    };
    img.src = url;
  });
}

/** Laplacian variance on greyscale, the standard cheap blur estimate. */
function laplacianVariance(grey: Float32Array, width: number, height: number): number {
  const values: number[] = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap =
        -4 * grey[i] + grey[i - 1] + grey[i + 1] + grey[i - width] + grey[i + width];
      values.push(lap);
    }
  }
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

export async function assessImageQuality(file: File): Promise<QualityReport> {
  const flags: QualityFlag[] = [];

  if (!file.type.startsWith("image/")) {
    return { verdict: "good", scorePct: 100, flags: [] };
  }

  const img = await loadImage(file);
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  if (naturalW < MIN_WIDTH || naturalH < MIN_HEIGHT) {
    flags.push({
      code: "low_resolution",
      message: `Image is only ${naturalW}x${naturalH}. Capture at a higher resolution so canopy and soil detail survive.`,
      severity: "block",
    });
  }

  // Downscale for a fast, consistent analysis regardless of camera resolution.
  const targetW = 320;
  const targetH = Math.max(1, Math.round((naturalH / naturalW) * targetW));
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { verdict: "good", scorePct: 100, flags };
  ctx.drawImage(img, 0, 0, targetW, targetH);
  const { data } = ctx.getImageData(0, 0, targetW, targetH);

  const grey = new Float32Array(targetW * targetH);
  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grey[p] = v;
    sum += v;
  }
  const meanLuma = sum / grey.length;
  let variance = 0;
  for (let p = 0; p < grey.length; p += 1) variance += (grey[p] - meanLuma) ** 2;
  const stdLuma = Math.sqrt(variance / grey.length);
  const blur = laplacianVariance(grey, targetW, targetH);

  if (blur < BLUR_BLOCK) {
    flags.push({
      code: "blurry",
      message: "Too blurry to score canopy or soil. Hold steady and retake.",
      severity: "block",
    });
  } else if (blur < BLUR_WARN) {
    flags.push({
      code: "blurry",
      message: "Slightly soft focus. A sharper frame gives a more reliable reading.",
      severity: "warn",
    });
  }

  if (meanLuma < DARK_BLOCK) {
    flags.push({
      code: "too_dark",
      message: "Frame is too dark to read. Retake in better light.",
      severity: "block",
    });
  } else if (meanLuma < DARK_WARN) {
    flags.push({
      code: "too_dark",
      message: "Underexposed. Detail in shaded areas may be missed.",
      severity: "warn",
    });
  } else if (meanLuma > BRIGHT_WARN) {
    flags.push({
      code: "too_bright",
      message: "Overexposed. Bright glare can hide salt crust and leaf colour.",
      severity: "warn",
    });
  }

  if (stdLuma < FLAT_WARN) {
    flags.push({
      code: "flat_frame",
      message: "Frame looks mostly flat, sky or water. Include ground, water edge or canopy.",
      severity: "warn",
    });
  }

  const blurScore = Math.min(100, (blur / 300) * 100);
  const exposureScore = 100 - Math.min(100, (Math.abs(meanLuma - 130) / 130) * 100);
  const detailScore = Math.min(100, (stdLuma / 60) * 100);
  const resolutionScore = Math.min(100, (Math.min(naturalW / MIN_WIDTH, naturalH / MIN_HEIGHT)) * 100);
  const scorePct = Math.round(
    0.4 * blurScore + 0.25 * exposureScore + 0.2 * detailScore + 0.15 * resolutionScore,
  );

  const verdict: QualityVerdict = flags.some((f) => f.severity === "block")
    ? "block"
    : flags.length > 0
      ? "warn"
      : "good";

  return { verdict, scorePct: Math.max(0, Math.min(100, scorePct)), flags };
}

export function qualityTone(verdict: QualityVerdict): { label: string; color: string; bg: string } {
  if (verdict === "block") return { label: "Not usable", color: "#7d1a10", bg: "#fde7e3" };
  if (verdict === "warn") return { label: "Usable with caution", color: "#7a4f0a", bg: "#fbedd0" };
  return { label: "Good frame", color: "#1A3622", bg: "#e7f1ea" };
}
