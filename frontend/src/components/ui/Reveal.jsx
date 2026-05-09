import useInView from "@/hooks/useInView";

const Reveal = ({ children, delay = 0, className = "" }) => {
  const { ref, inView } = useInView({ threshold: 0.18 });

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
};

export default Reveal;
