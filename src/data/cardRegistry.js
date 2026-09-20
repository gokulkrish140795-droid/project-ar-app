import registry from './card_registry.json' with { type: 'json' }
import { CH1_CONTENT_BIBLE, CH1_VAULT_ANAGRAM } from './ch1ContentBible.js'

export const PLAYABLE_CHAPTER = 1
export { CH1_VAULT_ANAGRAM }

const CH1_LETTER_IDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09']

export function getCardRegistry() {
  return registry
}

export function parseRegistryLetters(value) {
  return String(value || '')
    .split(/\s*-\s*/)
    .map((part) => part.trim().toUpperCase())
    .filter((part) => part.length === 1)
}

export function formatRegistryQuote(quote) {
  return String(quote || '')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

function letterCardFromRegistry(id) {
  const raw = registry.cards[id]
  const step = Number(id)
  const bible = CH1_CONTENT_BIBLE[step]
  return {
    step,
    chapter: 1,
    kind: 'letter',
    letters: parseRegistryLetters(raw.letters),
    lettersRaw: raw.letters,
    quote: raw.quote,
    bypass: bible.bypass,
    location: bible.location,
    file: raw.file,
    folder: raw.folder,
    act: raw.act,
  }
}

function chapter1WorkbenchCard() {
  const bible = CH1_CONTENT_BIBLE[10]
  return {
    step: 10,
    chapter: 1,
    kind: 'workbench',
    letters: [],
    lettersRaw: '',
    quote: null,
    bypass: bible.bypass,
    location: bible.location,
    vaultAnagram: CH1_VAULT_ANAGRAM,
    decoyNote: bible.decoyNote,
  }
}

export function getChapterCards(chapter = PLAYABLE_CHAPTER) {
  if (chapter !== 1) return []
  return [...CH1_LETTER_IDS.map(letterCardFromRegistry), chapter1WorkbenchCard()]
}

export function getCardByStep(step) {
  return getChapterCards(1).find((card) => card.step === step) || null
}

export function getPlayableCards() {
  return getChapterCards(PLAYABLE_CHAPTER)
}

export function assertChapter1Vault() {
  if (CH1_VAULT_ANAGRAM !== 'MICROWAVECUPBOARD') {
    throw new Error('Chapter 1 vault anagram must remain MICROWAVECUPBOARD')
  }
  return CH1_VAULT_ANAGRAM
}
