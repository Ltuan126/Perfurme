/**
 * Perfume quiz taxonomy — shared vocabulary for Product metadata.
 * CommonJS so the backend (Node, no bundler) can require() it directly.
 * Values MUST stay in sync with the display labels in src/data/productMeta.js
 * (frontend keeps the Vietnamese labels; this file is only the value set
 * used for schema validation / storage).
 */

const FAMILIES = ['citrus', 'floral', 'woody', 'green', 'spicy', 'musky', 'tea', 'white-floral', 'amber'];
const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const OCCASIONS = ['everyday', 'office', 'casual', 'date-night', 'party', 'special'];
const MOODS = ['fresh-energizing', 'calm-clean', 'bold-confident', 'romantic', 'sophisticated', 'bright-happy', 'modern-minimal', 'atmospheric'];
const INTENSITIES = ['light', 'moderate', 'strong'];

module.exports = { FAMILIES, SEASONS, OCCASIONS, MOODS, INTENSITIES };
