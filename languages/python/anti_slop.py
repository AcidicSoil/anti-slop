"""Opinionated Pylint rules for evidence-preserving Python type contracts."""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

from astroid import nodes
from pylint.checkers import BaseChecker

if TYPE_CHECKING:
    from pylint.lint import PyLinter


_DICTIONARY_NAMES = {
    "dict", "Dict", "typing.Dict", "Mapping", "typing.Mapping",
    "MutableMapping", "typing.MutableMapping",
}


def _qualified_name(node: nodes.NodeNG | None) -> str | None:
    if isinstance(node, nodes.Name):
        return node.name
    if isinstance(node, nodes.Attribute):
        owner = _qualified_name(node.expr)
        return f"{owner}.{node.attrname}" if owner else node.attrname
    return None


def _subscript_parts(node: nodes.Subscript) -> list[nodes.NodeNG]:
    if isinstance(node.slice, nodes.Tuple):
        return list(node.slice.elts)
    return [node.slice]


def _contains_any(
    annotation: nodes.NodeNG | None,
    aliases: dict[str, nodes.NodeNG | None],
    seen: frozenset[str] = frozenset(),
) -> bool:
    if annotation is None:
        return False
    name = _qualified_name(annotation)
    if name in aliases and name not in seen:
        value = aliases[name]
        return value is None or _contains_any(value, aliases, seen | {name})
    if isinstance(annotation, nodes.Subscript):
        return _contains_any(annotation.value, aliases, seen) or any(
            _contains_any(part, aliases, seen) for part in _subscript_parts(annotation)
        )
    if isinstance(annotation, nodes.BinOp) and annotation.op == "|":
        return _contains_any(annotation.left, aliases, seen) or _contains_any(
            annotation.right, aliases, seen
        )
    return False


def _is_unsafe_dictionary(
    annotation: nodes.NodeNG | None, aliases: dict[str, nodes.NodeNG]
) -> bool:
    if not isinstance(annotation, nodes.Subscript):
        return False
    if _qualified_name(annotation.value) not in _DICTIONARY_NAMES:
        return False
    parts = _subscript_parts(annotation)
    return bool(parts) and _contains_any(parts[-1], aliases)


def _is_cast_call(node: nodes.NodeNG | None) -> bool:
    return isinstance(node, nodes.Call) and _qualified_name(node.func) in {
        "cast", "typing.cast",
    }


def _local_name_target(statement: nodes.NodeNG) -> tuple[str, nodes.NodeNG] | None:
    if statement.__class__.__name__ == "TypeAlias":
        return statement.name.name, statement.value
    if isinstance(statement, nodes.AnnAssign):
        if isinstance(statement.target, nodes.AssignName) and statement.value is not None:
            return statement.target.name, statement.value
    if isinstance(statement, nodes.Assign) and len(statement.targets) == 1:
        if isinstance(statement.targets[0], nodes.AssignName):
            return statement.targets[0].name, statement.value
    return None


def _known_local_type(
    expression: nodes.NodeNG, previous: list[nodes.NodeNG]
) -> str | None:
    if isinstance(expression, nodes.Call):
        return _qualified_name(expression.func)
    if not isinstance(expression, nodes.Name):
        return None
    for statement in reversed(previous):
        assignment = _local_name_target(statement)
        if assignment and assignment[0] == expression.name:
            if isinstance(statement, nodes.AnnAssign):
                return _qualified_name(statement.annotation)
            if isinstance(assignment[1], nodes.Call):
                return _qualified_name(assignment[1].func)
            return None
    return None


