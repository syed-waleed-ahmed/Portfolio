import Reveal from "@/components/ui/Reveal";

// The header every section opens with: the title, and a line saying what the
// section holds. `id` must be `${sectionId}-title`: App.jsx labels each
// <section> with it, which is what turns the sections into named landmarks
// for screen-reader navigation.
//
// The number above the title is not rendered here. It is a CSS counter on the
// sections themselves (styles/layout.css), so it follows their order.
const SectionHeader = ({ id, title, children }) => (
  <Reveal as="header" className="section-header">
    <h2 id={id} className="section-title">
      {title}
    </h2>
    {children && <p className="section-subtitle">{children}</p>}
  </Reveal>
);

export default SectionHeader;
