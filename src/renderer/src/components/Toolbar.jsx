import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import FontFamilyDropdown from './toolbar/FontFamilyDropdown'
import FontSizeDropdown from './toolbar/FontSizeDropdown'
import BoldButton from './toolbar/BoldButton'
import ItalicButton from './toolbar/ItalicButton'
import UnderlineButton from './toolbar/UnderlineButton'
import StrikethroughButton from './toolbar/StrikethroughButton'
import TextColorPicker from './toolbar/TextColorPicker'
import HighlightColorPicker from './toolbar/HighlightColorPicker'
import AlignmentDropdown from './toolbar/AlignmentDropdown'
import LineSpacingDropdown from './toolbar/LineSpacingDropdown'

const Toolbar = () => {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 relative z-40">
      {/* Font Controls Group */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
        <FontFamilyDropdown editor={editor} />
        <FontSizeDropdown editor={editor} />
      </div>

      {/* Text Formatting Group */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <div className="relative z-50">
          <BoldButton editor={editor} />
        </div>
        <div className="relative z-50">
          <ItalicButton editor={editor} />
        </div>
        <div className="relative z-50">
          <UnderlineButton editor={editor} />
        </div>
        <div className="relative z-50">
          <StrikethroughButton editor={editor} />
        </div>
      </div>

      {/* Color Controls Group */}
      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <div className="relative z-50">
          <TextColorPicker editor={editor} />
        </div>
        <div className="relative z-50">
          <HighlightColorPicker editor={editor} />
        </div>
      </div>

      {/* Paragraph Formatting Group */}
      <div className="flex items-center gap-1 pl-2">
        <div className="relative z-50">
          <AlignmentDropdown editor={editor} />
        </div>
        <div className="relative z-50">
          <LineSpacingDropdown editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default Toolbar
