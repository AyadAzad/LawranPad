import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

const Tabs = ({ openDocuments, activeDocumentId, onSelectTab, onCloseTab, onNewTab }) => {
  return (
    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
      <AnimatePresence initial={false}>
        {openDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${activeDocumentId === doc.id ? 'bg-white dark:bg-gray-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            onClick={() => onSelectTab(doc.id)}
          >
            <span className="mr-2 text-sm font-medium text-gray-800 dark:text-white">{doc.title}</span>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(doc.id);
              }}
              className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </motion.button>
            {activeDocumentId === doc.id && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNewTab}
        className="px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        +
      </motion.button>
    </div>
  );
};

Tabs.propTypes = {
  openDocuments: PropTypes.array.isRequired,
  activeDocumentId: PropTypes.string,
  onSelectTab: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired,
  onNewTab: PropTypes.func.isRequired,
};

export default Tabs;
