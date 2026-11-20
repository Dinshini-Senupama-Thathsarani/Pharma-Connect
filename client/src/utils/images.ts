// Your own photos live in client/public/images/. Any of these formats works: jpg, jpeg, png, webp.
// A missing file is simply skipped, so the plain gradient fallback shows instead.
export const imageLayers = (name: string): string[] =>
  ['jpg', 'jpeg', 'png', 'webp'].map((ext) => `url(/images/${name}.${ext})`);

export const FALLBACK_GRADIENT = 'linear-gradient(135deg, #5E1A3F 0%, #85255A 50%, #5E2A78 100%)';
