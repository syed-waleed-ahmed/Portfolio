import { FaLinkedinIn, FaGithub, FaEnvelope } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="py-4 text-center footer">
      <div className="footer-social">
        <a
          href="https://www.linkedin.com/in/syed-waleed-ahmed/"
          target="_blank"
          rel="noreferrer"
          className="footer-icon"
          aria-label="LinkedIn"
        >
          <FaLinkedinIn />
        </a>
        <a
          href="https://github.com/syed-waleed-ahmed"
          target="_blank"
          rel="noreferrer"
          className="footer-icon"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://leetcode.com/u/syed-waleed-ahmed/"
          target="_blank"
          rel="noreferrer"
          className="footer-icon"
          aria-label="LeetCode"
        >
          <SiLeetcode />
        </a>
        <a
          href="mailto:syedwaleedahmed9@gmail.com"
          className="footer-icon"
          aria-label="Email"
        >
          <FaEnvelope />
        </a>
      </div>
      <small>
        © {new Date().getFullYear()} Syed Waleed Ahmed. All rights reserved.
      </small>
    </footer>
  );
};

export default Footer;
