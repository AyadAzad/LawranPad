import { useState, useRef, useEffect } from 'react'

export default function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomPreset,
  presets = [50, 75, 100, 125, 150, 200]
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
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

  return (
    <div className="fixed top-4 right-6 z-50 flex items-center bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={zoomLevel <= 25}
        className="p-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
        title="Zoom Out (Ctrl/Cmd + -)"
        aria-label="Zoom Out"
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>

      {/* Zoom Level Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 py-3 min-w-[80px] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200 flex items-center justify-between"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          title="Select zoom level"
        >
          <span>{zoomLevel}%</span>
          <svg
            className={`w-3 h-3 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] max-h-60 overflow-y-auto">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  preset === zoomLevel
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {preset}%
                {preset === 100 && <span className="text-xs text-gray-400 ml-2">(Default)</span>}
              </button>
            ))}

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset to 100%
            </button>
          </div>
        )}
      </div>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={zoomLevel >= 300}
        className="p-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
        title="Zoom In (Ctrl/Cmd + +)"
        aria-label="Zoom In"
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Fit to Width */}
      <button
        onClick={handleReset}
        className="p-3 hover:bg-gray-50 transition-colors"
        title="Fit to Width (Ctrl/Cmd + 0)"
        aria-label="Reset zoom to 100%"
      >
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  )
}
