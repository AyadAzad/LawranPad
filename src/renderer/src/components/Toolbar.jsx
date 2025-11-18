import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import BoldButton from './toolbar/BoldButton'
import ItalicButton from './toolbar/ItalicButton'
import StrikethroughButton from './toolbar/StrikethroughButton'
import BulletPointButton from './toolbar/BulletPointButton'
import NumberedPointButton from './toolbar/NumberedPointButton'
import CodeBlockButton from './toolbar/CodeBlockButton'
import BlockquoteButton from './toolbar/BlockquoteButton'
import HorizontalRuleButton from './toolbar/HorizontalRuleButton'
import HeadingsDropdown from './toolbar/HeadingsDropdown'
import InsertLinkButton from './toolbar/InsertLinkButton'

const Toolbar = () => {
  const [editor] = useLexicalComposerContext()

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 border-b border-gray-200 bg-white/95 dark:bg-gray-800/95 dark:border-gray-700 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-800/80 relative z-40">
      {/* Block Style Group */}
      <div className="flex items-center gap-1">
        <HeadingsDropdown />
      </div>

      <div className="h-6 w-px bg-gray-400 dark:bg-gray-500 mx-2" />

      {/* Text Style Group */}
      <div className="flex items-center gap-1">
        <BoldButton editor={editor} />
        <ItalicButton editor={editor} />
        <StrikethroughButton editor={editor} />
      </div>

      <div className="h-6 w-px bg-gray-400 dark:bg-gray-500 mx-2" />

      {/* Insert Group */}
      <div className="flex items-center gap-1">
        <BulletPointButton editor={editor} />
        <NumberedPointButton editor={editor} />
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
        <InsertLinkButton />
        <CodeBlockButton />
        <BlockquoteButton />
        <HorizontalRuleButton />
      </div>
    </div>
  )
}

export default Toolbar
