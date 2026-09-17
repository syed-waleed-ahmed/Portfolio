import { FaEnvelope, FaGithub, FaLinkedinIn } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import { personalInfo, socialLinks } from "@/data/portfolio";
import "./Footer.css";

// __BUILD_YEAR__ is injected by vite.config.js. Computing the year at render
// time instead would let the prerendered HTML and the hydrating client
// disagree once a new year starts before the next deploy.
const Footer = () => (
  <footer className="site-footer">
    <div className="container site-footer__inner">
      <p>
        &copy; {__BUILD_YEAR__} {personalInfo.name}.{" "}
        <ExternalLink href={socialLinks.source} className="text-link">
          Source on GitHub
        </ExternalLink>
      </p>
      <ul className="site-footer__links">
        <li>
          <a href={`mailto:${personalInfo.email}`} className="btn btn--icon" aria-label="Email">
            <FaEnvelope aria-hidden="true" />
          </a>
        </li>
        <li>
          <ExternalLink href={socialLinks.linkedin} className="btn btn--icon" aria-label="LinkedIn">
            <FaLinkedinIn aria-hidden="true" />
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href={socialLinks.github} className="btn btn--icon" aria-label="GitHub">
            <FaGithub aria-hidden="true" />
          </ExternalLink>
        </li>
      </ul>
    </div>
  </footer>
);

export default Footer;
