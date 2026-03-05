// src/components/Skills.jsx
import React, { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const skillGroups = [
  {
    title: "AI / ML & LLMs",
    skills: [
      { name: "Machine Learning • Deep Learning", percent: 88 },
      { name: "LLMs • RAG • LangChain • LangGraph", percent: 85 },
      { name: "Python • NumPy • Pandas • Scikit-learn", percent: 90 },
    ],
  },
  {
    title: "Data & Backend",
    skills: [
      { name: "Data Preprocessing • Clustering • ETL", percent: 85 },
      { name: "MySQL • PostgreSQL • MongoDB", percent: 82 },
      { name: "Node.js • Express • REST APIs", percent: 78 },
    ],
  },
  {
    title: "Web, Cloud & DevOps",
    skills: [
      { name: "React • HTML • CSS • JavaScript", percent: 82 },
      { name: "Azure • Docker • Linux", percent: 72 },
      { name: "Git • CI/CD • Workflow Automation", percent: 78 },
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

        <div className="skills-row d-flex flex-wrap justify-content-center gap-4">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.05}>
              <div className="neo-card p-4 skill-card-wrapper">
                <h3 className="mb-4 h5">{group.title}</h3>

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
          ))}
        </div>
    </div>
  );
};

export default Skills;