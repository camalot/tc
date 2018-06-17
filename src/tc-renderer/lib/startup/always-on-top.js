import settings from '../settings/settings'
import {remote} from 'electron'

export default function setOnTop () {
  remote.getCurrentWindow().setAlwaysOnTop(settings.appearance.alwaysOnTop)
}