class AntiSlopChecker(BaseChecker):
    """Reject broad type contracts and unjustified assertions."""

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
        "E9706": (
            "Type alias resolves to Any; preserve a named type contract",
            "no-any-type-alias",
            "Reject module-local type aliases that resolve to Any.",
        ),
        "E9707": (
            "Known type is widened to Any and cast back; preserve the original type",
            "no-widen-then-cast",
            "Reject direct local known-to-Any-to-known type evidence loss.",
        ),
    }

    def __init__(self, linter: PyLinter) -> None:
        super().__init__(linter)
        self._source_lines: list[str] = []
        self._aliases: dict[str, nodes.NodeNG | None] = {}

    def visit_module(self, node: nodes.Module) -> None:
        try:
            self._source_lines = Path(node.file).read_text(encoding="utf-8").splitlines()
        except (OSError, TypeError):
            self._source_lines = []
        self._aliases = {}
        for statement in node.body:
            if isinstance(statement, nodes.ImportFrom) and statement.modname == "typing":
                for name, alias in statement.names:
                    if name == "Any":
                        self._aliases[alias or name] = None
            if isinstance(statement, nodes.Import):
                for name, alias in statement.names:
                    if name == "typing":
                        self._aliases[f"{alias or name}.Any"] = None
            if isinstance(statement, (nodes.ClassDef, nodes.FunctionDef)):
                self._aliases.pop(statement.name, None)
            assignment = _local_name_target(statement)
            if assignment:
                self._aliases[assignment[0]] = assignment[1]

    def visit_functiondef(self, node: nodes.FunctionDef) -> None:
        self._check_function_contract(node)

    def visit_asyncfunctiondef(self, node: nodes.AsyncFunctionDef) -> None:
        self._check_function_contract(node)

    def _check_function_contract(
        self, node: nodes.FunctionDef | nodes.AsyncFunctionDef
    ) -> None:
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
            if _is_unsafe_dictionary(annotation, self._aliases):
                self.add_message("no-unsafe-dictionary-type", node=annotation)
            elif _contains_any(annotation, self._aliases):
                self.add_message("no-any-parameter", node=annotation, args=(argument.name,))
        if _is_unsafe_dictionary(node.returns, self._aliases):
            self.add_message("no-unsafe-dictionary-type", node=node.returns)
        elif _contains_any(node.returns, self._aliases):
            self.add_message("no-any-return", node=node.returns)

    def visit_assign(self, node: nodes.Assign) -> None:
        if isinstance(node.parent, nodes.Module):
            assignment = _local_name_target(node)
            if assignment and _contains_any(assignment[1], self._aliases):
                self.add_message("no-any-type-alias", node=node)

    def visit_typealias(self, node: nodes.NodeNG) -> None:
        if _contains_any(node.value, self._aliases):
            self.add_message("no-any-type-alias", node=node)

    def visit_annassign(self, node: nodes.AnnAssign) -> None:
        if _is_unsafe_dictionary(node.annotation, self._aliases):
            self.add_message("no-unsafe-dictionary-type", node=node.annotation)
        if (
            isinstance(node.parent, nodes.Module)
            and _qualified_name(node.annotation) in {"TypeAlias", "typing.TypeAlias"}
            and node.value is not None
            and _contains_any(node.value, self._aliases)
        ):
            self.add_message("no-any-type-alias", node=node)

    def visit_call(self, node: nodes.Call) -> None:
        if not _is_cast_call(node):
            return
        if len(node.args) >= 2 and _is_cast_call(node.args[1]):
            self.add_message("no-chained-cast", node=node)
        if not self._has_safety_comment(node.lineno):
            self.add_message("require-safety-comment-for-cast", node=node)
        self._check_widen_then_cast(node)

    def _check_widen_then_cast(self, node: nodes.Call) -> None:
        if len(node.args) < 2 or not isinstance(node.args[1], nodes.Name):
            return
        target_type = _qualified_name(node.args[0])
        if target_type is None:
            return
        scope = node.scope()
        if not isinstance(scope, (nodes.FunctionDef, nodes.AsyncFunctionDef)):
            return
        statement = node.statement()
        if statement not in scope.body:
            return
        index = scope.body.index(statement)
        name = node.args[1].name
        for i, prior in enumerate(scope.body[:index]):
            if not isinstance(prior, nodes.AnnAssign):
                continue
            assignment = _local_name_target(prior)
            if not assignment or assignment[0] != name:
                continue
            if not _contains_any(prior.annotation, self._aliases):
                continue
            known = _known_local_type(assignment[1], scope.body[:i])
            if known != target_type:
                continue
            # An intervening use, write, capture, or escape makes the flow uncertain.
            if any(
                isinstance(ref, (nodes.Name, nodes.AssignName)) and ref.name == name
                for intermediate in scope.body[i + 1:index]
                for ref in intermediate.nodes_of_class((nodes.Name, nodes.AssignName))
            ):
                continue
            self.add_message("no-widen-then-cast", node=node)
            return

    def _has_safety_comment(self, line_number: int) -> bool:
        index = line_number - 2
        return 0 <= index < len(self._source_lines) and self._source_lines[
            index
        ].lstrip().startswith("# SAFETY:")


def register(linter: PyLinter) -> None:
    """Register the anti-slop checker with Pylint."""

    linter.register_checker(AntiSlopChecker(linter))
