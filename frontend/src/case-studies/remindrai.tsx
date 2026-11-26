import CaseStudy from "@/components/case-study/CaseStudy";
import DataTable from "@/components/case-study/DataTable";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the thesis (University of Bologna, 2026) and the RemindrAI,
// console and evaluation documents in MemorAIz's private repositories. The
// repositories are MemorAIz property, so this page describes the design in
// prose and redrawn diagrams and quotes no code, schema or internal screen.
const project = projectBySlug("remindrai")!;

const system: DiagramSpec = {
  width: 930,
  height: 420,
  nodes: [
    { id: "host", label: "Host assistant", note: "embeds the capability", x: 130, y: 70, width: 190, kind: "actor" },
    { id: "console", label: "Operator console", note: "Next.js, no database", x: 450, y: 70, width: 190 },
    { id: "llm", label: "OpenAI", note: "via Vercel AI SDK", x: 795, y: 70, kind: "external" },
    { id: "queue", label: "Upstash QStash", note: "minute tick, signed jobs", x: 130, y: 220, width: 190, kind: "external" },
    { id: "api", label: "RemindrAI API", note: "Next.js routes, Vercel fra1", x: 450, y: 220, width: 210 },
    { id: "providers", label: "Channel providers", note: "email, WhatsApp, Telegram, Discord", x: 795, y: 220, width: 260, kind: "external" },
    { id: "db", label: "Turso / libSQL", note: "raw SQL, EU primary", x: 450, y: 360, width: 190, kind: "store" },
  ],
  edges: [
    { from: "host", to: "api", label: "tool call, scoped key" },
    { from: "console", to: "api", label: "admin and org API", labelOffset: [72, 4] },
    { from: "api", to: "llm", label: "channel turns" },
    { from: "queue", to: "api", label: "tick, jobs", both: true },
    { from: "api", to: "providers", label: "send, webhooks", both: true },
    { from: "api", to: "db", label: "claims, records", both: true, labelOffset: [62, 4] },
  ],
};

const lifecycle: DiagramSpec = {
  width: 960,
  height: 350,
  nodes: [
    { id: "pending", label: "pending", note: "due at a UTC instant", x: 110, y: 175, width: 180 },
    { id: "queued", label: "queued", note: "batch-claimed", x: 340, y: 175, width: 160 },
    { id: "processing", label: "processing", note: "claimed by one worker", x: 580, y: 175, width: 190 },
    { id: "sent", label: "sent", note: "accepted by provider", x: 850, y: 60, width: 170 },
    { id: "failed", label: "failed", note: "dead letter, alert", x: 850, y: 290, width: 170 },
  ],
  edges: [
    { from: "pending", to: "queued", label: "tick", labelOffset: [0, -14] },
    { from: "queued", to: "processing", label: "worker", labelOffset: [0, -14] },
    { from: "processing", to: "sent", label: "all targets sent", labelOffset: [-46, -6] },
    { from: "processing", to: "failed", label: "attempts used up", labelOffset: [-46, 16] },
    { from: "processing", to: "pending", label: "retry after backoff", curve: 110 },
    { from: "processing", to: "pending", label: "reaper: stuck over 5 min", curve: -110, labelOffset: [0, 20], dashed: true },
    { from: "sent", to: "failed", label: "provider fails it later", dashed: true, labelOffset: [-4, 4] },
  ],
};

const RUNS = [
  { run: "Run B, 2 passes", a: "179/184 (97.3%)", b: "178/184 (96.7%)" },
  { run: "Run C, 2 passes", a: "177/184 (96.2%)", b: "180/184 (97.8%)" },
  { run: "Run D, 3 passes", a: "268/276 (97.1%)", b: "268/276 (97.1%)" },
];

const BENCH = [
  { size: "1K", p50: "7.5", p95: "11.4", rate: "12,453" },
  { size: "10K", p50: "7.9", p95: "9.5", rate: "11,353" },
  { size: "100K", p50: "11.1", p95: "133.7", rate: "4,933" },
];

