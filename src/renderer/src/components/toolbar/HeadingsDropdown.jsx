import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getSelection, $isRangeSelection } from 'lexical'

const headingOptions = [
  { name: 'Title', tag: 'h1' },
  { name: 'Sub-title', tag: 'h2' },
  { name: 'Section', tag: 'h3' },
  { name: 'Sub-section', tag: 'h4' },
  { name: 'Paragraph', tag: 'p' }
]

export default function HeadingsDropdown() {
  const [editor] = useLexicalComposerContext()

  const onClick = (tag) => {
    if (tag === '') return

    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  return (
    <div className="relative">
      <select
        onChange={(e) => onClick(e.target.value)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent text-gray-800 dark:text-white"
      >
        <option value="">Select Style</option>
        {headingOptions.map((option) => (
          <option key={option.tag} value={option.tag}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
