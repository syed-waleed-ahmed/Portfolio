// src/components/ParticlesBackground.jsx
import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  // ✅ Correct init for current tsparticles versions
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // useMemo so options object isn't recreated every render
  const options = useMemo(
    () => ({
      fullScreen: { enable: false }, // we control position via style below
      background: { color: "#020617" },
      fpsLimit: 60,

      particles: {
        number: { value: 60, density: { enable: true, area: 800 } },
        color: { value: ["#6366f1", "#22d3ee", "#ec4899"] },

        links: {
          enable: true,
          color: "#4b5563",
          distance: 130,
          opacity: 0.4,
          width: 1,
        },

        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          outModes: { default: "out" },
        },

        opacity: { value: 0.6 },
        size: { value: { min: 1, max: 3 } },
      },

      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
        },
        modes: {
          repulse: { distance: 120 },
          push: { quantity: 3 },
        },
      },

      detectRetina: true,
    }),
    []
  );

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
      }}
    />
  );
};

export default ParticlesBackground;