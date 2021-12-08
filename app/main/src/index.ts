import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs';
import { Bot } from './bot';
import { getRulesList, getRulesPath } from './utils';
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

  mainWindow.webContents.toggleDevTools();
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

  ipcMain.handle('getRules', () => getRulesList())

  ipcMain.handle('saveRules', (event, rules: RoomRules) => {
    const filePath = path.resolve(rulesPath, rules.roomID + '.json');
    return fs.writeFileSync(filePath, JSON.stringify(rules));
  })

  ipcMain.handle('getRoom', async (event, roomID: string) => {
    const room = await bot.Room.find({ id: roomID })
    return room?.payload;
  })

  ipcMain.on('startRoomListener', () => {
    log.info('[listener]', 'Starting room listener');
    getRulesList().forEach(rules => {
      bot.Room.find({ id: rules.roomID }).then(room => {
        log.info('[listener]', 'Remove listen', rules.roomID);
        room?.removeAllListeners('message')
        log.info('[listener]', 'Listening to room', rules.roomID);
        room?.on('message', message => {
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
            room?.say(rules.content)
          }
        })
      })
    })
  })

  await bot.start();
})