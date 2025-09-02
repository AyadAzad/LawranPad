# zoom_utils.py
from PySide6.QtCore import Qt

def handle_keypress(event, editor):
    """Handle Ctrl + +/-/0 zoom shortcuts"""
    if event.modifiers() == Qt.ControlModifier:
        if event.key() in (Qt.Key_Plus, Qt.Key_Equal):
            editor.zoomIn(1)
            return True  # handled
        elif event.key() == Qt.Key_Minus:
            editor.zoomOut(1)
            return True
        elif event.key() == Qt.Key_0:
            editor.zoomIn(0)  # reset zoom
            return True
    return False  # not handled

def handle_wheel(event, editor):
    """Handle Ctrl + scroll zoom"""
    if event.modifiers() == Qt.ControlModifier:
        if event.angleDelta().y() > 0:
            editor.zoomIn(1)
        else:
            editor.zoomOut(1)
        return True
    return False
