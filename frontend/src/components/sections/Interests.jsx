import { FaCompass, FaSearchPlus } from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";

const Interests = () => {
  return (
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2 className="section-title">
              Interests &amp; What I&apos;m Looking For
            </h2>
            <p className="section-subtitle">
              The kind of work I&apos;d like to do next, and the topics I&apos;m
              currently digging into.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="neo-card interests-card p-4">
            <div className="row g-4 align-items-start">
              <div className="col-lg-7">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaCompass /></span>
                  Where I Want to Go Next
                </div>
                <p>
                  I&apos;m looking for <strong>AI engineer</strong>,{" "}
                  <strong>ML engineer</strong>, or <strong>full-stack AI</strong>{" "}
                  roles where I can own a system end to end, from the model up
                  through the API and the interface that someone actually clicks
                  on.
                </p>
                <p className="mb-0">
                  What I care about: clean architecture, reproducible workflows,
                  and the engineering between &ldquo;this notebook works&rdquo;
                  and &ldquo;real users use this every day.&rdquo;
                </p>
              </div>

              <div className="col-lg-5">
                <div className="card-heading">
                  <span className="card-heading-icon"><FaSearchPlus /></span>
                  Topics I&apos;m Exploring
                </div>
                <ul className="interests-list mb-0">
                  <li>Multi-agent systems &amp; tool use</li>
                  <li>RAG pipelines &amp; retrieval quality</li>
                  <li>LLM evaluation &amp; observability</li>
                  <li>Computer vision &amp; multimodal models</li>
                  <li>MLOps &amp; cloud deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
  );
};

export default Interests;
