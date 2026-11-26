import CaseStudy from "@/components/case-study/CaseStudy";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the repository's README, docs/evaluation.md, docs/load-testing.md,
// docs/threat-model.md and ADRs 0001-0011, and a re-run of its retrieval
// evaluation on 2026-11-25 that reproduced every published figure.
const project = projectBySlug("self-correcting-rag")!;

const system: DiagramSpec = {
  width: 900,
  height: 410,
  nodes: [
    { id: "client", label: "Web UI, CLI", note: "static site, terminal", x: 110, y: 60, kind: "actor" },
    { id: "api", label: "FastAPI service", note: "Render Free, Frankfurt", x: 380, y: 60, width: 190 },
    { id: "pg", label: "Postgres + pgvector", note: "Neon: sessions, uploads", x: 720, y: 60, width: 210, kind: "store" },
    { id: "index", label: "Vector index", note: "NumPy, built into image", x: 110, y: 200, kind: "store" },
    { id: "retriever", label: "Hybrid retriever", note: "BM25 + dense, RRF", x: 380, y: 200, width: 190 },
    { id: "guard", label: "Relevance filter", note: "LLM scores each chunk", x: 720, y: 200, width: 210 },
    { id: "eval", label: "Grounding evaluator", note: "LLM grades the answer", x: 380, y: 340, width: 190 },
    { id: "gen", label: "Generator", note: "LLM answers from chunks", x: 720, y: 340, width: 210 },
  ],
  edges: [
    { from: "client", to: "api", label: "question", both: true },
    { from: "api", to: "pg", label: "optional", both: true, dashed: true },
    { from: "api", to: "retriever", label: "query", labelOffset: [32, 4] },
    { from: "retriever", to: "index", label: "dense top 20", both: true },
    { from: "retriever", to: "guard", label: "fused top 5" },
    { from: "guard", to: "gen", label: "kept chunks", labelOffset: [48, 4] },
    { from: "gen", to: "eval", label: "draft", labelOffset: [0, -10] },
    { from: "eval", to: "gen", label: "critique, one retry", curve: 70, labelOffset: [0, 14], dashed: true },
  ],
};

const RETRIEVAL = [
  { k: "3", mode: "dense", recall: "0.950", hit: "0.967", mrr: "0.939", ndcg: "0.932" },
  { k: "3", mode: "hybrid", recall: "0.950", hit: "0.967", mrr: "0.958", ndcg: "0.946" },
  { k: "5", mode: "dense", recall: "0.967", hit: "0.983", mrr: "0.943", ndcg: "0.939" },
  { k: "5", mode: "hybrid", recall: "0.992", hit: "1.000", mrr: "0.966", ndcg: "0.965" },
];

const BOOTSTRAP = [
  { metric: "Recall@5", delta: "+0.025", ci: "0.000 to +0.067", split: "2 better, 0 worse" },
  { metric: "MRR@5", delta: "+0.023", ci: "-0.010 to +0.061", split: "4 better, 2 worse" },
  { metric: "nDCG@5", delta: "+0.026", ci: "-0.003 to +0.059", split: "5 better, 2 worse" },
  { metric: "MRR@3", delta: "+0.019", ci: "-0.014 to +0.056", split: "3 better, 1 worse" },
];

const ANSWERS = [
  { mode: "Baseline (dense)", tokens: "688", latency: "441" },
  { mode: "Hybrid", tokens: "696", latency: "431" },
  { mode: "Self-correcting", tokens: "1,797", latency: "1,145" },
  { mode: "Agent with tools", tokens: "1,924", latency: "869" },
];

