import React, { useCallback, useMemo, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // wait until page is idle / after first render
    const id = requestIdleCallback
      ? requestIdleCallback(() => setEnabled(true))
      : setTimeout(() => setEnabled(true), 1200);

    return () => {
      if (typeof id === "number") clearTimeout(id);
      else cancelIdleCallback?.(id);
    };
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: 45, density: { enable: true, area: 900 } }, // reduced
        color: { value: ["#6366f1", "#22d3ee"] }, // reduced
        links: {
          enable: true,
          color: "#4b5563",
          distance: 140,
          opacity: 0.25,
          width: 1,
        },
        move: { enable: true, speed: 0.8, outModes: { default: "out" } },
        opacity: { value: 0.45 },
        size: { value: { min: 1, max: 2 } },
      },
      interactivity: {
        events: {
          onHover: { enable: false }, // hover is costly
          onClick: { enable: false },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!enabled) return null;

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
