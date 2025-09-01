import sys
from PySide6.QtWidgets import (
QApplication, QMainWindow, QTextEdit, QToolBar, QStatusBar
)
from PySide6.QtGui import QIcon, QAction
from PySide6.QtCore import QSize


class LawranPad(QMainWindow):
    def __init__(self):
        super().__init__()
        # Window setup
        self.setWindowTitle("Lawran Pad")
        self.resize(900, 600)

        # Text Editor
        self.editor = QTextEdit()
        self.setCentralWidget(self.editor)

        # Status Bar
        self.status = QStatusBar()
        self.setStatusBar(self.status)

        # setup menus and tool bar
        self._create_actions()
        self._create_menus()

    def _create_actions(self):
            self.new_action = QAction(QIcon(), "New", self)
            self.new_tab_action = QAction(QIcon(), "New Tab", self)
            self.new_window_action = QAction(QIcon(), "New Window", self)
            self.open_action = QAction(QIcon(), "Open", self)
            self.save_action = QAction(QIcon(), "Save", self)
            self.exit_action = QAction(QIcon(), "Exit", self)

            self.cut_action = QAction(QIcon(), "Cut", self)
            self.copy_action = QAction(QIcon(), "Copy", self)
            self.paste_action = QAction(QIcon(), "Paste", self)
            self.undo_action = QAction(QIcon(), "Undo", self)
            self.redo_action = QAction(QIcon(), "Redo", self)

            self.about_action = QAction( "About LawranPad", self)

    def _create_menus(self):
            menu_bar = self.menuBar()
            # File menu
            file_menu = menu_bar.addMenu("File")
            file_menu.addAction(self.new_action)
            file_menu.addAction(self.new_tab_action)
            file_menu.addAction(self.new_window_action)
            file_menu.addAction(self.open_action)
            file_menu.addAction(self.save_action)

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

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = LawranPad()
    window.show()
    sys.exit(app.exec())
