import { personalInfo } from "@/data/portfolio";
import "./Masthead.css";

// The top of the page: the full name, over the dot band. It scrolls away with
// the page, since navigation lives in the dock. It stays because the hero greets
// by first name only, and the full name still has to be on the first screen.
const Masthead = () => (
  <header className="masthead">
    <div className="dot-band" aria-hidden="true" />
    <div className="container">
      <p className="masthead__name">{personalInfo.name}</p>
    </div>
  </header>
);

export default Masthead;
