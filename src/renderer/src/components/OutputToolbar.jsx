import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { motion } from 'framer-motion'

const ALL_TRANSFORMERS = [
  TRANSFORMERS.TABLE,
  TRANSFORMERS.HEADING,
  TRANSFORMERS.QUOTE,
  TRANSFORMERS.CODE,
  TRANSFORMERS.UNORDERED_LIST,
  TRANSFORMERS.ORDERED_LIST,
  TRANSFORMERS.CHECK_LIST,
  TRANSFORMERS.INLINE_CODE,
  TRANSFORMERS.LINK,
  TRANSFORMERS.BOLD_ITALIC_STAR,
  TRANSFORMERS.BOLD_ITALIC_UNDERSCORE,
  TRANSFORMERS.BOLD_STAR,
  TRANSFORMERS.BOLD_UNDERSCORE,
  TRANSFORMERS.ITALIC_STAR,
  TRANSFORMERS.ITALIC_UNDERSCORE,
  TRANSFORMERS.STRIKETHROUGH
]

const OutputToolbar = () => {
  const [editor] = useLexicalComposerContext()

  const handleExportToMarkdown = () => {
    editor.getEditorState().read(() => {
      const markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
      window.electron.ipcRenderer.send('export-to-markdown', markdown)
    })
  }

  const handleExportToPDF = () => {
    const rootElement = editor.getRootElement()
    if (rootElement) {
      const html = rootElement.innerHTML
      window.electron.ipcRenderer.send('export-to-pdf', html)
    }
  }

  const handleExportToDocx = () => {
    const rootElement = editor.getRootElement()
    if (rootElement) {
      const html = rootElement.innerHTML
      window.electron.ipcRenderer.send('export-to-docx', html)
    }
  }

  const buttonClasses =
    'flex items-center justify-center w-12 h-12 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200'
  const svgIconClasses = 'w-6 h-6 text-gray-600 dark:text-gray-300'

  // Container animation variants - slides from RIGHT
  const containerVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    }
  }

  // Title animation variants with pulse effect
  const titleVariants = {
    hidden: { scale: 0, rotate: 180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 12
      }
    },
    hover: {
      scale: [1, 1.15, 1],
      textShadow: [
        '0px 0px 0px rgba(59, 130, 246, 0)',
        '0px 0px 20px rgba(59, 130, 246, 0.8)',
        '0px 0px 0px rgba(59, 130, 246, 0)'
      ],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut'
      }
    }
  }

  // Button animation variants
  const buttonVariants = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.15,
      y: -5,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.9,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  }

  // Markdown icon variant - code brackets animation
  const markdownIconVariants = {
    hover: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    },
    tap: {
      scale: 0.8,
      rotate: 15
    }
  }

  // PDF icon variant - download motion
  const pdfIconVariants = {
    hover: {
      y: [0, -3, 0],
      transition: {
        repeat: Infinity,
        duration: 0.8,
        ease: 'easeInOut'
      }
    },
    tap: {
      y: 5,
      scale: 0.9
    }
  }

  // DOCX icon variant - document flip
  const docxIconVariants = {
    hover: {
      rotateY: [0, 180, 360],
      transition: {
        duration: 0.8,
        ease: 'easeInOut'
      }
    },
    tap: {
      scale: 0.85
    }
  }

  // Success feedback animation
  const successVariants = {
    tap: {
      scale: [1, 1.3, 1],
      rotate: [0, -10, 10, 0],
      backgroundColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0)'],
      transition: {
        duration: 0.4
      }
    }
  }

  return (
    <motion.aside
      className="w-20 bg-white/80 dark:bg-gray-800/80 border-l border-gray-200 dark:border-gray-700 shadow-lg flex flex-col items-center p-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-4"
        variants={titleVariants}
        whileHover="hover"
      >
        Output
      </motion.div>

      <motion.button
        onClick={handleExportToMarkdown}
        className={buttonClasses}
        title="Export as Markdown"
        variants={buttonVariants}
        whileHover="hover"
        whileTap={{ ...buttonVariants.tap, ...successVariants.tap }}
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={markdownIconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 18l6-6-6-6M8 6l-6 6 6 6"
          ></path>
        </motion.svg>
      </motion.button>

      <motion.button
        onClick={handleExportToPDF}
        className={buttonClasses}
        title="Export as PDF"
        variants={buttonVariants}
        whileHover="hover"
        whileTap={{ ...buttonVariants.tap, ...successVariants.tap }}
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={pdfIconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </motion.svg>
      </motion.button>

      <motion.button
        onClick={handleExportToDocx}
        className={buttonClasses}
        title="Export as DOCX"
        variants={buttonVariants}
        whileHover="hover"
        whileTap={{ ...buttonVariants.tap, ...successVariants.tap }}
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={docxIconVariants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </motion.svg>
      </motion.button>
    </motion.aside>
  )
}

export default OutputToolbar
