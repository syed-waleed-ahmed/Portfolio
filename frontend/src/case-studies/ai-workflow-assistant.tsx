import CaseStudy from "@/components/case-study/CaseStudy";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the repository's README, docs/architecture.md, docs/deployment.md,
// SECURITY.md, backend/app/agents (graph.py, verification.py, runner.py) and
// CI run 45018839209 on main (2026-11-22) for the test counts.
const project = projectBySlug("ai-workflow-assistant")!;

const graph: DiagramSpec = {
  width: 920,
  height: 380,
  nodes: [
    { id: "ui", label: "Next.js app", note: "Vercel", x: 100, y: 60, kind: "actor" },
    { id: "api", label: "FastAPI", note: "Render, one instance", x: 370, y: 60, width: 180 },
    { id: "db", label: "Postgres + storage", note: "Supabase: jobs, Parquet", x: 700, y: 60, width: 210, kind: "store" },
    { id: "plan", label: "Plan", note: "LLM picks up to 8 tools", x: 110, y: 200 },
    { id: "tools", label: "pandas tools", note: "16, deterministic", x: 360, y: 200, width: 180 },
    { id: "verify", label: "Verify", note: "did a tool succeed?", x: 650, y: 200 },
    { id: "report", label: "Report", note: "LLM, structured draft", x: 650, y: 320 },
    { id: "ground", label: "Ground", note: "check every figure", x: 360, y: 320, width: 180 },
    { id: "llm", label: "Groq", note: "gpt-oss-120b", x: 840, y: 260, width: 120, kind: "external" },
  ],
  edges: [
    { from: "ui", to: "api", label: "/api", both: true },
    { from: "api", to: "db", label: "jobs, data", both: true },
    { from: "api", to: "plan", label: "worker thread", labelOffset: [-36, 4] },
    { from: "plan", to: "tools", label: "tool calls" },
    { from: "tools", to: "verify" },
    { from: "verify", to: "report" },
    { from: "report", to: "ground", label: "draft" },
    { from: "ground", to: "report", label: "one correction", curve: 54, labelOffset: [0, 14], dashed: true },
    { from: "report", to: "llm", dashed: true },
  ],
};

export default function AiWorkflowAssistantCaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole author, rebuilding an earlier command-line prototype into a multi-user web service, written with an AI coding assistant; the commit history marks co-written commits."
      glance={[
        {
          label: "Safety property",
          value: "Nothing the model writes is executed. It chooses among 16 tested pandas tools, and calculated columns accept arithmetic only.",
        },
        {
          label: "Number check",
          value: "Each figure in the report's findings must match a value the tools computed, within half a unit of its last digit, or the report is corrected once and then flagged.",
        },
        {
          label: "Accuracy",
          value: "Not yet measured on a test set. One recorded run traced all 22 of its figures, which shows the mechanism works, not how often it is right.",
        },
        {
          label: "Cost per analysis",
          value: "13,000 to 17,000 tokens and 45 to 90 seconds on Groq's free tier, which allows roughly 12 to 15 analyses a day for the whole deployment.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                Asking a language model about a spreadsheet goes wrong in a specific way: the answer is fluent and the numbers
                in it are plausible and wrong. Letting the model write and run pandas code fixes the arithmetic but hands it an
                interpreter, which is a security problem on a multi-user service.
              </p>
              <p>
                The design goal was that every number a user reads has been computed by tested code, and that the model only
                decides which computations to run and how to explain them.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "Architecture",
          content: (
            <>
              <Figure caption="The service (top) and the LangGraph run behind one analysis (below). Only Plan and Report call the model.">
                <Diagram
                  spec={graph}
                  title="AI Workflow Assistant architecture"
                  description="A Next.js app on Vercel rewrites /api requests to a FastAPI service on Render, which claims analysis jobs from Supabase Postgres and reads datasets stored as Parquet. A worker thread runs a LangGraph graph: Plan, where the model picks up to eight tools; deterministic pandas tools; Verify, which checks that a tool succeeded; Report, where the model writes a structured draft using Groq; and Ground, which checks every figure and can send the draft back for one correction."
                />
              </Figure>
              <p>
                Uploads go straight to the backend with a signed five-minute ticket and are stored as Parquet. An analysis is a
                row in Postgres that a worker claims with a conditional update, heartbeats while it runs, and re-queues once if
                the heartbeat goes stale; progress events are written to a table the browser polls. Each run is bounded: 16 tool
                calls, five rounds, seven minutes and an 8,000-token request budget.
              </p>
              <Figure caption="A finished report on the bundled sample dataset, with the banner confirming its figures were verified.">
                <Screenshot image="ai-workflow-assistant" alt="A finished report on the bundled sales dataset: the question asked, a banner confirming all 16 figures were verified against computed results, a summary and key revenue metrics." />
              </Figure>
            </>
          ),
        },
        {
          id: "verification",
          title: "How a number is checked",
          content: (
            <>
              <p>After the model drafts a report, a deterministic step reads it back:</p>
              <ol>
                <li>
                  It extracts every number from the title, summary, data-quality note, key metrics, findings and anomalies,
                  understanding currency, percentages and thousands, millions and billions. Recommendations and stated
                  limitations are exempt.
                </li>
                <li>It skips dates, evidence references, integers up to 12 and calendar years.</li>
                <li>
                  Each remaining number must match a value from a successful tool result, the dataset profile, a tool argument or
                  the user&apos;s question, within half a unit of the last digit shown or 0.5%, whichever is larger.
                </li>
                <li>
                  If any fail and time allows, the report is regenerated once with the unverified figures listed; otherwise they
                  are flagged in the report and the run is marked partially verified.
                </li>
              </ol>
              <p className="callout">
                The check is about provenance, not meaning. A number can pass by coincidentally matching an unrelated computed
                value, numbers repeated from the question pass by design, and the words around a number are not checked at all:
                a correct figure attached to the wrong region would pass.
              </p>
            </>
          ),
        },
        {
          id: "security",
          title: "Security and reliability",
          content: (
            <ul>
              <li>Passwords hashed with Argon2id; sessions are random tokens stored only as hashes, in HttpOnly cookies, with double-submit CSRF protection.</li>
              <li>Another user&apos;s dataset or analysis answers 404, tested across 17 routes.</li>
              <li>Uploads are typed by their bytes, not their names, and checked for zip bombs; spreadsheet formulas are never evaluated, and exports escape cells that could become formulas.</li>
              <li>Calculated columns are parsed into a syntax tree that allows arithmetic only, tested against about 30 injection payloads.</li>
              <li>The service refuses to start with an unsafe production configuration.</li>
              <li>CI runs 375 backend tests against both SQLite and Postgres and 139 frontend tests on every change.</li>
            </ul>
          ),
        },
        {
          id: "decisions",
          title: "Decisions and trade-offs",
          content: (
            <ul>
              <li>
                <strong>Fixed tools instead of generated code.</strong> Questions the 16 tools cannot express get no answer,
                which is the price of never running model-written code.
              </li>
              <li>
                <strong>Polling instead of server-sent events.</strong> Progress is a table the browser polls: plainer to run
                behind the Vercel rewrite, at the cost of up to one poll interval of delay.
              </li>
              <li>
                <strong>No LangGraph checkpointing.</strong> A run that dies is re-queued once and starts again, which is
                acceptable for runs bounded at seven minutes.
              </li>
              <li>
                <strong>pandas, not DuckDB,</strong> so every tool shares one engine and one set of tests.
              </li>
            </ul>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <ul>
              <li>No measured accuracy: there is no set of questions with known correct reports to score against.</li>
              <li>The number check verifies provenance, not wording or attribution.</li>
              <li>One model provider with no fallback, and one dataset per analysis.</li>
              <li>No password reset, multi-factor authentication or audit log, and rate limits are per instance.</li>
              <li>
                Next: a small gold set of questions over the sample datasets with hand-checked answers, scored for both the
                figures and the claims made about them.
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}
