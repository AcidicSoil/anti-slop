"""Opinionated Pylint rules that reject low-evidence Python type contracts."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from astroid import nodes
from pylint.checkers import BaseChecker

if TYPE_CHECKING:
    from pylint.lint import PyLinter


_ANY_NAMES = {"Any", "typing.Any"}
_DICTIONARY_NAMES = {
    "dict",
    "Dict",
    "typing.Dict",
    "Mapping",
    "typing.Mapping",
    "MutableMapping",
    "typing.MutableMapping",
}


def _qualified_name(node: nodes.NodeNG | None) -> str | None:
    if isinstance(node, nodes.Name):
        return node.name
    if isinstance(node, nodes.Attribute):
        owner = _qualified_name(node.expr)
        return f"{owner}.{node.attrname}" if owner else node.attrname
    return None


def _subscript_parts(node: nodes.Subscript) -> list[nodes.NodeNG]:
    slice_node = node.slice
    if isinstance(slice_node, nodes.Tuple):
        return list(slice_node.elts)
    return [slice_node]


def _contains_any(annotation: nodes.NodeNG | None) -> bool:
    if annotation is None:
        return False
    if _qualified_name(annotation) in _ANY_NAMES:
        return True
    if isinstance(annotation, nodes.Subscript):
        return _contains_any(annotation.value) or any(
            _contains_any(part) for part in _subscript_parts(annotation)
        )
    if isinstance(annotation, nodes.BinOp) and annotation.op == "|":
        return _contains_any(annotation.left) or _contains_any(annotation.right)
    return False


def _is_unsafe_dictionary(annotation: nodes.NodeNG | None) -> bool:
    if not isinstance(annotation, nodes.Subscript):
        return False
    if _qualified_name(annotation.value) not in _DICTIONARY_NAMES:
        return False
    parts = _subscript_parts(annotation)
    return bool(parts) and _contains_any(parts[-1])


def _is_cast_call(node: nodes.NodeNG | None) -> bool:
    return isinstance(node, nodes.Call) and _qualified_name(node.func) in {"cast", "typing.cast"}


class AntiSlopChecker(BaseChecker):
    """Reject broad type contracts and unjustified type assertions."""

    name = "anti-slop"
    msgs = {
        "E9701": (
            "Parameter %s uses Any; parse or name the boundary contract instead",
            "no-any-parameter",
            "Reject function parameters whose annotation contains Any.",
        ),
        "E9702": (
            "Return annotation uses Any; return a named or validated contract instead",
            "no-any-return",
            "Reject function return annotations that contain Any.",
        ),
        "E9703": (
            "Dictionary value type uses Any; prefer a named contract such as TypedDict, dataclass, or protocol",
            "no-unsafe-dictionary-type",
            "Reject dict-like annotations whose value type contains Any.",
        ),
        "E9704": (
            "Chained cast() calls fabricate type evidence; validate once at the boundary",
            "no-chained-cast",
            "Reject cast() applied to the result of another cast().",
        ),
        "E9705": (
            "cast() requires a preceding SAFETY comment describing the checked invariant",
            "require-safety-comment-for-cast",
            "Require a specific SAFETY comment immediately before each cast().",
        ),
    }

    def __init__(self, linter: PyLinter) -> None:
        super().__init__(linter)
        self._source_lines: list[str] = []

    def visit_module(self, node: nodes.Module) -> None:
        path = Path(node.file)
        try:
            self._source_lines = path.read_text(encoding="utf-8").splitlines()
        except OSError:
            self._source_lines = []

    def visit_functiondef(self, node: nodes.FunctionDef) -> None:
        self._check_function_contract(node)

    def visit_asyncfunctiondef(self, node: nodes.AsyncFunctionDef) -> None:
        self._check_function_contract(node)

    def _check_function_contract(self, node: nodes.FunctionDef | nodes.AsyncFunctionDef) -> None:
        arguments = [*node.args.posonlyargs, *(node.args.args or []), *node.args.kwonlyargs]
        annotations = [
            *node.args.posonlyargs_annotations,
            *node.args.annotations,
            *node.args.kwonlyargs_annotations,
        ]
        if node.args.vararg_node is not None and node.args.varargannotation is not None:
            arguments.append(node.args.vararg_node)
            annotations.append(node.args.varargannotation)
        if node.args.kwarg_node is not None and node.args.kwargannotation is not None:
            arguments.append(node.args.kwarg_node)
            annotations.append(node.args.kwargannotation)

        for argument, annotation in zip(arguments, annotations, strict=False):
            if _is_unsafe_dictionary(annotation):
                self.add_message("no-unsafe-dictionary-type", node=annotation)
            elif _contains_any(annotation):
                self.add_message("no-any-parameter", node=annotation, args=(argument.name,))

        if _is_unsafe_dictionary(node.returns):
            self.add_message("no-unsafe-dictionary-type", node=node.returns)
        elif _contains_any(node.returns):
            self.add_message("no-any-return", node=node.returns)

    def visit_annassign(self, node: nodes.AnnAssign) -> None:
        if _is_unsafe_dictionary(node.annotation):
            self.add_message("no-unsafe-dictionary-type", node=node.annotation)

    def visit_call(self, node: nodes.Call) -> None:
        if not _is_cast_call(node):
            return
        if len(node.args) >= 2 and _is_cast_call(node.args[1]):
            self.add_message("no-chained-cast", node=node)
        if not self._has_safety_comment(node.lineno):
            self.add_message("require-safety-comment-for-cast", node=node)

    def _has_safety_comment(self, line_number: int) -> bool:
        index = line_number - 2
        if index < 0 or index >= len(self._source_lines):
            return False
        return self._source_lines[index].lstrip().startswith("# SAFETY:")


def register(linter: PyLinter) -> None:
    """Register the anti-slop checker with Pylint."""

    linter.register_checker(AntiSlopChecker(linter))
