import { useEffect, useRef, useState, Suspense } from "react";

export default function LazyMountSection({ id, className = "", children }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setMounted(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: "300px 0px", threshold: 0.01 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id={id} className={className} ref={ref}>
      {mounted ? <Suspense fallback={null}>{children}</Suspense> : null}
    </section>
  );
}
