import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}

// A numbered home-page section. The number is a CSS counter, so it follows the
// order of SECTIONS without being written anywhere. tabIndex -1 lets an in-page
// jump move focus here, as a native anchor jump would.
export default function Section({ id, title, intro, children }: Props) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`} tabIndex={-1}>
      <div className="container section__grid">
        <header className="section__head">
          <h2 id={`${id}-title`} className="section__title">
            {title}
          </h2>
          {intro && <p className="section__intro">{intro}</p>}
        </header>
        <div className="section__body">{children}</div>
      </div>
    </section>
  );
}