export default function SelfCorrectingRagCaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole author: design, implementation, evaluation and deployment, written with an AI coding assistant; the commit history marks co-written commits."
      glance={[
        {
          label: "Retrieval",
          value: "Hybrid search is never worse than dense on the 60-question set and better on two questions. A paired bootstrap does not separate the two.",
        },
        {
          label: "Self-correction",
          value: "On the answers evaluated, the first attempt always passed, so correction changed no outcome while costing about 2.6 times the tokens.",
        },
        {
          label: "Under load",
          value: "No failures at 300 simulated users with a stubbed model; pinning ONNX to one thread took search on a 0.1-CPU runner from 990 ms to 7 ms median.",
        },
        {
          label: "Operations",
          value: "Per-client token buckets, a daily budget, Prometheus metrics, optional OpenTelemetry and a STRIDE threat model, on free-tier hosting.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                The simplest retrieval-augmented generation puts the nearest chunks into a prompt and hopes the answer is
                grounded in them. Two things go wrong: the retriever misses the passage that holds the answer, and the model
                answers anyway, fluently, from what it was given or from nothing.
              </p>
              <p>
                This project adds a feedback stage on each side of generation: a relevance filter that drops off-topic chunks
                before the model sees them, and an evaluator that grades the answer against its sources and asks for one
                correction when the grade is low. The question I wanted the evaluation to answer was whether those stages pay
                for themselves.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "Architecture",
          content: (
            <>
              <Figure caption="The query path. The three LLM stages all call one Groq model; Postgres is optional and holds only per-session data.">
                <Diagram
                  spec={system}
                  title="Self-Correcting RAG architecture"
                  description="A web UI or CLI sends a question to a FastAPI service, which can use an optional Postgres with pgvector for sessions and uploads. The service passes the query to a hybrid retriever that combines BM25 with dense search over a NumPy vector index and fuses the results by reciprocal rank. The top five chunks go to a relevance filter, the kept chunks to a generator, and the draft answer to a grounding evaluator, which can send a critique back to the generator for one retry."
                />
              </Figure>
              <ul>
                <li>
                  <strong>Retrieval.</strong> Dense cosine search and a BM25 implementation written from scratch each return
                  their top 20; reciprocal rank fusion merges them and keeps five.
                </li>
                <li>
                  <strong>Relevance filter.</strong> One batched LLM call scores every chunk and keeps those at 0.3 or above.
                  It fails open: unscored chunks are kept, and if it drops everything the raw retrieval is used.
                </li>
                <li>
                  <strong>Generate and evaluate.</strong> The evaluator scores the draft; at 0.7 or above it is returned,
                  otherwise the generator gets its previous answer and the critique for one more attempt, and the better of the
                  two is returned.
                </li>
                <li>
                  <strong>Agent mode.</strong> A planner with tools (search, a calculator, read-only SQL, an allow-listed web
                  fetch and an approval-gated re-index) for questions retrieval alone cannot answer.
                </li>
              </ul>
              <Figure caption="The demo's Ask tab, with the answer mode and the search scope a visitor can choose.">
                <Screenshot image="self-correcting-rag" alt="The demo's Ask tab: a question about what triggers self-correction, the answer mode and search scope, and a row of sample questions." />
              </Figure>
            </>
          ),
        },
        {
          id: "decisions",
          title: "Decisions and trade-offs",
          content: (
            <>
              <p>The repository records eleven architecture decisions. The ones with measured evidence behind them:</p>
              <ul>
                <li>
                  <strong>ONNX embeddings instead of torch.</strong> The same MiniLM model through fastembed made a 211 MB image
                  instead of 428 MB and answered in 3.0 ms instead of 12.3 ms per query, with identical vectors. On a free tier
                  the image size is the deploy time.
                </li>
                <li>
                  <strong>An exact scan per session instead of an HNSW index.</strong> An approximate index can silently return
                  fewer than k results when a filter removes most candidates; with per-session uploads that small, exact search
                  is both correct and fast enough.
                </li>
                <li>
                  <strong>Streaming progress per stage, not answer tokens.</strong> The answer is graded before it is shown, so
                  streaming tokens would show text that might be replaced. The UI streams which stage is running instead.
                </li>
                <li>
                  <strong>No Redis.</strong> Rate limits and budgets live in process, and in Postgres when configured, because a
                  hosted cache on a free tier is a cost risk. The price is that limits reset on restart.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "evaluation",
          title: "Evaluation",
          content: (
            <>
              <h3>Retrieval</h3>
              <p>
                The golden set is 60 questions over 16 documents (29 chunks), 25 lexical and 35 semantic, with relevance
                labelled per document. The documents and the questions were written for this project by the same author, which
                the repository states as its main limitation: the absolute numbers are optimistic.
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <caption>One deterministic run; re-running it on 2026-11-25 reproduced every figure</caption>
                  <thead>
                    <tr>
                      <th scope="col">k</th>
                      <th scope="col">Mode</th>
                      <th scope="col" className="num">
                        Recall
                      </th>
                      <th scope="col" className="num">
                        Hit rate
                      </th>
                      <th scope="col" className="num">
                        MRR
                      </th>
                      <th scope="col" className="num">
                        nDCG
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {RETRIEVAL.map((row) => (
                      <tr key={row.k + row.mode}>
                        <td>{row.k}</td>
                        <td>{row.mode}</td>
                        <td className="num">{row.recall}</td>
                        <td className="num">{row.hit}</td>
                        <td className="num">{row.mrr}</td>
                        <td className="num">{row.ndcg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Read as averages, hybrid wins at k=5. Read per question, the picture is smaller. A paired bootstrap over the 60
                questions (10,000 resamples) gives these differences, hybrid minus dense:
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <caption>Hybrid minus dense, with 95% bootstrap intervals</caption>
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      <th scope="col" className="num">
                        Difference
                      </th>
                      <th scope="col" className="num">
                        95% interval
                      </th>
                      <th scope="col">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOOTSTRAP.map((row) => (
                      <tr key={row.metric}>
                        <th scope="row">{row.metric}</th>
                        <td className="num">{row.delta}</td>
                        <td className="num">{row.ci}</td>
                        <td>{row.split}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="callout">
                Every estimate favours hybrid, but no interval excludes zero, and the recall gain is two questions. One of the
                two is partly an artefact: labels are per document, and at k=5 dense retrieval gets credit for a chunk from the
                right document that does not contain the answer. The honest claim is that hybrid search never did worse here
                and helped on lexical questions; the set is too small to say more.
              </p>

              <h3>Answers and self-correction</h3>
              <p>
                Eight answerable questions were run through each mode at k=3. Every mode passed all eight, with a judge score of
                1.00 and full keyword coverage, so the comparison comes down to cost:
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <caption>Mean per answer, eight questions, Groq</caption>
                  <thead>
                    <tr>
                      <th scope="col">Mode</th>
                      <th scope="col" className="num">
                        Tokens
                      </th>
                      <th scope="col" className="num">
                        Latency (ms)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANSWERS.map((row) => (
                      <tr key={row.mode}>
                        <th scope="row">{row.mode}</th>
                        <td className="num">{row.tokens}</td>
                        <td className="num">{row.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul>
                <li>
                  Self-correction never changed an outcome: the first attempt always passed, so it bought a checked grounding
                  status at about 2.6 times the tokens and latency.
                </li>
                <li>
                  On a small hard set, the two answerable hard questions failed in every mode at k=3 and passed with hybrid
                  retrieval at k=5. Retrieval, not generation, was the bottleneck. All four unanswerable questions were
                  declined.
                </li>
                <li>
                  The judge scored every answer 1.00, including refusals of questions that were answerable. It measures
                  faithfulness, not completeness, and it is the same model as the generator, which flatters both.
                </li>
              </ul>

              <h3>Under load</h3>
              <p>
                Locust load tests replace the model with a 300 ms stand-in, so they measure the service, not Groq. Locally there
                were no failures at 20, 100 or 300 users (9.6, 47.1 and 135.6 requests a second), with the knee between 100 and
                300 users. On a CI runner limited to 0.1 CPU, two runs disagreed by a factor of 50 on search latency; pinning
                ONNX Runtime to one thread fixed it, taking the median from 990 ms to 7 ms. Cutting the embedding batch from 32
                to 8 cut ingest memory from 232 MiB to 70 MiB extra.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <ul>
              <li>A small, author-written golden set over author-written documents, labelled per document rather than per chunk.</li>
              <li>The relevance filter was never evaluated on its own: the self-correcting mode bundles it with the correction loop.</li>
              <li>The judge is the generator&apos;s own model, and it has not been checked against human grades.</li>
              <li>One LLM provider, so Groq is a single point of failure; in-process rate limits reset on restart.</li>
              <li>
                Next: chunk-level labels, a question set written apart from the corpus, a filter-only configuration, a judge
                from a different model family, and per-question reports committed with each run.
              </li>
            </ul>
          ),
        },
      ]}
    />
  );
}
