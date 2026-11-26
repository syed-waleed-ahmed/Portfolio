import CaseStudy from "@/components/case-study/CaseStudy";
import DataTable from "@/components/case-study/DataTable";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the repository's README, ARCHITECTURE.md, BENCHMARKS.md,
// SECURITY.md and src/llm_judge (diagnostics.py, judge.py, scoring.py), and
// CI run 43702401562 for the test and coverage figures.
const project = projectBySlug("llm-as-judge")!;

const flow: DiagramSpec = {
  width: 840,
  height: 390,
  nodes: [
    { id: "input", label: "Two outputs", note: "plus task, criteria", x: 100, y: 150, width: 180, kind: "actor" },
    { id: "scan", label: "Validate, scan", note: "six injection patterns", x: 310, y: 150, width: 180 },
    { id: "ab", label: "Judge A then B", note: "one LLM call", x: 520, y: 60, width: 170 },
    { id: "ba", label: "Judge B then A", note: "same call, swapped", x: 520, y: 240, width: 170 },
    { id: "parse", label: "Parse and repair", note: "schema, one retry", x: 730, y: 150, width: 180 },
    { id: "merge", label: "Merge verdicts", note: "flag if winner flips", x: 730, y: 330, width: 180 },
    { id: "out", label: "Verdict + warnings", note: "library, CLI, API, UI", x: 470, y: 340, width: 200, kind: "actor" },
  ],
  edges: [
    { from: "input", to: "scan" },
    { from: "scan", to: "ab", label: "A first", labelOffset: [-18, -6] },
    { from: "scan", to: "ba", label: "B first", labelOffset: [-18, 16] },
    { from: "ab", to: "parse" },
    { from: "ba", to: "parse" },
    { from: "parse", to: "merge" },
    { from: "merge", to: "out" },
  ],
};

