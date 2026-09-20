import registry from './card_registry.json' with { type: 'json' }

export const PLAYABLE_CHAPTER = registry.meta.playableChapter
export const CH1_VAULT_ANAGRAM = registry.meta.vaultAnagrams['1']

export function getCardRegistry() {
  return registry
}

export function getChapterCards(chapter = PLAYABLE_CHAPTER) {
  return registry.cards
    .filter((card) => card.chapter === chapter)
    .slice()
    .sort((a, b) => a.step - b.step)
}

export function getCardByStep(step) {
  return registry.cards.find((card) => card.step === step) || null
}

export function getPlayableCards() {
  return getChapterCards(PLAYABLE_CHAPTER)
}

export function assertChapter1Vault() {
  const vault = getCardByStep(10)
  if (!vault || vault.vaultAnagram !== 'MICROWAVECUPBOARD' || CH1_VAULT_ANAGRAM !== 'MICROWAVECUPBOARD') {
    throw new Error('Chapter 1 vault anagram must remain MICROWAVECUPBOARD')
  }
  return vault.vaultAnagram
}
