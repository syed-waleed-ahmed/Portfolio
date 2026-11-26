import CaseStudy from "@/components/case-study/CaseStudy";
import Diagram, { type DiagramSpec } from "@/components/case-study/Diagram";
import Figure, { Screenshot } from "@/components/case-study/Figure";
import { projectBySlug } from "@/content/projects.ts";

// Sources: the repository's README, MODEL_CARD.md, docs/architecture
// (DECISIONS.md, REQUEST_LIFECYCLE.md, MODEL_PIPELINE.md), evaluation.py,
// eval/baseline.json at three commits, and the Gate 1 per-item reports of
// training run 43622001406, from which the paired bootstrap intervals are
// computed (scripts/paired_bootstrap.py in that repository).
const project = projectBySlug("fastapi-niche-assistant")!;

const pipeline: DiagramSpec = {
  width: 920,
  height: 400,
  nodes: [
    { id: "data", label: "502 Q&A pairs", note: "train; 108 held out", x: 110, y: 60, kind: "store" },
    { id: "train", label: "LoRA fine-tune", note: "Kaggle T4, fp16", x: 340, y: 60 },
    { id: "gate1", label: "Gate 1", note: "beats its base model", x: 570, y: 60 },
    { id: "gguf", label: "Merge, quantize", note: "Q4_K_M GGUF, 1 GB", x: 800, y: 60, width: 190 },
    { id: "hub", label: "Hugging Face Hub", note: "pinned, SHA-256 checked", x: 800, y: 190, width: 200, kind: "external" },
    { id: "gate2", label: "Gate 2", note: "within 0.02 of live", x: 500, y: 190 },
    { id: "client", label: "Client", note: "OpenAI-compatible API", x: 110, y: 330, kind: "actor" },
    { id: "edge", label: "Cloudflare Worker", note: "limits, cache, failover", x: 360, y: 330, width: 190 },
    { id: "origin", label: "Cloud Run origin", note: "FastAPI + llama.cpp, CPU", x: 680, y: 330, width: 200 },
  ],
  edges: [
    { from: "data", to: "train" },
    { from: "train", to: "gate1" },
    { from: "gate1", to: "gguf" },
    { from: "gguf", to: "hub", labelOffset: [0, 0] },
    { from: "hub", to: "gate2", label: "candidate", labelOffset: [0, -10] },
    { from: "gate2", to: "origin", label: "release PR", labelOffset: [44, 4] },
    { from: "client", to: "edge", both: true },
    { from: "edge", to: "origin", label: "origin secret", both: true },
    { from: "origin", to: "hub", label: "weights at boot", dashed: true, labelOffset: [56, 12] },
  ],
};

const COMPARISONS = [
  { what: "Fine-tune vs untuned base Qwen", backend: "transformers fp16", a: "0.672", b: "0.558", delta: "+0.114", ci: "0.069 to 0.160", items: "84 better, 24 worse" },
  { what: "Qwen fine-tune vs TinyLlama fine-tune", backend: "llama.cpp, CI", a: "0.666", b: "0.546", delta: "+0.120", ci: "0.080 to 0.160", items: "80 better, 28 worse" },
  { what: "Base TinyLlama with vs without retrieval", backend: "laptop", a: "0.400", b: "0.410", delta: "-0.010", ci: "-0.056 to +0.036", items: "" },
];

const COMPONENTS = [
  { metric: "Keyword recall", ft: "0.711", base: "0.622", ci: "+0.090 (0.022 to 0.161)" },
  { metric: "Code that parses", ft: "0.856", base: "0.721", ci: "+0.135 (0.039 to 0.231)" },
  { metric: "ROUGE-L", ft: "0.455", base: "0.345", ci: "+0.110 (0.091 to 0.129)" },
];