export default function RemindrAICaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole developer, as my MSc thesis: requirements, architecture, implementation, tests and evaluation. Supervised by Prof. Luigi Di Stefano (University of Bologna), with a company tutor at MemorAIz as the stakeholder."
      glance={[
        {
          label: "Delivery guarantee",
          value: "At most one send per reminder and channel, with retries, backoff and a dead-letter state. A provider accepting a message is not counted as delivery.",
        },
        {
          label: "Agent evaluation",
          value: "92 author-written cases, each scored by the automated checks its expected outcome names. Two models over three repeat runs passed 96.2 to 97.8% of case-runs, and every security check passed.",
        },
        {
          label: "Claim benchmark",
          value: "Median time to claim a batch of 100 due reminders: 7.5 ms with 1K pending, 11.1 ms with 100K. Local libSQL on one machine; absolute numbers will not transfer.",
        },
        {
          label: "Tests",
          value: "670 in the backend and 146 in the console, including 25 failure-injection tests that race workers and ticks against a real SQL engine.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                Every conversational assistant eventually wants reminders, and each one that builds them alone rebuilds the
                same fragile parts: a scheduler on a platform that has none, a model allowed to schedule things, channel
                integrations, and tenants that must never see each other&apos;s data. The thesis asks whether that can be
                built once, as a service other assistants embed, and still be correct.
              </p>
              <p>It splits the problem into four:</p>
              <ol>
                <li>
                  <strong>Scheduling without a scheduler.</strong> Serverless functions cannot sleep until 9:00 tomorrow, and
                  the hosting tier&apos;s own cron runs once a day.
                </li>
                <li>
                  <strong>Scheduling from natural language with bounded authority.</strong> The model may create a reminder;
                  it must not decide whose reminder it is.
                </li>
                <li>
                  <strong>Representing the channel decision.</strong> Which of email, WhatsApp, Telegram or Discord a reminder
                  goes to, and what &quot;sent&quot; means on each.
                </li>
                <li>
                  <strong>Safe multi-tenancy.</strong> Many host apps on one deployment, each provably confined to its own
                  users.
                </li>
              </ol>
              <p>
                A design goal that ran through every chapter: make silent failures audible. A reminder that never arrives,
                and that nobody notices never arrived, is the failure that matters.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "Architecture",
          content: (
            <>
              <Figure caption="The system around RemindrAI. Dashed boxes are third-party services; arrows show who calls whom.">
                <Diagram
                  spec={system}
                  title="RemindrAI system context"
                  description="A host assistant calls the RemindrAI API with a scoped key. The operator console calls its admin and organisation API. The API calls OpenAI for conversations on messaging channels, exchanges a minute tick and signed jobs with Upstash QStash, sends to and receives verified webhooks from the four channel providers, and reads and writes a Turso libSQL database."
                />
              </Figure>
              <p>
                RemindrAI is a set of Next.js API routes on Vercel, pinned to the Frankfurt region, over one Turso (libSQL)
                database queried with raw SQL. A host assistant reaches it in one of two ways: a coupled Mastra capability
                registered in a line of code, or a portable adapter that lets the host supply each user&apos;s identity. Both
                expose six tools to the host&apos;s agent: create, list, get, update and cancel a reminder, and send a message.
              </p>
              <p>
                When a host calls in, the request is admitted in a fixed order: the credential is classified and its tenant
                becomes authoritative, then the rate limit, the tenant&apos;s policy, its entitlements and its quota, and
                finally a check that any object named in the call belongs to that tenant. The stored reminder carries a UTC
                instant and an IANA time zone, so &quot;9:00 every Monday&quot; survives daylight-saving changes.
              </p>
              <p>
                Messages that arrive on the four channels come in as webhooks. Each is verified by its provider&apos;s scheme
                (HMAC for Twilio, a secret token for Telegram, Ed25519 for Discord, Svix for email), deduplicated, and handed
                to RemindrAI&apos;s own agent, which has at most six tool steps over a 20-message window.
              </p>
              <Figure caption="From the thesis poster, which I made for it: a chat request and the same reminder arriving on four channels. An illustration, not a screenshot of the product.">
                <Screenshot image="remindrai" alt="A chat message asking for a reminder, the task and time the assistant understood, and the same reminder arriving on WhatsApp, Telegram, Discord and Email." />
              </Figure>
            </>
          ),
        },
        {
          id: "delivery",
          title: "Delivering a reminder once",
          content: (
            <>
              <Figure caption="A reminder's states. Solid arrows are the normal path; dashed ones are recovery.">
                <Diagram
                  spec={lifecycle}
                  title="Reminder delivery lifecycle"
                  description="A pending reminder is batch-claimed into queued by the minute tick, then claimed by exactly one worker into processing. From processing it becomes sent when every target is sent, returns to pending after a backoff when a send fails and attempts remain, or becomes failed, a dead letter with an alert, when attempts are used up. A reaper returns rows stuck for over five minutes to pending. A provider can later move a sent reminder to failed."
                />
              </Figure>
              <p>
                An external tick calls the scheduler every minute. It first returns any row that has been locked for more
                than five minutes to <code>pending</code>, then claims due rows in batches with one conditional update that
                selects pending, due rows past their backoff, oldest first, and returns what it claimed. The claimed rows are
                queued as signed jobs, and each worker claims its single row again before sending. Two claims make
                correctness independent of whether the queue delivers a job once, twice or late: the second worker to arrive
                claims nothing and stops.
              </p>
              <p>
                Retries live in the database, not the queue. A failed send returns the row to <code>pending</code> with a
                backoff drawn uniformly between zero and the smaller of an hour and 30 seconds doubled per attempt. After five
                attempts the row becomes <code>failed</code>, a dead letter an operator can inspect and re-queue, and an alert
                is raised. Each reminder carries the list of channel targets already sent, so a retry never resends to a
                channel that succeeded.
              </p>
              <p className="callout">
                The guarantee is <strong>at most once per channel target</strong>, and <code>sent</code> means the provider
                accepted the message, not that it arrived. The evaluation found the agent telling users an email had been
                &quot;delivered&quot; when it had only been accepted, which is how that distinction ended up written into the
                prompt.
              </p>
              <p>
                The tick stamps a heartbeat, and the health check fails when the heartbeat goes stale, so a scheduler that
                stops is noticed by the uptime probe rather than by a user who missed a reminder.
              </p>
            </>
          ),
        },
        {
          id: "authority",
          title: "Tenancy and the agent's authority",
          content: (
            <>
              <p>
                The model is allowed to propose what a reminder says and when it fires. It is never allowed to say whose it is.
                The owner and the tenant come from the credential and the request context, and appear in no tool&apos;s
                parameter schema; anything extra in the model&apos;s arguments is stripped by validation, every lookup is
                scoped to the authenticated owner, and the word &quot;self&quot; resolves to that owner. A prompt injection can
                make the model ask for another user&apos;s reminders, but there is no argument through which the request could
                reach them.
              </p>
              <p>Tenant isolation is checked at four independent depths, so a mistake at one is caught by the next:</p>
              <DataTable caption="Where tenant isolation is checked">
                <thead>
                  <tr>
                    <th scope="col">Depth</th>
                    <th scope="col">What it checks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Credential</th>
                    <td>The API key&apos;s tenant is authoritative; a payload naming another tenant is rejected.</td>
                  </tr>
                  <tr>
                    <th scope="row">Object</th>
                    <td>Every user-addressed operation verifies ownership; a mismatch is a 404, so it reveals nothing.</td>
                  </tr>
                  <tr>
                    <th scope="row">Query</th>
                    <td>The tenant predicate is in the SQL itself, and no route takes a tenant as a parameter.</td>
                  </tr>
                  <tr>
                    <th scope="row">Policy</th>
                    <td>Suspension, subscription state and overrides apply before any work is done.</td>
                  </tr>
                </tbody>
              </DataTable>
              <p>
                API keys are per organisation, scoped to data or administration, stored only as hashes, shown once, and can
                expire or be revoked from the operator console, whose own sessions are encrypted cookies behind a
                per-request content security policy. Data-subject export and erasure live in the API: erasure removes a
                user&apos;s data across the tables that hold it, child rows first, is safe to repeat, and leaves an audit trail with the
                person pseudonymised. The thesis claims no legal compliance; it describes the mechanism.
              </p>
            </>
          ),
        },
        {
          id: "decisions",
          title: "Decisions and trade-offs",
          content: (
            <>
              <p>Each decision is recorded in the thesis with what it costs.</p>
              <DataTable caption="Each decision, what it replaced, and what it costs">
                <thead>
                  <tr>
                    <th scope="col">Decision</th>
                    <th scope="col">Instead of</th>
                    <th scope="col">Accepted cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Retry state in the database</td>
                    <td>The queue&apos;s own retries</td>
                    <td>The scheduler owns backoff logic</td>
                  </tr>
                  <tr>
                    <td>Two claims, per batch and per worker</td>
                    <td>Trusting the queue to deliver once</td>
                    <td>One extra write per send</td>
                  </tr>
                  <tr>
                    <td>External minute tick, with a health check that fails when it stops</td>
                    <td>The platform&apos;s daily cron</td>
                    <td>A second service on the critical path</td>
                  </tr>
                  <tr>
                    <td>Tenant derived from the credential</td>
                    <td>Tenant asserted in the request</td>
                    <td>Every route resolves identity first</td>
                  </tr>
                  <tr>
                    <td>Raw SQL</td>
                    <td>An ORM</td>
                    <td>Hand-kept queries, but the claim is explicit and reviewable</td>
                  </tr>
                  <tr>
                    <td>A three-field memory document per user</td>
                    <td>Retrieval over past conversations</td>
                    <td>No recall of arbitrary history; what a reminder agent needs is small and structured</td>
                  </tr>
                  <tr>
                    <td>No metrics stack in the thesis scope</td>
                    <td>Instrumenting from the start</td>
                    <td>Rates and latencies need log queries</td>
                  </tr>
                </tbody>
              </DataTable>
            </>
          ),
        },
        {
          id: "evaluation",
          title: "Evaluation",
          content: (
            <>
              <h3>The agent: a regression instrument, not an accuracy score</h3>
              <p>
                I wrote 92 cases for RemindrAI&apos;s own agent: relative and absolute times, recurrence, daylight-saving
                boundaries, month and year ends, leap days, impossible and past times, corrections and cancellations over
                several turns, unsupported channels, malformed input, provider failures, and a security group with forged
                identities, injected instructions, malicious arguments and attempts to reach another tenant. Each case runs
                against recorders in place of the real tools, with the clock frozen. There are 12 kinds of automated check;
                each case names the ones that apply to it and passes only if every one of them passes. Every run records a hash of the exact system prompt and tool schemas, so two runs are known to
                have tested the same system.
              </p>
              <DataTable caption="Case-runs passed, same prompt and tools in every run">
                <thead>
                  <tr>
                    <th scope="col">Run</th>
                    <th scope="col" className="num">
                      gpt-5.6
                    </th>
                    <th scope="col" className="num">
                      gpt-5.5
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RUNS.map((row) => (
                    <tr key={row.run}>
                      <th scope="row">{row.run}</th>
                      <td className="num">{row.a}</td>
                      <td className="num">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              <p>
                The ranges overlap, so these runs do not separate the two models, and the thesis says so rather than naming a
                winner. What did reproduce was the shape of the failures: in the three-pass run all eight of one model&apos;s
                failures were clarifying questions where a tool call was expected, and all eight of the other&apos;s were
                actions it should not have taken. All security checks passed for both.
              </p>
              <p>The harness earned its place by catching regressions that review did not:</p>
              <ul>
                <li>
                  Inserting one rule between two related instructions, with no change of wording, dropped one model from 17 to
                  12 of 18 conversation and correction runs: it began answering a correction by creating a second reminder.
                  Moving the same sentence to the end of the block restored 17 of 18.
                </li>
                <li>
                  Asked whether an email reminder had been delivered, the agent said yes on two of two runs when the provider
                  had only accepted it. A rule on what &quot;sent&quot; means fixed it: those cases went from 7 of 10 to 10 of
                  10.
                </li>
                <li>A change to how &quot;self&quot; resolves broke one case and added 521 input tokens to every turn.</li>
              </ul>
              <p className="callout">
                Limits: the cases are mine, the model provider is one, and in the pilot the host&apos;s own agent made the
                scheduling calls, so this measures RemindrAI&apos;s agent rather than the path the pilot used.
              </p>

              <h3>The scheduler: claim latency as the backlog grows</h3>
              <DataTable caption="Claiming batches of 100 until every due reminder is claimed, local libSQL file, 8 tenants">
                <thead>
                  <tr>
                    <th scope="col">Due reminders</th>
                    <th scope="col" className="num">
                      Median (ms)
                    </th>
                    <th scope="col" className="num">
                      p95 (ms)
                    </th>
                    <th scope="col" className="num">
                      Drain rate (rows/s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BENCH.map((row) => (
                    <tr key={row.size}>
                      <th scope="row">{row.size}</th>
                      <td className="num">{row.p50}</td>
                      <td className="num">{row.p95}</td>
                      <td className="num">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
              <p>
                The median barely moves across two orders of magnitude, which is the partial index doing its job; the tail at
                100K does not, and the drain rate falls by more than half. The benchmark excludes the queue and the providers,
                and ran on one machine: the shape is the finding, not the numbers.
              </p>

              <h3>Failure injection</h3>
              <p>
                Twenty-five tests run the scheduler against a real in-memory SQL engine rather than mocks: overlapping ticks,
                racing workers, a reaper meeting a live lock and a dead one, the backoff window, exhausted attempts and
                re-queued dead letters, a cancellation racing a send, tenants under concurrency, and the database vanishing
                mid-tick. They interleave on one connection, so they say nothing about multiple writers; that argument rests
                on the claim&apos;s SQL, not on a test.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <>
              <ul>
                <li>No metrics or tracing stack: structured logs and a failing health check are all the operator has.</li>
                <li>One region, one database and no replicas.</li>
                <li>
                  One pilot consumer, H-FARM&apos;s Student Assistant, integrated through the portable adapter, and 22 sends in
                  production during the pilot: far too few to say anything about reliability in the field.
                </li>
                <li>An author-written evaluation set, one model provider, no user study and no penetration test.</li>
              </ul>
              <p>
                The thesis ends with three directions: an MCP adapter so any agent framework can use the capability, letting
                the agent author a user&apos;s preferences with explicit confirmation, and a second, external consumer to test
                whether the capability is as embeddable as its first one suggests.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
