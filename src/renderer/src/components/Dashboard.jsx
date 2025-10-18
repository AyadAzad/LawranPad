import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

const Dashboard = ({ onNewDocument, onOpenRecentDocument, onOpenFileDialog }) => {
  const [recentFiles, setRecentFiles] = useState([])

  useEffect(() => {
    const getRecentFiles = async () => {
      try {
        const files = await window.electron.ipcRenderer.invoke('get-documents')
        setRecentFiles(files)
      } catch (error) {
        console.error('Failed to fetch recent files:', error)
      }
    }

    void getRecentFiles()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto p-8">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">LawranPad</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              A modern and powerful text editor.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-2xl dark:hover:shadow-blue-500/20 transition-shadow duration-300 cursor-pointer"
              onClick={onNewDocument}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 text-white mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                New Document
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Start with a blank canvas.</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-2xl dark:hover:shadow-green-500/20 transition-shadow duration-300 cursor-pointer"
              onClick={onOpenFileDialog}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Open File
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Open a file from your computer.</p>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Recent Documents
            </h3>
            {recentFiles.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              >
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentFiles.map((file) => (
                    <motion.li
                      key={file.id}
                      variants={itemVariants}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => onOpenRecentDocument(file.id)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
                          {file.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last updated: {new Date(file.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  No Recent Documents
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Create a new document or open a file to get started.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <footer className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by Lawran</p>
      </footer>
    </motion.div>
  )
}

Dashboard.propTypes = {
  onNewDocument: PropTypes.func.isRequired,
  onOpenRecentDocument: PropTypes.func.isRequired,
  onOpenFileDialog: PropTypes.func.isRequired
}

export default Dashboard
