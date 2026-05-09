import { useEffect, useRef, useState } from "react";

/**
 * useInView — observe an element with IntersectionObserver and flip a
 * boolean to true the first time it enters the viewport. Disconnects
 * after the first hit, so it's a one-shot trigger by design.
 *
 * Usage:
 *   const { ref, inView } = useInView({ threshold: 0.2, rootMargin: "0px" });
 *   <div ref={ref}>{inView ? "shown" : null}</div>
 *
 * In environments without IntersectionObserver (older browsers, SSR),
 * `inView` initializes to `true` so content always renders.
 */
export default function useInView({ threshold = 0.18, rootMargin = "0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(
    () => typeof window !== "undefined" && !("IntersectionObserver" in window)
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return { ref, inView };
}
