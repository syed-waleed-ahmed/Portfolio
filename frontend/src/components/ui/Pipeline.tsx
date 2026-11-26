// A project's core flow as an ordered list, drawn as a strip of steps. It is a
// real list, so a screen reader announces the steps and their count.
export default function Pipeline({ steps, label }: { steps: readonly string[]; label: string }) {
  return (
    <ol className="pipeline" aria-label={label}>
      {steps.map((step) => (
        <li key={step} className="pipeline__step">
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
