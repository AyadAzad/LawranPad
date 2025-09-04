from PySide6.QtGui import QTextCursor, QTextCharFormat, QFont, QTextListFormat
from PySide6.QtWidgets import QMessageBox, QFileDialog


def apply_heading(main_window, level):
    editor = main_window.get_current_editor()
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

def apply_bold(main_window):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)

        fmt = QTextCharFormat()
        current_weight = cursor.charFormat().fontWeight()
        fmt.setFontWeight(QFont.Normal if current_weight == QFont.Bold else QFont.Bold)
        cursor.mergeCharFormat(fmt)

def apply_italic(main_window):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)

        fmt = QTextCharFormat()
        current_italic = cursor.charFormat().fontItalic()
        fmt.setFontItalic(not current_italic)
        cursor.mergeCharFormat(fmt)

def apply_bullet_list(main_window):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)
        # using createList to apply the bullet without removing the rext
        cursor.createList(QTextListFormat.ListDisc)

def apply_numbered_list(main_window):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)
        cursor.createList(QTextListFormat.ListDecimal)

def insert_link(main_window):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            QMessageBox.warning(main_window, "No Selection", "Please select the text to turn into a link.")
            return
        url, ok = QFileDialog.getSaveFileName(main_window, "Enter URL")  # quick hack for URL input
        if ok:
            fmt = cursor.charFormat()
            fmt.setAnchor(True)
            fmt.setAnchorHref(url)
            fmt.setForeground("blue")
            fmt.setFontUnderline(True)
            cursor.setCharFormat(fmt)

def apply_font_size(main_window, size_str):
        editor = main_window.get_current_editor()
        cursor = editor.textCursor()
        if not cursor.hasSelection():
            cursor.select(QTextCursor.LineUnderCursor)
        size = int(size_str)
        fmt = QTextCharFormat()
        fmt.setFontPointSize(size)
        cursor.mergeCharFormat(fmt)