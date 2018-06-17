import {remote} from 'electron'

export default function joinChannelFromCommand () {
  const main = remote.getCurrentWindow()
  remote.process.argv.forEach(function (arg) {
    if (arg.includes('--channel=')) {
      setTimeout(function () {
        main.webContents.send('join-channel', arg.slice(10).replace(/\\/g, ''))
      }, 1500)
    }
  })
}
