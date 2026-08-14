// Sanitize user-supplied URLs to block unsafe schemes (javascript:, data:, etc.)
// and reduce stored-XSS risk when these values are rendered into <a href> links.
const isValidHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

// Returns the trimmed URL when it is a valid http/https URL, otherwise an empty string
const cleanUrl = (value) => (isValidHttpUrl(value) ? value.trim() : "");

module.exports = { isValidHttpUrl, cleanUrl };