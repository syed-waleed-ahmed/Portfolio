import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const init = async (engine) => {
    await loadFull(engine);
  };

  const options = {
    fullScreen: { enable: false }, // we'll control positioning by style
    background: {
      color: "#020617",
    },
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
  };

  return (
    <Particles
      id="tsparticles"
      init={init}
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
