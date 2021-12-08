import { app, ipcMain } from 'electron'
import { ScanStatus, WechatyBuilder } from 'wechaty'
import * as path from 'path'

const pkg = import('../../../package.json')

const resetWindow = async (mainWindow: Electron.BrowserWindow) => {
  mainWindow.setSize(960, 720, true)
  mainWindow.setTitle((await pkg).productName)
}
export class Bot {
  bot = WechatyBuilder.build({
    name: path.resolve(app.getPath('userData'), '.memory-card.json'),
    puppet: 'wechaty-puppet-wechat',
  })

  constructor(
    private mainWindow: Electron.BrowserWindow
  ) {
    this.bot.on('scan', (qrcode, status) => {
      this.mainWindow.webContents.send('scan', qrcode, status)
      switch (status) {
        case ScanStatus.Waiting:
        case ScanStatus.Timeout:
          this.mainWindow.setSize(360, 520, true)
          this.mainWindow.setTitle('微信登录')
          break;

        default:
          resetWindow(this.mainWindow)
          break;
      }
    })

    this.bot.on('login', async (user) => {
      resetWindow(this.mainWindow)
      const avatar = await user.avatar().then(avatar => avatar.toBase64())
      this.mainWindow.webContents.send('login', {
        ...(user as any)._payload,
        avatar
      })
    })

    ipcMain.on('logout', () => {
      this.bot.logout()
    })

    ipcMain.handle('room.findAll', async () => {
      const rooms = await this.bot.Room.findAll()
      return rooms.map(room => room.payload)
    })
  }

  public start() {
    return this.bot.start()
  }

  public logout() {
    return this.bot.logout()
  }

  get Room() {
    return this.bot.Room
  }
}