import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_ELEMENT_COMMAND } from 'lexical'
import { useState, useRef, useEffect } from 'react'

const alignmentOptions = [
  {
    value: 'left',
    label: 'Left',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="none" d="M0 0h24v24H0z" />
        <path fill="currentColor" d="M3 4h18v2H3V4zm0 15h14v2H3v-2zm0-5h18v2H3v-2zm0-5h14v2H3V9z" />
      </svg>
    )
  },
  {
    value: 'center',
    label: 'Center',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M3 4h18v2H3V4zm4 15h14v2H7v-2zm-4-5h18v2H3v-2zm4-5h14v2H7V9z"
        />
      </svg>
    )
  },
  {
    value: 'right',
    label: 'Right',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M3 4h18v2H3V4zm7 15h14v2H10v-2zm-7-5h18v2H3v-2zm7-5h14v2H10V9z"
        />
      </svg>
    )
  },
  {
    value: 'justify',
    label: 'Justify',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="none" d="M0 0h24v24H0z" />
        <path fill="currentColor" d="M3 4h18v2H3V4zm0 15h18v2H3v-2zm0-5h18v2H3v-2zm0-5h18v2H3V9z" />
      </svg>
    )
  }
]

const AlignmentDropdown = () => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [currentAlignment, setCurrentAlignment] = useState('left')
  const dropdownRef = useRef(null)

  const handleAlignmentChange = (alignment) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)
    setCurrentAlignment(alignment)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-800 dark:text-gray-200"
        title="Text Alignment"
      >
        {alignmentOptions.find((opt) => opt.value === currentAlignment)?.icon}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] z-50">
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAlignmentChange(option.value)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlignmentDropdown
