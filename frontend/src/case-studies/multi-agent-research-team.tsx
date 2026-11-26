import CaseStudy from "@/components/case-study/CaseStudy";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the repository's README, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md,
// SECURITY.md, src (crew.py, agents.py, report.py, providers.py,
// web/jobs.py) and CI run 43831026791 for the test counts.
const project = projectBySlug("multi-agent-research-team")!;

const flow: DiagramSpec = {
  width: 920,
  height: 370,
  nodes: [
    { id: "ui", label: "React app", note: "live progress over SSE", x: 100, y: 60, kind: "actor" },
    { id: "api", label: "FastAPI", note: "one container, Render", x: 370, y: 60, width: 180 },
    { id: "db", label: "Postgres or SQLite", note: "jobs, events, heartbeats", x: 700, y: 60, width: 210, kind: "store" },
    { id: "research", label: "Research", note: "web search, 2 to 6 calls", x: 110, y: 200 },
    { id: "coding", label: "Coding", note: "no tools", x: 360, y: 200, width: 160 },
    { id: "synthesis", label: "Synthesis", note: "the 'manager', no tools", x: 610, y: 200 },
    { id: "check", label: "Report checks", note: "links, code parses", x: 610, y: 320 },
    { id: "search", label: "Serper, Tavily", note: "search, with fallback", x: 110, y: 320, kind: "external" },
    { id: "llm", label: "LLM via LiteLLM", note: "per-stage fallback", x: 840, y: 200, width: 150, kind: "external" },
  ],
  edges: [
    { from: "ui", to: "api", label: "SSE", both: true },
    { from: "api", to: "db", label: "jobs, events", both: true },
    { from: "api", to: "research", label: "job runner", labelOffset: [-30, 4] },
    { from: "research", to: "coding", label: "notes" },
    { from: "coding", to: "synthesis", label: "examples" },
    { from: "synthesis", to: "check", label: "report", labelOffset: [32, 4] },
    { from: "research", to: "search", dashed: true },
    { from: "synthesis", to: "llm", dashed: true },
  ],
};

export default function MultiAgentResearchTeamCaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole author, rebuilding a command-line prototype into a hosted web platform, written with an AI coding assistant; the commit history marks co-written commits."
      glance={[
        {
          label: "Orchestration",
          value: "A fixed three-stage pipeline: research, coding, synthesis. No agent delegates to another; only the research stage has a tool.",
        },
        {
          label: "Checks on the report",
          value: "Links must be URLs the search actually returned, and code blocks must parse. Nothing checks that a source supports its claim, or that the code runs.",
        },
        {
          label: "Resilience",
          value: "Persisted jobs, a heartbeat sweep and graceful drain on deploy; a stage that exhausts its retries re-runs on a fallback model.",
        },
        {
          label: "Quality",
          value: "Not measured. A typical live run takes about a minute and cites around nine sources; that is an anecdote, not an evaluation.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                Give it a technical topic and get back a cited report with code examples. The interesting constraint was running
                real agents on free tiers, where rate limits and restarts are routine, without a demo that falls over.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "Architecture",
          content: (
            <>
              <Figure caption="One container serves the app, the API and the event stream; the three stages run in order in a job thread.">
                <Diagram
                  spec={flow}
                  title="Multi-Agent Research Team architecture"
                  description="A React app submits a topic to a FastAPI service in one container on Render and streams progress over server-sent events. The service persists jobs, events and heartbeats in Postgres or SQLite. A job runner executes three stages in order: Research, which calls Serper or Tavily web search; Coding, with no tools; and Synthesis, with no tools. All stages call a language model through LiteLLM with per-stage fallback, and the finished report goes through link and code checks."
                />
              </Figure>
              <p>
                The stages are CrewAI agents, but they are not run as a crew that plans for itself. Each task is executed on its
                own, in a fixed order, with delegation and code execution switched off and a 6,000-character cap on what one
                stage passes to the next. The research agent is the only one with a tool: a web search with a budget of two,
                four or six calls depending on the depth requested. Its autonomy is choosing what to search for within that
                budget.
              </p>
              <p>
                Events are written to the database and streamed to the browser, and a reconnecting browser resumes from the last
                event it saw. Jobs are persisted before they start; a heartbeat every 15 seconds and a sweep every 30 mark a job
                that has gone silent for 90 seconds as interrupted, queued jobs are picked up after a restart, and a deploy
                gives running jobs 20 seconds to finish.
              </p>
              <Figure caption="A completed run with each stage's timing, searches and model requests.">
                <Screenshot image="research-team" alt="A completed research run on rate limiting a public REST API: the research, coding and manager agents each marked completed, with their timings, web searches and model requests." />
              </Figure>
            </>
          ),
        },
        {
          id: "decisions",
          title: "Decisions and trade-offs",
          content: (
            <ul>
              <li>
                <strong>A pipeline, not a self-organising crew.</strong> A crew that decides its own steps is harder to bound in
                cost and harder to recover mid-run. Running each stage separately means a failed stage can be retried, or
                re-run on another model, without starting over.
              </li>
              <li>
                <strong>A thread pool, not Celery or a queue service.</strong> One container on a free tier has no room for a
                broker; the database is the queue.
              </li>
              <li>
                <strong>Fallback per stage.</strong> Each model call retries with backoff, jitter and the provider&apos;s
                Retry-After within a 60-second budget; when that runs out, the current stage re-runs on the next configured
                model and later stages stay there. The code supports Groq, Gemini, OpenRouter, OpenAI-compatible endpoints and
                Ollama; the live demo&apos;s fallback is a second, smaller Groq model.
              </li>
              <li>
                <strong>Quotas that keep the demo free.</strong> Ten runs per visitor and sixty in total a day, one running at a
                time and five queued.
              </li>
            </ul>
          ),
        },
        {
          id: "evaluation",
          title: "Evaluation",
          content: (
            <>
              <p className="callout">
                The report&apos;s quality has not been measured. There is no set of topics with reference reports, no rubric, and
                no human rating of the output.
              </p>
              <p>What is checked is narrower, and the report states it in its own methodology section:</p>
              <ul>
                <li>
                  <strong>Citations.</strong> Every link in the report is compared with the URLs the search tool actually
                  returned; links that were not retrieved are flagged. This catches invented URLs. It does not check that a
                  retrieved page says what the report says it does, and a failed check does not stop the report.
                </li>
                <li>
                  <strong>Code.</strong> Python blocks are parsed to confirm they are syntactically valid. They are never run, so
                  &quot;runnable&quot; would overstate it.
                </li>
              </ul>
              <p>
                The software around the agents is tested: 185 backend tests (two of them against Postgres), 55 frontend tests and
                19 end-to-end browser tests in CI, with 90% backend coverage.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <ul>
              <li>No measurement of research quality or factual accuracy.</li>
              <li>A job interrupted mid-run is marked failed, not resumed from its last completed stage.</li>
              <li>A single instance; the demo&apos;s fallback stays within one provider.</li>
              <li>
                Next: a dozen topics with hand-written reference points, a check that each cited page contains the claim it
                supports, and resuming an interrupted job from its last finished stage.
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}
