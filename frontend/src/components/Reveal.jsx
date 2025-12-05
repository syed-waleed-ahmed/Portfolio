// src/components/Reveal.jsx
import { motion } from "framer-motion";

// make ESLint clearly see that `motion` is used in JS
const MotionDiv = motion.div;

const Reveal = ({ children, delay = 0 }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  );
};

export default Reveal;
