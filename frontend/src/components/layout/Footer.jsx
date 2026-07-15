import { personalInfo } from "@/data/portfolio";

const Footer = () => {
  return (
    <footer className="text-center footer">
      <div className="container footer-meta">
        <span>Built and designed by {personalInfo.name}.</span>
        <span>All rights reserved. &copy;</span>
      </div>
    </footer>
  );
};

export default Footer;
