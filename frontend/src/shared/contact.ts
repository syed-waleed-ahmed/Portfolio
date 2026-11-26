// The contact form's rules, shared by the form (src/components/home/Contact.tsx)
// and the API that receives it (worker/contact.ts). One definition, so the
// browser stops input at exactly the length the API would refuse.

export const CONTACT_ENDPOINT = "/api/contact";

export const FIELDS = [
  { name: "name", label: "Name", max: 100 },
  { name: "email", label: "Email", max: 100 },
  { name: "subject", label: "Subject", max: 200 },
  { name: "message", label: "Message", max: 5000 },
] as const;

export type FieldName = (typeof FIELDS)[number]["name"];
export type ContactValues = Record<FieldName, string>;

// Hidden from people, filled by bots that complete every input. A submission
// that fills it gets the same answer as a real one and is not sent.
export const HONEYPOT = "website";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Control characters and unpaired surrogates pass EMAIL_RE but no mailbox can
// hold them, and an address cannot be cleaned without becoming another one.
const EMAIL_UNSENDABLE_RE = /[\p{Cc}\p{Cs}]/u;

export const isEmail = (value: string) => EMAIL_RE.test(value) && !EMAIL_UNSENDABLE_RE.test(value);

export type FieldErrors = Partial<Record<FieldName, string>>;

// Every field's problem, if it has one, with the trimmed values. Unknown or
// non-string input counts as empty. The form shows all errors at once.
export function contactErrors(input: unknown): { values: ContactValues; errors: FieldErrors } {
  const body = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const values = {} as ContactValues;
  const errors: FieldErrors = {};
  for (const { name, label, max } of FIELDS) {
    const raw = body[name];
    const value = typeof raw === "string" ? raw.trim() : "";
    values[name] = value;
    if (!value) errors[name] = `${label} is required.`;
    else if (value.length > max) errors[name] = `${label} must be ${max} characters or fewer.`;
  }
  if (!errors.email && !isEmail(values.email)) errors.email = "Enter a valid email address, like name@example.com.";
  return { values, errors };
}

export type Validation =
  | { ok: true; values: ContactValues }
  | { ok: false; field: FieldName; error: string };

// The API's view: the values, or the first problem in form order.
export function validateContact(input: unknown): Validation {
  const { values, errors } = contactErrors(input);
  const first = FIELDS.find(({ name }) => errors[name]);
  return first ? { ok: false, field: first.name, error: errors[first.name]! } : { ok: true, values };
}

// The bodies the API answers with, so the form can rely on their shape.
export type ContactResponse = { ok: true } | { ok: false; error: string; field?: FieldName };
