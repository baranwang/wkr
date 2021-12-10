import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import * as path from 'path'
import * as fs from 'fs';
import { Bot } from './bot';
import { getRulesList, getRulesPath, sleep } from './utils';
import log from 'electron-log';
import { autoUpdater } from "electron-updater"

const isDevelopment = import.meta.env.MODE === 'development';

let mainWindow: Electron.BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      contextIsolation: true,
      preload: path.resolve(__dirname, '../../preload/dist/index.cjs'),
    },
  });

  const pageURL = isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
    ? import.meta.env.VITE_DEV_SERVER_URL
    : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  mainWindow.loadURL(pageURL);

  if (isDevelopment) {
    mainWindow.webContents.toggleDevTools();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('new-window-for-tab', () => {
  mainWindow.focus();
});

app.whenReady().then(async () => {
  autoUpdater.checkForUpdatesAndNotify();
  const bot = new Bot(mainWindow);

  const rulesPath = getRulesPath()

  ipcMain.handle('botStart', async () => {
    log.info('[bot]', 'Starting bot...')
    try {
      await bot.start();
      log.info('[bot]', 'Bot started')
    } catch (error) {
      log.error('[bot]', JSON.stringify(error))
    }
  })

  ipcMain.handle('getRules', () => getRulesList())

  ipcMain.handle('saveRules', (event, rules: RoomRules) => {
    const filePath = path.resolve(rulesPath, rules.roomID + '.json');
    log.info('[rules]', 'Saving rules', filePath)
    return fs.writeFileSync(filePath, JSON.stringify(rules));
  })

  ipcMain.handle('deleteRules', (event, roomID: string) => {
    const filePath = path.resolve(rulesPath, roomID + '.json');
    log.info('[rules]', 'Deleting rules ', roomID)
    return fs.rmSync(filePath);
  })

  let ready = false;

  bot.bot.on('ready', () => {
    ready = true;
  })

  ipcMain.handle('botReady', () => {
    return ready;
  })

  ipcMain.on('logout', () => {
    bot.logout()
  })

  ipcMain.handle('room.findAll', async () => {
    const rooms = await bot.Room.findAll()
    return rooms.map(room => room.payload)
  })

  ipcMain.handle('getRoom', async (event, roomID: string) => {
    const room = await bot.Room.find({ id: roomID })
    return room?.payload;
  })

  ipcMain.on('startRoomListener', () => {
    if (!ready) return
    log.info('[listener]', 'Starting room listener');
    getRulesList().forEach(async rules => {
      if (!rules.enabled) return

      const room = await bot.Room.find({ id: rules.roomID })

      if (!room) {
        log.error('[listener]', 'Room not found', rules.roomID)
        return
      }

      log.info('[listener]', 'Remove listen', rules.roomID);
      room.removeAllListeners('message')
      await sleep(1000)

      const topic = await room?.topic()

      log.info('[listener]', 'Listening to room', rules.roomID);
      room.on('message', message => {
        let text = message.text()
        log.verbose('[message]', text);

        if (message.self()) return

        const textList = text.split('<br/>- - - - - - - - - - - - - - -<br/>')
        text = textList[textList.length - 1]

        if (rules.members && rules.members.length) {
          if (!rules.members.includes(message.from()?.id || '')) {
            return;
          }
        }
        let isHit = false;
        const hitKeywords = rules.keywords.filter(keyword => text.includes(keyword))
        if (rules.keywordsMode === 'all') {
          isHit = hitKeywords.length === rules.keywords.length
        }
        if (rules.keywordsMode === 'include') {
          isHit = hitKeywords.length > 0
        }
        if (isHit) {
          room.say(rules.content)

          if (Notification.isSupported()) {
            new Notification({
              title: '触发自动回复信息',
              body: `${topic ? `[${topic}] ` : ''}发送：${rules.content}`,
              silent: false,
            }).show()
          }
        }
      })

    })
  })
})