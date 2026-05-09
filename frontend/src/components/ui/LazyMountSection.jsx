import { Suspense } from "react";
import useInView from "@/hooks/useInView";

export default function LazyMountSection({ id, className = "", children }) {
  // Mount the section once it's within 300px of the viewport. The hook
  // disconnects after the first hit so this stays a one-shot trigger.
  const { ref, inView } = useInView({ threshold: 0.01, rootMargin: "300px 0px" });

  return (
    <section id={id} className={className} ref={ref}>
      {inView ? <Suspense fallback={null}>{children}</Suspense> : null}
    </section>
  );
}
