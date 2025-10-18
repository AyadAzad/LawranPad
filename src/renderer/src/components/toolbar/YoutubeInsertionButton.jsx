import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_YOUTUBE_COMMAND } from '../../plugins/YouTubePlugin'
import { motion } from 'framer-motion'

const YouTubeInsertionButton = () => {
  const [editor] = useLexicalComposerContext()

  const handleInsertYouTube = async () => {
    try {
      // Use Electron's dialog to get YouTube URL
      const videoUrl = await window.electron.ipcRenderer.invoke('show-input-dialog', {
        title: 'Insert YouTube Video',
        label: 'YouTube URL or Video ID:',
        defaultValue: 'https://www.youtube.com/watch?v='
      })

      if (videoUrl) {
        let videoId = videoUrl

        // Extract video ID from various YouTube URL formats
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const match = videoUrl.match(
            /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
          )
          videoId = match ? match[1] : videoUrl
        }

        if (videoId && videoId.length === 11) {
          editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, { videoId })
        } else {
          // Show error dialog
          await window.electron.ipcRenderer.invoke('show-message-box', {
            type: 'error',
            title: 'Invalid YouTube URL',
            message: 'Please enter a valid YouTube URL or Video ID'
          })
        }
      }
    } catch (error) {
      console.error('Error inserting YouTube video:', error)
    }
  }

  return (
    <motion.button
      onClick={handleInsertYouTube}
      className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      title="Insert YouTube Video"
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
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    </motion.button>
  )
}

export default YouTubeInsertionButton