export default function FastApiNicheAssistantCaseStudy() {
  return (
    <CaseStudy
      project={project}
      role="Sole author of the data, training pipeline, evaluation and service, written with an AI coding assistant; part of the training data was drafted by AI agents, as the model card states."
      glance={[
        {
          label: "Fine-tuning effect",
          value: "+0.114 on a composite score over the untuned base model, 95% interval 0.069 to 0.160, better on 84 of 108 held-out items.",
        },
        {
          label: "What the score is",
          value: "A lexical composite: required keywords present, Python blocks that parse, and ROUGE-L against a reference. No human has graded the answers.",
        },
        {
          label: "Serving",
          value: "A 1 GB Q4_K_M model on Cloud Run CPU at about 7.6 tokens a second; a typical answer takes 14 to 26 seconds.",
        },
        {
          label: "Release discipline",
          value: "Two evaluation gates, a pinned and checksummed model, Prometheus alerts and rollback by reverting the release pull request.",
        },
      ]}
      sections={[
        {
          id: "problem",
          title: "Problem",
          content: (
            <>
              <p>
                Can a small model, fine-tuned on one framework&apos;s documentation, answer that framework&apos;s questions
                usefully, and can it run as a real service on free tiers, with no GPU at inference? The project picks FastAPI,
                a 1.5-billion-parameter code model, and a CPU-only deployment, and treats every answer as a draft for a
                developer who can read Python.
              </p>
            </>
          ),
        },
        {
          id: "architecture",
          title: "From data to a live endpoint",
          content: (
            <>
              <Figure caption="Training and release (top) and serving (bottom). A model reaches production only through both gates and a release pull request.">
                <Diagram
                  spec={pipeline}
                  title="FastAPI Niche Assistant pipeline"
                  description="502 question and answer pairs train a LoRA fine-tune on a Kaggle T4. Gate 1 requires it to beat its base model; it is then merged, quantized to a 1 GB Q4_K_M GGUF and pushed to the Hugging Face Hub, pinned and checksummed. Gate 2 requires the candidate to score within 0.02 of the live model, and a release pull request deploys it. At serving time a client calls an OpenAI-compatible API through a Cloudflare Worker that rate-limits, caches and fails over, and the Worker calls a Cloud Run origin running FastAPI and llama.cpp on CPU, which downloads the weights from the Hub at boot."
                />
              </Figure>
              <ul>
                <li>
                  <strong>Training.</strong> LoRA rank 16, alpha 32, on all attention and MLP projections of
                  Qwen2.5-Coder-1.5B-Instruct: 18.5M trainable parameters, 1.2% of the model. Three epochs with completion-only
                  loss on a free Kaggle T4, about 28 minutes. One run, one seed.
                </li>
                <li>
                  <strong>Serving.</strong> The merged model is quantized to Q4_K_M and served by llama.cpp behind FastAPI on
                  Cloud Run (2 vCPU, 4 GiB, scaling to zero). Admission control counts tokens before a request is accepted, so an
                  over-long prompt gets a 400 rather than a crash, and a full queue gets a 429 with Retry-After.
                </li>
                <li>
                  <strong>Edge.</strong> A Cloudflare Worker allow-lists routes, caps bodies at 64 KiB, rate-limits per key,
                  caches answers for verified keys, and is the only caller the origin accepts.
                </li>
              </ul>
              <Figure caption="The web UI, served by the same Worker, with the fine-tuned model's version shown as ready.">
                <Screenshot image="fastapi-assistant" alt="The assistant's web UI: a prompt to ask anything about FastAPI, the fine-tuned model's version marked ready, a note that the public demo needs no key, and four example questions." />
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
                <strong>CPU and a 4-bit model instead of a GPU.</strong> It makes the service free to run and slow to answer.
                About 7.6 tokens a second is acceptable for a documentation assistant; it would not be for chat.
              </li>
              <li>
                <strong>Weights downloaded at boot, not baked into the image.</strong> The free container registry holds 0.5 GB;
                the model is 1 GB. The download is pinned to a tag and refused if its checksum does not match.
              </li>
              <li>
                <strong>The instance limit is the spend limit.</strong> One instance at most means the worst case is bounded by
                construction; a budget alert only notifies.
              </li>
              <li>
                <strong>HTTP/2 to the origin.</strong> Under HTTP/1.1 a client that gave up left its generation running and
                blocked the next request for a minute; with HTTP/2 the disconnect reaches the app, and the request behind an
                abandoned one was answered in 1.3 s instead of 59.8 s.
              </li>
              <li>
                <strong>Rate limiting that degrades instead of failing open.</strong> If the shared limiter is unreachable the
                Worker falls back to per-instance limits rather than letting everything through.
              </li>
            </ul>
          ),
        },
        {
          id: "evaluation",
          title: "Evaluation",
          content: (
            <>
              <h3>The data and the metric</h3>
              <p>
                There are 502 training pairs and 108 held-out evaluation items across 41 topics, 104 of them with code in the
                reference answer. The pairs are partly hand-written and partly drafted by AI agents from the FastAPI
                documentation, and the evaluation set came from the same process; the files do not record which rows were
                drafted. Overlap was checked lexically, which removed four near-duplicates, but semantic leakage was not
                checked.
              </p>
              <p>
                Each answer is scored on the share of required keywords it contains, the share of its Python blocks that parse,
                and ROUGE-L against the reference, and the composite is their mean. It rewards answers that look like the
                reference; it does not run the code or judge whether the advice is right.
              </p>

              <h3>Results</h3>
              <div className="table-scroll">
                <table className="data-table">
                  <caption>Composite score on the 108 held-out items, with paired bootstrap intervals (10,000 resamples)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Comparison</th>
                      <th scope="col">Backend</th>
                      <th scope="col" className="num">
                        First
                      </th>
                      <th scope="col" className="num">
                        Second
                      </th>
                      <th scope="col" className="num">
                        Difference (95% CI)
                      </th>
                      <th scope="col">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISONS.map((row) => (
                      <tr key={row.what}>
                        <th scope="row">{row.what}</th>
                        <td>{row.backend}</td>
                        <td className="num">{row.a}</td>
                        <td className="num">{row.b}</td>
                        <td className="num">
                          {row.delta} ({row.ci})
                        </td>
                        <td>{row.items}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                The first row is the one that says whether fine-tuning helped: same base model, same backend, same items. The
                second is the comparison the deployed releases were judged on, and it mixes three changes at once (a stronger
                base model, 151 more training rows and LoRA on the MLP layers), so it cannot be credited to any one of them.
                The third is a negative result: adding retrieval to the base TinyLlama made no measurable difference.
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <caption>The fine-tune against its base, by component (transformers fp16)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Component</th>
                      <th scope="col" className="num">
                        Fine-tune
                      </th>
                      <th scope="col" className="num">
                        Base
                      </th>
                      <th scope="col" className="num">
                        Difference (95% CI)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPONENTS.map((row) => (
                      <tr key={row.metric}>
                        <th scope="row">{row.metric}</th>
                        <td className="num">{row.ft}</td>
                        <td className="num">{row.base}</td>
                        <td className="num">{row.ci}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Quantization cost nothing measurable: the 4-bit model on llama.cpp scored 0.005 below the fp16 model, with an
                interval from -0.046 to +0.035, though the two ran on different hardware. The intervals cover sampling of the
                108 items only; there was one training run, so the spread between seeds is unknown.
              </p>

              <h3>How the gates actually work</h3>
              <p>
                Gate 1 runs on Kaggle and requires the fine-tune to beat its own base model by at least 0.005. Gate 2 runs in CI
                and lets a candidate through if it scores no more than 0.02 below the deployed model, re-scored on the same
                runner. So a release can be slightly worse than the one it replaces; the gate stops regressions larger than
                0.02, not every regression.
              </p>

              <h3>Where it fails</h3>
              <p>
                Live, it has described a header as a query parameter and over-complicated a 201 response. Earlier releases
                invented arguments that do not exist, and some answers still use the deprecated startup event. The weakest
                topics are logging, deployment and rate limiting; the strongest gains over the previous release were in security
                and websockets.
              </p>
            </>
          ),
        },
        {
          id: "limitations",
          title: "Limitations and next steps",
          content: (
            <ul>
              <li>Confidently wrong answers remain common at this size; the README says to check them.</li>
              <li>A lexical metric, an evaluation set from the same drafting process as the training data, and no human grading.</li>
              <li>One training seed; the base model&apos;s per-item scores live in a CI artifact that expires in February 2027 and should be committed.</li>
              <li>The failover origins are configured but have never been deployed.</li>
              <li>Next: grade a sample of answers by hand, run the code in the answers, and test whether the gain survives a second seed.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
