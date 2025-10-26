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
import BulletPointButton from './toolbar/BulletPointButton'
import NumberedPointButton from './toolbar/NumberedPointButton'
import RomanPointButton from './toolbar/RomanPointButton'
import TableInsertionButton from './toolbar/TableInsertionButton'
import CodeBlockButton from './toolbar/CodeBlockButton'
import BlockquoteButton from './toolbar/BlockquoteButton'
import HorizontalRuleButton from './toolbar/HorizontalRuleButton'
import HeadingsDropdown from './toolbar/HeadingsDropdown'
import InsertLinkButton from './toolbar/InsertLinkButton'
import ChecklistButton from './toolbar/ChecklistButton'

const Toolbar = () => {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 border-b border-gray-200 bg-white/95 dark:bg-gray-800/95 dark:border-gray-700 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-800/80 relative z-40">
      {/* Text Style Group */}
      <div className="flex items-center gap-1">
        <FontFamilyDropdown editor={editor} />
        <FontSizeDropdown editor={editor} />
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        <BoldButton editor={editor} />
        <ItalicButton editor={editor} />
        <UnderlineButton editor={editor} />
        <StrikethroughButton editor={editor} />
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        <TextColorPicker editor={editor} />
        <HighlightColorPicker editor={editor} />
      </div>

      <div className="h-6 w-px bg-gray-400 dark:bg-gray-500 mx-2" />

      {/* Block Style Group */}
      <div className="flex items-center gap-1">
        <HeadingsDropdown />
        <AlignmentDropdown editor={editor} />
        <LineSpacingDropdown editor={editor} />
      </div>

      <div className="h-6 w-px bg-gray-400 dark:bg-gray-500 mx-2" />

      {/* Insert Group */}
      <div className="flex items-center gap-1">
        <BulletPointButton editor={editor} />
        <NumberedPointButton editor={editor} />
        <RomanPointButton editor={editor} />
        <ChecklistButton />
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        <InsertLinkButton />
        <TableInsertionButton editor={editor} />
        <CodeBlockButton />
        <BlockquoteButton />
        <HorizontalRuleButton />
      </div>
    </div>
  )
}

export default Toolbar
