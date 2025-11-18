import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { $getSelection, $isRangeSelection } from 'lexical';

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export default function HeadingsDropdown() {
  const [editor] = useLexicalComposerContext();

  const onClick = (heading) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(heading));
      }
    });
  };

  return (
    <div className="relative">
      <select
        onChange={(e) => onClick(e.target.value)}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent text-gray-800 dark:text-white"
      >
        <option value="">Title</option>
        {headings.map((heading) => (
          <option key={heading} value={heading}>
            {`Heading ${heading.substring(1)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
