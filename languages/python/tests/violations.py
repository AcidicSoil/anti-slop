from typing import Any, cast


def load(value: Any) -> Any:
    metadata: dict[str, Any] = {"value": value}
    return cast(dict[str, str], cast(object, metadata))
