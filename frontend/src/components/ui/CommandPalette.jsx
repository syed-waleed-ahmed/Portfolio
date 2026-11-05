import { useEffect, useRef, useState } from "react";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
} from "cmdk";
import { LuArrowRight, LuCheck, LuCopy, LuExternalLink, LuSearch } from "react-icons/lu";
import { isCommandShortcut } from "@/components/ui/commandShortcut";
import { scrollToSection } from "@/components/ui/scrollToSection";
import { commandGroups, scoreCommand } from "@/data/commands";
import "./CommandPalette.css";

const ACTION_ICONS = { scroll: LuArrowRight, open: LuExternalLink, copy: LuCopy };

// A native modal <dialog> supplies the top layer, the inert background, focus
// containment and Escape. It also restores focus synchronously in close(),
// which lets a jump to a section take focus straight afterwards and keep it.
//
// Loaded on first use, so a visitor who never opens it never downloads it.
const CommandPalette = ({ onClose }) => {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // Explicitly, because showModal() focuses the first focusable element and
    // cmdk's root comes first with its tabIndex of -1, which leaves typing with
    // nowhere to go.
    inputRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  const run = async ({ action, target }) => {
    if (action === "scroll") {
      close();
      scrollToSection(target);
    } else if (action === "open") {
      close();
      window.open(target, "_blank", "noopener,noreferrer");
    } else {
      try {
        await navigator.clipboard.writeText(target);
        setCopied(true);
      } catch {
        // Clipboard access can be refused, and the address is the point.
        window.location.assign(`mailto:${target}`);
      }
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Command menu"
      onClose={onClose}
      // The panel fills the dialog, so only the backdrop targets it directly.
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
      onKeyDown={(event) => {
        if (!isCommandShortcut(event)) return;
        event.preventDefault();
        close();
      }}
    >
      <CommandRoot
        className="palette__panel"
        label="Command menu"
        filter={scoreCommand}
        loop
        vimBindings={false}
      >
        <div className="palette__search">
          <LuSearch aria-hidden="true" />
          <CommandInput
            ref={inputRef}
            className="palette__input"
            placeholder="Search sections, projects, skills..."
          />
        </div>

        <CommandList className="palette__list">
          <CommandEmpty className="palette__empty">No results.</CommandEmpty>
          {commandGroups.map(({ heading, items }) => (
            <CommandGroup key={heading} heading={heading} className="palette__group">
              {items.map((item) => {
                const justCopied = copied && item.action === "copy";
                const Icon = justCopied ? LuCheck : ACTION_ICONS[item.action];
                return (
                  <CommandItem
                    key={item.id}
                    className="palette__item"
                    value={item.label}
                    keywords={item.keywords}
                    onSelect={() => run(item)}
                  >
                    <span className="palette__label">{justCopied ? "Email address copied" : item.label}</span>
                    <Icon aria-hidden="true" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>

        <p className="palette__hint" aria-hidden="true">
          <span>↑↓ to move</span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </p>
      </CommandRoot>

      <p className="visually-hidden" role="status">
        {copied ? "Email address copied." : ""}
      </p>
    </dialog>
  );
};

export default CommandPalette;
