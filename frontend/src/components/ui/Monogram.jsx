// The ringed initial that opens a role or a school row. Decorative: the name it
// abbreviates is always written out beside it.
const Monogram = ({ name }) => (
  <span className="monogram" aria-hidden="true">
    {name.trim().charAt(0)}
  </span>
);

export default Monogram;
