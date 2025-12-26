import React, { useCallback, useEffect, useMemo, useState } from "react";
import { loadSlim } from "tsparticles-slim";

const ParticlesBackground = () => {
  const [enabled, setEnabled] = useState(false);
  const [ParticlesComponent, setParticlesComponent] = useState(null);

  useEffect(() => {
    // Hard-disable on mobile / low-end scenarios for Lighthouse wins
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const isSmallScreen =
      typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)")?.matches;

    // navigator.deviceMemory is not supported everywhere; if missing, treat as unknown
    const lowMemory =
      typeof navigator !== "undefined" && "deviceMemory" in navigator
        ? navigator.deviceMemory <= 4
        : false;

    if (prefersReducedMotion || isSmallScreen || lowMemory) {
      setEnabled(false);
      return;
    }

    // Defer enabling until idle
    const enableLater = () => setEnabled(true);

    const id =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(enableLater, { timeout: 2000 })
        : window.setTimeout(enableLater, 1500);

    return () => {
      if (typeof id === "number") window.clearTimeout(id);
      else window.cancelIdleCallback?.(id);
    };
  }, []);

  useEffect(() => {
    // Dynamically import react-tsparticles only when enabled
    if (!enabled) return;

    let cancelled = false;

    (async () => {
      const mod = await import("react-tsparticles");
      if (!cancelled) setParticlesComponent(() => mod.default);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },

      // Lower FPS reduces CPU on slower devices.
      fpsLimit: 40,

      particles: {
        number: { value: 30, density: { enable: true, area: 1100 } },
        color: { value: ["#6366f1", "#22d3ee"] },
        links: {
          enable: true,
          color: "#4b5563",
          distance: 150,
          opacity: 0.22,
          width: 1,
        },
        move: { enable: true, speed: 0.7, outModes: { default: "out" } },
        opacity: { value: 0.42 },
        size: { value: { min: 1, max: 2 } },
      },

      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: true,
        },
      },

      // Retina can double work; for a background effect, it's not worth it.
      detectRetina: false,
    }),
    []
  );

  if (!enabled || !ParticlesComponent) return null;

  return (
    <ParticlesComponent
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