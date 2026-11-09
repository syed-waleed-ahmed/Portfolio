import { useEffect, useRef } from "react";
import { locations, locationsCaption } from "@/data/about";
import "./LocationGlobe.css";

// The drawing buffer, in pixels. About 2.4 times the 19rem (304px) the globe
// is shown at, so its dots stay sharp on a 2x screen; past 1920px, where the
// root font scales the globe up to 456px, it is a little soft.
const CANVAS_SIZE = 720;

// Turns a latitude and longitude into the rotation that faces it, per cobe's docs.
const DEGREES = Math.PI / 180;
const phiFacing = (longitude) => Math.PI - (longitude * DEGREES - Math.PI / 2);
const CENTRE = { latitude: 38, longitude: 32 }; // Between all three places.
const BASE_PHI = phiFacing(CENTRE.longitude);
const THETA = CENTRE.latitude * DEGREES * 0.55;

// It sways rather than spins: a full turn would hide all three places behind
// the globe for half of every rotation.
const SWAY = 0.45;
const SWAY_SPEED = 0.00022;

const CYAN = [0.133, 0.827, 0.933];

const pairs = (list) => list.slice(1).map((place, i) => [list[i], place]);

// A decorative globe marking where the degrees were earned. The caption beside
// it says the same thing in words, so the canvas is hidden from assistive
// technology.
//
// cobe loads only as the block nears the viewport and draws only while it is on
// screen. Under reduced motion it draws one still frame. Without WebGL it never
// fades in and the caption stands alone.
const LocationGlobe = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !("IntersectionObserver" in window)) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let globe = null;
    let frame = 0;
    let onScreen = false;
    let loading = false;
    let disposed = false;

    const draw = (time) => {
      globe.update({ phi: BASE_PHI + Math.sin(time * SWAY_SPEED) * SWAY });
      if (onScreen && !still) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    const load = async () => {
      loading = true;
      // Probed only now, so a screen where the globe is hidden never creates
      // a WebGL context at all. On a spare canvas: cobe does not fail on a
      // missing context, and one requested on the real canvas would fix its
      // settings first. The probe's context is released straight away.
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") || probe.getContext("webgl");
      if (!gl) return;
      gl.getExtension("WEBGL_lose_context")?.loseContext();

      try {
        const { default: createGlobe } = await import("cobe");
        if (disposed) return;
        globe = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          phi: BASE_PHI,
          theta: THETA,
          dark: 1,
          diffuse: 1.2,
          mapSamples: 16000,
          mapBrightness: 5,
          mapBaseBrightness: 0.02,
          baseColor: [0.32, 0.4, 0.56],
          markerColor: CYAN,
          glowColor: [0.16, 0.24, 0.42],
          markers: locations.map(({ coordinates }) => ({ location: coordinates, size: 0.05 })),
          arcs: pairs(locations).map(([from, to]) => ({ from: from.coordinates, to: to.coordinates })),
          arcColor: CYAN,
          arcWidth: 0.6,
          arcHeight: 0.25,
        });
        canvas.dataset.ready = "true";
        if (onScreen || still) start();
      } catch {
        // No WebGL, or the chunk failed. The caption does not depend on either.
      }
    };

    const observer = new IntersectionObserver(
      // The newest entry is the current state; a batch can hold older ones.
      (entries) => {
        onScreen = entries.at(-1).isIntersecting;
        if (onScreen && !loading) load();
        if (onScreen && globe) start();
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(canvas);

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      globe?.destroy();
    };
  }, []);

  return (
    <div className="location-globe">
      <canvas
        ref={canvasRef}
        className="location-globe__canvas"
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        aria-hidden="true"
      />
      <p className="location-globe__caption">{locationsCaption}</p>
    </div>
  );
};

export default LocationGlobe;
