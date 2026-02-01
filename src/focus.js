const key = "returnFocusTo";

export function saveFocus() {
  const activeElementId = document.activeElement.getAttribute("id");
  if (activeElementId) {
    sessionStorage.setItem(key, activeElementId);
  }
}

export function returnFocus() {
  const elementId = sessionStorage.getItem(key);
  if (elementId) {
    sessionStorage.removeItem(key);
    // Security: Use getElementById instead of querySelector to prevent CSS selector injection
    const returnFocusToEl = document.getElementById(elementId);
    if (returnFocusToEl && returnFocusToEl.focus) {
      returnFocusToEl.focus();
    }
  }
}
