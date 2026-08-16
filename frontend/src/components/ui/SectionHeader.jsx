import Reveal from "@/components/ui/Reveal";

// The header every section opens with: icon badge, title, subtitle. All six
// sections rendered this markup by hand before, which is how the icon badge
// would have drifted section to section. One component, one place to change it.
//
// `icon` is a component (the section owns its own import), not a key - unlike
// the data files, a section file is already JSX.
// The icon and the title share one line inside the h2, rather than the icon
// sitting in its own block above it. Stacked, the tile read as a loose graphic
// floating over the heading; inline it is anchored to the words it labels.
// The gradient rule under the title is an ::after on the h2, so it still
// breaks to its own line and centres under the pair.
const SectionHeader = ({ icon: Icon, title, children }) => (
  <Reveal>
    <div className="section-header">
      <h2 className="section-title">
        <span className="section-title-row">
          {Icon && (
            <span className="section-icon" aria-hidden="true">
              <Icon />
            </span>
          )}
          <span className="section-title-text">{title}</span>
        </span>
      </h2>
      {children && <p className="section-subtitle">{children}</p>}
    </div>
  </Reveal>
);

export default SectionHeader;
