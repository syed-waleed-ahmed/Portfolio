import type { AnchorHTMLAttributes, ReactNode } from "react";

// An off-site link, opened in a new tab. Screen-reader users are told about
// the new tab; when an aria-label replaces the text, the notice joins it.
const NEW_TAB = "(opens in a new tab)";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export default function ExternalLink({ href, children, "aria-label": ariaLabel, ...rest }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel ? `${ariaLabel} ${NEW_TAB}` : undefined} {...rest}>
      {children}
      {!ariaLabel && <span className="visually-hidden"> {NEW_TAB}</span>}
    </a>
  );
}
