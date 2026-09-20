/**
 * Chapter 1 hunt fields that are not in card_registry.json.
 * Bypass phrases and household location clues come from the locked content bible.
 * Do not shorten bypass phrases. Letters/quotes always load from the Desktop registry.
 */
export const CH1_VAULT_ANAGRAM = 'MICROWAVECUPBOARD'

export const CH1_CONTENT_BIBLE = {
  1: { bypass: 'mirror', location: 'Full-Length Bedroom Mirror' },
  2: { bypass: 'sofa', location: 'Living Room Sofa Cushion' },
  3: { bypass: 'computer table', location: 'Work/Computer Table Monitor' },
  4: { bypass: 'curtain', location: 'Bedroom Window Curtain Fold' },
  5: { bypass: 'pooja drawer', location: 'Pooja Drawer / Sacred Shelf' },
  6: { bypass: 'cutlery drawer', location: 'Cutlery Drawer (Spoon Tray)' },
  7: { bypass: 'teddy bear', location: 'Favorite Teddy Bear Plushie' },
  8: { bypass: 'wardrobe', location: 'Main Bedroom Wardrobe Closet' },
  9: { bypass: 'chair', location: 'Dining Table Chair Cushion' },
  10: {
    bypass: 'microwave cupboard',
    location: 'Kitchen Microwave Cupboard',
    vaultAnagram: CH1_VAULT_ANAGRAM,
    decoyNote: 'Christchurch dust-bunnies → trash',
  },
}
