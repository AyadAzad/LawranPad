import { useState, useCallback, useRef, useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $patchStyleText } from '@lexical/selection'

const FONT_FAMILIES = Object.freeze({
  Default: 'system-ui, -apple-system',
  Arial: 'Arial, sans-serif',
  TimesNewRoman: 'Times New Roman, serif',
  Georgia: 'Georgia, serif',
  Garamond: 'Garamond, serif',
  CourierNew: 'Courier New, monospace',
  Monaco: 'Monaco, monospace',
  Verdana: 'Verdana, sans-serif',
  Tahoma: 'Tahoma, sans-serif',
  TrebuchetMS: 'Trebuchet MS, sans-serif',
  Impact: 'Impact, sans-serif',
  ComicSansMS: 'Comic Sans MS, cursive',
  Palatino: 'Palatino, serif',
  Baskerville: 'Baskerville, serif',
  AndaleMono: 'Andale Mono, monospace',
  LucidaGrande: 'Lucida Grande, sans-serif',
  GillSans: 'Gill Sans, sans-serif',
  Optima: 'Optima, sans-serif',
  FranklinGothic: 'Franklin Gothic, sans-serif'
})

const FONT_NAMES = {
  Default: 'Default',
  Arial: 'Arial',
  TimesNewRoman: 'Times New Roman',
  Georgia: 'Georgia',
  Garamond: 'Garamond',
  CourierNew: 'Courier New',
  Monaco: 'Monaco',
  Verdana: 'Verdana',
  Tahoma: 'Tahoma',
  TrebuchetMS: 'Trebuchet MS',
  Impact: 'Impact',
  ComicSansMS: 'Comic Sans MS',
  Palatino: 'Palatino',
  Baskerville: 'Baskerville',
  AndaleMono: 'Andale Mono',
  LucidaGrande: 'Lucida Grande',
  GillSans: 'Gill Sans',
  Optima: 'Optima',
  FranklinGothic: 'Franklin Gothic'
}

function FontFamilyDropdown() {
  const [editor] = useLexicalComposerContext()
  const [currentFont, setCurrentFont] = useState('Default')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleFontChange = useCallback(
    (fontKey) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            'font-family': FONT_FAMILIES[fontKey]
          })
        }
      })
      setCurrentFont(fontKey)
      setIsOpen(false)
    },
    [editor]
  )

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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-40 h-10 px-3 rounded-lg border-2 transition-all duration-200
          flex items-center justify-between gap-2
          ${isOpen ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'}
          focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:ring-opacity-50
        `}
      >
        <span
          className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate"
          style={{ fontFamily: FONT_FAMILIES[currentFont] }}
        >
          {FONT_NAMES[currentFont]}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
          {Object.entries(FONT_NAMES).map(([key, name]) => (
            <button
              key={key}
              onClick={() => handleFontChange(key)}
              className={`
                w-full px-3 py-2 text-sm text-left flex items-center justify-between gap-2
                transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/50
                ${currentFont === key ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}
              `}
              style={{ fontFamily: FONT_FAMILIES[key] }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FontFamilyDropdown
