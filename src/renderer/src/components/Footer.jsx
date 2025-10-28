import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const Footer = ({
  document,
  lastSaved,
  onRename,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomPreset,
  presets,
  onGoToDashboard
}) => {
  const { t } = useTranslation()
  const [editor] = useLexicalComposerContext()
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [lastSavedText, setLastSavedText] = useState(t('notSaved'))
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!editor) return
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent()
        const words = text.trim().split(/\s+/).filter(Boolean)
        setWordCount(words.length)
        setCharCount(text.length)
      })
    })
    return () => unregister()
  }, [editor, t])

  useEffect(() => {
    if (lastSaved) {
      const updateLastSavedText = () => {
        const now = new Date()
        const savedDate = new Date(lastSaved)
        const diffInSeconds = Math.floor((now - savedDate) / 1000)

        if (diffInSeconds < 5) {
          setLastSavedText(t('saved'))
        } else if (diffInSeconds < 60) {
          setLastSavedText(t('aFewSecondsAgo'))
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60)
          setLastSavedText(t('minutesAgo', { count: minutes }))
        } else {
          setLastSavedText(
            new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          )
        }
      }
      updateLastSavedText()
      const interval = setInterval(updateLastSavedText, 5000)
      return () => clearInterval(interval)
    } else {
      setLastSavedText(t('notSaved'))
    }
  }, [lastSaved, t])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      window.document.addEventListener('mousedown', handleClickOutside)
      return () => window.document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handlePresetSelect = (preset) => {
    onZoomPreset(preset)
    setIsDropdownOpen(false)
  }

  const handleReset = () => {
    onZoomReset()
    setIsDropdownOpen(false)
  }

  const handleRename = () => {
    if (renameValue && document && renameValue !== document.title) {
      onRename(renameValue)
    }
    setIsRenaming(false)
  }

  const handleDoubleClick = () => {
    if (document) {
      setRenameValue(document.title)
      setIsRenaming(true)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  }

  const dropdownVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.15,
        ease: 'easeOut'
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        when: 'beforeChildren',
        staggerChildren: 0.05
      }
    }
  }

  const dropdownItemVariants = {
    closed: { x: -10, opacity: 0 },
    open: { x: 0, opacity: 1 }
  }

  const statusPulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-4 py-1 bg-gray-100/95 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 backdrop-blur-sm"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onGoToDashboard}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title={t('backToDashboard')}
          variants={itemVariants}
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
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            ></path>
          </svg>
        </motion.button>

        <motion.div
          variants={itemVariants}
          className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"
        />

        {document && (
          <motion.div variants={itemVariants}>
            {isRenaming ? (
              <motion.input
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="font-semibold bg-gray-200 dark:bg-gray-700 rounded px-1 -my-0.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                autoFocus
              />
            ) : (
              <motion.div
                className="flex items-center gap-1"
                onDoubleClick={handleDoubleClick}
                title={t('doubleClickToRename')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-semibold cursor-pointer bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                  {document.title}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"
        />

        <motion.span variants={itemVariants} whileHover={{ scale: 1.05 }} className="font-medium">
          {wordCount} {t('words', { count: wordCount })}
        </motion.span>

        <motion.span variants={itemVariants} whileHover={{ scale: 1.05 }} className="font-medium">
          {charCount} {t('characters', { count: charCount })}
        </motion.span>

        <motion.div
          variants={itemVariants}
          className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"
        />

        <motion.span
          variants={itemVariants}
          animate={{
            color: lastSavedText === t('saved') ? '#10B981' : '',
            transition: { duration: 0.3 }
          }}
          className="font-medium"
        >
          {lastSavedText}
        </motion.span>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          variants={itemVariants}
          className="flex items-center bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden"
          whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        >
          <motion.button
            onClick={onZoomOut}
            disabled={zoomLevel <= 50}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200 dark:border-gray-600"
            title={t('zoomOutCtrl')}
            aria-label={t('zoomOut')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </motion.button>

          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-2 min-w-[80px] text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-r border-gray-200 dark:border-gray-600 flex items-center justify-center"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              title={t('selectZoomLevel')}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{zoomLevel}%</span>
              <motion.svg
                className="w-3 h-3 ml-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-1 min-w-[120px] max-h-60 overflow-y-auto z-50 backdrop-blur-sm"
                >
                  {presets.map((preset) => (
                    <motion.button
                      key={preset}
                      variants={dropdownItemVariants}
                      onClick={() => handlePresetSelect(preset)}
                      className={`w-full px-4 py-2 text-left text-sm transition-all ${
                        preset === zoomLevel
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      {preset}%
                      {preset === 100 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                          ({t('default')})
                        </span>
                      )}
                    </motion.button>
                  ))}
                  <motion.div
                    variants={dropdownItemVariants}
                    className="border-t border-gray-200 dark:border-gray-600 my-1"
                  />
                  <motion.button
                    variants={dropdownItemVariants}
                    onClick={handleReset}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {t('resetTo100')}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={onZoomIn}
            disabled={zoomLevel >= 200}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={t('zoomInCtrl')}
            aria-label={t('zoomIn')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-4 h-4 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-px h-4 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"
        />

        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            variants={statusPulseVariants}
            initial="initial"
            animate="pulse"
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"
          />
          <span className="font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
            {t('ready')}
          </span>
        </motion.div>
      </div>

      {/* Subtle background animation on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

Footer.propTypes = {
  document: PropTypes.shape({
    title: PropTypes.string
  }),
  lastSaved: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRename: PropTypes.func.isRequired,
  zoomLevel: PropTypes.number.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onZoomReset: PropTypes.func.isRequired,
  onZoomPreset: PropTypes.func.isRequired,
  presets: PropTypes.arrayOf(PropTypes.number),
  onGoToDashboard: PropTypes.func.isRequired
}

Footer.defaultProps = {
  presets: [50, 75, 100, 125, 150, 200],
  lastSaved: null
}

export default Footer
