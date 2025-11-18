import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { basename } from 'path'
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

let mainWindow;
let fileToOpenOnReady = null;

// --- Single Instance Lock ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const filePath = commandLine.pop();
      if (filePath && (filePath.endsWith('.txt') || filePath.endsWith('.md'))) {
        handleOpenFile(filePath);
      }
    }
  });
}

const handleOpenFile = (filePath) => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    mainWindow.webContents.send('open-file-from-path', filePath);
  }
};

app.on('open-file', (event, path) => {
  event.preventDefault();
  if (app.isReady()) {
    handleOpenFile(path);
  } else {
    fileToOpenOnReady = path;
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon: join(__dirname, '../../resources/icon.png') } : {}),
    ...(process.platform === 'win32' ? { icon: join(__dirname, '../../resources/icon.ico') } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    if (fileToOpenOnReady) {
      handleOpenFile(fileToOpenOnReady);
      fileToOpenOnReady = null;
    }
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

    const menu = Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              BrowserWindow.getAllWindows()[0].webContents.send('new-document')
            }
          },
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              BrowserWindow.getAllWindows()[0].webContents.send('open-document')
            }
          },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              BrowserWindow.getAllWindows()[0].webContents.send('save-document')
            }
          },
          {
            label: 'Save As',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              BrowserWindow.getAllWindows()[0].webContents.send('save-document-as')
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Exit',
            click: () => app.quit()
          }
        ]
      }
    ])
    Menu.setApplicationMenu(menu)

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    ipcMain.handle('get-documents', () => listDocuments())
    ipcMain.handle('get-document-content', (_, id) => getDocument(id))
    ipcMain.handle('create-new-document', () => createDocument())
    ipcMain.handle('delete-document', (_, id) => deleteDocument(id))

    ipcMain.handle('open-file-dialog', async (event, filePath) => {
      try {
        if (!filePath) {
          const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
              { name: 'Markdown', extensions: ['md', 'markdown'] },
              { name: 'Text', extensions: ['txt'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          });
          if (canceled || filePaths.length === 0) {
            return null;
          }
          filePath = filePaths[0];
        }

        const content = await readFile(filePath, 'utf-8');
        let doc = findDocumentByPath(filePath);

        if (doc) {
          return updateDocument(doc.id, { content });
        } else {
          const title = basename(filePath)
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '');

          return createDocument({
            title,
            content,
            filePath
          });
        }
      } catch (error) {
        console.error('Error opening file:', error);
        dialog.showErrorBox('Open Error', `Could not open the file: ${error.message}`);
        return null;
      }
    });

    ipcMain.handle('save-document', async (event, { id, content }) => {
      try {
        const doc = getDocument(id);
        if (!doc) throw new Error('Document not found');

        const isTxtFile = doc.file_path && doc.file_path.toLowerCase().endsWith('.txt');

        if (doc.file_path && !isTxtFile) {
          await writeFile(doc.file_path, content, 'utf-8');
          return updateDocument(id, { content });
        } else {
          const { canceled, filePath } = await dialog.showSaveDialog({
            defaultPath: `${doc.title.replace(/\.txt$/i, '')}.md`,
            filters: [
              { name: 'Markdown', extensions: ['md'] },
              { name: 'Text', extensions: ['txt'] }
            ]
          });

          if (canceled || !filePath) {
            return doc;
          }

          await writeFile(filePath, content, 'utf-8');
          const title = basename(filePath)
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '');
          return updateDocument(id, { title, content, file_path: filePath });
        }
      } catch (error) {
        console.error('Error saving document:', error);
        throw new Error(`Failed to save document: ${error.message}`);
      }
    });

    ipcMain.handle('save-file-as', async (event, { id, content }) => {
      try {
        const doc = getDocument(id)
        if (!doc) throw new Error('Document not found')

        const { canceled, filePath } = await dialog.showSaveDialog({
          defaultPath: `${doc.title}.md`,
          filters: [
            { name: 'Markdown', extensions: ['md'] },
            { name: 'Text', extensions: ['txt'] }
          ]
        })

        if (canceled || !filePath) {
          return doc
        }

        await writeFile(filePath, content, 'utf-8')
        const title = basename(filePath)
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '')
        return updateDocument(id, { title, content, file_path: filePath })
      } catch (error) {
        console.error('Error saving document as:', error)
        throw new Error(`Failed to save document as: ${error.message}`)
      }
    })

    ipcMain.handle('rename-document', async (event, { id, newTitle }) => {
      try {
        return updateDocument(id, { title: newTitle })
      } catch (error) {
        console.error('Error renaming document:', error)
        throw new Error(`Failed to rename document: ${error.message}`)
      }
    })

    ipcMain.handle('show-input-dialog', async (event, options) => {
      try {
        const { title = 'Input', label = 'Enter value:', defaultValue = '' } = options
        const parentWindow = BrowserWindow.fromWebContents(event.sender)
        if (!parentWindow) {
          return null
        }

        return new Promise((resolve) => {
          const inputWindow = new BrowserWindow({
            width: 400,
            height: 180,
            show: false,
            modal: true,
            parent: parentWindow,
            webPreferences: {
              nodeIntegration: true,
              contextIsolation: false
            },
            title: title,
            resizable: false,
            autoHideMenuBar: true,
            minimizable: false,
            maximizable: false
          })

          const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .label {
              display: block;
              margin-bottom: 8px;
              font-weight: 500;
            }
            .input {
              width: 100%;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 4px;
              margin-bottom: 16px;
              box-sizing: border-box;
            }
            .buttons {
              display: flex;
              justify-content: flex-end;
              gap: 8px;
            }
            button {
              padding: 6px 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            .cancel { background: #f0f0f0; }
            .ok { background: #007acc; color: white; }
          </style>
        </head>
        <body>
          <label class="label">${label}</label>
          <input type="text" id="input" class="input" value="${defaultValue}" autofocus>
          <div class="buttons">
            <button class="cancel" onclick="cancel()">Cancel</button>
            <button class="ok" onclick="submit()">OK</button>
          </div>
          <script>
            const { ipcRenderer } = require('electron')
            function submit() {
              const value = document.getElementById('input').value
              ipcRenderer.send('dialog-result', value)
            }
            function cancel() {
              ipcRenderer.send('dialog-result', null)
            }
            document.getElementById('input').addEventListener('keypress', (e) => {
              if (e.key === 'Enter') submit()
            })
          </script>
        </body>
        </html>
      `

          inputWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)

          const handleDialogResult = (e, result) => {
            if (e.sender === inputWindow.webContents) {
              resolve(result)
              ipcMain.removeListener('dialog-result', handleDialogResult)
              inputWindow.close()
            }
          }

          ipcMain.on('dialog-result', handleDialogResult)

          inputWindow.on('closed', () => {
            ipcMain.removeListener('dialog-result', handleDialogResult)
            resolve(null)
          })

          inputWindow.once('ready-to-show', () => {
            inputWindow.show()
          })
        })
      } catch (error) {
        console.error('Error showing input dialog:', error)
        return null
      }
    })

    ipcMain.on('exit-app', () => {
      app.quit()
    })

    createWindow()

    const initialFilePath = process.argv.find(arg => arg.endsWith('.txt') || arg.endsWith('.md'));
    if (initialFilePath) {
        fileToOpenOnReady = initialFilePath;
    }

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
