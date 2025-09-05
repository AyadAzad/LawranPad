import sys

from PySide6.QtCore import QSize

import handle_files as hf
from zoom_utils import handle_keypress, handle_wheel
from line_swapper import LineSwapper
from theme_manager import ThemeManager
from PySide6.QtGui import QIcon, QAction, QKeySequence, QShortcut, QActionGroup, QFont
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QStatusBar,
    QTabWidget, QWidget, QVBoxLayout,
)
from toolbar import FormattingToolbar


class LawranPad(QMainWindow):
    def __init__(self):
        super().__init__()
        # initialize theme manager
        self.theme_manager = ThemeManager()
        # Window setup
        self.child_windows = []
        self.setWindowTitle("Lawran Pad")
        self.resize(1000, 700)

        # create central widget with layout for better spacing.
        central_widget = QWidget()
        central_layout = QVBoxLayout(central_widget)
        central_layout.setContentsMargins(0, 0, 0, 0)
        central_layout.setSpacing(0)

        # Tab widget to manage multiple documents
        self.tabs = QTabWidget()
        self.tabs.setTabsClosable(True)
        self.tabs.tabCloseRequested.connect(lambda index: hf.close_tab(self, index))
        self.setCentralWidget(self.tabs)
        # Dictionary to store file  paths for each tab
        self.file_paths = {}

        # Status Bar
        self.status = QStatusBar()
        self.status.setStyleSheet("QStatusBar{padding: 4px;}")
        self.setStatusBar(self.status)

        # setup menus
        self._create_actions()
        self._create_menus()
        self._create_shortcuts()

        # Start with one new tab
        hf.new_tab(self)

        # formating toolbar
        toolbar = FormattingToolbar(self)
        toolbar.setMovable(False)
        toolbar.setIconSize(QSize(24, 24))
        self.addToolBar(toolbar)

        self._style_current_editor()

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

        self.about_action = QAction("About LawranPad", self)

        # connect actions connect buttons with functions
        self.new_action.triggered.connect(lambda: hf.new_file(self))
        self.new_tab_action.triggered.connect(lambda: hf.new_tab(self))
        self.new_window_action.triggered.connect(self.new_window)
        self.open_action.triggered.connect(lambda: hf.open_file(self))
        self.close_tab_action.triggered.connect(lambda: hf.close_tab(self))
        self.save_action.triggered.connect(lambda: hf.save_file(self))
        self.save_as_action.triggered.connect(lambda: hf.save_file_as(self))
        self.save_all_action.triggered.connect(lambda: hf.save_all_files(self))
        self.exit_action.triggered.connect(lambda: hf.exit_app(self))

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
        # View Menu with theme options
        view_menu = menu_bar.addMenu("View")
        theme_menu = view_menu.addMenu("Theme")

        # create theme action group
        theme_group = QActionGroup(self)

        # Add popular themes
        themes = [
            ('dark_teal.xml', 'Dark Teal'),
            ('dark_cyan.xml', 'Dark Cyan'),
            ('dark_blue.xml', 'Dark Blue'),
            ('dark_purple.xml', 'Dark Purple'),
            ('light_teal.xml', 'Light Teal'),
            ('light_cyan.xml', 'Light Cyan'),
            ('light_blue.xml', 'Light Blue'),
            ('light_purple.xml', 'Light Purple'),
        ]

        for theme_file, theme_name in themes:
            action = QAction(theme_name, self)
            action.setCheckable(True)
            action.setActionGroup(theme_group)
            if theme_file == self.theme_manager.current_theme:
                action.setChecked(True)
            action.triggered.connect(lambda checked, t=theme_file: self.change_theme(t))
            theme_menu.addAction(action)

        # Help Menu
        help_menu = menu_bar.addMenu("Help")
        help_menu.addAction(self.about_action)

    def _create_shortcuts(self):
        """Create keyboard shortcuts for line swapping"""
        # Alt+Up to move line up
        self.move_line_up_shortcut = QShortcut(QKeySequence("Alt+Up"), self)
        self.move_line_up_shortcut.activated.connect(self.swap_lines_up)

        # Alt+Down to move line down
        self.move_line_down_shortcut = QShortcut(QKeySequence("Alt+Down"), self)
        self.move_line_down_shortcut.activated.connect(self.swap_lines_down)

        # Keyboard shortcuts
        self.new_action.setShortcut(QKeySequence("Ctrl+N"))
        self.new_tab_action.setShortcut(QKeySequence("Ctrl+T"))
        self.new_window_action.setShortcut(QKeySequence("Ctrl+Shift+N"))
        self.open_action.setShortcut("Ctrl+O")
        self.close_tab_action.setShortcut(QKeySequence("Ctrl+W"))
        self.save_action.setShortcut(QKeySequence("Ctrl+S"))
        self.save_as_action.setShortcut(QKeySequence("Ctrl+Shift+S"))
        self.exit_action.setShortcut(QKeySequence("Ctrl+Q"))

    def swap_lines_up(self):
        """Handle Alt+Up to swap lines upward"""
        editor = self.get_current_editor()
        if editor:
            LineSwapper.swap_lines_up(editor)

    def swap_lines_down(self):
        """Handle Alt+Down to swap lines downward"""
        editor = self.get_current_editor()
        if editor:
            LineSwapper.swap_lines_down(editor)

    def change_theme(self, theme_name):
        """Change the application theme"""
        app = QApplication.instance()
        self.theme_manager.apply_theme(app, theme_name)
        self.theme_manager.save_theme_preference(theme_name)
        self.status.showMessage(f"Theme changed to {theme_name.replace('.xml', '').replace('_', ' ').title()}", 2000)

    def _style_current_editor(self):
        """Apply additional styling to the current editor"""
        editor = self.get_current_editor()
        if editor:
            # Set a nice monospace font
            font = QFont("Consolas", 11)
            font.setStyleHint(QFont.Monospace)
            editor.setFont(font)

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
    theme_manager = ThemeManager()
    theme_manager.apply_theme(app)
    window = LawranPad()
    window.show()
    sys.exit(app.exec())