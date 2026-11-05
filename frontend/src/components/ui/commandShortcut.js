// Ctrl+K or Cmd+K. In its own module because the eager dock item opens the
// palette with it and the lazily loaded palette closes itself with it.
export const isCommandShortcut = (event) =>
  (event.ctrlKey || event.metaKey) &&
  !event.altKey &&
  !event.shiftKey &&
  event.key.toLowerCase() === "k";
