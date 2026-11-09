// Scrolls to a part of this page without writing "#id" into the address bar.
//
// Scrolling goes through scrollIntoView with the default behaviour, which
// follows the CSS: smooth normally, instant under reduced motion, and offset
// by scroll-padding. Focus then moves to the target, as a native anchor jump
// would, so the next Tab continues from the section the visitor jumped to.
// Targets carry tabIndex={-1} to be focusable.
//
// Returns false when the target does not exist, so a caller can fall back.
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return false;

  // "top" is the hero, but Home means the top of the page: the masthead and
  // dot band sit above the hero, and scrolling the hero to the edge would cut
  // them off. window.scrollTo without a behaviour follows the CSS as well.
  if (id === "top") window.scrollTo({ top: 0 });
  else target.scrollIntoView({ block: "start" });
  target.focus({ preventScroll: true });

  // A hash from an earlier visit or a shared link is cleared as well.
  if (window.location.hash) {
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", pathname + search);
  }
  return true;
}
