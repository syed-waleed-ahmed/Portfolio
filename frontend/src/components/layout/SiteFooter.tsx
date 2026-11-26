import ExternalLink from "@/components/ui/ExternalLink";
import { PERSON, SITE } from "@/content/site.ts";

const UPDATED = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
  new Date(`${SITE.updated}T00:00:00Z`)
);

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          &copy; {__BUILD_YEAR__} {PERSON.name}. Content reviewed {UPDATED}.
        </p>
        <ul className="site-footer__links">
          <li>
            <a href="/privacy/">Privacy</a>
          </li>
          <li>
            <ExternalLink href={SITE.repository}>Source on GitHub</ExternalLink>
          </li>
          <li>
            <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
