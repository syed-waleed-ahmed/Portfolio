import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaFileAlt, FaEnvelope, FaGithub, FaLinkedinIn } from "react-icons/fa";
import ExternalLink from "@/components/ui/ExternalLink";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { personalInfo, socialLinks } from "@/data/portfolio";
import "./Contact.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://portfolio-backend-kmum.onrender.com";

// Field rules mirror FIELDS in backend/routes/contactRoutes.js, so the browser
// stops input at the same length the API would reject.
const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", maxLength: 100, half: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", maxLength: 100, half: true },
  { name: "subject", label: "Subject", type: "text", autoComplete: "off", maxLength: 200 },
  { name: "message", label: "Message", multiline: true, maxLength: 5000 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The backend runs on a plan that sleeps when idle, and a cold start can take
// most of a minute. Past SLOW_NOTICE_MS the form says so; past the timeout it
// gives up and points at email instead.
const SLOW_NOTICE_MS = 6000;
const REQUEST_TIMEOUT_MS = 60000;

const initialValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  // Honeypot - hidden from people, filled by bots. See contactRoutes.js.
  website: "",
};

function validate(values) {
  const errors = {};
  for (const { name, label } of FIELDS) {
    if (!values[name].trim()) errors[name] = `${label} is required.`;
  }
  if (!errors.email && !EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }
  return errors;
}

function failureMessage(status, serverError) {
  if (status === 429) return "Too many messages from this network. Please try again in 15 minutes.";
  if (status === 400 && serverError) return serverError;
  return "The message could not be sent right now.";
}

const Contact = () => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  // idle | submitting | success | error
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const [slow, setSlow] = useState(false);
  const formRef = useRef(null);
  const warmedUp = useRef(false);

  useEffect(() => {
    if (status !== "submitting") return;
    const timer = setTimeout(() => setSlow(true), SLOW_NOTICE_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [status]);

  // Wake the backend as soon as someone starts on the form, so the cold start
  // is mostly over by the time they press send. The response is not needed,
  // hence no-cors.
  const warmUp = () => {
    if (warmedUp.current) return;
    warmedUp.current = true;
    fetch(`${API_BASE_URL}/health`, { mode: "no-cors" }).catch(() => {});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (status === "success" || status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalid = FIELDS.find(({ name }) => nextErrors[name]);
    if (firstInvalid) {
      // Focus lands on the field, and its error is announced as its
      // description - no separate summary to read twice.
      formRef.current?.elements.namedItem(firstInvalid.name)?.focus();
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      // A proxy error page is HTML, not JSON; treat it as a plain failure.
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setStatus("error");
        setFeedback(failureMessage(res.status, data?.error));
        return;
      }

      setValues(initialValues);
      setStatus("success");
      setFeedback("Thanks for reaching out. Your message is on its way, and I will reply by email.");
    } catch (err) {
      setStatus("error");
      setFeedback(
        err?.name === "TimeoutError"
          ? "The server took too long to respond."
          : "The server could not be reached. Check your connection and try again."
      );
    }
  };

  const submitting = status === "submitting";

  return (
    <div className="container">
      <SectionHeader id="contact-title" title="Contact">
        Whether it&apos;s a role, a question, or a collaboration, send a
        message. I read every one.
      </SectionHeader>

      <div className="contact-grid">
        <Reveal as="aside" className="contact-aside" aria-label="Other ways to reach me">
          <p className="contact-aside__intro">
            Open to AI and ML engineering roles. Based in {personalInfo.location}.
          </p>
          <ul className="contact-channels">
            <li>
              <a href={`mailto:${personalInfo.email}`} className="contact-channel">
                <FaEnvelope aria-hidden="true" />
                <span>{personalInfo.email}</span>
              </a>
            </li>
            <li>
              <ExternalLink href={socialLinks.linkedin} className="contact-channel">
                <FaLinkedinIn aria-hidden="true" />
                <span>LinkedIn</span>
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={socialLinks.github} className="contact-channel">
                <FaGithub aria-hidden="true" />
                <span>GitHub</span>
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href={personalInfo.resumeUrl} className="contact-channel">
                <FaFileAlt aria-hidden="true" />
                <span>Resume</span>
              </ExternalLink>
            </li>
          </ul>
        </Reveal>

        <Reveal className="card contact-form-card" delay={60}>
          <form ref={formRef} className="contact-form" noValidate onSubmit={handleSubmit} onFocus={warmUp}>
            <p className="contact-form__note">All fields are required.</p>

            {/* Honeypot. Off-screen, out of the tab order and hidden from
                assistive tech, so no person fills it - but still a plain input
                in the DOM, which is all a bot looks at. */}
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={handleChange}
              />
            </div>

            {FIELDS.map(({ name, label, multiline, half, ...inputProps }) => {
              const error = errors[name];
              const Control = multiline ? "textarea" : "input";
              return (
                <div key={name} className={`field${half ? " field--half" : ""}`}>
                  <label className="field__label" htmlFor={name}>
                    {label}
                  </label>
                  <Control
                    id={name}
                    name={name}
                    className="field__control"
                    value={values[name]}
                    onChange={handleChange}
                    required
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={error ? `${name}-error` : undefined}
                    rows={multiline ? 6 : undefined}
                    {...inputProps}
                  />
                  {error && (
                    <p id={`${name}-error`} className="field__error">
                      <FaExclamationCircle aria-hidden="true" />
                      {error}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="contact-form__footer">
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? "Sending..." : "Send message"}
              </button>

              {/* Always in the DOM so screen readers are already listening
                  when the text inside it changes. */}
              <div className="contact-form__status" aria-live="polite">
                {submitting && slow && (
                  <p className="form-feedback">
                    Still sending. The server sleeps when idle and can take up
                    to a minute to wake.
                  </p>
                )}
                {status === "success" && (
                  <p className="form-feedback form-feedback--success">
                    <FaCheckCircle aria-hidden="true" />
                    {feedback}
                  </p>
                )}
                {status === "error" && (
                  <p className="form-feedback form-feedback--error">
                    <FaExclamationCircle aria-hidden="true" />
                    <span>
                      {feedback} You can also email me at{" "}
                      <a className="text-link" href={`mailto:${personalInfo.email}`}>
                        {personalInfo.email}
                      </a>
                      .
                    </span>
                  </p>
                )}
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
};

export default Contact;
