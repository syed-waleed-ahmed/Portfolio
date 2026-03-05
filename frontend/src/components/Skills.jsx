// src/components/Skills.jsx
import React, { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const skillGroups = [
  {
    title: "AI / ML & LLMs",
    skills: [
      { name: "Machine Learning • Deep Learning", percent: 82 },
      { name: "LLMs • RAG • OpenAI • Gemini", percent: 88 },
      { name: "Python • PyTorch • Scikit-learn", percent: 88 },
    ],
  },
  {
    title: "Data & Backend",
    skills: [
      { name: "Data Preprocessing • Clustering • ETL", percent: 85 },
      { name: "PostgreSQL • MySQL • pgvector", percent: 78 },
      { name: "Node.js • Express • REST APIs", percent: 72 },
    ],
  },
  {
    title: "Web, Frameworks & Tools",
    skills: [
      { name: "React • Next.js • JavaScript", percent: 80 },
      { name: "Git • CI/CD • Power BI", percent: 72 },
      { name: "Mastra • OpenAI Gym • Vercel", percent: 70 },
    ],
  },
];

const Skills = () => {
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const [animate, setAnimate] = useState(false);

  const [displayPercents, setDisplayPercents] = useState(
    skillGroups.map((group) => group.skills.map(() => 0))
  );

  // Trigger animation when section enters viewport
  useEffect(() => {
    // If IntersectionObserver isn't available, just animate immediately
    if (!("IntersectionObserver" in window)) {
      setAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  // Animate numbers from 0 → target when animate=true
  useEffect(() => {
    if (!animate) return;

    const targets = skillGroups.map((g) => g.skills.map((s) => s.percent));
    const duration = 1500; // ms
    const start = performance.now();

    // Reduce React renders: update at ~20fps (every 50ms)
    const minFrameInterval = 50;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);

      // Throttle state updates
      if (now - lastUpdateRef.current >= minFrameInterval || progress === 1) {
        lastUpdateRef.current = now;

        const current = targets.map((group) =>
          group.map((p) => Math.round(p * progress))
        );
        setDisplayPercents(current);
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <div className="container" ref={sectionRef}>
        <Reveal>
          <h2 className="section-title text-center mb-5">Skills</h2>
        </Reveal>

        <div className="row g-4 justify-content-center">
          {skillGroups.map((group, gi) => (
            <div className="col-md-6 col-lg-4 d-flex" key={group.title}>
              <Reveal delay={gi * 0.05} className="w-100">
                <div className="neo-card h-100 p-4">
                  <h3 className="mb-4">{group.title}</h3>

                  {group.skills.map((skill, si) => (
                    <div className="mb-3" key={skill.name}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-percent">
                          {displayPercents[gi][si]}%
                        </span>
                      </div>

                      <div className="progress skill-progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          aria-label={`${skill.name} proficiency`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={displayPercents[gi][si]}
                          style={{
                            width: animate ? `${displayPercents[gi][si]}%` : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Skills;