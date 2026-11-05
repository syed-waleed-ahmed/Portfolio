import Reveal from "@/components/ui/Reveal";

// The header every section opens with. `id` must be `${sectionId}-title`:
// App.jsx labels each <section> with it, which is what turns the sections into
// named landmarks for screen-reader navigation.
//
// `variant` is empty for the quiet default, "feature" for the pill-on-a-rule
// header (which needs a `label`), or "panel" for a section that is one bordered
// panel, where the title itself becomes the pill on the panel's top border. The
// label repeats the section's name for the eye, so it is hidden from assistive
// technology, which already gets the heading.
const SectionHeader = ({ id, title, label, variant, children }) => (
  <Reveal
    as="header"
    className={variant ? `section-header section-header--${variant}` : "section-header"}
  >
    {label && (
      <div className="section-pill-row" aria-hidden="true">
        <span className="section-pill">{label}</span>
      </div>
    )}
    <h2 id={id} className="section-title">
      {title}
    </h2>
    {children && <p className="section-subtitle">{children}</p>}
  </Reveal>
);

export default SectionHeader;
