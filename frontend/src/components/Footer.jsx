import { FaLinkedinIn, FaGithub, FaEnvelope } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { personalInfo, socialLinks } from "../data/portfolio";

const Footer = () => {
  return (
    <footer className="py-4 text-center footer">
      <div className="footer-social">
        <a
          href={socialLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn />
        </a>
        <a
          href={socialLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href={socialLinks.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon"
          aria-label="LeetCode"
        >
          <SiLeetcode />
        </a>
        <a
          href={`mailto:${personalInfo.email}`}
          className="footer-icon"
          aria-label="Email"
        >
          <FaEnvelope />
        </a>
      </div>
      <small>
        &copy; {new Date().getFullYear()} {personalInfo.name}. All rights reserved.
      </small>
    </footer>
  );
};

export default Footer;
