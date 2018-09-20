import './chat-input.styl'
import angular from 'angular'
import template from './chat-input.pug'
import replacePhrases from '../../../lib/transforms/replace-phrases'
import {getChatterNames} from '../../../lib/chatters'
import emotesFfz from '../../../lib/emotes/ffz'
import emotesBttv from '../../../lib/emotes/bttv'
import replacements from '../../../lib/data/replacements.json'
import store from '../../../store'

angular.module('tc').component('chatInput', {template, controller})

// eslint-disable-next-line
function controller ($scope, $element, session, irc, messages, emotesTwitch, settings) {
  const vm = this
  let lastWhisperer
  const input = $element.find('input')[0]

  vm.$onInit = () => {
    vm.emoteMenu = false
    vm.session = session
    vm.irc = irc
    vm.chatHistory = []
    session.input = input // TODO make a better system

    closeEmoteMenuOnEscape()
    irc.on('whisper', listenToWhispers)
  }

  vm.$onDestroy = () => {
    irc.removeListener('whisper', listenToWhispers)
    window.removeEventListener('keyup', keyupHandlerCloseEmoteMenu)
  }

  vm.getAutoCompleteStrings = () => {
    const channel = settings.channels[settings.selectedTabIndex]
    if (!channel) return []

    const names = getChatterNames(channel)
    const atNames = names.map(name => '@' + name)
    const bttvEmotes = grabEmotes(emotesBttv(channel)).sort()
    const ffzEmotes = grabEmotes(emotesFfz(channel)).sort()
    const twitchEmotes = grabEmotes(emotesTwitch).sort()
    const replacementsKeys = []
      .concat(
        Object.keys(replacements || {}),
        Object.keys(store.settings.state.shortcuts || {})
      )
      .map(x => `:${x}:`).sort()
    return [].concat(
      twitchEmotes, bttvEmotes,
      ffzEmotes, names, atNames,
      replacementsKeys)

    function grabEmotes (arr) {
      return arr.map((e) => ':' + e.emote)
    }
  }

  vm.input = () => {
    if (vm.emoteMenu) vm.hideEmoteMenu()
    const channel = settings.channels[settings.selectedTabIndex]
    if (!channel || !session.message.trim().length) return

    if (session.message.charAt(0) === '/') {
      session.message = '.' + session.message.substr(1)
    }

    if (session.message.indexOf('.w') === 0) {
      const words = session.message.split(' ')
      const username = words[1]
      const message = words.slice(2).join(' ')
      irc.whisper(username, message)
      messages.addWhisper(settings.identity.username, username, message)
    } else irc.say(channel, session.message)
    if (vm.chatHistory.indexOf(session.message) !== -1) {
      vm.chatHistory.splice(
        vm.chatHistory.indexOf(session.message),
        1
      )
    }
    vm.chatHistory.unshift(session.message)
    session.message = ''
  }

  vm.keyUp = (event) => {
    const keyCode = event.keyCode || event.which
    const historyIndex = vm.chatHistory.indexOf(session.message)
    if (keyCode === 38) { // arrow up
      if (historyIndex >= 0) {
        if (vm.chatHistory[historyIndex + 1]) {
          session.message = vm.chatHistory[historyIndex + 1]
        }
      } else {
        if (session.message !== '') {
          vm.chatHistory.unshift(session.message)
          session.message = vm.chatHistory[1]
        } else {
          session.message = vm.chatHistory[0]
        }
      }
    } else if (keyCode === 40) { // arrow down
      if (historyIndex >= 0) {
        if (vm.chatHistory[historyIndex - 1]) {
          session.message = vm.chatHistory[historyIndex - 1]
        } else {
          session.message = ''
        }
      }
    } else if (keyCode === 186) { // : (colon)
      vm.showEmoteMenu()
    } else if (keyCode === 32 && vm.emoteMenu) {
      vm.hideEmoteMenu()
    } else {
      let startPos = input.selectionStart
      // find the current word
      let word = getWordAt(input.value, startPos)
      let pattern = /:(\w+)/
      // see if it is a :emote
      let match = pattern.exec(word)
      if (match && match.length > 1) {
        let query = match[1].slice(0)
        vm.showEmoteMenu(query)
      } else {
        vm.hideEmoteMenu()
      }
    }
  }

  vm.change = function () {
    const msg = session.message
    if (msg === '/r ') {
      if (lastWhisperer) session.message = `/w ${lastWhisperer} `
      else session.message = '/w '
    } else if (msg.startsWith('/') || /(^|\s):\w+(:(\s|$))?/.test(msg)) {
      session.message = replacePhrases(msg)
    }
  }
  vm.showEmoteMenu = function (filter) {
    vm.emoteMenu = true
    if (session.emoteMenu) {
      session.emoteMenu.filter = filter
    }
  }

  vm.hideEmoteMenu = function () {
    vm.emoteMenu = false
    if (session.emoteMenu) {
      session.emoteMenu.filter = ''
    }
  }

  vm.toggleEmoteMenu = function () {
    if (vm.emoteMenu) {
      vm.hideEmoteMenu()
    } else {
      vm.showEmoteMenu('')
    }
  }

  function getWordAt (str, pos) {
    str = String(str)
    pos = (Number(pos) >>> 0) - 1
    let left = str.slice(0, pos + 1).search(/\S+$/)
    let right = str.slice(pos).search(/\s/)

    return right < 0
      ? str.slice(left)
      : str.slice(left, right + pos)
  }

  function listenToWhispers (from) {
    lastWhisperer = from.startsWith('#') ? from.substring(1) : from
  }

  function closeEmoteMenuOnEscape () {
    window.addEventListener('keyup', keyupHandlerCloseEmoteMenu)
  }

  function keyupHandlerCloseEmoteMenu (e) {
    if (e.keyCode === 27 && vm.emoteMenu) {
      vm.hideEmoteMenu()
      $scope.$digest()
    }
  }
}
