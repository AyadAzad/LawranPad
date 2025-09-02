import sys
import html2text
import markdown
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
        self.tabs.tabCloseRequested.connect(self.close_tab)
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
        self.new_tab()

        # formating toolbar
        toolbar = QToolBar("Formatting")
        self.addToolBar(toolbar)

        # markdown actions
        for i in range(1,7):
            act = QAction(f"H{i}", self)
            act.triggered.connect(lambda checked, level=i: self.apply_heading(level))
            toolbar.addAction(act)
        # bold
        bold_action = QAction("bold", self)
        bold_action.triggered.connect(self.apply_bold)
        toolbar.addAction(bold_action)
        # italic
        italic_action = QAction("italic", self)
        italic_action.triggered.connect(self.apply_italic)
        toolbar.addAction(italic_action)
        # link
        link_action = QAction("link", self)
        link_action.triggered.connect(self.insert_link)
        toolbar.addAction(link_action)
        # bullet points
        bullet_action = QAction("Bullet List", self)
        bullet_action.triggered.connect(self.apply_bullet_list)
        toolbar.addAction(bullet_action)
        # Numbered list
        number_action = QAction("Number List", self)
        number_action.triggered.connect(self.apply_numbered_list)
        toolbar.addAction(number_action)

    def apply_heading(self, level):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)

        font = cursor.charFormat().font()
        font.setPointSize(24 - (level * 2))  # Bigger for H1, smaller for H6
        cursor.mergeCharFormat(cursor.charFormat())
        fmt = cursor.blockFormat()
        fmt.setHeadingLevel(level) if hasattr(fmt, "setHeadingLevel") else None
        cursor.setBlockFormat(fmt)

        charfmt = cursor.charFormat()
        charfmt.setFont(font)
        cursor.setCharFormat(charfmt)

    def apply_bold(self):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        # if not cursor.hasSelection():
        #     return

        fmt = QTextCharFormat()
        current_weight = cursor.charFormat().fontWeight()
        fmt.setFontWeight(QFont.Normal if current_weight == QFont.Bold else QFont.Bold)
        cursor.mergeCharFormat(fmt)

    def apply_italic(self):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            return

        fmt = QTextCharFormat()
        current_italic = cursor.charFormat().fontItalic()
        fmt.setFontItalic(not current_italic)
        cursor.mergeCharFormat(fmt)

    def apply_bullet_list(self):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        cursor.insertList(QTextListFormat.ListDisc)

    def apply_numbered_list(self):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        cursor.insertList(QTextListFormat.ListDecimal)

    def insert_link(self):
        editor = self.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            QMessageBox.warning(self, "No Selection", "Please select the text to turn into a link.")
            return
        url, ok = QFileDialog.getSaveFileName(self, "Enter URL")  # quick hack for URL input
        if ok:
            fmt = cursor.charFormat()
            fmt.setAnchor(True)
            fmt.setAnchorHref(url)
            fmt.setForeground("blue")
            fmt.setFontUnderline(True)
            cursor.setCharFormat(fmt)

    def _create_actions(self):
        # Create the actions
            self.new_action = QAction(QIcon(), "New", self)
            self.new_tab_action = QAction(QIcon(), "New Tab", self)
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
            self.new_action.triggered.connect(self.new_file)
            self.new_tab_action.triggered.connect(self.new_tab)
            self.new_window_action.triggered.connect(self.new_window)
            self.open_action.triggered.connect(self.open_file)
            self.close_tab_action.triggered.connect(lambda: self.close_tab())
            self.save_action.triggered.connect(self.save_file)
            self.save_as_action.triggered.connect(self.save_file_as)
            self.save_all_action.triggered.connect(self.save_all_files)
            self.exit_action.triggered.connect(self.exit_app)
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

    def new_file(self):
        editor = self.get_current_editor()
        if editor:
            editor.clear()
            self.file_paths[self.tabs.currentIndex()] = None
            self.tabs.setTabText(self.tabs.currentIndex(), "Untitled")

    def new_tab(self):
        widget = QWidget()
        layout = QVBoxLayout()
        editor = QTextEdit()
        layout.addWidget(editor)
        widget.setLayout(layout)

        index = self.tabs.addTab(widget, "Untitled")
        self.tabs.setCurrentIndex(index)
        self.file_paths[index] = None

    def new_window(self):
        win = LawranPad()
        self.child_windows.append(win)
        win.show()

    def close_tab(self, index):
        if index is None:
            index = self.tabs.currentIndex()
        if self.tabs.count() > 1:
            self.tabs.removeTab(index)
            if index in self.file_paths:
                del self.file_paths[index]

    def exit_app(self):
        # Ask the user before closing the app
        reply = QMessageBox.question(
            self,
            "Exit LawranPad",
            "Are you sure you want to exit?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            QApplication.quit()

    def open_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open File", "",
                                                   "Text/Markdown Files (*.txt *.md);;All Files (*)")
        if file_path:
            try:
                # Try UTF-8 first
                with open(file_path, "r", encoding="utf-8") as file:
                    text = file.read()
            except UnicodeDecodeError:
                try:
                    # Fallback: UTF-16
                    with open(file_path, "r", encoding="utf-16") as file:
                        text = file.read()
                except UnicodeDecodeError:
                    # Last fallback: system default encoding
                    with open(file_path, "r", encoding="latin-1") as file:
                        text = file.read()
            editor = self.get_current_editor()
            # when we want to open a file, we check if it ends
            # with .md , then convert the next into html
            if file_path.endswith(".md"):
                html = markdown.markdown(text, extensions=["fenced_code", "tables"])
                editor.setHtml(html)
            else:
                editor.setPlainText(text)
            self.current_file = file_path
            self.setWindowTitle(f"LawranPad - {file_path}")

    def save_file(self):
        index = self.tabs.currentIndex()
        editor = self.get_current_editor()
        if not editor:
            return

        text = editor.toPlainText()
        path = self.file_paths.get(index)

        # If Markdown detected, warn
        if any(md in text for md in ["#", "**", "*", "[", "]", "-", "1. "]):
            QMessageBox.warning(
                self,
                "Markdown Detected",
                "Your text contains markdown formatting.\n"
                "It's recommended to save with .md extension."
            )

        if not path:  # No path yet → Save As
            return self.save_file_as()
        text = editor.toHtml() if path.endswith(".md") else text
        if path.endswith(".md"):
            # convert html back to md
            html = editor.toHtml()
            text = html2text.html2text(html)
        with open(path, "w", encoding="utf-8") as file:
            file.write(text)
        self.status.showMessage(f"Saved {path}", 2000)

    def save_file_as(self):
        index = self.tabs.currentIndex()
        editor = self.get_current_editor()
        if editor:
            path, _ = QFileDialog.getSaveFileName(self, "Save File As", "","Text Files (*.txt);;All Files (*)")
            if path:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(editor.toPlainText())
                self.file_paths[index] = path
                self.tabs.setTabText(index, path.split("/")[-1])
                self.status.showMessage(f"Saved {path}", 2000)

    def save_all_files(self):
        for index in range(self.tabs.count()):
            self.tabs.setCurrentIndex(index)
            self.save_file()

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

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = LawranPad()
    window.show()
    sys.exit(app.exec())
