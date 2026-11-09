import ExternalLink from "@/components/ui/ExternalLink";
import { personalInfo, socialLinks } from "@/data/portfolio";
import "./Footer.css";

// One line. Email, LinkedIn and GitHub are all in the contact panel directly
// above it, and the dock below it carries LinkedIn and GitHub on wider
// screens, so another set here would only repeat them.
//
// __BUILD_YEAR__ is injected by vite.config.js. Computing the year at render
// time instead would let the prerendered HTML and the hydrating client
// disagree once a new year starts before the next deploy.
const Footer = () => (
  <footer className="site-footer">
    <p className="container">
      &copy; {__BUILD_YEAR__} {personalInfo.name}.{" "}
      <ExternalLink href={socialLinks.source} className="text-link">
        Source on GitHub
      </ExternalLink>
    </p>
  </footer>
);

export default Footer;
