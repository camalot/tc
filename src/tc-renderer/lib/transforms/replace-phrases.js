import emojis from '../data/emojis'
import replacements from '../data/replacements.json'
import store from '../../store'
import { getAllCachedEmotes } from '../emotes/menu'

const slashRegex = /\/[a-z0-9\-_]+$/i
const colonRegex = /:[a-z0-9\-_]+:/ig
const emoteRegex = /:\w+/ig

export default function replacePhrases (string) {
  const emotes = [].concat(...getAllCachedEmotes()
    .map(c => c.emotes))
    .map(e => {
      let x = {}
      x[e.emote.toLowerCase()] = e.emote
      return x
    })
  const sources = [replacements, store.settings.state.shortcuts].concat(emotes)
  const phrasesAndEmojis = Object.assign({}, emojis, ...sources)
  const phrases = Object.assign({}, ...sources)
  console.log(phrases)
  string = string.replace(slashRegex, s => {
    const phrase = s.substring(1).toLowerCase()
    if (phrases[phrase]) return phrases[phrase]
    else return s
  }).replace(emoteRegex, s => {
    const emote = s.substring(1).toLowerCase()
    console.log(emote)
    if (emotes[emote]) {
      return emotes[emote]
    } else {
      return s
    }
  })

  return string.replace(colonRegex, s => {
    const phrase = s.substring(1, s.length - 1).toLowerCase()
    if (phrasesAndEmojis[phrase]) return phrasesAndEmojis[phrase]
    else return s
  })
}
