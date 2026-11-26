import { lazy, Suspense, useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { LuCommand, LuSearch } from "react-icons/lu";
import { isCommandShortcut } from "./commandShortcut.ts";

type PaletteProps = { onHome: boolean; onClose: () => void };

// A chunk that fails to load (a tab left open across a deploy) is caught here:
// the header sits outside every error boundary.
const loadPalette = (): Promise<{ default: ComponentType<PaletteProps> }> =>
  import("./CommandPalette").catch(() => ({ default: () => null }));
const CommandPalette = lazy(loadPalette);

// The prerendered HTML says "Ctrl K" for everyone; Apple platforms switch to
// their key after hydration. The Command key is an icon because the font
// subset cannot draw U+2318.
const subscribeToNothing = () => () => {};
const clientIsApple = () => /Mac|iPhone|iPad/.test(navigator.platform);
const serverIsApple = () => false;

export default function CommandMenu({ onHome }: { onHome: boolean }) {
  const [open, setOpen] = useState(false);
  const apple = useSyncExternalStore(subscribeToNothing, clientIsApple, serverIsApple);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isCommandShortcut(event)) return;
      // Browsers bind Ctrl+K to the address bar.
      event.preventDefault();
      // Only opens: an open palette closes itself, through the dialog, so
      // focus is restored.
      setOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        className="button button--quiet button--compact command-trigger"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
        // Fetched on intent, so the click opens without a wait.
        onPointerEnter={loadPalette}
        onFocus={loadPalette}
      >
        <LuSearch className="icon" aria-hidden="true" />
        {/* The button's name. On a phone it is hidden visually, not removed,
            so the icon-only button is still called "Search". */}
        <span className="command-trigger__label">Search</span>
        <kbd className="kbd command-trigger__keys" aria-hidden="true">
          {apple ? <LuCommand className="icon" /> : "Ctrl"} K
        </kbd>
      </button>
      {open &&
        createPortal(
          <Suspense fallback={null}>
            <CommandPalette onHome={onHome} onClose={() => setOpen(false)} />
          </Suspense>,
          document.body
        )}
    </>
  );
}
