// An off-site link that opens in a new tab. One component so every such link
// gets the same rel, and so screen-reader users are told about the new tab
// rather than being moved to one without warning. An aria-label replaces the
// link's text as its accessible name, so for icon-only links the notice is
// appended to the label instead.
const NEW_TAB = "(opens in a new tab)";

const ExternalLink = ({ href, children, "aria-label": ariaLabel, ...rest }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel ? `${ariaLabel} ${NEW_TAB}` : undefined}
    {...rest}
  >
    {children}
    {!ariaLabel && <span className="visually-hidden"> {NEW_TAB}</span>}
  </a>
);

export default ExternalLink;
