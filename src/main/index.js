import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, dirname, basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile } from 'fs/promises'
import {
  initDatabase,
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByPath
} from './database.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../resources/icon.png') } : {}),
    ...(process.platform === 'win32' ? { icon: join(__dirname, '../../resources/icon.ico') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app
  .whenReady()
  .then(() => {
    electronApp.setAppUserModelId('com.lawran.lawranpad')

    try {
      initDatabase(app.getPath('userData'))
    } catch (err) {
      console.error('Failed to initialize database:', err)
      dialog.showErrorBox('Database Error', 'Could not initialize the database.')
      app.quit()
      return
    }

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // --- New Database-Centric IPC Handlers ---

    ipcMain.handle('get-documents', () => listDocuments())
    ipcMain.handle('get-document-content', (_, id) => getDocument(id))
    ipcMain.handle('create-new-document', () => createDocument())
    ipcMain.handle('delete-document', (_, id) => deleteDocument(id))

    ipcMain.handle('open-file-dialog', async (event) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }]
      })

      if (canceled || filePaths.length === 0) {
        return null
      }

      const filePath = filePaths[0]
      let doc = findDocumentByPath(filePath)

      if (doc) {
        return doc
      } else {
        const content = await readFile(filePath, 'utf-8')
        const title = basename(filePath, '.md').replace(/[-_]/g, ' ')
        return createDocument({ title, content, filePath })
      }
    })

    ipcMain.handle('save-document', async (event, { id, content }) => {
      const doc = getDocument(id)
      if (!doc) throw new Error('Document not found')

      if (doc.file_path) {
        await writeFile(doc.file_path, content, 'utf-8')
        return updateDocument(id, { content })
      } else {
        // If no file path, trigger save-as dialog
        const { canceled, filePath } = await dialog.showSaveDialog({
          defaultPath: `${doc.title}.md`,
          filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }]
        })

        if (canceled || !filePath) {
          return doc // Return original doc if save is cancelled
        }

        await writeFile(filePath, content, 'utf-8')
        const title = basename(filePath, '.md').replace(/[-_]/g, ' ')
        return updateDocument(id, { title, content, file_path: filePath })
      }
    })

    ipcMain.handle('rename-document', async (event, { id, newTitle }) => {
      return updateDocument(id, { title: newTitle })
    })

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  .catch((err) => {
    console.error('Application startup failed:', err)
    dialog.showErrorBox('Application Error', 'A critical error occurred during startup.')
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
