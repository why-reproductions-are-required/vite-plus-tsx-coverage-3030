export function jsx(tag: string, props: { children: string }): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = props.children;
  return element;
}

export { jsx as jsxs, jsx as jsxDEV };
