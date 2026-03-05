import { useState } from "react";
import Reveal from "./Reveal";

const initialState = {
  name: "",
  email: "",
  phone: "",
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

    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required.";
    } else {
      // allow + and digits and optional spaces
      const phoneRegex = /^\+\d[\d\s]{6,18}$/;
      if (!phoneRegex.test(form.phone)) {
        newErrors.phone =
          "Use international format, e.g. +12 3456789000";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // also check backend "success" flag to be extra safe
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSubmitSuccess("Thanks for reaching out! I’ll get back to you soon.");
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
          <h2 className="section-title text-center mb-5">Contact</h2>
        </Reveal>

        {/* Full-width card */}
        <Reveal delay={0.08}>
          <div className="neo-card contact-card p-4">
                <p className="text-center text-muted mb-4">
                  Have a question, collaboration idea, or opportunity? Fill out
                  the form and I&apos;ll get back to you.
                </p>

                <form noValidate onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-md-6">
                      <label className="form-label mb-1" htmlFor="name">
                        Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className={`form-control glass-input ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={handleChange}
                        spellCheck="false"
                      />
                      {errors.name && (
                        <div className="small text-danger mt-1">
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label mb-1" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control glass-input ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="e.g. john.doe@company.com"
                        value={form.email}
                        onChange={handleChange}
                        spellCheck="false"
                      />
                      {errors.email && (
                        <div className="small text-danger mt-1">
                          {errors.email}
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                      <label className="form-label mb-1" htmlFor="phone">
                        Phone *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`form-control glass-input ${
                          errors.phone ? "is-invalid" : ""
                        }`}
                        placeholder="e.g. +1 234 567 8900"
                        value={form.phone}
                        onChange={handleChange}
                        spellCheck="false"
                      />
                      {errors.phone && (
                        <div className="small text-danger mt-1">
                          {errors.phone}
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="col-md-6">
                      <label className="form-label mb-1" htmlFor="subject">
                        Subject *
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        className={`form-control glass-input ${
                          errors.subject ? "is-invalid" : ""
                        }`}
                        placeholder="e.g. Job Opportunity / Collaboration / Freelance"
                        value={form.subject}
                        onChange={handleChange}
                        spellCheck="false"
                      />
                      {errors.subject && (
                        <div className="small text-danger mt-1">
                          {errors.subject}
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label mb-1" htmlFor="message">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        className={`form-control glass-input contact-message ${
                          errors.message ? "is-invalid" : ""
                        }`}
                        placeholder="Hi Waleed, I came across your portfolio and would like to discuss..."
                        value={form.message}
                        onChange={handleChange}
                      />
                      {errors.message && (
                        <div className="small text-danger mt-1">
                          {errors.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit row */}
                  <div className="d-flex align-items-center gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary neon-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                    {submitError && (
                      <span className="small text-danger">{submitError}</span>
                    )}
                    {submitSuccess && !submitError && (
                      <span className="small text-success">
                        {submitSuccess}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </Reveal>
      </div>
  );
};

export default Contact;