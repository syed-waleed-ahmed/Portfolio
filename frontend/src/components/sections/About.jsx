import { FaUserAstronaut, FaGraduationCap } from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";

const About = () => {
  return (
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2 className="section-title">About Me &amp; Education</h2>
            <p className="section-subtitle">
              Half full-stack engineer, half AI/ML. Here&apos;s a quick
              summary of how I got here and what I&apos;m working on now.
            </p>
          </div>
        </Reveal>

        <div className="row g-4 align-items-stretch justify-content-center">
          <div className="col-md-6 d-flex">
            <Reveal delay={0.04} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaUserAstronaut /></span>
                  My Approach
                </div>
                <p className="mb-3">
                  My background is split between full-stack engineering and
                  AI/ML. That mix shapes how I work: I build models the way
                  I&apos;d build any other service, with proper APIs, error
                  handling, and observability. Not notebooks that only run on my
                  machine.
                </p>
                <p className="mb-3">
                  My Master&apos;s thesis at <strong>MemorAIz</strong> was{" "}
                  <strong>RemindrAI</strong>, a serverless AI backend that
                  schedules reminders and chats with users across Email,
                  WhatsApp, Telegram, and Discord. I packaged it as a drop-in
                  capability other apps can reuse. At <strong>Fruugle</strong> I
                  built the ML that matches and categorizes the same grocery
                  item across six Italian supermarket chains, so the app could
                  compare prices across 80K+ scraped products.
                </p>
                <p className="mb-0">
                  Before that, a year at <strong>Jubilee Life Insurance</strong>{" "}
                  rotating through cybersecurity, web development, and database
                  administration. That breadth means I can wire up a whole
                  system, not only the ML parts.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="col-md-6 d-flex">
            <Reveal delay={0.08} className="w-100">
              <div className="neo-card about-card flex-fill h-100 p-4 d-flex flex-column">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaGraduationCap /></span>
                  Education
                </div>
                <ul className="timeline timeline-fill flex-grow-1 d-flex flex-column justify-content-between mb-0">
                  <li>
                    <div className="fw-semibold">
                      Master&apos;s in Automation Engineering
                    </div>
                    <div className="timeline-meta">
                      Alma Mater Studiorum - Universit&agrave; di Bologna, Italy
                      <br />
                      Sep 2024 - Present
                    </div>
                  </li>

                  <li>
                    <div className="fw-semibold">
                      Erasmus+ Mobility
                    </div>
                    <div className="timeline-meta">
                      University of Twente, Enschede, Netherlands
                      <br />
                      Sep 2025 - Jan 2026
                    </div>
                  </li>

                  <li>
                    <div className="fw-semibold">
                      Bachelor&apos;s in Electrical Engineering
                    </div>
                    <div className="timeline-meta">
                      NED University of Engineering and Technology, Karachi,
                      Pakistan
                      <br />
                      Oct 2019 - Aug 2023 &middot; CGPA: 3.46
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
  );
};

export default About;
