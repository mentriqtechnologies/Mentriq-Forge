// Safe pagination helpers. Clamp page/limit to sane integer bounds so rogue,
// negative, NaN or extreme values can never cause expensive / erroneous queries.
const toInt = (value, fallback) => {
  const n = Number(value);
  return Number.isNaN(n) || !Number.isFinite(n) ? fallback : Math.floor(n);
};

// Returns { page, limit, skip } with page >= 1 and 1 <= limit <= maxLimit
const getPagination = (query = {}, { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(toInt(query.page, defaultPage), 1);
  const limit = Math.min(Math.max(toInt(query.limit, defaultLimit), 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { getPagination, toInt };