import { useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import PropTypes from 'prop-types'

const TableInsertionButton = ({ editor }) => {
  const [showDialog, setShowDialog] = useState(false)
  const [rows, setRows] = useState(3)
  const [columns, setColumns] = useState(3)

  const handleInsertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: String(columns), rows: String(rows) })
    setShowDialog(false)
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Insert Table"
        aria-label="Insert Table"
      >
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M3 3h18v18H3zM21 9H3M21 15H3M9 3v18M15 3v18"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Insert Table
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="rows"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Rows
                </label>
                <input
                  type="number"
                  id="rows"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="columns"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Columns
                </label>
                <input
                  type="number"
                  id="columns"
                  value={columns}
                  onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertTable}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

TableInsertionButton.propTypes = {
  editor: PropTypes.object.isRequired
}

export default TableInsertionButton
