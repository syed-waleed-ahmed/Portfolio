import { locations } from "@/data/about";
import { personalInfo } from "@/data/portfolio";
import "./Masthead.css";

// Where the page is written from, as a map reference: the same coordinates
// the globe at the foot of the page marks, found by the city's name in
// `locations`. Decoration beside that name, so a screen reader is given the
// name alone, and optional: a city the globe does not mark shows no
// coordinates rather than failing the build.
const place = locations.find(({ name }) => personalInfo.location.startsWith(name));
const COORDINATES = place
  ? `${place.coordinates[0].toFixed(2)}°N ${place.coordinates[1].toFixed(2)}°E`
  : null;

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
        {COORDINATES && <span aria-hidden="true"> · {COORDINATES}</span>}
      </p>
    </div>
  </header>
);

export default Masthead;
