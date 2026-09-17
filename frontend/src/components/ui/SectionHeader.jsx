// The header every section opens with. `id` must be `${sectionId}-title`:
// App.jsx labels each <section> with it, which is what turns the sections into
// named landmarks for screen-reader navigation.
const SectionHeader = ({ id, title, children }) => (
  <header className="section-header">
    <h2 id={id} className="section-title">
      {title}
    </h2>
    {children && <p className="section-subtitle">{children}</p>}
  </header>
);

export default SectionHeader;
