import { scrollToSection } from "@/components/ui/scrollToSection";

// A link to a part of this page that scrolls there without writing "#id" into
// the address bar, so the URL stays clean however much someone navigates.
//
// It stays a real <a href="#id">: before hydration, or if the target is
// missing, the browser's own anchor jump still works. Clicks with a modifier
// key or a non-primary button are left alone, so "open in new tab" works too.
const SectionLink = ({ to, onClick, children, ...rest }) => {
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (scrollToSection(to)) event.preventDefault();
  };

  return (
    <a href={`#${to}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

export default SectionLink;
