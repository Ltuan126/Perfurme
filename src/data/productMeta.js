// Product metadata for quiz matching
// Families: citrus, floral, woody, green, spicy, musky, tea, white-floral, amber

export const productMeta = {
  1: {
    name: 'Another 13',
    families: ['musky', 'woody', 'amber'],
    seasons: ['spring', 'summer', 'fall', 'winter'],
    occasions: ['everyday', 'office'],
    moods: ['calm-clean', 'modern-minimal'],
    intensity: 'moderate',
  },
  2: {
    name: 'Bergamote 22',
    families: ['citrus', 'woody'],
    seasons: ['spring', 'summer'],
    occasions: ['everyday', 'office', 'casual'],
    moods: ['fresh-energizing'],
    intensity: 'light',
  },
  3: {
    name: 'Baie 19',
    families: ['green', 'woody'],
    seasons: ['spring', 'fall'],
    occasions: ['everyday', 'casual'],
    moods: ['atmospheric', 'fresh-energizing'],
    intensity: 'moderate',
  },
  4: {
    name: 'Rose 31',
    families: ['floral', 'spicy', 'woody'],
    seasons: ['fall', 'winter'],
    occasions: ['date-night', 'special'],
    moods: ['bold-confident', 'romantic'],
    intensity: 'strong',
  },
  5: {
    name: 'THÉ NOIR 29',
    families: ['tea', 'woody', 'green'],
    seasons: ['fall', 'spring'],
    occasions: ['everyday', 'office', 'special'],
    moods: ['sophisticated'],
    intensity: 'moderate',
  },
  6: {
    name: 'NEROLI 36',
    families: ['white-floral', 'citrus'],
    seasons: ['spring', 'summer'],
    occasions: ['everyday', 'casual'],
    moods: ['bright-happy'],
    intensity: 'light',
  },
};

export const allFamilies = [
  'citrus', 'floral', 'woody', 'green', 'spicy', 'musky', 'tea', 'white-floral', 'amber'
];

export const allSeasons = ['any', 'spring', 'summer', 'fall', 'winter'];
export const allOccasions = ['everyday', 'office', 'casual', 'date-night', 'party', 'special'];
export const allMoods = ['fresh-energizing', 'calm-clean', 'bold-confident', 'romantic', 'sophisticated', 'bright-happy', 'modern-minimal', 'atmospheric'];