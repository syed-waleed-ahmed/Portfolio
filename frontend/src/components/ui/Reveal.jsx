import { useEffect, useRef } from "react";

// Fades content up as it scrolls into view - once, and only for content that
// starts below the fold.
//
// The page is prerendered, so the server HTML has to be fully visible: hiding
// it until JavaScript runs would blank the first paint. Instead, after
// hydration, anything still below the viewport gets data-reveal="pending"
// (invisible, and off screen anyway) and flips to "shown" when it enters.
// Anything already on screen is never touched, so nothing visible flickers.
//
// The state lives in a data attribute written straight to the node rather than
// in React state: React never renders that attribute, so it cannot overwrite
// it, and scrolling a section in costs no re-render.
const Reveal = ({ as: Tag = "div", delay = 0, style, children, ...rest }) => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    node.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.reveal = "shown";
        observer.disconnect();
      },
      // Threshold 0 rather than a ratio: a ratio can never be reached by an
      // element taller than the viewport, which would leave it hidden.
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { ...style, "--reveal-delay": `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
