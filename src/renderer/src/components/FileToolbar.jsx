import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import ThemeToggleButton from './toolbar/ThemeToggleButton'
import { useTranslation } from 'react-i18next'

const FileToolbar = ({ onSave, onOpen, onGoToDashboard }) => {
  const { t } = useTranslation()

  const handleExit = () => {
    window.electron.ipcRenderer.send('exit-app')
  }

  const buttonClasses =
    'flex items-center justify-center w-12 h-12 rounded-lg hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200'
  const svgIconClasses = 'w-6 h-6 text-gray-600 dark:text-gray-300'

  // Container animation variants
  const containerVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  // Title animation variants
  const titleVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
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
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut'
        }
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
      rotate: [0, -5, 5, 0],
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.9,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    }
  }

  // Icon animation variants
  const iconVariants = {
    hover: {
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    },
    tap: {
      scale: 0.8
    }
  }

  // Special exit button variant
  const exitButtonVariants = {
    ...buttonVariants,
    hover: {
      scale: 1.15,
      x: [0, 5, 0],
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
        x: {
          repeat: Infinity,
          duration: 1,
          ease: 'easeInOut'
        }
      }
    }
  }

  return (
    <motion.aside
      className="w-20 bg-white/80 dark:bg-gray-800/80 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col items-center p-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-lg font-bold text-green-700 dark:text-green-400 mb-4"
        variants={titleVariants}
        whileHover="hover"
      >
        {t('file')}
      </motion.div>

      <motion.button
        onClick={onGoToDashboard}
        className={buttonClasses}
        title={t('backToDashboard')}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={iconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 17l-5-5m0 0l5-5m-5 5h12"
          ></path>
        </motion.svg>
      </motion.button>

      <motion.button
        onClick={onOpen}
        className={buttonClasses}
        title={t('openFile')}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={iconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
          ></path>
        </motion.svg>
      </motion.button>

      <motion.button
        onClick={onSave}
        className={buttonClasses}
        title={t('saveFile')}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={iconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          ></path>
        </motion.svg>
      </motion.button>

      <div className="flex-grow"></div>

      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <ThemeToggleButton />
      </motion.div>

      <motion.button
        onClick={handleExit}
        className={buttonClasses}
        title={t('exit')}
        variants={exitButtonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <motion.svg
          className={svgIconClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          variants={iconVariants}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H3"
          ></path>
        </motion.svg>
      </motion.button>
    </motion.aside>
  )
}

FileToolbar.propTypes = {
  onSave: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  onGoToDashboard: PropTypes.func.isRequired
}

export default FileToolbar