export default function LlmAsJudgeCaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole author and maintainer of the PyPI package, written with an AI coding assistant; the commit history marks co-written commits."
      glance={[
        {
          label: "What it is",
          value: "One judging engine behind a Python library, a CLI, a FastAPI service and a Streamlit dashboard, published on PyPI as llm-as-judge-platform.",
        },
        {
          label: "Validity",
          value: "Not yet measured. No agreement study against human labels exists, so its verdicts are untested as measurements, however well the software works.",
        },
        {
          label: "Bias handling",
          value: "Order-swapped judging with a flag when the winner flips, plus heuristic warnings for verbosity, self-preference and injected instructions.",
        },
        {
          label: "Software quality",
          value: "619 tests on Python 3.11 to 3.14 and 98% line coverage of the library package in CI; the dashboard is outside that figure.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                Many qualities of an LLM&apos;s output have no exact-match answer: whether a summary is faithful, whether a
                support reply is helpful, whether an agent took a sensible path. An LLM judge can score them at scale, but a
                naive one is easy to fool and has known biases: it prefers the answer it reads first, it prefers longer
                answers, and a model may prefer its own family&apos;s output.
              </p>
              <p>
                The project packages a judge that tries to make those failure modes visible: structured verdicts that must
                parse, order-swapped comparison, warnings when a known bias could explain the result, and resistance to
                instructions planted in the outputs being judged.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "Architecture",
          content: (
            <>
              <Figure caption="A pairwise judgment with order swapping on. The two judge calls run in parallel, through Groq, Ollama or any OpenAI-compatible API behind one interface.">
                <Diagram
                  spec={flow}
                  title="LLM-as-Judge pairwise flow"
                  description="Two outputs, with the task and criteria, are validated and scanned for six injection patterns. The judge is then called twice in parallel, once with output A first and once with output B first. Both responses are parsed against a schema with one repair retry, the verdicts are merged and a flag is raised if the winner changes with the order, and the verdict with its warnings is returned through the library, CLI, API or dashboard."
                />
              </Figure>
              <p>
                Six evaluation modes share the engine: pairwise, pointwise, reference-based, ranking, RAG faithfulness and
                agent trajectories. Every provider implements one protocol, so the judge does not know whether it is talking
                to Groq, a local Ollama model or a mock in the tests. Datasets run through a checkpointed JSONL runner, and
                experiments can be stored in SQLite or Postgres and compared.
              </p>
              <p>A few principles hold across the codebase:</p>
              <ul>
                <li>
                  <strong>Numbers override words.</strong> Winners are recomputed from the parsed scores; if the judge&apos;s prose
                  says A but its scores say B, the scores win.
                </li>
                <li>
                  <strong>Warnings never change scores.</strong> A suspected bias is reported beside the verdict, not corrected
                  into it, so a reader can see both.
                </li>
                <li>
                  <strong>No silent fallback.</strong> Switching to another provider after a failure is opt-in, because a
                  verdict from a different judge is a different measurement.
                </li>
              </ul>
              <Figure caption="A pairwise verdict in the hosted playground, with the verbosity warning shown beside the scores.">
                <Screenshot image="llm-as-judge" alt="A pairwise verdict in the LLM-as-Judge playground: output B preferred at 0.89 to 0.11, with a warning of possible verbosity bias and a bar chart of scores." />
              </Figure>
            </>
          ),
        },
        {
          id: "bias",
          title: "What the bias checks actually do",
          content: (
            <>
              <p>The names suggest more than the code does, so here is exactly what each one computes:</p>
              <DataTable caption="What each bias check computes">
                <thead>
                  <tr>
                    <th scope="col">Check</th>
                    <th scope="col">How it decides</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Position</th>
                    <td>The winner differs between the two orders. Only when order swapping is on, which it is not by default.</td>
                  </tr>
                  <tr>
                    <th scope="row">Verbosity</th>
                    <td>The longer output won and is at least twice as long, by word count.</td>
                  </tr>
                  <tr>
                    <th scope="row">Self-preference</th>
                    <td>The judge&apos;s model family name matches a candidate&apos;s, when the caller supplies the candidates&apos; model names.</td>
                  </tr>
                  <tr>
                    <th scope="row">Injection</th>
                    <td>One of six regular expressions matches, such as text telling the judge to ignore its instructions or to award a score.</td>
                  </tr>
                </tbody>
              </DataTable>
              <p>
                Only the position check measures the judge&apos;s behaviour. The other three are heuristics that point a reader
                at results worth a second look; they cannot confirm a bias, and a determined injection that avoids the
                patterns will not be flagged.
              </p>
            </>
          ),
        },
        {
          id: "evaluation",
          title: "Evaluation",
          content: (
            <>
              <p className="callout">
                The software is well tested; the judge as a measuring instrument is not. There is no study of how often its
                verdicts agree with human preferences, no published position-flip rate, and the library&apos;s agreement
                statistics (Cohen&apos;s kappa, Spearman correlation) have so far only compared one judge run with another.
              </p>
              <p>
                The nine bundled benchmark sets are small and synthetic, 49 rows in all, built so that one system&apos;s answers
                are better. The one live result, on six instruction-following rows, scored the stronger system 1.000 and the
                weaker 0.074, which shows the pipeline works end to end and nothing more; the repository says six rows are far
                too few for any statistical claim.
              </p>
              <p>What has been measured is the engineering:</p>
              <ul>
                <li>619 tests pass in CI on Python 3.11, 3.12, 3.13 and 3.14, with 26 more against Postgres.</li>
                <li>Line coverage of the library package is 98%; the Streamlit dashboard, about 2,200 lines, is not counted.</li>
                <li>
                  The judging machinery adds 0.23 ms per judgment at the median, and a live judgment takes about a second, almost
                  all of it the model.
                </li>
              </ul>
              <p>
                The study that would make it a measurement is clear: run it against a public set of human preference labels,
                such as MT-Bench&apos;s human judgments, with order swapping on, and report agreement and the flip rate with
                intervals. It needs a model provider&apos;s quota rather than new code, since the statistics already exist.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <ul>
              <li>No validation against human labels, so its scores should be read as relative, not calibrated.</li>
              <li>Biases are mitigated or flagged, not removed, and order swapping is off unless asked for.</li>
              <li>The REST API is not hosted publicly; the demo runs the library inside Streamlit, capped per session and per day.</li>
              <li>Jobs run on a single node with an in-process queue.</li>
              <li>Next: the human-agreement study above, then making order swapping the default if the flip rate warrants it.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
