import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

export default function InsertLinkButton() {
  const [editor] = useLexicalComposerContext();

  const handleClick = async () => {
    const url = await window.electron.ipcRenderer.invoke('show-input-dialog', {
      title: 'Insert Link',
      label: 'Enter URL:',
      defaultValue: 'https://'
    });

    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  return (
    <button onClick={handleClick} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Insert Link">
      <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899l4-4a4 4 0 10-5.656-5.656l-4 4a4 4 0 005.656 5.656l.414-.414"></path>
      </svg>
    </button>
  );
}
