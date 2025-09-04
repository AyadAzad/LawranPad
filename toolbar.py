from PySide6.QtGui import QKeySequence, QAction, QShortcut
from PySide6.QtWidgets import QComboBox, QToolBar

import handle_markdown as hmd

class FormattingToolbar(QToolBar):
    # parent = none means the toolbar can work or without a parent
    def __init__(self, parent=None):
        # toolbar title and parent widget(QMainWindow)
        # super calls the parent class (QToolBar)
        super().__init__("Formatting", parent)

        # selecting a specific font size
        self.font_size_box = QComboBox()
        self.font_size_box.setEditable(False)
        # size 8 -> 32
        self.font_size_box.addItems([str(size) for size in range(8, 88, 2)])
        self.font_size_box.setCurrentText("20")
        self.font_size_box.currentTextChanged.connect(lambda size: hmd.apply_font_size(self, int(size)))

        self.addWidget(self.font_size_box)

        # markdown actions
        for i in range(1, 7):
            act = QAction(f"H{i}", self)
            act.triggered.connect(lambda checked, level=i: hmd.apply_heading(parent, level))
            self.addAction(act)
        # bold
        bold_action = QAction("bold", self)
        bold_action.triggered.connect(lambda: hmd.apply_bold(parent))
        self.addAction(bold_action)
        # italic
        italic_action = QAction("italic", self)
        italic_action.triggered.connect(lambda: hmd.apply_italic(parent))
        self.addAction(italic_action)
        # link
        link_action = QAction("link", self)
        link_action.triggered.connect(lambda: hmd.apply_italic(parent))
        self.addAction(link_action)
        # bullet points
        bullet_action = QAction("Bullet List", self)
        bullet_action.triggered.connect(lambda: hmd.apply_bullet_list(parent))
        bullet_action.setShortcut(QKeySequence("Ctrl+Shift+B"))
        self.addAction(bullet_action)
        # Numbered list
        number_action = QAction("Number List", self)
        number_action.triggered.connect(lambda: hmd.apply_numbered_list(parent))
        number_action.setShortcut(QKeySequence("Ctrl+1"))
        self.addAction(number_action)
