import type { KeyboardEvent as ReactKeyboardEvent } from "react";

// Ctrl+K or Cmd+K. Its own module because the eager header button opens the
// palette with it and the lazily loaded palette closes itself with it.
export const isCommandShortcut = (event: KeyboardEvent | ReactKeyboardEvent) =>
  (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k";
