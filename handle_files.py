import html2text
import markdown
from PySide6.QtWidgets import QWidget, QVBoxLayout, QTextEdit, QMessageBox, QApplication, QFileDialog


def new_file(main_window):
    editor = main_window.get_current_editor()
    if editor:
        editor.clear()
        main_window.file_paths[main_window.tabs.currentIndex()] = None
        main_window.tabs.setTabText(main_window.tabs.currentIndex(), "Untitled")

def new_tab(main_window):
    widget = QWidget()
    layout = QVBoxLayout()
    editor = QTextEdit()
    layout.addWidget(editor)
    widget.setLayout(layout)

    index = main_window.tabs.addTab(widget, "Untitled")
    main_window.tabs.setCurrentIndex(index)
    main_window.file_paths[index] = None

def close_tab(main_window, index):
    if index is None:
        index = main_window.tabs.currentIndex()
    if main_window.tabs.count() > 1:
        main_window.tabs.removeTab(index)
        if index in main_window.file_paths:
            del main_window.file_paths[index]

def exit_app(main_window):
    # Ask the user before closing the app
    reply = QMessageBox.question(
        main_window,
        "Exit LawranPad",
        "Are you sure you want to exit?",
        QMessageBox.Yes | QMessageBox.No,
        QMessageBox.No
    )
    if reply == QMessageBox.Yes:
        QApplication.quit()

def open_file(main_window):
    file_path, _ = QFileDialog.getOpenFileName(main_window, "Open File", "",
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
        editor = main_window.get_current_editor()
        # when we want to open a file, we check if it ends
        # with .md , then convert the next into html
        if file_path.endswith(".md"):
            html = markdown.markdown(text, extensions=["fenced_code", "tables"])
            editor.setHtml(html)
        else:
            editor.setPlainText(text)
        main_window.current_file = file_path
        main_window.setWindowTitle(f"LawranPad - {file_path}")

def save_file(main_window):
    index = main_window.tabs.currentIndex()
    editor = main_window.get_current_editor()
    if not editor:
        return

    text = editor.toPlainText()
    path = main_window.file_paths.get(index)

    # If Markdown detected, warn
    if any(md in text for md in ["#", "**", "*", "[", "]", "-", "1. "]):
        QMessageBox.warning(
            main_window,
            "Markdown Detected",
            "Your text contains markdown formatting.\n"
            "It's recommended to save with .md extension."
        )

    if not path:  # No path yet → Save As
        return main_window.save_file_as()
    text = editor.toHtml() if path.endswith(".md") else text
    if path.endswith(".md"):
        # convert html back to md
        html = editor.toHtml()
        text = html2text.html2text(html)
    with open(path, "w", encoding="utf-8") as file:
        file.write(text)
    main_window.status.showMessage(f"Saved {path}", 2000)

def save_file_as(main_window):
    index = main_window.tabs.currentIndex()
    editor = main_window.get_current_editor()
    if editor:
        path, _ = QFileDialog.getSaveFileName(main_window, "Save File As", "", "Text Files (*.txt);;All Files (*)")
        if path:
            with open(path, "w", encoding="utf-8") as file:
                file.write(editor.toPlainText())
            main_window.file_paths[index] = path
            main_window.tabs.setTabText(index, path.split("/")[-1])
            main_window.status.showMessage(f"Saved {path}", 2000)

def save_all_files(main_window):
    for index in range(main_window.tabs.count()):
        main_window.tabs.setCurrentIndex(index)
        main_window.save_file()