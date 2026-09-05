// Tiny EXIF GPS extractor — JPEG only. Returns null if no GPS data.
export async function extractGPS(file: File): Promise<{ lat: number; lng: number } | null> {
  if (!file.type.startsWith("image/jpeg")) return null;
  try {
    const buf = await file.arrayBuffer();
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xffd8) return null;
    let offset = 2;
    const length = view.byteLength;
    while (offset < length) {
      const marker = view.getUint16(offset);
      offset += 2;
      if (marker === 0xffe1) {
        const exifLen = view.getUint16(offset);
        if (view.getUint32(offset + 2) !== 0x45786966) return null;
        return parseExif(view, offset + 8, exifLen - 8);
      } else {
        offset += view.getUint16(offset);
      }
    }
  } catch { /* ignore */ }
  return null;
}

function parseExif(view: DataView, start: number, len: number): { lat: number; lng: number } | null {
  const little = view.getUint16(start) === 0x4949;
  const get16 = (o: number) => view.getUint16(o, little);
  const get32 = (o: number) => view.getUint32(o, little);
  if (get16(start + 2) !== 0x002a) return null;
  const ifd0 = start + get32(start + 4);
  const numEntries = get16(ifd0);
  let gpsIfdOffset = 0;
  for (let i = 0; i < numEntries; i++) {
    const entry = ifd0 + 2 + i * 12;
    if (get16(entry) === 0x8825) { gpsIfdOffset = start + get32(entry + 8); break; }
  }
  if (!gpsIfdOffset) return null;
  const gpsEntries = get16(gpsIfdOffset);
  let latRef = "N", lngRef = "E";
  let lat: number | null = null, lng: number | null = null;
  for (let i = 0; i < gpsEntries; i++) {
    const entry = gpsIfdOffset + 2 + i * 12;
    const tag = get16(entry);
    const valOff = start + get32(entry + 8);
    if (tag === 1) latRef = String.fromCharCode(view.getUint8(entry + 8));
    else if (tag === 3) lngRef = String.fromCharCode(view.getUint8(entry + 8));
    else if (tag === 2) lat = readRational3(view, valOff, little);
    else if (tag === 4) lng = readRational3(view, valOff, little);
  }
  if (lat == null || lng == null) return null;
  return { lat: latRef === "S" ? -lat : lat, lng: lngRef === "W" ? -lng : lng };
}
function readRational3(view: DataView, o: number, little: boolean) {
  const get32 = (oo: number) => view.getUint32(oo, little);
  const d = get32(o) / get32(o + 4);
  const m = get32(o + 8) / get32(o + 12);
  const s = get32(o + 16) / get32(o + 20);
  return d + m / 60 + s / 3600;
}

// Extract a single keyframe from a video file as a JPEG data URL
export async function extractVideoKeyframe(file: File, atSecond = 1): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "auto";
    v.muted = true;
    v.src = url;
    v.onloadedmetadata = () => { v.currentTime = Math.min(atSecond, v.duration - 0.1); };
    v.onseeked = () => {
      const c = document.createElement("canvas");
      c.width = v.videoWidth; c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(v, 0, 0);
      c.toBlob((b) => { URL.revokeObjectURL(url); resolve(b); }, "image/jpeg", 0.85);
    };
    v.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
  });
}
