import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { LuCommand, LuSearch } from "react-icons/lu";
import { isCommandShortcut } from "@/components/ui/commandShortcut";

// The failure is caught here rather than left to throw: the dock sits outside
// every ErrorBoundary, so a chunk that fails to load (a tab left open across a
// deploy, say) would otherwise take the whole page down with it.
const loadPalette = () =>
  import("@/components/ui/CommandPalette").catch(() => ({ default: () => null }));
const CommandPalette = lazy(loadPalette);

// The prerendered HTML has to say one thing for everyone, so it says "Ctrl K",
// and Apple platforms switch to their own key straight after hydration. The
// Command key is an icon rather than the U+2318 character, which the
// self-hosted font subset cannot draw.
const subscribeToNothing = () => () => {};
const clientIsApple = () => /Mac|iPhone|iPad/.test(navigator.platform);
const serverIsApple = () => false;

// The palette's dock item and its keyboard shortcut. The item hides on phones
// with dock__item--wide-only, but stays mounted, so the shortcut still works in
// a narrow window. Rendered inline at the end of the dock, the dialog would
// inherit the dock's styles, hence the portal; nothing here reaches the portal
// on the server, where `open` is always false.
const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const apple = useSyncExternalStore(subscribeToNothing, clientIsApple, serverIsApple);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isCommandShortcut(event)) return;
      // Browsers bind Ctrl+K to the address bar.
      event.preventDefault();
      // Only opens. An open palette handles the shortcut itself, because
      // closing has to go through the dialog for focus to be restored.
      setOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        className="dock__link"
        aria-label="Search"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
        // Fetched on intent, so the click itself opens without a wait.
        onPointerEnter={loadPalette}
        onFocus={loadPalette}
      >
        <LuSearch aria-hidden="true" />
        <span className="dock__tooltip" aria-hidden="true">
          Search (
          {apple ? (
            <>
              <LuCommand aria-hidden="true" />K
            </>
          ) : (
            "Ctrl K"
          )}
          )
        </span>
      </button>

      {open &&
        createPortal(
          <Suspense fallback={null}>
            <CommandPalette onClose={() => setOpen(false)} />
          </Suspense>,
          document.body
        )}
    </>
  );
};

export default CommandMenu;
