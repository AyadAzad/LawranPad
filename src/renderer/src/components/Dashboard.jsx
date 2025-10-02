import { useState, useEffect } from 'react'

const Dashboard = ({ onNewDocument, onOpenRecentDocument }) => {
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

    getRecentFiles()
  }, [])

  const handleNewDocument = () => {
    onNewDocument()
  }

  const handleOpenFile = () => {
    window.electron.ipcRenderer.send('open-file')
  }

  const handleOpenRecentDocument = (id) => {
    onOpenRecentDocument(id)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">LawranPad</h1>
            <p className="text-xl text-gray-600">A modern and powerful text editor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={handleNewDocument}
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">New Document</h2>
              <p className="text-gray-600">Start with a blank canvas.</p>
            </div>
            <div
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={handleOpenFile}
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
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Open File</h2>
              <p className="text-gray-600">Open a file from your computer.</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Documents</h3>
            {recentFiles.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg">
                <ul className="divide-y divide-gray-200">
                  {recentFiles.map((file) => (
                    <li
                      key={file.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenRecentDocument(file.id)}
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800">{file.title}</p>
                        <p className="text-sm text-gray-500">
                          Last updated: {new Date(file.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
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
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 text-gray-500 mx-auto mb-6">
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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recent Documents</h3>
                <p className="text-gray-600">
                  Create a new document or open a file to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Lawran</p>
      </footer>
    </div>
  )
}

export default Dashboard
