// A link to a part of this page that scrolls there without writing "#id" into
// the address bar, so the URL stays clean however much someone navigates.
//
// It stays a real <a href="#id">: before hydration, or if the target is
// missing, the browser's own anchor jump still works. Clicks with a modifier
// key or a non-primary button are left alone, so "open in new tab" works too.
//
// Scrolling goes through scrollIntoView with the default behaviour, which
// follows the CSS: smooth normally, instant under reduced motion, and offset
// for the sticky header by scroll-padding. Focus then moves to the target, as
// a native anchor jump would, so the next Tab continues from the section the
// visitor jumped to rather than from the link they clicked. Targets carry
// tabIndex={-1} to be focusable.
const SectionLink = ({ to, onClick, children, ...rest }) => {
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById(to);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });

    // A hash from an earlier visit or a shared link is cleared as well.
    if (window.location.hash) {
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", pathname + search);
    }
  };

  return (
    <a href={`#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

export default SectionLink;
