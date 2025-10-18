import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { basename } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFile, writeFile } from 'fs/promises'
import HTMLtoDOCX from 'html-to-docx'
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
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
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

    // --- Database-Centric IPC Handlers ---

    ipcMain.handle('get-documents', () => listDocuments())
    ipcMain.handle('get-document-content', (_, id) => getDocument(id))
    ipcMain.handle('create-new-document', () => createDocument())
    ipcMain.handle('delete-document', (_, id) => deleteDocument(id))

    // --- File Operations ---

    ipcMain.handle('select-image-file', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            {
              name: 'Images',
              extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
            }
          ]
        })

        if (canceled || filePaths.length === 0) {
          return null
        }

        return filePaths[0]
      } catch (error) {
        console.error('Error selecting image file:', error)
        return null
      }
    })

    ipcMain.handle('read-image-as-data-url', async (_, filePath) => {
      try {
        const data = await readFile(filePath)
        const ext = basename(filePath).split('.').pop().toLowerCase()
        let mimeType = ''
        switch (ext) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg'
            break
          case 'png':
            mimeType = 'image/png'
            break
          case 'gif':
            mimeType = 'image/gif'
            break
          case 'bmp':
            mimeType = 'image/bmp'
            break
          case 'webp':
            mimeType = 'image/webp'
            break
          case 'svg':
            mimeType = 'image/svg+xml'
            break
          default:
            mimeType = 'application/octet-stream'
        }
        return `data:${mimeType};base64,${data.toString('base64')}`
      } catch (error) {
        console.error('Error reading image file as data URL:', error)
        return null
      }
    })

    // Custom input dialog for URLs and text input
    // Improved input dialog without external HTML file
    ipcMain.handle('show-input-dialog', async (event, options) => {
      try {
        const { title = 'Input', label = 'Enter value:', defaultValue = '', value = '' } = options
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

          // Create HTML content directly
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
          <input type="text" id="input" class="input" value="${value || defaultValue}" autofocus>
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

    // Message box for errors and information
    ipcMain.handle('show-message-box', async (event, options) => {
      try {
        const { type = 'info', title = 'Message', message = '' } = options

        await dialog.showMessageBox({
          type: type,
          title: title,
          message: message,
          buttons: ['OK']
        })
      } catch (error) {
        console.error('Error showing message box:', error)
      }
    })

    ipcMain.handle('open-file-dialog', async () => {
      try {
        const { canceled, filePaths } = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [
            { name: 'HTML', extensions: ['html', 'htm'] },
            { name: 'Markdown', extensions: ['md', 'markdown'] },
            { name: 'Text', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })

        if (canceled || filePaths.length === 0) {
          return null
        }

        const filePath = filePaths[0]
        const fileExtension = filePath.split('.').pop().toLowerCase()
        let doc = findDocumentByPath(filePath)

        if (doc) {
          return doc
        } else {
          const content = await readFile(filePath, 'utf-8')
          const title = basename(filePath)
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '')

          // Convert markdown to HTML if needed
          let htmlContent = content
          if (fileExtension === 'md' || fileExtension === 'markdown') {
            // Simple markdown to HTML conversion
            htmlContent = convertMarkdownToHTML(content)
          } else if (fileExtension === 'txt') {
            // Convert plain text to HTML
            htmlContent = convertTextToHTML(content)
          }

          return createDocument({
            title,
            content: htmlContent,
            filePath
          })
        }
      } catch (error) {
        console.error('Error opening file:', error)
        dialog.showErrorBox('Open Error', `Could not open the file: ${error.message}`)
        return null
      }
    })

    ipcMain.handle('save-document', async (event, { id, content }) => {
      try {
        const doc = getDocument(id)
        if (!doc) throw new Error('Document not found')

        if (doc.file_path) {
          await writeFile(doc.file_path, content, 'utf-8')
          return updateDocument(id, { content })
        } else {
          // If no file path, trigger save-as dialog
          const { canceled, filePath } = await dialog.showSaveDialog({
            defaultPath: `${doc.title}.html`,
            filters: [
              { name: 'HTML', extensions: ['html', 'htm'] },
              { name: 'Markdown', extensions: ['md'] },
              { name: 'Text', extensions: ['txt'] }
            ]
          })

          if (canceled || !filePath) {
            return doc // Return original doc if save is cancelled
          }

          await writeFile(filePath, content, 'utf-8')
          const title = basename(filePath)
            .replace(/[-_]/g, ' ')
            .replace(/\.[^/.]+$/, '')
          return updateDocument(id, { title, content, file_path: filePath })
        }
      } catch (error) {
        console.error('Error saving document:', error)
        throw new Error(`Failed to save document: ${error.message}`)
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

    // --- Export Handlers ---

    ipcMain.on('export-to-markdown', async (event, markdown) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Export as Markdown',
          defaultPath: 'document.md',
          filters: [{ name: 'Markdown', extensions: ['md'] }]
        })

        if (!canceled && filePath) {
          await writeFile(filePath, markdown, 'utf-8')

          // Show success message
          dialog.showMessageBox({
            type: 'info',
            title: 'Export Successful',
            message: 'Document exported as Markdown successfully!'
          })
        }
      } catch (error) {
        console.error('Failed to export Markdown:', error)
        dialog.showErrorBox('Export Error', 'Could not save the Markdown file.')
      }
    })

    ipcMain.on('export-to-pdf', async (event, html) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Export as PDF',
          defaultPath: 'document.pdf',
          filters: [{ name: 'PDF', extensions: ['pdf'] }]
        })

        if (!canceled && filePath) {
          const pdfWindow = new BrowserWindow({
            show: false,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true
            }
          })

          const fullHtml = `<!DOCTYPE html>\n            <html lang="en" >\n              <head>\n                <meta charset="UTF-8">\n                <style>\n                  body {\n                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;\n                    line-height: 1.6;\n                    color: #1f2937;\n                    padding: 20px;\n                  }\n                  img {\n                    max-width: 100%;\n                    height: auto;\n                  }\n                  .video-embed {\n                    display: none; /* Hide videos in PDF */\n                  }\n                  @media print {\n                    body { margin: 0; padding: 0; }\n                  }\n                </style>\n              </head>\n              <body>${html}</body>\n            </html>`

          await pdfWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(fullHtml))

          // Wait for content to load
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const data = await pdfWindow.webContents.printToPDF({
            margins: {
              top: 0.5, // 0.5 inch
              bottom: 0.5,
              left: 0.5,
              right: 0.5
            },
            pageSize: 'A4',
            printBackground: true,
            landscape: false
          })

          await writeFile(filePath, data)
          pdfWindow.close()

          dialog.showMessageBox({
            type: 'info',
            title: 'Export Successful',
            message: 'Document exported as PDF successfully!'
          })
        }
      } catch (error) {
        console.error('Failed to export PDF:', error)
        dialog.showErrorBox('Export Error', 'Could not save the PDF file.')
      }
    })

    ipcMain.on('export-to-docx', async (event, html) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Export as DOCX',
          defaultPath: 'document.docx',
          filters: [{ name: 'Word Document', extensions: ['docx'] }]
        })

        if (!canceled && filePath) {
          const fileBuffer = await HTMLtoDOCX(html, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
            margins: {
              top: 720, // 1 inch in twips (1 inch = 1440 twips, 0.5 inch = 720 twips)
              right: 720,
              bottom: 720,
              left: 720
            }
          })

          await writeFile(filePath, fileBuffer)

          dialog.showMessageBox({
            type: 'info',
            title: 'Export Successful',
            message: 'Document exported as DOCX successfully!'
          })
        }
      } catch (error) {
        console.error('Failed to export DOCX:', error)
        dialog.showErrorBox('Export Error', 'Could not save the DOCX file.')
      }
    })

    // --- App Control ---

    ipcMain.on('exit-app', () => {
      app.quit()
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

// --- Helper Functions ---

/**
 * Simple markdown to HTML converter
 */
function convertMarkdownToHTML(markdown) {
  if (!markdown) return ''

  return (
    markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Wrap in paragraph if no HTML tags
      .replace(/^(?!<h[1-6]|<br|<p)(.*)$/gim, '<p>$1</p>')
  )
}

/**
 * Convert plain text to HTML
 */
function convertTextToHTML(text) {
  if (!text) return ''

  return text.split('\n').map((line) => (line.trim() ? `<p>${line}</p>` : '<br>').join(''))
}
