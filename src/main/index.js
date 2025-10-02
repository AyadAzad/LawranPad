import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname, extname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile, rename } from 'fs'
import {
  initDatabase,
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
} from './database.js'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../resources/icon.png') } : {}),
    ...(process.platform === 'win32' ? { icon: join(__dirname, '../../resources/icon.ico') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.lawran.lawranpad')

    // Initialize database
    try {
      initDatabase(app.getPath('userData'))
    } catch (err) {
      console.error('Failed to initialize database:', err)
      dialog.showErrorBox(
        'Database Error',
        'Could not initialize the database. The application will now close.'
      )
      app.quit()
      return
    }

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // --- Database IPC Handlers ---
    ipcMain.handle('get-documents', () => listDocuments())
    ipcMain.handle('get-document', (event, id) => getDocument(id))
    ipcMain.handle('create-document', (event, data) => createDocument(data))
    ipcMain.handle('update-document', (event, { id, data }) => updateDocument(id, data))
    ipcMain.handle('delete-document', (event, id) => deleteDocument(id))

    // --- Legacy File-System IPC Handlers ---
    ipcMain.on('open-file', (event) => {
      dialog
        .showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'Documents', extensions: ['txt', 'md', 'docx'] }]
        })
        .then((result) => {
          if (!result.canceled) {
            const filePath = result.filePaths[0]
            readFile(filePath, 'utf-8', (err, data) => {
              if (err) {
                console.log(err)
                return
              }
              event.sender.send('file-opened', { filePath, data })
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    })

    ipcMain.on('save-file', (event, { filePath, data }) => {
      if (filePath) {
        writeFile(filePath, data, (err) => {
          if (err) {
            console.log(err)
          } else {
            event.sender.send('file-saved', filePath)
          }
        })
      } else {
        dialog
          .showSaveDialog({
            filters: [{ name: 'Documents', extensions: ['txt', 'md', 'docx'] }]
          })
          .then((result) => {
            if (!result.canceled) {
              const newFilePath = result.filePath
              writeFile(newFilePath, data, (err) => {
                if (err) {
                  console.log(err)
                  return
                }
                event.sender.send('file-saved', newFilePath)
              })
            }
          })
          .catch((err) => {
            console.log(err)
          })
      }
    })

    ipcMain.on('save-file-as', (event, { data, defaultName }) => {
      dialog
        .showSaveDialog({
          defaultPath: defaultName ? `${defaultName}.txt` : 'Untitled.txt',
          filters: [{ name: 'Documents', extensions: ['txt', 'md', 'docx'] }]
        })
        .then((result) => {
          if (!result.canceled) {
            const filePath = result.filePath
            writeFile(filePath, data, (err) => {
              if (err) {
                console.log(err)
                return
              }
              event.sender.send('file-saved', filePath)
            })
          }
        })
        .catch((err) => {
          console.log(err)
        })
    })

    ipcMain.on('rename-file', (event, { oldPath, newName }) => {
      const dir = dirname(oldPath)
      const ext = extname(oldPath)
      const newPath = join(dir, `${newName}${ext}`)

      rename(oldPath, newPath, (err) => {
        if (err) {
          console.log('Error renaming file:', err)
          return
        }
        event.sender.send('file-renamed', newPath)
      })
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .catch((err) => {
    console.error('Application startup failed:', err)
    dialog.showErrorBox(
      'Application Error',
      'A critical error occurred during startup. The application will now close.'
    )
    app.quit()
  })

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
