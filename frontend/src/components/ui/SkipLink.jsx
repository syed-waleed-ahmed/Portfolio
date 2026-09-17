import SectionLink from "@/components/ui/SectionLink";

// Hidden until focused. Lets keyboard / screen-reader users
// jump straight past the navbar to the main content.
const SkipLink = () => (
  <SectionLink to="main" className="skip-link">
    Skip to content
  </SectionLink>
);

export default SkipLink;
