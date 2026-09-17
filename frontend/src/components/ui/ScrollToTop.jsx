import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./ScrollToTop.css";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // setState with an unchanged boolean bails out, so this only re-renders
    // when the threshold is actually crossed.
    const onScroll = () => setVisible(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0 });
    // Move focus with the view, or a keyboard user is left at the bottom of
    // the tab order while looking at the top of the page.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className="scroll-top"
      data-visible={visible}
      // Hidden from the tab order and the accessibility tree while invisible,
      // not just faded out.
      inert={!visible}
      aria-label="Back to top"
      onClick={handleClick}
    >
      <FaArrowUp aria-hidden="true" />
    </button>
  );
};

export default ScrollToTop;
