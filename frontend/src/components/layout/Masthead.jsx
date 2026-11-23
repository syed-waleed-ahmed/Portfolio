import { personalInfo } from "@/data/portfolio";
import "./Masthead.css";

// The top of the page: who this is, what they do and where. It scrolls away
// with the page, since navigation lives in the dock. The hero greets by first
// name only, so the full name has to be here, and beside it the role and the
// city answer a recruiter's first three questions before the greeting does.
const Masthead = () => (
  <header className="masthead">
    <div className="container masthead__inner">
      <p className="masthead__name">{personalInfo.name}</p>
      <p className="masthead__role">{personalInfo.role}</p>
      <p className="masthead__place">{personalInfo.location}</p>
    </div>
  </header>
);

export default Masthead;
