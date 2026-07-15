import { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaTag,
  FaCommentDots,
  FaPaperPlane,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";

const initialState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://portfolio-backend-kmum.onrender.com";

const Contact = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef(null);

  // Grow the message box to fit what's typed. Keyed off the value rather than
  // the change handler so it also shrinks back when the form resets on send.
  //
  // scrollHeight covers content + padding but not the border, and box-sizing is
  // border-box globally - so assigning it straight to height leaves the content
  // area a border short and the box scrolls by exactly that much. Add it back.
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    const borders =
      parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + borders}px`;
  }, [form.message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!form.subject.trim()) newErrors.subject = "Subject is required.";
    if (!form.message.trim()) newErrors.message = "Message is required.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSubmitSuccess("Thanks for reaching out! I'll get back to you soon.");
      setForm(initialState);
      setErrors({});
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Reveal>
        <div className="section-header">
          <h2 className="section-title">Contact</h2>
          <p className="section-subtitle">
            Got a role, a question, or an idea? Drop a note. I read every
            message.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="neo-card contact-card">
          <form noValidate onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="contact-label mb-2" htmlFor="name">
                  <FaUser className="contact-label-icon" />
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`form-control glass-input ${errors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={handleChange}
                  spellCheck="false"
                />
                {errors.name && <div className="small text-danger mt-1">{errors.name}</div>}
              </div>

              <div className="col-md-6">
                <label className="contact-label mb-2" htmlFor="email">
                  <FaEnvelope className="contact-label-icon" />
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control glass-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="e.g. jane.doe@company.com"
                  value={form.email}
                  onChange={handleChange}
                  spellCheck="false"
                />
                {errors.email && <div className="small text-danger mt-1">{errors.email}</div>}
              </div>

              <div className="col-12">
                <label className="contact-label mb-2" htmlFor="subject">
                  <FaTag className="contact-label-icon" />
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={`form-control glass-input ${errors.subject ? "is-invalid" : ""}`}
                  placeholder="e.g. AI Engineer role at Acme"
                  value={form.subject}
                  onChange={handleChange}
                  spellCheck="false"
                />
                {errors.subject && <div className="small text-danger mt-1">{errors.subject}</div>}
              </div>

              <div className="col-12">
                <label className="contact-label mb-2" htmlFor="message">
                  <FaCommentDots className="contact-label-icon" />
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  ref={messageRef}
                  rows={1}
                  className={`form-control glass-input contact-message ${errors.message ? "is-invalid" : ""}`}
                  placeholder="Hi Waleed, I came across your portfolio and would like to discuss..."
                  value={form.message}
                  onChange={handleChange}
                />
                {errors.message && <div className="small text-danger mt-1">{errors.message}</div>}
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-3 mt-4">
              <button type="submit" className="contact-btn" disabled={isSubmitting}>
                <FaPaperPlane className="btn-icon" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>

            {submitError && (
              <div className="contact-feedback is-error" role="alert">
                {submitError}
              </div>
            )}
            {submitSuccess && !submitError && (
              <div className="contact-feedback is-success" role="status">
                {submitSuccess}
              </div>
            )}
          </form>
        </div>
      </Reveal>
    </div>
  );
};

export default Contact;
