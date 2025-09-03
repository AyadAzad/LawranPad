import sys
import handle_files as hf
import handle_markdown as hmd
from zoom_utils import handle_keypress, handle_wheel
from PySide6.QtGui import QIcon, QAction, QKeySequence, QTextCursor, QFont, QTextListFormat, QTextCharFormat
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QStatusBar, QFileDialog,
    QTabWidget, QWidget, QVBoxLayout, QMessageBox, QToolBar,
)



class LawranPad(QMainWindow):
    def __init__(self):
        super().__init__()
        # Window setup
        self.child_windows = []
        self.setWindowTitle("Lawran Pad")
        self.resize(900, 600)

        # Tab widget to manage multiple documents
        self.tabs = QTabWidget()
        self.tabs.setTabsClosable(True)
        self.tabs.tabCloseRequested.connect(lambda index: hf.close_tab(self, index))
        self.setCentralWidget(self.tabs)
        # Dictionary to store file  paths for each tab
        self.file_paths = {}

        # Status Bar
        self.status = QStatusBar()
        self.setStatusBar(self.status)

        # setup menus
        self._create_actions()
        self._create_menus()

        # Start with one new tab
        hf.new_tab(self)

        # formating toolbar
        toolbar = QToolBar("Formatting")
        self.addToolBar(toolbar)

        # markdown actions
        for i in range(1,7):
            act = QAction(f"H{i}", self)
            act.triggered.connect(lambda checked, level=i: hmd.apply_heading(self, level))
            toolbar.addAction(act)
        # bold
        bold_action = QAction("bold", self)
        bold_action.triggered.connect(lambda: hmd.apply_bold(self))
        toolbar.addAction(bold_action)
        # italic
        italic_action = QAction("italic", self)
        italic_action.triggered.connect(lambda: hmd.apply_italic(self))
        toolbar.addAction(italic_action)
        # link
        link_action = QAction("link", self)
        link_action.triggered.connect(lambda: hmd.apply_italic(self))
        toolbar.addAction(link_action)
        # bullet points
        bullet_action = QAction("Bullet List", self)
        bullet_action.triggered.connect(lambda: hmd.apply_bullet_list(self))
        toolbar.addAction(bullet_action)
        # Numbered list
        number_action = QAction("Number List", self)
        number_action.triggered.connect(lambda: hmd.apply_numbered_list(self))
        toolbar.addAction(number_action)

    def _create_actions(self):
        # Create the actions
            self.new_action = QAction(QIcon(), "New", self)
            self.new_tab_action = QAction(QIcon, "New Tab", self)
            self.new_window_action = QAction(QIcon(), "New Window", self)
            self.close_tab_action = QAction(QIcon(), "Close Tab", self)
            self.open_action = QAction(QIcon(), "Open", self)
            self.save_action = QAction(QIcon(), "Save", self)
            self.save_as_action = QAction(QIcon(), "Save As", self)
            self.save_all_action = QAction(QIcon(), "Save All", self)
            self.exit_action = QAction(QIcon(), "Exit", self)

            self.cut_action = QAction(QIcon(), "Cut", self)
            self.copy_action = QAction(QIcon(), "Copy", self)
            self.paste_action = QAction(QIcon(), "Paste", self)
            self.undo_action = QAction(QIcon(), "Undo", self)
            self.redo_action = QAction(QIcon(), "Redo", self)

            self.about_action = QAction( "About LawranPad", self)

            # connect actions connect buttons with functions
            self.new_action.triggered.connect(lambda: hf.new_file(self))
            self.new_tab_action.triggered.connect(lambda: hf.new_tab(self))
            self.new_window_action.triggered.connect(lambda: self.new_window)
            self.open_action.triggered.connect(lambda: hf.open_file(self))
            self.close_tab_action.triggered.connect(lambda: hf.close_tab(self))
            self.save_action.triggered.connect(lambda: hf.save_file(self))
            self.save_as_action.triggered.connect(lambda: hf.save_file_as(self))
            self.save_all_action.triggered.connect(lambda: hf.save_all_files(self))
            self.exit_action.triggered.connect(lambda: hf.exit_app(self))
            # Keyboard shortcuts
            self.new_action.setShortcut(QKeySequence("Ctrl+N"))
            self.new_tab_action.setShortcut(QKeySequence("Ctrl+T"))
            self.new_window_action.setShortcut(QKeySequence("Ctrl+Shift+N"))
            self.open_action.setShortcut("Ctrl+O")
            self.close_tab_action.setShortcut(QKeySequence("Ctrl+W"))
            self.save_action.setShortcut(QKeySequence("Ctrl+S"))
            self.save_as_action.setShortcut(QKeySequence("Ctrl+Shift+S"))
            self.exit_action.setShortcut(QKeySequence("Ctrl+Q"))

    def _create_menus(self):
            menu_bar = self.menuBar()
            # File menu
            file_menu = menu_bar.addMenu("File")
            file_menu.addAction(self.new_action)
            file_menu.addAction(self.new_tab_action)
            file_menu.addAction(self.new_window_action)
            file_menu.addAction(self.open_action)
            file_menu.addAction(self.close_tab_action)
            file_menu.addAction(self.save_action)
            file_menu.addAction(self.save_as_action)
            file_menu.addAction(self.save_all_action)


            file_menu.addSeparator()
            file_menu.addAction(self.exit_action)
            # Edit Menu
            edit_menu = menu_bar.addMenu("Edit")
            edit_menu.addAction(self.undo_action)
            edit_menu.addAction(self.redo_action)
            edit_menu.addSeparator()
            edit_menu.addAction(self.cut_action)
            edit_menu.addAction(self.copy_action)
            edit_menu.addAction(self.paste_action)
            # Help Menu
            help_menu = menu_bar.addMenu("Help")
            help_menu.addAction(self.about_action)

    def get_current_editor(self):
        widget = self.tabs.currentWidget()
        if widget:
            return widget.findChild(QTextEdit)
        return None

    def keyPressEvent(self, event):
        editor = self.get_current_editor()
        if editor:
            if handle_keypress(event, editor):
                return
        super().keyPressEvent(event)

    def wheelEvent(self, event):
        editor = self.get_current_editor()
        if editor:
            if handle_wheel(event, editor):
                return  # zoom handled
        super().wheelEvent(event)

    def new_window(self):
        win = LawranPad()
        self.child_windows.append(win)
        win.show()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = LawranPad()
    window.show()
    sys.exit(app.exec())
