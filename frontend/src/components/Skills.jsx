// src/components/Skills.jsx
import React, { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const skillGroups = [
  {
    title: "Programming & AI/ML",
    skills: [
      { name: "Python • NumPy • Pandas", percent: 85 },
      { name: "Machine Learning • Deep Learning", percent: 80 },
      { name: "Data Analysis & Predictive Analytics", percent: 85 },
    ],
  },
  {
    title: "Web & Application Development",
    skills: [
      { name: "HTML • CSS • TypeScript", percent: 80 },
      { name: ".NET • JavaScript", percent: 70 },
      { name: "MySQL • PostgreSQL", percent: 85 },
    ],
  },
  {
    title: "Cloud, Systems & Automation",
    skills: [
      { name: "Workflow Automation", percent: 80 },
      { name: "Linux • Networking & Security Ops", percent: 70 },
      { name: "Azure • SharePoint & CRM", percent: 65 },
    ],
  },
];

const Skills = () => {
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  // 2D array for the numbers we display
  const [displayPercents, setDisplayPercents] = useState(
    skillGroups.map((group) => group.skills.map(() => 0))
  );

  // Trigger animation when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const current = targets.map((group) =>
        group.map((p) => Math.round(p * progress))
      );
      setDisplayPercents(current);

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [animate]);

  return (
    <section id="skills" className="section-wrapper" ref={sectionRef}>
      <div className="container">
        <Reveal>
          <h2 className="section-title text-center mb-5">Skills</h2>
        </Reveal>

        {/* Main 3 cards */}
        {/* Use gap-4 and center so spacing is consistent like Projects section */}
        <div className="skills-row d-flex flex-wrap justify-content-center gap-4">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.05}>
              {/* Make wrapper control width; keep neo-card styling intact */}
              <div className="neo-card p-4 skill-card-wrapper">
                {/* Fix heading order for Lighthouse while keeping same visual size */}
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
                          width: animate
                            ? `${displayPercents[gi][si]}%`
                            : "0%",
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
    </section>
  );
};

export default Skills;