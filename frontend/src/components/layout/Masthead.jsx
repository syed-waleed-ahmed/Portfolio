import { locations } from "@/data/about";
import { personalInfo } from "@/data/portfolio";
import "./Masthead.css";

// Where the page is written from, as a map reference: the same coordinates
// the globe at the foot of the page marks. Decoration beside the city's name,
// so a screen reader is given the name alone.
const [latitude, longitude] = locations.find(({ name }) => personalInfo.location.startsWith(name)).coordinates;
const COORDINATES = `${latitude.toFixed(2)}°N ${longitude.toFixed(2)}°E`;

// The top of the page: who this is, what they do and where. It scrolls away
// with the page, since navigation lives in the dock. The hero greets by first
// name only, so the full name has to be here, and beside it the role and the
// city answer a recruiter's first three questions before the greeting does.
const Masthead = () => (
  <header className="masthead">
    <div className="container masthead__inner">
      <p className="masthead__name">{personalInfo.name}</p>
      <p className="label">{personalInfo.role}</p>
      <p className="label masthead__place">
        {personalInfo.location}
        <span aria-hidden="true"> · {COORDINATES}</span>
      </p>
    </div>
  </header>
);

export default Masthead;
