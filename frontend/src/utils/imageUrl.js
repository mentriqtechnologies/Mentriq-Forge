export function resolveImageUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  const driveMatch = trimmed.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=download&)?id=))([\w-]{10,})/i
  );
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
  }
  return trimmed;
}