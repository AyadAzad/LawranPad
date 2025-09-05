from qt_material import apply_stylesheet, list_themes
import json
import os


class ThemeManager:
    def __init__(self):
        self.current_theme = 'dark_teal.xml'
        self.custom_css = """
        /* Custom CSS to enhance the material design */
        QMainWindow {
            background-color: @bg;
        }

        /* Tab Widget Styling */
        QTabWidget::pane {
            border: none;
            background-color: @bg;
        }

        QTabBar::tab {
            padding: 8px 16px;
            margin-right: 4px;
            border-radius: 4px 4px 0 0;
        }

        QTabBar::tab:selected {
            background-color: @bg.light;
        }

        /* Text Editor Styling */
        QTextEdit {
            border: none;
            border-radius: 4px;
            padding: 8px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
        }

        /* Toolbar Styling */
        QToolBar {
            border: none;
            spacing: 8px;
            padding: 4px;
        }

        QToolButton {
            border-radius: 4px;
            padding: 6px;
            margin: 2px;
        }

        QToolButton:hover {
            background-color: @hover;
        }

        /* Menu Styling */
        QMenuBar {
            padding: 4px;
            spacing: 4px;
        }

        QMenuBar::item {
            padding: 6px 12px;
            border-radius: 4px;
        }

        QMenu {
            padding: 8px;
            border-radius: 8px;
        }

        QMenu::item {
            padding: 8px 24px;
            border-radius: 4px;
            margin: 2px 4px;
        }

        /* Status Bar */
        QStatusBar {
            background-color: @bg.dark;
            padding: 4px;
        }

        /* ComboBox in Toolbar */
        QComboBox {
            padding: 6px 12px;
            border-radius: 4px;
            min-width: 120px;
        }

        QComboBox::drop-down {
            border: none;
            padding-right: 8px;
        }

        /* Scrollbars */
        QScrollBar:vertical {
            width: 12px;
            border-radius: 6px;
        }

        QScrollBar:horizontal {
            height: 12px;
            border-radius: 6px;
        }

        QScrollBar::handle {
            border-radius: 6px;
            min-height: 30px;
        }

        QScrollBar::add-line, QScrollBar::sub-line {
            border: none;
            background: none;
        }
        """

    def apply_theme(self, app, theme_name=None):
        if theme_name:
            self.current_theme = theme_name

        apply_stylesheet(app, theme=self.current_theme)
        app.setStyleSheet(app.styleSheet() + self.custom_css)

    def get_available_themes(self):
        return list_themes()

    def save_theme_preference(self, theme_name):
        self.current_theme = theme_name
        # You can save this to a config file if needed