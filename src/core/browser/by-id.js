export function byId(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Expected page element "${id}" was not found.`);
  return node;
}
