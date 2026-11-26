import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { LuCircleAlert, LuCircleCheck, LuMail, LuTriangleAlert } from "react-icons/lu";
import ExternalLink from "@/components/ui/ExternalLink";
import Section from "@/components/ui/Section";
import { PERSON } from "@/content/site.ts";
import {
  CONTACT_ENDPOINT,
  contactErrors,
  FIELDS,
  HONEYPOT,
  type ContactResponse,
  type ContactValues,
  type FieldErrors,
  type FieldName,
} from "@/shared/contact.ts";

const EMPTY: ContactValues & { [HONEYPOT]: string } = { name: "", email: "", subject: "", message: "", [HONEYPOT]: "" };

// The API answers within a few seconds; past this the form says it is still
// working, and past the timeout it gives up and points at email.
const SLOW_NOTICE_MS = 5000;
const TIMEOUT_MS = 20000;

type Status = "idle" | "sending" | "sent" | "warning" | "error";

const AUTOCOMPLETE: Record<FieldName, string> = { name: "name", email: "email", subject: "off", message: "off" };

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [slow, setSlow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Before the script loads the browser validates natively (required,
  // email, length caps); once it has, the form shows its own messages.
  useEffect(() => {
    if (formRef.current) formRef.current.noValidate = true;
  }, []);

  useEffect(() => {
    if (status !== "sending") return;
    const timer = setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [status]);

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    if (errors[name as FieldName]) setErrors((previous) => ({ ...previous, [name]: undefined }));
    if (status !== "idle" && status !== "sending") setStatus("idle");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The button is aria-disabled, not disabled, while sending, so Enter in a
    // field could submit twice.
    if (status === "sending") return;

    // The same rules the API applies, from the same module. Every error shows
    // at once, and focus goes to the first, whose error is its description.
    const { errors: nextErrors } = contactErrors(values);
    setErrors(nextErrors);
    const first = FIELDS.find(({ name }) => nextErrors[name]);
    if (first) {
      const control = formRef.current?.elements.namedItem(first.name);
      if (control instanceof HTMLElement) control.focus();
      return;
    }

    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      // A platform error page is HTML, not JSON: treat it as a plain failure.
      const data = (await response.json().catch(() => null)) as ContactResponse | null;
      if (response.ok && data?.ok) {
        setValues(EMPTY);
        setStatus("sent");
        setFeedback("Thanks, your message is on its way. I will reply by email.");
        return;
      }
      if (response.status === 400 && data && !data.ok) {
        // The one failure the visitor can correct.
        setStatus("error");
        setFeedback(data.error);
        if (data.field) setErrors({ [data.field]: data.error });
        return;
      }
      setStatus("warning");
      setFeedback(
        response.status === 429
          ? "Too many messages from this network. Please try again in 15 minutes."
          : "The message could not be sent right now."
      );
    } catch (error) {
      setStatus("warning");
      setFeedback(
        error instanceof DOMException && error.name === "TimeoutError"
          ? "The server took too long to answer."
          : "The server could not be reached. Check your connection and try again."
      );
    }
  };

  const sending = status === "sending";

  return (
    <Section id="contact" title="Contact" intro="For a role, a question about a project, or a collaboration. I reply to every message.">
      <div className="contact">
        <div className="contact__channels">
          <p className="contact__lead">The quickest way to reach me is email.</p>
          <ul className="channels">
            <li>
              <a href={`mailto:${PERSON.email}`}>
                <LuMail className="icon" aria-hidden="true" />
                {PERSON.email}
              </a>
            </li>
            <li>
              <ExternalLink href={PERSON.links.linkedin}>
                <FaLinkedinIn className="icon" aria-hidden="true" />
                LinkedIn
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={PERSON.links.github}>
                <FaGithub className="icon" aria-hidden="true" />
                GitHub
              </ExternalLink>
            </li>
          </ul>
        </div>

        {/* method and action make it work before the script loads: the API
            answers a plain form post as well, with a page of its own. */}
        <form ref={formRef} className="contact-form" method="post" action={CONTACT_ENDPOINT} onSubmit={onSubmit}>
          <p className="meta">All fields are required. What happens to your message is set out on the <a href="/privacy/">privacy page</a>.</p>

          {/* A trap for bots that fill every input: off screen, out of the
              tab order and hidden from assistive technology. */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor={HONEYPOT}>Website</label>
            <input id={HONEYPOT} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" value={values[HONEYPOT]} onChange={onChange} />
          </div>

          {FIELDS.map(({ name, label, max }) => {
            const error = errors[name];
            const shared = {
              id: name,
              name,
              className: "field__control",
              value: values[name],
              onChange,
              // Read-only while sending: an edit then would never be sent.
              readOnly: sending,
              required: true,
              maxLength: max,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error ? `${name}-error` : undefined,
            };
            return (
              <div key={name} className={`field field--${name}`}>
                <label className="field__label" htmlFor={name}>
                  {label}
                </label>
                {name === "message" ? (
                  <textarea {...shared} rows={6} />
                ) : (
                  <input {...shared} type={name === "email" ? "email" : "text"} autoComplete={AUTOCOMPLETE[name]} />
                )}
                {error && (
                  <p id={`${name}-error`} className="field__error">
                    <LuCircleAlert className="icon" aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          <div className="contact-form__footer">
            <button type="submit" className="button" aria-disabled={sending || undefined}>
              {sending ? "Sending..." : "Send message"}
            </button>
            {/* Always present, so screen readers are listening before it changes. */}
            <div className="contact-form__status" aria-live="polite">
              {sending && slow && <p className="form-feedback">Still sending...</p>}
              {status === "sent" && (
                <p className="form-feedback form-feedback--success">
                  <LuCircleCheck className="icon" aria-hidden="true" />
                  {feedback}
                </p>
              )}
              {(status === "warning" || status === "error") && (
                <p className={`form-feedback form-feedback--${status}`}>
                  {status === "warning" ? <LuTriangleAlert className="icon" aria-hidden="true" /> : <LuCircleAlert className="icon" aria-hidden="true" />}
                  <span>
                    {feedback} You can also email me at <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>.
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </Section>
  );
}
