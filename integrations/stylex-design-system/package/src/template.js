function attributeNode(name, value, original, spread = false) {
  if (spread) return { ...original, type: "JSXSpreadAttribute", argument: value };
  return {
    ...original,
    type: "JSXAttribute",
    name: { type: "JSXIdentifier", name: name === "class" ? "className" : name },
    value:
      value?.type === "VExpressionContainer"
        ? {
            ...value,
            type: "JSXExpressionContainer",
            expression: value.expression,
          }
        : value?.type === "VLiteral" || value?.type === "SvelteLiteral"
          ? {
              ...value,
              type: "Literal",
              value: value.value,
            }
          : value?.type === "SvelteMustacheTag"
            ? {
                ...value,
                type: "JSXExpressionContainer",
                expression: value.expression,
              }
            : value,
  };
}

function fromVue(node) {
  const attributes = node.startTag.attributes.flatMap((attribute) => {
    if (attribute.directive) {
      const key = attribute.key;
      if (key.name.name !== "bind") return [];
      const expression = attribute.value?.expression;
      if (!key.argument) return expression ? [attributeNode("", expression, attribute, true)] : [];
      return [attributeNode(key.argument.name, attribute.value, attribute)];
    }
    return [attributeNode(attribute.key.name, attribute.value, attribute)];
  });
  return {
    ...node,
    type: "JSXOpeningElement",
    name: { type: "JSXIdentifier", name: node.rawName },
    attributes,
  };
}

function fromSvelte(node) {
  const attributes = node.startTag.attributes.flatMap((attribute) => {
    if (attribute.type === "SvelteSpreadAttribute") {
      return [attributeNode("", attribute.argument, attribute, true)];
    }
    if (attribute.type === "SvelteStyleDirective") {
      return [attributeNode("style", attribute.value?.[0], attribute)];
    }
    if (attribute.type === "SvelteShorthandAttribute") {
      return [
        attributeNode(
          attribute.key.name,
          {
            type: "SvelteMustacheTag",
            expression: attribute.value,
            range: attribute.range,
            loc: attribute.loc,
          },
          attribute,
        ),
      ];
    }
    if (attribute.type !== "SvelteAttribute") return [];
    return [attributeNode(attribute.key.name, attribute.value[0], attribute)];
  });
  const name = node.name?.name ?? node.name?.property?.name;
  return { ...node, type: "JSXOpeningElement", name: { type: "JSXIdentifier", name }, attributes };
}

export function templateVisitors(context, visitors) {
  const service = context.sourceCode.parserServices?.defineTemplateBodyVisitor;
  if (context.filename?.endsWith(".vue") && service) {
    const scriptVisitors = { ...visitors, "Program:exit"() {} };
    return service(
      {
        VElement(node) {
          const mapped = fromVue(node);
          visitors.JSXOpeningElement?.(mapped);
          for (const attribute of mapped.attributes) {
            if (attribute.type === "JSXAttribute") visitors.JSXAttribute?.(attribute);
          }
          visitors["Program:exit"]?.();
        },
      },
      scriptVisitors,
    );
  }
  if (context.filename?.endsWith(".svelte")) {
    return {
      ...visitors,
      SvelteElement(node) {
        const mapped = fromSvelte(node);
        visitors.JSXOpeningElement?.(mapped);
        for (const attribute of mapped.attributes) {
          if (attribute.type === "JSXAttribute") visitors.JSXAttribute?.(attribute);
        }
      },
    };
  }
  return visitors;
}
