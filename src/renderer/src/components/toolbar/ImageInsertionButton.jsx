import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_IMAGE_COMMAND } from '../../plugins/ImagePlugin'
import { motion } from 'framer-motion'

const ImageInsertionButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleInsertImage = async () => {
    try {
      // Use Electron's dialog to select an image file
      const filePath = await window.electron.ipcRenderer.invoke('select-image-file')

      if (filePath) {
        // Read the image file as a data URL from the main process
        const dataUrl = await window.electron.ipcRenderer.invoke('read-image-as-data-url', filePath)

        if (dataUrl) {
          // Dispatch the command to insert the image with the data URL
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: dataUrl,
            altText: 'Image',
            width: '100%',
            height: 'auto'
          })
        } else {
          // Handle cases where the data URL could not be created
          console.error('Failed to create data URL for image:', filePath)
          window.electron.ipcRenderer.invoke('show-message-box', {
            type: 'error',
            title: 'Image Error',
            message: 'Could not load the selected image file.'
          })
        }
      }
    } catch (error) {
      console.error('Error inserting image:', error)
      window.electron.ipcRenderer.invoke('show-message-box', {
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while inserting the image.'
      })
    }
  }

  return (
    <motion.button
      onClick={handleInsertImage}
      className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      title="Insert Image"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg
        className="w-5 h-5 text-gray-600 dark:text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </motion.button>
  )
}

export default ImageInsertionButton
