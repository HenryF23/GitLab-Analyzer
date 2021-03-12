import re
from typing import Union, Optional, List
from model.code_diff import *
import gitlab


class CodeDiffAnalyzer:
    def __init__(self) -> None:
        self.__codeDiffList: List[CodeDiff] = []
        self.__listSize: int = 0

    # TODO: a way to fill the code diff list

    # The ID's of the codeDiffs are their index in the list
    def get_code_diff_by_id(self, codeDiffId: int) -> list:
        return self.__codeDiffList[codeDiffId] if codeDiffId < self.__listSize else []

    def get_code_diff_statistic(self, codeDiffObject: CodeDiff) -> None:

        # TODO:
        # Case where the commit diff is a block of comment
        # Case where there is some insertion into the middle of a line of code
        # without any deletion (current code will mark it as one addition and one deletion)
        # This need to be just one addition

        newLine = 0
        deleteLine = 0
        newCommentLine = 0
        deleteCommentLine = 0
        newBlank = 0
        deleteBlank = 0
        syntax = 0
        spacing = 0

        oldLine = " "
        python = False

        self.check_for_code_type(codeDiffObject)

        diffCode = codeDiffObject
        for line in diffCode.diff.splitlines():
            if line[0] == '+' or line[0] == '-':
                if line[0] != oldLine[0] and abs(len(line) - len(oldLine)) == 1:
                    if self.check_middle_syntax_addition(line, oldLine, syntax, python):
                        continue

                if oldLine[1:] in line[1:] and oldLine[0] != line[0]:
                    tempLine = '+' + line[1:].replace(oldLine[1:], '')
                    self.modify_to_a_new_line(
                        newLine,
                        deleteLine,
                        newCommentLine,
                        deleteCommentLine,
                        newBlank,
                        deleteBlank,
                        spacing,
                        syntax,
                        tempLine,
                        python,
                    )
                if line[1:] in oldLine[1:] and oldLine[0] != line[0]:
                    tempLine = '-' + oldLine[1:].replace(line[1:], '')
                    self.modify_to_a_new_line(
                        newLine,
                        deleteLine,
                        newCommentLine,
                        deleteCommentLine,
                        newBlank,
                        deleteBlank,
                        spacing,
                        syntax,
                        tempLine,
                        python,
                    )
                else:
                    self.modify_to_a_new_line(
                        newLine,
                        deleteLine,
                        newCommentLine,
                        deleteCommentLine,
                        newBlank,
                        deleteBlank,
                        spacing,
                        syntax,
                        line,
                        python,
                    )
                oldLine = line

        print(newLine)
        print(deleteLine)
        print(newCommentLine)
        print(deleteCommentLine)
        print(newBlank)
        print(deleteBlank)
        print(spacing)
        print(syntax)

    def modify_to_a_new_line(
        self,
        newLine,
        deleteLine,
        newCommentLine,
        deleteCommentLine,
        newBlank,
        deleteBlank,
        spacing,
        syntax,
        line,
        python,
    ) -> None:

        if line == '+':
            newBlank = newBlank + 1
            return
        if line == '-':
            deleteBlank = deleteBlank + 1
            return

        if self.check_for_spacing_or_comment(
            line[0:1], newCommentLine, deleteCommentLine, spacing, line[1:], python
        ):
            return

        if line[0:1] == '+':
            newLine = newLine + 1
            if python is False:
                if "{" == line[1:] or "}" == line[1:]:
                    syntax = syntax + 1
                    newLine = newLine - 1
            if python is True:
                if ":" == line[1:]:
                    syntax = syntax + 1
                    newLine = newLine - 1

        if line[0:1] == '-':
            deleteLine = deleteLine + 1
            if python is False:
                if "{" == line[1:] or "}" == line[1:]:
                    syntax = syntax + 1
                    deleteLine = deleteLine - 1
            if python is True:
                if ":" == line[1:]:
                    syntax = syntax + 1
                    deleteLine = deleteLine - 1

    def check_for_spacing_or_comment(
        self, signal, newCommentLine, deleteCommentLine, spacing, str, python
    ) -> bool:

        for i in str:
            if i == " ":
                continue
            elif i == "#" and python is True:
                if signal == '+':
                    newCommentLine = newCommentLine + 1
                else:
                    deleteCommentLine = deleteCommentLine + 1
                return True
            elif i == "//" and python is False:
                if signal == '+':
                    newCommentLine = newCommentLine + 1
                else:
                    deleteCommentLine = deleteCommentLine + 1
                return True
            else:
                break
        if str.isspace():
            spacing = spacing + 1
            return True

        return False

    def check_for_code_type(self, codeDiffObject: CodeDiff) -> None:
        diffCode = codeDiffObject
        fileName = diffCode.new_path
        found = re.search('\.(.+?)$', fileName).group(1)
        if found == 'py':
            python = True

    def check_middle_syntax_addition(self, line, oldLine, syntax, python) -> bool:
        temp = 0

        if len(line) > len(oldLine):
            length = len(oldLine)
            lastChar = line[len(line) - 1]
        else:
            length = len(line)
            lastChar = oldLine[len(oldLine) - 1]

        for i in range(1, length):
            if oldLine[i] != line[i]:
                temp = i
                break
        if temp != 0:
            if python:
                if oldLine[temp] == ":" or line[temp] == ":":
                    syntax = syntax + 1
                    return True
            else:
                if oldLine[temp] == "{" or oldLine[temp] == "}":
                    syntax = syntax + 1
                    return True
                if line[temp] == "{" or line[temp] == "}":
                    syntax = syntax + 1
                    return True
        if temp == 0:
            if python:
                if lastChar == ":" or lastChar == ":":
                    syntax = syntax + 1
                    return True
            else:
                if lastChar == "{" or lastChar == "}":
                    syntax = syntax + 1
                    return True

        return False
