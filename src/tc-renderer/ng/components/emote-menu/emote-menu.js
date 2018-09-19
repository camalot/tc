import './emote-menu.styl'
import $ from 'jquery'
import angular from 'angular'
import template from './emote-menu.pug'
import {getAllCachedEmotes} from '../../../lib/emotes/menu'

angular.module('tc').component('emoteMenu', {template, controller})

function controller ($element, $timeout, session, settings) {
  const vm = this

  vm.$onInit = () => {
    vm.visible = false
    vm.choose = choose
    vm.filter = ''
    vm.clearFilter = () => { vm.filter = '' }
    vm.categories = getAllCachedEmotes(currChannel())
    session.emoteMenu = vm
    vm.filterEmote = filterEmote
    handleEmoteHover()
    $timeout(() => vm.visible = true)
  }

  vm.$onDestroy = () => $($element[0]).off()

  const filterEmote = function (value) {
    if (vm.filter && vm.filter !== '') {
      return value.emote.toLowerCase().match(new RegExp(vm.filter, 'gi'))
    } else {
      return true
    }
  }

  const choose = function (emote) {
    let cursorPosition = session.input.selectionStart || session.message.length
    let msgLeft = (session.message || '').slice(0, cursorPosition - 1) || ''
    let msgRight = (session.message || '').slice(cursorPosition) || ''
    const space = msgLeft ? ' ' : ''
    if (vm.filter && vm.filter !== '') {
      session.message = session.message
        .replace(new RegExp(`:${vm.filter}\\s?`, 'i'), emote)
    } else {
      session.message = `${msgLeft}${space}${emote} ${msgRight}`
    }
    session.input.focus()
  }

  const handleEmoteHover = () => {
    $($element[0]).on('mouseenter', '.emoticon', e => {
      const emoticon = $(e.target)
      let tooltip = emoticon.data('emote-name')
      const description = emoticon.data('emote-description')

      if (description) tooltip += '<br>' + description
      showTooltip(emoticon, tooltip)
    })
  }

  const currChannel = () => settings.channels[settings.selectedTabIndex]

  const showTooltip = (el, content) => {
    el.frosty({html: true, content})
    el.frosty('show')
    el.one('mouseleave', kill)
    setTimeout(kill, 3000)

    function kill () {
      el.frosty('destroy')
      el.off()
    }
  }
}
