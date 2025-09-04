from PySide6.QtGui import QTextCursor
from PySide6.QtWidgets import QTextEdit


class LineSwapper:
    """Handles line swapping functionality similar to VS Code"""

    @staticmethod
    def swap_lines_up(editor: QTextEdit) -> bool:
        """
        Swaps the current line(s) with the line above.
        Returns True if swap was performed, False otherwise.
        """
        if not editor:
            return False

        cursor = editor.textCursor()

        # If there's a selection, we need to handle multiple lines
        if cursor.hasSelection():
            return LineSwapper._swap_selected_lines_up(editor, cursor)
        else:
            return LineSwapper._swap_single_line_up(editor, cursor)

    @staticmethod
    def swap_lines_down(editor: QTextEdit) -> bool:
        """
        Swaps the current line(s) with the line below.
        Returns True if swap was performed, False otherwise.
        """
        if not editor:
            return False

        cursor = editor.textCursor()

        # If there's a selection, we need to handle multiple lines
        if cursor.hasSelection():
            return LineSwapper._swap_selected_lines_down(editor, cursor)
        else:
            return LineSwapper._swap_single_line_down(editor, cursor)

    @staticmethod
    def _swap_single_line_up(editor: QTextEdit, cursor: QTextCursor) -> bool:
        """Swaps a single line with the line above"""
        # Get current position
        current_block = cursor.block()

        # Can't move up if we're at the first line
        if current_block == editor.document().firstBlock():
            return False

        # Get the previous block
        previous_block = current_block.previous()

        # Store cursor position within the line
        position_in_line = cursor.position() - current_block.position()

        # Get text from both lines
        current_text = current_block.text()
        previous_text = previous_block.text()

        # Begin edit block for undo/redo
        cursor.beginEditBlock()

        # Select and replace previous line
        cursor.setPosition(previous_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(current_text)

        # Select and replace current line
        cursor.setPosition(current_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(previous_text)

        # Restore cursor position
        new_position = previous_block.position() + min(position_in_line, len(current_text))
        cursor.setPosition(new_position)

        cursor.endEditBlock()

        # Set the cursor back
        editor.setTextCursor(cursor)
        return True

    @staticmethod
    def _swap_single_line_down(editor: QTextEdit, cursor: QTextCursor) -> bool:
        """Swaps a single line with the line below"""
        # Get current position
        current_block = cursor.block()

        # Can't move down if we're at the last line
        if current_block == editor.document().lastBlock():
            return False

        # Get the next block
        next_block = current_block.next()

        # Store cursor position within the line
        position_in_line = cursor.position() - current_block.position()

        # Get text from both lines
        current_text = current_block.text()
        next_text = next_block.text()

        # Begin edit block for undo/redo
        cursor.beginEditBlock()

        # Select and replace current line
        cursor.setPosition(current_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(next_text)

        # Select and replace next line
        cursor.setPosition(next_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(current_text)

        # Restore cursor position
        new_position = next_block.position() + min(position_in_line, len(current_text))
        cursor.setPosition(new_position)

        cursor.endEditBlock()

        # Set the cursor back
        editor.setTextCursor(cursor)
        return True

    @staticmethod
    def _swap_selected_lines_up(editor: QTextEdit, cursor: QTextCursor) -> bool:
        """Swaps selected lines with the line above"""
        # Get selection boundaries
        start_pos = cursor.selectionStart()
        end_pos = cursor.selectionEnd()

        # Get the blocks that contain the selection
        cursor.setPosition(start_pos)
        start_block = cursor.block()
        cursor.setPosition(end_pos)
        end_block = cursor.block()

        # Can't move up if selection starts at first line
        if start_block == editor.document().firstBlock():
            return False

        # Get the block above the selection
        previous_block = start_block.previous()

        # Collect all selected lines
        selected_lines = []
        block = start_block
        while True:
            selected_lines.append(block.text())
            if block == end_block:
                break
            block = block.next()

        # Get the line above
        previous_text = previous_block.text()

        # Begin edit block
        cursor.beginEditBlock()

        # Replace the previous line with the first selected line
        cursor.setPosition(previous_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(selected_lines[0])

        # Replace selected lines
        block = start_block
        for i, line_text in enumerate(selected_lines[1:] + [previous_text]):
            cursor.setPosition(block.position())
            cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
            cursor.insertText(line_text)
            block = block.next()

        # Restore selection
        new_start = previous_block.position()
        new_end = new_start
        for i in range(len(selected_lines)):
            if i > 0:
                new_end = cursor.block().next().position()
            else:
                new_end = cursor.block().position() + len(cursor.block().text())

        cursor.setPosition(new_start)
        cursor.setPosition(new_end, QTextCursor.KeepAnchor)

        cursor.endEditBlock()

        editor.setTextCursor(cursor)
        return True

    @staticmethod
    def _swap_selected_lines_down(editor: QTextEdit, cursor: QTextCursor) -> bool:
        """Swaps selected lines with the line below"""
        # Get selection boundaries
        start_pos = cursor.selectionStart()
        end_pos = cursor.selectionEnd()

        # Get the blocks that contain the selection
        cursor.setPosition(start_pos)
        start_block = cursor.block()
        cursor.setPosition(end_pos)
        end_block = cursor.block()

        # Can't move down if selection ends at last line
        if end_block == editor.document().lastBlock():
            return False

        # Get the block below the selection
        next_block = end_block.next()

        # Collect all selected lines
        selected_lines = []
        block = start_block
        while True:
            selected_lines.append(block.text())
            if block == end_block:
                break
            block = block.next()

        # Get the line below
        next_text = next_block.text()

        # Begin edit block
        cursor.beginEditBlock()

        # Replace the first selected line with the line below
        cursor.setPosition(start_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(next_text)

        # Replace remaining lines
        block = start_block.next()
        for line_text in selected_lines[1:]:
            cursor.setPosition(block.position())
            cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
            cursor.insertText(line_text)
            block = block.next()

        # Replace the line that was below with the last selected line
        cursor.setPosition(next_block.position())
        cursor.movePosition(QTextCursor.EndOfBlock, QTextCursor.KeepAnchor)
        cursor.insertText(selected_lines[-1])

        # Restore selection
        new_start = start_block.next().position()
        new_end = next_block.position() + len(next_block.text())

        cursor.setPosition(new_start)
        cursor.setPosition(new_end, QTextCursor.KeepAnchor)

        cursor.endEditBlock()

        editor.setTextCursor(cursor)
        return True