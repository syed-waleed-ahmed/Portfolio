import { useEffect, useRef, useState } from "react";
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandRoot } from "cmdk";
import { LuArrowRight, LuCheck, LuCopy, LuExternalLink, LuSearch } from "react-icons/lu";
import { rankCommands, type CommandAction } from "@/commands.ts";
import { isCommandShortcut } from "./commandShortcut.ts";
import "./CommandPalette.css";

const ACTION_ICONS = { section: LuArrowRight, navigate: LuArrowRight, open: LuExternalLink, copy: LuCopy } as const;

// A native modal <dialog> supplies the top layer, the inert page behind it,
// focus containment and Escape, and restores focus when it closes. Loaded on
// first use, so a visitor who never opens it never downloads it.
export default function CommandPalette({ onHome, onClose }: { onHome: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  // The palette filters and orders entries itself and cmdk only moves the
  // selection. cmdk 1.1.1 keys its groups by an internal id but looks them up
  // by their value when it reorders them, so its own sort never moves a group:
  // a search for "rag" left "Go to" first and Enter went to a section.
  const results = rankCommands(search);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // showModal() focuses cmdk's root, which has tabIndex -1; typing needs
    // the input.
    inputRef.current?.focus();
  }, []);

  const close = () => dialogRef.current?.close();

  const run = async (action: CommandAction) => {
    switch (action.kind) {
      case "section": {
        close();
        const target = onHome ? document.getElementById(action.id) : null;
        if (!target) {
          window.location.assign(`/#${action.id}`);
          return;
        }
        if (action.id === "top") window.scrollTo({ top: 0 });
        else target.scrollIntoView({ block: "start" });
        target.focus({ preventScroll: true });
        return;
      }
      case "navigate":
        close();
        window.location.assign(action.href);
        return;
      case "open":
        close();
        window.open(action.href, "_blank", "noopener,noreferrer");
        return;
      case "copy":
        try {
          await navigator.clipboard.writeText(action.text);
          setCopied(true);
        } catch {
          // Clipboard access can be refused, and the address is the point.
          window.location.assign(`mailto:${action.text}`);
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
      <CommandRoot className="palette__panel" label="Command menu" shouldFilter={false} loop vimBindings={false}>
        <div className="palette__search">
          <LuSearch className="icon" aria-hidden="true" />
          <CommandInput
            ref={inputRef}
            className="palette__input"
            placeholder="Search pages, projects and links"
            value={search}
            onValueChange={setSearch}
          />
        </div>
        <CommandList className="palette__list">
          <CommandEmpty className="palette__empty">No results.</CommandEmpty>
          {results.map(({ group, items }) => (
            <CommandGroup key={group.id} value={group.id} heading={group.heading} className="palette__group">
              {items.map((item) => {
                const justCopied = copied && item.action.kind === "copy";
                const Icon = justCopied ? LuCheck : ACTION_ICONS[item.action.kind];
                return (
                  <CommandItem key={item.id} className="palette__item" value={item.id} onSelect={() => run(item.action)}>
                    <span>{justCopied ? "Email address copied" : item.label}</span>
                    <Icon className="icon" aria-hidden="true" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
        <p className="palette__hint" aria-hidden="true">
          <span>Arrows to move</span>
          <span>Enter to select</span>
          <span>Esc to close</span>
        </p>
      </CommandRoot>
      <p className="visually-hidden" role="status">
        {copied ? "Email address copied." : ""}
      </p>
    </dialog>
  );
}
