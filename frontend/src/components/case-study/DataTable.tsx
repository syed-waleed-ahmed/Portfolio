import { useId, type ReactNode } from "react";

// A table that scrolls sideways on a narrow screen. The scroll container is
// focusable so a keyboard user can scroll it, and it is a region named by the
// caption, so each table on a page has its own name.
export default function DataTable({ caption, children }: { caption: string; children: ReactNode }) {
  const id = `${useId().replace(/:/g, "")}-caption`;
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-labelledby={id}>
      <table className="data-table">
        <caption id={id}>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
