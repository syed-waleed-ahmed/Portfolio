import ExternalLink from "@/components/ui/ExternalLink";
import { PERSON, SITE } from "@/content/site.ts";

// What the site actually does with data, and nothing it does not do. It makes
// no claim of compliance with any law: it describes the processing.
export default function PrivacyPage() {
  return (
    <article className="container standalone prose" aria-labelledby="privacy-title">
      <p className="meta">Last reviewed {SITE.updated}</p>
      <h1 id="privacy-title" className="standalone__title">
        Privacy
      </h1>
      <p>
        This is a personal website run by {PERSON.name}, an individual in {PERSON.location}. You can reach me about
        anything on this page at <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>.
      </p>

      <h2>No analytics, no cookies</h2>
      <p>
        The site sets no cookies, uses no analytics or advertising scripts, and loads nothing from other websites while
        you read it. Fonts and images are served from this domain. Links to other sites, such as GitHub, LinkedIn or a
        project&apos;s live demo, take you to services with their own policies.
      </p>

      <h2>Hosting</h2>
      <p>
        The site is served by Cloudflare. Like any web host, it processes your IP address and request details to deliver
        pages and to protect the site from abuse, and keeps aggregate request statistics. I do not receive a log of
        individual visits.
      </p>

      <h2>The contact form</h2>
      <p>
        If you send a message, the form sends your name, email address, subject and message to this site&apos;s own server
        code, which runs on Cloudflare. It passes them to Resend, an email delivery service, which delivers them to my
        inbox (Gmail). Nothing else is stored: there is no database of messages.
      </p>
      <ul>
        <li>
          <strong>Why:</strong> to read your message and reply to it, which you ask for by sending it.
        </li>
        <li>
          <strong>Rate limiting:</strong> to stop abuse, the server keeps a count of recent submissions per IP address for
          15 minutes, then discards it.
        </li>
        <li>
          <strong>How long:</strong> the email stays in my inbox until I delete it. Resend keeps a record of the delivery
          for a limited period under its own policy.
        </li>
        <li>
          <strong>Your choices:</strong> you can ask me to delete your message, or for a copy of what I hold, by email. If
          you prefer not to use the form, write to me directly instead.
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        If what the site collects changes, this page changes with it, and the date at the top moves. The site&apos;s
        source is <ExternalLink href={SITE.repository}>public on GitHub</ExternalLink>, so the history of this page and of
        the code it describes can be checked.
      </p>
    </article>
  );
}
