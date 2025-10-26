import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_CHECK_LIST_COMMAND } from '@lexical/list';

export default function ChecklistButton() {
  const [editor] = useLexicalComposerContext();

  const handleClick = () => {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  };

  return (
    <button onClick={handleClick} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Insert Checklist">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
      </svg>
    </button>
  );
}
