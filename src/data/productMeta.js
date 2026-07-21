// Quiz vocabulary + Vietnamese display labels.
// Actual per-product metadata (families/seasons/occasions/moods/intensity)
// now lives directly on each product document (backend Product schema, or
// inline on the local fallback items in src/data/products.js) — read it via
// `product.families`, `product.intensity`, etc. No more id-keyed lookup table.

export const allFamilies = [
  'citrus', 'floral', 'woody', 'green', 'spicy', 'musky', 'tea', 'white-floral', 'amber'
];

export const allSeasons = ['any', 'spring', 'summer', 'fall', 'winter'];
export const allOccasions = ['everyday', 'office', 'casual', 'date-night', 'party', 'special'];
export const allMoods = ['fresh-energizing', 'calm-clean', 'bold-confident', 'romantic', 'sophisticated', 'bright-happy', 'modern-minimal', 'atmospheric'];
export const allIntensities = ['light', 'moderate', 'strong'];

// Display labels (Vietnamese) — SILLAGE product tags & filters
export const familyLabelsVN = {
  citrus: 'Cam chanh',
  floral: 'Hoa',
  woody: 'Gỗ',
  green: 'Xanh',
  spicy: 'Gia vị',
  musky: 'Xạ hương',
  tea: 'Trà',
  'white-floral': 'Hoa cam',
  amber: 'Hổ phách',
};

export const intensityLabelsVN = {
  light: 'Nhẹ',
  moderate: 'Ấm',
  strong: 'Đậm',
};
