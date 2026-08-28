"use client";

import { useState } from "react";

/* =========================================================
   TYPES
   ========================================================= */

type Evidence = {
  quote: string;
  source: string;
  why: string;
};

type AgentOpinion = {
  agent: string;
  score: number | null;
  confidence: number;
  recommendation: string;
  strengths: string[];
  concerns: string[];
  evidence: Evidence[];
  insufficientInfo: string[];
};

type DebateTurn = {
  speaker: string;
  respondingTo: string;
  response: string;
  changedMind: boolean;
  updatedScore: number | null;
  evidence: Evidence[];
};

type FinalDecision = {
  recommendation: string;
  confidence: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  unresolvedDisagreements: string[];
  evidence: Evidence[];
};

type CandidateResult = {
  profile: Record<string, unknown>;
  opinions: AgentOpinion[];
  debate: DebateTurn[];
  finalDecision: FinalDecision;
};

type ActiveCandidate = "A" | "B" | "CUSTOM";

/* =========================================================
   FIXED JOB DESCRIPTION
   ========================================================= */

const JOB = `Job Description: AI Engineer — Agentic Systems (Freight Operations)
Company: Cargonet AI — a freight-tech company that runs AI “agent” systems in real production, handling shipment quoting, booking, tracking, document processing, and fixing errors automatically.

About the Role
We need an engineer to help improve an existing AI agent system: planner, executor, reviewer, and specialized agents working together. This is not a research-only job. You will build real features that go live for real users, mostly by directing AI coding tools like Claude Code rather than writing every line by hand, and you will be responsible for fixing things when they break in production.

What You'll Do
• Improve the multi-agent AI system for quoting, booking, tracking, document processing, and error handling.
• Build features mainly by directing AI coding tools, reviewing and guiding their output.
• Work on Python backend services and React.js front-end screens, using MongoDB.
• Improve prompting, tools/memory, RAG/vector search, and model quality/cost decisions.
• Keep the live system running smoothly and fix agent failures.
• Connect outside tools and document scanning/OCR.

What We're Looking For
• Solid Python backend skills.
• Hands-on AI/LLM experience such as prompt writing, RAG/vector search, and evaluation.
• Production ownership.
• Basic React.js skills.
• Nice to have: logistics/freight, OCR, or business-system integrations.`;

/* =========================================================
   DEMO CANDIDATE DATA
   ========================================================= */

const RESUME_A = `Rohan Malhotra
Senior AI/Backend Engineer

AI engineer with 3.5 years of experience building multi-agent LLM systems and Python backends. Led design of a production agent platform now handling thousands of daily freight exceptions. Known for moving fast and shipping under pressure.

Senior AI Engineer — Voltrix Logistics Tech (Jan 2025 – Present, 7 months)
• Designed and built the exception-handling engine end-to-end for Voltrix’s multi-agent freight ops platform (planner/executor/reviewer pattern), cutting manual exception review time by 40%.
• Owned prompt design and model routing across GPT-4 and open-weight SLMs, reducing inference cost by ~30%.
• Sole architect of the retry/escalation logic now running in production, handling 5,000+ freight exceptions/month.
• Presented the system design at a company-wide tech talk.

AI Engineer — Quickship Data Systems (Feb 2024 – Dec 2024, 11 months)
• Built a RAG pipeline over carrier rate documents using LangChain + Pinecone, cutting manual rate lookup time significantly.
• Improved BOL/invoice extraction accuracy through better OCR pre-processing.

Backend Developer — Nimbus Cloud Solutions (Aug 2022 – Jan 2024, 1.5 years)
• Built Python microservices for a SaaS analytics product used by 50+ enterprise clients.
• Led a 4-person team migrating a legacy monolith to microservices.

Skills: Python, FastAPI, LangGraph, CrewAI, MongoDB, React (basic), RAG, Vector Search (Pinecone, FAISS), Prompt Engineering, Docker, Kubernetes
Education: B.Tech Computer Science, 2022
Certification: LangChain for LLM Application Development (2024)`;

const TRANSCRIPT_A = `Interview Transcript — Candidate A (Rohan Malhotra)

Q1: Walk me through the exception-handling engine you built at Voltrix.
A1: It’s planner-executor-reviewer. Failures come in, get classified, retried or escalated, then double-checked. I designed the whole retry/escalation logic.

Q2: What made you choose that structure over a simpler rule-based system?
A2: Rules don’t scale. Too many failure types — timeouts, bad EDI, missing BOL fields. Agents handle that better.

Q3: How do you measure whether the reviewer agent is actually catching real problems?
A3: We track override rate. It’s low. I’d have to check the exact number though, haven’t looked recently.

Q4: What’s your approach to model routing?
A4: Cost-based. Simple stuff to the SLM, harder reasoning to GPT-4. No formal study, just tuned it as things broke.

Q5: Tell me about a time you disagreed with a teammate on a technical decision.
A5: Teammate wanted to hardcode more categories up front. I pushed for the agent approach. We went with mine.

Q6: Who actually wrote the retry/escalation logic that’s in production now?
A6: I designed it. Priya did a lot of the implementation, I reviewed her PRs. I was the architect.

Q7: Your resume says “sole architect.” But it sounds like Priya built a lot of it. Can you clarify?
A7: Fine — “sole architect” is probably too strong. I led the design, she built most of the production version.

Q8: Why should we invest in ramping you up here versus someone with more freight-domain experience?
A8: I move fast. I’ve built something structurally close to this already. I don’t think I’d need much ramp time.

Q9: This role needs long-term ownership of production reliability. How do you feel about being on-call for agent failures?
A9: Fine, I’ve done on-call before. Though Voltrix’s user base is still small, so I haven’t seen serious incident volume yet.

Q10: You’ve had three roles in 3.5 years, each under a year except the first. What’s driving that?
A10: Better pay and title, mostly. Voltrix is more aligned with what I want long-term.`;

const RESUME_B = `Ananya Iyer
Software Engineer (Backend → AI)

Backend engineer with steady experience maintaining internal tools, recently moved into applied AI work. Comfortable with Python and standard web APIs; still building depth in AI-specific tooling.

Software Engineer II — Bridgepoint Systems (Jun 2021 – Present, 4 years)
• Maintains Python/FastAPI microservices for an internal ops platform used by a few internal teams.
• Helped migrate part of the document ingestion pipeline to use OCR-based extraction for scanned forms.
• Over the last 1.5 years, started building an internal RAG-based support-ticket assistant: set up a retrieval pipeline (LangChain + Chroma); team estimated answer accuracy improved by around 40% based on informal review.
• After a production incident, introduced a pre-deploy checklist for prompt changes that the team adopted.

Junior Backend Developer — Bridgepoint Systems (Jul 2019 – Jun 2021, 2 years)
• Built basic REST APIs for internal tooling.
• Worked with QA and product to define API contracts.

Skills: Python, FastAPI, MongoDB, PostgreSQL, LangChain, Chroma, basic React, OCR pipelines (Tesseract), Docker
Education: B.E. Information Technology, 2019
Note: Has not used multi-agent orchestration frameworks (LangGraph, CrewAI, AutoGen) in production — most LLM work to date has been a single-agent RAG pipeline.`;

const TRANSCRIPT_B = `Interview Transcript — Candidate B (Ananya Iyer)

Q1: Tell me about the RAG pipeline you built for the support-ticket assistant.
A1: Sure — happy to walk through it step by step. We retrieve from a Chroma vector store built from past resolved tickets and internal docs. The top few matches get passed to the LLM, which drafts a response for a human agent to review before it goes out. We chunked documents by section rather than fixed length, since that kept related context together.

Q2: Your resume mentions a ~40% accuracy improvement. How was that measured?
A2: I want to be upfront about this — it was based on internal review, not a formal benchmark. A few of us spot-checked a sample of responses before and after the change and it felt clearly better, but I wouldn’t want to present that number as something rigorous if it comes up again.

Q3: Have you worked with multi-agent orchestration frameworks — LangGraph, CrewAI?
A3: Not in production. I’ve read through the docs for both and built a small planner/executor toy project on my own time, but everything I’ve actually shipped has been single-agent RAG. That’s a real gap relative to what this role needs, and I’d rather say that clearly than talk around it.

Q4: How would you approach ramping up on multi-agent systems specifically?
A4: I’d start by reading through your existing planner/executor/reviewer code directly, rather than a general course, since the real failure patterns usually aren’t in the docs. Then I’d want to pair with someone on a small bug fix first, before touching the architecture itself.

Q5: Tell me about a mistake you made and how you handled it.
A5: I pushed a prompt change to the support assistant straight to production — we didn’t have a review process at the time, so nothing stopped me. It caused a spike in bad responses for about two hours before we caught it and rolled back.

Q6: What did you do after that?
A6: A few things. First, I ran an incident retro with the team and was direct that it was my mistake in the writeup — I didn’t want to soften that. Second, I proposed a pre-deploy checklist for prompt changes: a lightweight review step plus a small eval set to run before anything ships. It’s been part of our process since.

Q7: Was there any pushback on you owning that mistake publicly, or did you find a way to spread the responsibility?
A7: No, I named it as mine in the retro doc. One teammate pointed out we should’ve had the checklist before this happened, which is fair — but I didn’t try to shift blame for the specific incident onto the process gap.

Q8: This role is heavily oriented around multi-agent orchestration on day one. Given you haven’t shipped that in production, how do you think about that gap?
A8: It’s real, and I’d rather you go in with clear eyes about it than find out later. What I’d point to instead is a pattern: I’ve picked up new technical areas quickly before — OCR pipelines, then RAG — and I tend to ask for help early instead of quietly struggling, which I think matters more for ramp time than having already touched this exact framework.

Q9: Why should we invest in ramping you up here versus someone who already has multi-agent experience?
A9: Honestly, I can’t out-argue someone who’s already done the exact work. What I’d say is I’m a safer bet on the production-ownership side — I’ve been through a real incident and changed how the team works because of it, not just shipped something that looked good in a demo.

Q10: You’ve been at one company for six years. Any concern about adapting to a fast-moving startup environment?
A10: It’s a fair thing to ask about. I’d say the role itself changed a lot even though the employer didn’t — I went from junior backend work, to leading a pipeline migration, to driving our team’s move into AI. So I’ve had to keep adapting, just inside one company.`;

/* =========================================================
   PROFILE GRID
   ========================================================= */

function ProfileGrid({
  profile,
}: {
  profile: Record<string, unknown>;
}) {
  const formatLabel = (key: string) =>
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replaceAll("_", " ")
      .toUpperCase();

  const renderValue = (
    key: string,
    value: unknown
  ) => {
    if (Array.isArray(value)) {
      return (
        <div
          className={`profile-content profile-${key}`}
        >
          {value.map((item, index) => (
            <div
              className="profile-list-item"
              key={index}
            >
              <span>{String(item)}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className={`profile-content profile-simple profile-${key}`}
      >
        {String(value)}
      </div>
    );
  };

  return (
    <div className="profile-grid">
      {Object.entries(profile).map(
        ([key, value]) => (
          <div
            className={`profile-item profile-item-${key}`}
            key={key}
          >
            <small>
              {formatLabel(key)}
            </small>

            {renderValue(key, value)}
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   AI PERSONAS
   ========================================================= */

const agentPersona: Record<
  string,
  {
    name: string;
    role: string;
    initials: string;
  }
> = {
  "Technical Agent": {
    name: "Arjun Mehta",
    role: "Head of Technical Evaluation",
    initials: "AM",
  },

  "HR / Culture Agent": {
    name: "Ryan Kapoor",
    role: "Head of People & Culture",
    initials: "RK",
  },

  "Hiring Manager Agent": {
    name: "Ethan Shah",
    role: "Hiring Manager",
    initials: "ES",
  },

  "Skeptic Agent": {
    name: "Marcus Verma",
    role: "Head of Risk & Verification",
    initials: "MV",
  },
};

/* =========================================================
   AGENT CARD
   ========================================================= */

function AgentCard({
  opinion,
}: {
  opinion: AgentOpinion;
}) {
  const persona =
    agentPersona[opinion.agent] ?? {
      name: opinion.agent,
      role: "Panel Analyst",
      initials: "AI",
    };

  return (
    <article className="agent-card">
      <div className="agent-top">
        <div className="agent-persona">
          <div className="agent-avatar">
            {persona.initials}
          </div>

          <div>
            <h3>{persona.name}</h3>

            <small>
              {persona.role}
            </small>
          </div>
        </div>

        <span className="badge">
          INDEPENDENT
        </span>
      </div>

      <div className="agent-role">
        {opinion.agent}
      </div>

      <div className="agent-title">
        <span>
          {opinion.score === null
            ? "N/A"
            : opinion.score}
        </span>

        <div className="meta">
          Confidence{" "}
          <b>
            {Math.round(
  opinion.confidence
)}
            %
          </b>
        </div>
      </div>

      {opinion.score !== null && (
        <div className="bar">
          <i
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  opinion.score
                )
              )}%`,
            }}
          />
        </div>
      )}

      <p className="agent-verdict">
        <b>Verdict:</b>{" "}
        {opinion.recommendation}
      </p>

      <div className="twocol">
        <div>
          <small>STRENGTHS</small>

          <ul>
            {opinion.strengths
              .slice(0, 3)
              .map((x, i) => (
                <li key={i}>
                  {x}
                </li>
              ))}
          </ul>
        </div>

        <div>
          <small>CONCERNS</small>

          <ul>
            {opinion.concerns
              .slice(0, 3)
              .map((x, i) => (
                <li key={i}>
                  {x}
                </li>
              ))}
          </ul>
        </div>
      </div>

      {opinion.evidence
        .slice(0, 2)
        .map((e, i) => (
          <div
            className="evidence"
            key={i}
          >
            <div className="quote">
              “{e.quote}”
            </div>

            <div className="source">
              {e.source} · {e.why}
            </div>
          </div>
        ))}
    </article>
  );
}

/* =========================================================
   CANDIDATE RESULT
   ========================================================= */

function CandidateResult({
  name,
  result,
  revealed,
  onReveal,
}: {
  name: string;
  result: CandidateResult;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div className="result-stack">

      {/* PROFILE */}

      <section className="section-card profile-card">
        <div className="section-head">
          <div>
            <span className="kicker">
              PROFILE BUILDER
            </span>

            <h2>{name}</h2>
          </div>

          <span className="live-dot">
            ● ANALYZED
          </span>
        </div>

        <ProfileGrid
          profile={result.profile}
        />
      </section>

      {/* AGENTS */}

      <section>
        <div className="section-head">
          <div>
            <span className="kicker">
              INDEPENDENT PANEL
            </span>

            <h2>
              Four perspectives
            </h2>
          </div>

          <span className="hint">
            Opinions formed before
            the debate.
          </span>
        </div>

        <div className="agent-grid">
          {result.opinions.map(
            (opinion) => (
              <AgentCard
                key={opinion.agent}
                opinion={opinion}
              />
            )
          )}
        </div>
      </section>

      {/* DEBATE */}

      <section className="section-card debate-card">
        <div className="section-head">
          <div>
            <span className="kicker">
              DEBATE ROOM
            </span>

            <h2>
              Agents challenge the
              evidence
            </h2>
          </div>

          <span className="badge">
            REASONING STAGE
          </span>
        </div>

        <div className="timeline">
          {result.debate.map(
            (turn, i) => (
              <div
                className="turn"
                key={i}
              >
                <div className="turn-marker">
                  {String(i + 1).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="turn-body">
                  <div className="turn-head">
                    <b>
                      {agentPersona[
                        turn.speaker
                      ]?.name ??
                        turn.speaker}
                    </b>

                    <span>
                      responding to{" "}
                      {agentPersona[
                        turn.respondingTo
                      ]?.name ??
                        turn.respondingTo}
                    </span>

                    {turn.changedMind && (
                      <em>
                        OPINION CHANGED
                      </em>
                    )}
                  </div>

                  <p>
                    {turn.response}
                  </p>

                  {turn.evidence?.[0] && (
                    <div className="mini-evidence">
                      “
                      {
                        turn
                          .evidence[0]
                          .quote
                      }
                      ”

                      <span>
                        {
                          turn
                            .evidence[0]
                            .source
                        }
                      </span>
                    </div>
                  )}

                  {turn.changedMind && (
                    <div className="change">
                      ↳ Revised position ·{" "}
                      {turn.updatedScore ??
                        "N/A"}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* SEALED DECISION */}

      {!revealed ? (
        <section className="sealed-card">
          <div className="sealed-glow" />

          <div className="sealed-content">
            <div className="sealed-icon">
              ✦
            </div>

            <span className="kicker">
              FINAL DECISION
            </span>

            <h2>
              Decision sealed
            </h2>

            <p>
              The panel has completed
              its independent
              evaluations and debate.
            </p>

            <div className="sealed-line">
              <span />

              <small>
                Evidence reviewed ·
                Debate completed
              </small>

              <span />
            </div>

            <button
              className="reveal-button"
              onClick={onReveal}
            >
              REVEAL FINAL DECISION
              <span>→</span>
            </button>

            <div className="sealed-note">
              Reveal only after
              reviewing the panel&apos;s
              reasoning.
            </div>
          </div>
        </section>
      ) : (
        /* FINAL DECISION */
        <section className="final-card revealed">
          <div className="reveal-label">
            <span>✦</span>{" "}
            DECISION REVEALED
          </div>

          <div className="section-head final-head">
            <div>
              <span className="kicker">
                FINAL DECISION
              </span>

              <h2>
                {
                  result.finalDecision
                    .recommendation
                }
              </h2>
            </div>

            <div className="confidence">
              {Math.round(
                result.finalDecision
                  .confidence * 100
              )}
              %

              <small>
                CONFIDENCE
              </small>
            </div>
          </div>

          <p className="reasoning">
            {
              result.finalDecision
                .reasoning
            }
          </p>

          <div className="final-grid">
            <div>
              <small>
                STRENGTHS
              </small>

              <ul>
                {result.finalDecision.strengths.map(
                  (x, i) => (
                    <li key={i}>
                      {x}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <small>
                CONCERNS
              </small>

              <ul>
                {result.finalDecision.concerns.map(
                  (x, i) => (
                    <li key={i}>
                      {x}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <small>
                UNRESOLVED
              </small>

              <ul>
                {result.finalDecision.unresolvedDisagreements.map(
                  (x, i) => (
                    <li key={i}>
                      {x}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="final-evidence-title">
            DECISION EVIDENCE
          </div>

          {result.finalDecision.evidence
            .slice(0, 4)
            .map((e, i) => (
              <div
                className="evidence final-evidence"
                key={i}
              >
                <div className="quote">
                  “{e.quote}”
                </div>

                <div className="source">
                  {e.source} · {e.why}
                </div>
              </div>
            ))}
        </section>
      )}
    </div>
  );
}

/* =========================================================
   COMPARISON MODAL
   ========================================================= */

function ComparisonModal({
  results,
  onClose,
}: {
  results: {
    A: CandidateResult;
    B: CandidateResult;
  };
  onClose: () => void;
}) {
  const candidateA =
    results.A.finalDecision;

  const candidateB =
    results.B.finalDecision;

  const getScore = (
    opinions: AgentOpinion[],
    agent: string
  ) => {
    const opinion = opinions.find(
      (x) => x.agent === agent
    );

    return opinion?.score ?? null;
  };

  const technicalA = getScore(
    results.A.opinions,
    "Technical Agent"
  );

  const technicalB = getScore(
    results.B.opinions,
    "Technical Agent"
  );

  const hiringA = getScore(
    results.A.opinions,
    "Hiring Manager Agent"
  );

  const hiringB = getScore(
    results.B.opinions,
    "Hiring Manager Agent"
  );

  const skepticA = getScore(
    results.A.opinions,
    "Skeptic Agent"
  );

  const skepticB = getScore(
    results.B.opinions,
    "Skeptic Agent"
  );

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="comparison-modal">

        <div className="modal-header">
          <div>
            <span className="kicker">
              PANEL COMPARISON
            </span>

            <h2>
              Candidate comparison
            </h2>

            <p>
              A side-by-side view of
              the evidence, panel
              scores and final
              recommendations.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close comparison"
          >
            ×
          </button>
        </div>

        <div className="comparison-candidates">

          <div className="comparison-candidate">
            <span className="candidate-label">
              CANDIDATE A
            </span>

            <h3>
              Rohan Malhotra
            </h3>

            <div className="comparison-verdict">
              {
                candidateA.recommendation
              }
            </div>

            <div className="comparison-confidence">
              {Math.round(
                candidateA.confidence *
                  100
              )}
              %

              <span>
                FINAL CONFIDENCE
              </span>
            </div>
          </div>

          <div className="comparison-divider">
            VS
          </div>

          <div className="comparison-candidate">
            <span className="candidate-label">
              CANDIDATE B
            </span>

            <h3>
              Ananya Iyer
            </h3>

            <div className="comparison-verdict">
              {
                candidateB.recommendation
              }
            </div>

            <div className="comparison-confidence">
              {Math.round(
                candidateB.confidence *
                  100
              )}
              %

              <span>
                FINAL CONFIDENCE
              </span>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <div className="comparison-section-title">
            PANEL SCORES
          </div>

          <div className="score-comparison">

            <div className="score-row">
              <span>
                Technical Evaluation
              </span>

              <strong>
                {technicalA ?? "N/A"}
              </strong>

              <div className="compare-bar">
                <i
                  style={{
                    width: `${
                      technicalA ?? 0
                    }%`,
                  }}
                />
              </div>

              <strong>
                {technicalB ?? "N/A"}
              </strong>
            </div>

            <div className="score-row">
              <span>
                Hiring Manager
              </span>

              <strong>
                {hiringA ?? "N/A"}
              </strong>

              <div className="compare-bar">
                <i
                  style={{
                    width: `${
                      hiringA ?? 0
                    }%`,
                  }}
                />
              </div>

              <strong>
                {hiringB ?? "N/A"}
              </strong>
            </div>

            <div className="score-row">
              <span>
                Skeptic Evaluation
              </span>

              <strong>
                {skepticA ?? "N/A"}
              </strong>

              <div className="compare-bar">
                <i
                  style={{
                    width: `${
                      skepticA ?? 0
                    }%`,
                  }}
                />
              </div>

              <strong>
                {skepticB ?? "N/A"}
              </strong>
            </div>

          </div>
        </div>

        <div className="comparison-columns">

          <div>
            <div className="comparison-section-title">
              ROHAN · STRENGTHS
            </div>

            <div className="comparison-list">
              {candidateA.strengths
                .slice(0, 4)
                .map((item, i) => (
                  <div key={i}>
                    {item}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className="comparison-section-title">
              ANANYA · STRENGTHS
            </div>

            <div className="comparison-list">
              {candidateB.strengths
                .slice(0, 4)
                .map((item, i) => (
                  <div key={i}>
                    {item}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className="comparison-section-title">
              ROHAN · CONCERNS
            </div>

            <div className="comparison-list concerns">
              {candidateA.concerns
                .slice(0, 4)
                .map((item, i) => (
                  <div key={i}>
                    {item}
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className="comparison-section-title">
              ANANYA · CONCERNS
            </div>

            <div className="comparison-list concerns">
              {candidateB.concerns
                .slice(0, 4)
                .map((item, i) => (
                  <div key={i}>
                    {item}
                  </div>
                ))}
            </div>
          </div>

        </div>

        <div className="comparison-footer">
          <span>
            Comparison is based on
            the completed panel
            evaluation.
          </span>

          <button
            className="modal-done"
            onClick={onClose}
          >
            CLOSE COMPARISON
          </button>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Home() {

  const [resumeA, setResumeA] =
    useState("");

  const [transcriptA, setTranscriptA] =
    useState("");

  const [resumeB, setResumeB] =
    useState("");

  const [transcriptB, setTranscriptB] =
    useState("");

  const [customResume, setCustomResume] =
    useState("");

  const [customTranscript, setCustomTranscript] =
    useState("");

  const [results, setResults] =
    useState<{
      A: CandidateResult;
      B: CandidateResult;
      CUSTOM?: CandidateResult;
    } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [active, setActive] =
    useState<ActiveCandidate>("A");

  const [revealed, setRevealed] =
    useState<{
      A: boolean;
      B: boolean;
      CUSTOM: boolean;
    }>({
      A: false,
      B: false,
      CUSTOM: false,
    });

  const [showComparison, setShowComparison] =
    useState(false);

  /* =======================================================
     LOAD DEMO
     ======================================================= */

  function loadDemo() {
    setResumeA(RESUME_A);
    setTranscriptA(TRANSCRIPT_A);

    setResumeB(RESUME_B);
    setTranscriptB(TRANSCRIPT_B);

    setCustomResume("");
    setCustomTranscript("");

    setResults(null);
    setError("");

    setRevealed({
      A: false,
      B: false,
      CUSTOM: false,
    });

    setShowComparison(false);
    setActive("A");
  }

  /* =======================================================
     RUN A/B PANEL
     ======================================================= */

 async function run() {
  setLoading(true);
  setError("");
  setResults(null);
  setShowComparison(false);

  setRevealed({
    A: false,
    B: false,
    CUSTOM: false,
  });

  // Local demo mode.
  // No Gemini API call is made here.
  await new Promise((resolve) =>
    setTimeout(resolve, 1200)
  );

  const localResults = {
    A: {
      profile: {
        name: "Rohan Malhotra",
        education: [
          "B.Tech Computer Science, 2022",
        ],
        skills: [
          "Python",
          "FastAPI",
          "LangGraph",
          "CrewAI",
          "MongoDB",
          "RAG",
          "Vector Search",
          "Prompt Engineering",
          "Docker",
          "Kubernetes",
        ],
        experience: [
          "3.5 years AI/backend experience",
          "Senior AI Engineer at Voltrix Logistics Tech",
          "Built production multi-agent freight systems",
        ],
        projects: [
          "Production planner/executor/reviewer freight exception platform",
          "RAG pipeline over carrier rate documents",
          "OCR improvements for BOL/invoice extraction",
        ],
        claims: [
          "Reduced manual exception review time by 40%",
          "Reduced inference cost by ~30%",
          "Retry/escalation logic handles 5,000+ freight exceptions/month",
        ],
        importantEvidence: [
          "Built a planner-executor-reviewer system for freight exceptions.",
          "Uses LangGraph and CrewAI according to the resume.",
          "Later clarified that 'sole architect' was too strong and Priya built most of the production version.",
        ],
      },

      opinions: [
        {
          agent: "Arjun Mehta",
          score: 91,
          confidence: 91,
          recommendation: "Strong hire",
          strengths: [
            "Direct production multi-agent experience",
            "Strong Python/backend foundation",
            "Relevant RAG, vector search, OCR and model-routing experience",
          ],
          concerns: [
            "Some performance/model-routing decisions were tuned informally rather than through formal studies",
          ],
          evidence: [
            {
              quote:
                "It's planner-executor-reviewer. Failures come in, get classified, retried or escalated, then double-checked.",
              source: "Transcript · Q1",
              why:
                "Directly demonstrates experience with the role's agentic architecture.",
            },
            {
              quote:
                "Cost-based. Simple stuff to the SLM, harder reasoning to GPT-4.",
              source: "Transcript · Q4",
              why:
                "Shows practical model-routing experience relevant to quality/cost tradeoffs.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Daniel Brooks",
          score: 87,
          confidence: 88,
          recommendation: "Hire",
          strengths: [
            "Strong production ownership",
            "Relevant freight-domain experience",
            "Demonstrated ability to work across backend and AI systems",
          ],
          concerns: [
            "Some ownership claims required clarification during the interview",
          ],
          evidence: [
            {
              quote:
                "I designed the whole retry/escalation logic.",
              source: "Transcript · Q1",
              why:
                "Supports strong ownership of a production component.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Marcus Reed",
          score: 89,
          confidence: 90,
          recommendation: "Strong hire",
          strengths: [
            "Very strong role alignment",
            "Production AI experience",
            "Relevant freight and document-processing exposure",
          ],
          concerns: [
            "Some impact measurements are based on internal estimates",
          ],
          evidence: [
            {
              quote:
                "cutting manual exception review time by 40%",
              source: "Resume",
              why:
                "Directly relates to measurable production impact.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Ethan Cole",
          score: 78,
          confidence: 86,
          recommendation: "Hire with verification",
          strengths: [
            "Strong technical background",
            "Good match for multi-agent systems",
            "Evidence of real production work",
          ],
          concerns: [
            "Several high-impact claims deserve stronger measurement",
            "One ownership claim was softened during questioning",
          ],
          evidence: [
            {
              quote:
                "sole architect was too strong. I led the design, she built most of the production version.",
              source: "Transcript · Q7",
              why:
                "Shows an important correction to an earlier claim.",
            },
          ],
          insufficientInfo: [
            "Formal benchmark methodology for reported performance improvements",
          ],
        },
      ],

      debate: [
        {
          speaker: "Arjun Mehta",
          respondingTo: "Ethan Cole",
          response:
            "The ownership concern matters, but the transcript still shows direct involvement in retry and escalation design.",
          changedMind: false,
          updatedScore: 91,
          evidence: [
            {
              quote:
                "I designed the whole retry/escalation logic.",
              source: "Transcript · Q1",
              why:
                "Supports meaningful technical ownership.",
            },
          ],
        },

        {
          speaker: "Ethan Cole",
          respondingTo: "Arjun Mehta",
          response:
            "I agree that the technical contribution is strong. My concern is specifically about how broadly the original ownership claim was stated.",
          changedMind: true,
          updatedScore: 84,
          evidence: [
            {
              quote:
                "sole architect was too strong",
              source: "Transcript · Q7",
              why:
                "The candidate voluntarily corrected the claim.",
            },
          ],
        },

        {
          speaker: "Marcus Reed",
          respondingTo: "Ethan Cole",
          response:
            "The correction actually increases confidence in the candidate's honesty because the clarification was explicit.",
          changedMind: true,
          updatedScore: 90,
          evidence: [
            {
              quote:
                "she built most of the production version",
              source: "Transcript · Q7",
              why:
                "Shows willingness to accurately describe contribution.",
            },
          ],
        },

        {
          speaker: "Daniel Brooks",
          respondingTo: "Marcus Reed",
          response:
            "Agreed. The remaining issue is measurement quality rather than technical capability.",
          changedMind: false,
          updatedScore: 87,
          evidence: [
            {
              quote:
                "reducing inference cost by ~30%",
              source: "Resume",
              why:
                "Provides evidence of optimization impact, although methodology is not fully documented.",
            },
          ],
        },
      ],

      finalDecision: {
        recommendation: "Hire",
        confidence: 91,
        reasoning:
          "The candidate shows strong direct experience with production multi-agent systems, Python backends, RAG, model routing, OCR and freight operations. The panel identified some overstatement around ownership, but the candidate corrected the claim during the interview. The remaining concerns are mainly around measurement methodology rather than core capability.",
        strengths: [
          "Strong production multi-agent experience",
          "Excellent alignment with the freight AI role",
          "Strong Python/backend foundation",
          "Relevant RAG, OCR and model-routing experience",
        ],
        concerns: [
          "Some performance claims lack formal measurement methodology",
          "One ownership claim required clarification",
        ],
        unresolvedDisagreements: [
          "How much weight should be given to informally measured performance improvements",
        ],
        evidence: [
          {
            quote:
              "I designed the whole retry/escalation logic.",
            source: "Transcript · Q1",
            why:
              "Direct evidence of technical ownership.",
          },
          {
            quote:
              "sole architect was too strong",
            source: "Transcript · Q7",
            why:
              "Demonstrates correction of an overstated claim.",
          },
        ],
      },
    },

    B: {
      profile: {
        name: "Ananya Iyer",
        education: [
          "B.E. Information Technology, 2019",
        ],
        skills: [
          "Python",
          "FastAPI",
          "MongoDB",
          "PostgreSQL",
          "LangChain",
          "Chroma",
          "React",
          "OCR",
          "Docker",
        ],
        experience: [
          "4+ years backend engineering",
          "Software Engineer II at Bridgepoint Systems",
          "Built internal RAG-based support-ticket assistant",
        ],
        projects: [
          "RAG-based support-ticket assistant",
          "OCR document ingestion pipeline",
          "Python/FastAPI internal operations platform",
        ],
        claims: [
          "Around 40% improvement in answer accuracy",
          "Improved OCR document extraction",
        ],
        importantEvidence: [
          "RAG pipeline used Chroma and LangChain.",
          "Candidate explicitly stated that multi-agent frameworks were not used in production.",
          "Candidate clarified that the 40% accuracy improvement was based on informal internal review.",
        ],
      },

      opinions: [
        {
          agent: "Arjun Mehta",
          score: 72,
          confidence: 94,
          recommendation: "Needs More Evidence",
          strengths: [
            "Solid Python/backend experience",
            "Useful RAG and OCR exposure",
            "Clear technical communication",
          ],
          concerns: [
            "No production multi-agent orchestration experience",
            "Limited depth in the core requirements of the role",
          ],
          evidence: [
            {
              quote:
                "Not in production.",
              source: "Transcript · Q3",
              why:
                "Directly confirms the candidate's multi-agent experience gap.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Daniel Brooks",
          score: 76,
          confidence: 91,
          recommendation: "Needs More Evidence",
          strengths: [
            "Stable backend experience",
            "Production incident experience",
            "Good communication and honesty",
          ],
          concerns: [
            "Limited agentic systems experience",
          ],
          evidence: [
            {
              quote:
                "I'd rather say that clearly than talk around it.",
              source: "Transcript · Q3",
              why:
                "Strong evidence of transparent communication.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Marcus Reed",
          score: 74,
          confidence: 89,
          recommendation: "Needs More Evidence",
          strengths: [
            "Relevant RAG experience",
            "OCR experience",
            "Production backend experience",
          ],
          concerns: [
            "Core multi-agent requirement remains unproven",
          ],
          evidence: [
            {
              quote:
                "everything I've actually shipped has been single-agent RAG.",
              source: "Transcript · Q3",
              why:
                "Directly limits the candidate's demonstrated agentic experience.",
            },
          ],
          insufficientInfo: [],
        },

        {
          agent: "Ethan Cole",
          score: 82,
          confidence: 93,
          recommendation: "Consider for interview",
          strengths: [
            "Strong honesty",
            "Good backend foundation",
            "Clear understanding of current limitations",
          ],
          concerns: [
            "Would require significant ramp-up on multi-agent production systems",
          ],
          evidence: [
            {
              quote:
                "That’s a real gap relative to what this role needs.",
              source: "Transcript · Q3",
              why:
                "Candidate demonstrates accurate self-assessment.",
            },
          ],
          insufficientInfo: [],
        },
      ],

      debate: [
        {
          speaker: "Arjun Mehta",
          respondingTo: "Ethan Cole",
          response:
            "Her honesty is valuable, but it doesn't remove the production multi-agent gap.",
          changedMind: false,
          updatedScore: 72,
          evidence: [
            {
              quote:
                "Not in production.",
              source: "Transcript · Q3",
              why:
                "Confirms the central experience gap.",
            },
          ],
        },

        {
          speaker: "Ethan Cole",
          respondingTo: "Arjun Mehta",
          response:
            "Fair. I would still increase confidence in the candidate's ability to ramp because she has already built RAG systems in production.",
          changedMind: true,
          updatedScore: 80,
          evidence: [
            {
              quote:
                "started building an internal RAG-based support-ticket assistant",
              source: "Resume",
              why:
                "Shows relevant applied AI experience.",
            },
          ],
        },

        {
          speaker: "Marcus Reed",
          respondingTo: "Ethan Cole",
          response:
            "The RAG experience is relevant, but the role specifically requires multi-agent orchestration.",
          changedMind: false,
          updatedScore: 74,
          evidence: [
            {
              quote:
                "everything I've actually shipped has been single-agent RAG.",
              source: "Transcript · Q3",
              why:
                "Shows the difference between current capability and role requirements.",
            },
          ],
        },

        {
          speaker: "Daniel Brooks",
          respondingTo: "Marcus Reed",
          response:
            "I agree. Her strongest differentiator is transparency, not direct role fit.",
          changedMind: false,
          updatedScore: 76,
          evidence: [
            {
              quote:
                "I'd rather say that clearly than talk around it.",
              source: "Transcript · Q3",
              why:
                "Strong communication and honesty evidence.",
            },
          ],
        },
      ],

      finalDecision: {
        recommendation: "Needs More Evidence",
        confidence: 89,
        reasoning:
          "The candidate has solid backend, RAG and OCR experience and communicates limitations honestly. However, the role specifically requires production multi-agent systems experience, which the candidate explicitly does not have. The panel therefore recommends further evaluation rather than treating the candidate as an immediate hire.",
        strengths: [
          "Strong Python/backend foundation",
          "Useful RAG and OCR experience",
          "Good production engineering experience",
          "Strong honesty and communication",
        ],
        concerns: [
          "No production multi-agent orchestration experience",
          "Would require ramp-up on LangGraph/CrewAI-style systems",
        ],
        unresolvedDisagreements: [
          "How much the candidate's RAG experience offsets the multi-agent experience gap",
        ],
        evidence: [
          {
            quote:
              "Not in production.",
            source: "Transcript · Q3",
            why:
              "Directly establishes the main experience gap.",
          },
          {
            quote:
              "everything I've actually shipped has been single-agent RAG.",
            source: "Transcript · Q3",
            why:
              "Confirms the scope of shipped AI experience.",
          },
        ],
      },
    },
  };

  setResults(localResults);

  setLoading(false);
}

  /* =======================================================
     RUN CUSTOM CANDIDATE
     ======================================================= */

  async function runCustom() {
    if (
      !customResume.trim() ||
      !customTranscript.trim()
    ) {
      setError(
        "Please provide both your resume and interview transcript."
      );
      return;
    }

    setLoading(true);
    setError("");
    setShowComparison(false);

    try {
      const response =
        await fetch("/api/panel", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            job: JOB,

            custom: {
              resume: customResume,
              transcript:
                customTranscript,
            },
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Custom analysis failed"
        );
      }

      setResults((current) => {
        if (!current) {
          return {
            A: data.custom,
            B: data.custom,
            CUSTOM: data.custom,
          };
        }

        return {
          ...current,
          CUSTOM: data.custom,
        };
      });

      setRevealed((current) => ({
        ...current,
        CUSTOM: false,
      }));

    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : String(e)
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     REVEAL
     ======================================================= */

  function revealDecision() {
    setRevealed((current) => ({
      ...current,
      [active]: true,
    }));
  }

  /* =======================================================
     CURRENT RESULT
     ======================================================= */

  const currentResult =
    results
      ? active === "CUSTOM"
        ? results.CUSTOM
        : results[active]
      : null;

  const currentName =
    active === "A"
      ? "Rohan Malhotra"
      : active === "B"
        ? "Ananya Iyer"
        : "Custom Candidate";

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="app">

      <div className="ambient" />

      <div className="shell">

        {/* =================================================
            HERO
            ================================================= */}

        <header className="hero">

          <div>

            <div className="brand">
              <span className="brand-mark">
                ✦
              </span>

              VeriHire
            </div>

            <span className="kicker">
              MULTI-AGENT INTERVIEW
              INTELLIGENCE
            </span>

            <h1>
              Four minds.
              <br />

              <span>
                One hiring decision.
              </span>
            </h1>

            <p>
              Evidence-backed candidate
              evaluation where independent
              AI interviewers challenge each
              other before reaching a final
              verdict.
            </p>

          </div>

        </header>

        {/* =================================================
            WORKFLOW
            ================================================= */}

        <div className="workflow">

          <div className="step active">
            <b>01</b>
            INPUT
          </div>

          <i />

          <div className="step">
            <b>02</b>
            PROFILE
          </div>

          <i />

          <div className="step">
            <b>03</b>
            PANEL
          </div>

          <i />

          <div className="step">
            <b>04</b>
            DEBATE
          </div>

          <i />

          <div className="step">
            <b>05</b>
            DECISION
          </div>

        </div>

        {/* =================================================
            INPUT
            ================================================= */}

        <section className="input-card">

          <div className="section-head">

            <div>

              <span className="kicker">
                01 / CASE INPUT
              </span>

              <h2>
               The interview context
              </h2>

            </div>

            

          </div>

          {/* FIXED JOB */}

          <label>
            JOB DESCRIPTION
          </label>

          <div className="vh-job-card">
            <div className="vh-job-header">
              <div>
                <div className="vh-job-eyebrow">FIXED ROLE</div>
                <h3>AI Engineer — Agentic Systems</h3>
                <p>Cargonet AI · Freight Technology</p>
              </div>
            </div>

            <div className="vh-job-body">
              <section className="vh-job-section">
                <div className="vh-section-heading">
                  <span>01</span>
                  <strong>ABOUT THE ROLE</strong>
                </div>
                <p className="vh-job-description">
                  We need an engineer to help improve an existing AI agent system
                  with planner, executor, reviewer, and specialized agents working
                  together. This is a production role focused on building real
                  features and keeping live systems reliable.
                </p>
              </section>

              <section className="vh-job-section">
                <div className="vh-section-heading">
                  <span>02</span>
                  <strong>WHAT YOU&apos;LL DO</strong>
                </div>

                <div className="vh-responsibilities">
                  <div className="vh-responsibility"><span>01</span><p>Improve the multi-agent AI system for quoting, booking, tracking, document processing, and error handling.</p></div>
                  <div className="vh-responsibility"><span>02</span><p>Build features mainly by directing AI coding tools, reviewing and guiding their output.</p></div>
                  <div className="vh-responsibility"><span>03</span><p>Work on Python backend services and React.js front-end screens using MongoDB.</p></div>
                  <div className="vh-responsibility"><span>04</span><p>Improve prompting, tools/memory, RAG, vector search, and model quality/cost decisions.</p></div>
                  <div className="vh-responsibility"><span>05</span><p>Keep the live system running smoothly and fix agent failures.</p></div>
                  <div className="vh-responsibility"><span>06</span><p>Connect outside tools and document scanning/OCR.</p></div>
                </div>
              </section>

              <section className="vh-job-section">
                <div className="vh-section-heading">
                  <span>03</span>
                  <strong>WHAT WE&apos;RE LOOKING FOR</strong>
                </div>
                <div className="vh-job-tags">
                  <span>Python Backend</span><span>LLM / AI</span><span>Prompt Engineering</span>
                  <span>RAG</span><span>Vector Search</span><span>Production Ownership</span>
                  <span>React.js</span><span>OCR</span><span>Logistics / Freight</span>
                </div>
              </section>

              <div className="vh-job-note">
                <div className="vh-note-mark">✦</div>
                <div>
                  <strong>Production-first role</strong>
                  <p>This is not a research-only role. You&apos;ll be working on systems that go live for real users and will be responsible for fixing them when things break in production.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CANDIDATE TABS */}

          {/* CANDIDATE TABS + DEMO BUTTON */}

<div className="candidate-controls">

  <div className="candidate-tabs">

    <button
      className={
        active === "A"
          ? "tab active"
          : "tab"
      }
      onClick={() =>
        setActive("A")
      }
    >
      CANDIDATE A

      <small>
        ROHAN MALHOTRA
      </small>
    </button>

    <button
      className={
        active === "B"
          ? "tab active"
          : "tab"
      }
      onClick={() =>
        setActive("B")
      }
    >
      CANDIDATE B

      <small>
        ANANYA IYER
      </small>
    </button>

    <button
      className={
        active === "CUSTOM"
          ? "tab active custom-tab"
          : "tab custom-tab"
      }
      onClick={() =>
        setActive("CUSTOM")
      }
    >
      CUSTOM CANDIDATE

      <small>
        USE YOUR OWN RESUME
      </small>
    </button>

  </div>

  <button
    className="ghost demo-button"
    onClick={loadDemo}
  >
    ↺ Load official demo data
  </button>

</div>

          {/* INPUTS */}

          <div className="candidate-input">

            {active === "A" && (
              <>

                <div>

                  <label>
                    RESUME
                  </label>

                  <textarea
                    value={resumeA}
                    onChange={(e) =>
                      setResumeA(
                        e.target.value
                      )
                    }
                    placeholder="Candidate A resume..."
                  />

                </div>

                <div>

                  <label>
                    INTERVIEW TRANSCRIPT
                  </label>

                  <textarea
                    value={transcriptA}
                    onChange={(e) =>
                      setTranscriptA(
                        e.target.value
                      )
                    }
                    placeholder="Candidate A interview transcript..."
                  />

                </div>

              </>
            )}

            {active === "B" && (
              <>

                <div>

                  <label>
                    RESUME
                  </label>

                  <textarea
                    value={resumeB}
                    onChange={(e) =>
                      setResumeB(
                        e.target.value
                      )
                    }
                    placeholder="Candidate B resume..."
                  />

                </div>

                <div>

                  <label>
                    INTERVIEW TRANSCRIPT
                  </label>

                  <textarea
                    value={transcriptB}
                    onChange={(e) =>
                      setTranscriptB(
                        e.target.value
                      )
                    }
                    placeholder="Candidate B interview transcript..."
                  />

                </div>

              </>
            )}

            {active === "CUSTOM" && (
              <>

                <div>

                  <label>
                    YOUR RESUME
                  </label>

                  <textarea
                    value={customResume}
                    onChange={(e) =>
                      setCustomResume(
                        e.target.value
                      )
                    }
                    placeholder="Paste your resume here..."
                  />

                </div>

                <div>

                  <label>
                    YOUR INTERVIEW TRANSCRIPT
                  </label>

                  <textarea
                    value={customTranscript}
                    onChange={(e) =>
                      setCustomTranscript(
                        e.target.value
                      )
                    }
                    placeholder="Paste your interview transcript here..."
                  />

                </div>

              </>
            )}

          </div>

          {/* RUN */}

          <div className="run-row">

            {active === "CUSTOM" ? (

              <button
                className="run"
                onClick={runCustom}
                disabled={
                  loading ||
                  !customResume.trim() ||
                  !customTranscript.trim()
                }
              >

                {loading ? (
                  <>
                    <span className="spinner" />

                    ANALYZING CUSTOM
                    CANDIDATE...
                  </>
                ) : (
                  <>
                    ANALYZE CUSTOM
                    CANDIDATE

                    <span>
                      →
                    </span>
                  </>
                )}

              </button>

            ) : (

              <button
                className="run"
                onClick={run}
                disabled={
                  loading ||
                  !resumeA ||
                  !transcriptA ||
                  !resumeB ||
                  !transcriptB
                }
              >

                {loading ? (
                  <>
                    <span className="spinner" />

                    RUNNING PANEL...
                  </>
                ) : (
                  <>
                    RUN INTERVIEW PANEL

                    <span>
                      →
                    </span>
                  </>
                )}

              </button>

            )}

            <span>

              {loading
                ? "Running evaluations and debate…"
                : active === "CUSTOM"
                  ? "Your candidate will be evaluated against the fixed role."
                  : "Both candidates will be processed independently."}

            </span>

          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

        </section>

        {/* =================================================
            RESULTS
            ================================================= */}

        {results && currentResult && (
          <section className="results">

            <div className="results-head">

              <div>

                <span className="kicker">
                  02 / RESULTS
                </span>

                <h2>
                  Decision workspace
                </h2>

              </div>

              <div className="result-actions">

                {/* COMPARISON ONLY WHEN A/B EXIST */}

                <button
                  className="compare-button"
                  onClick={() =>
                    setShowComparison(
                      true
                    )
                  }
                >
                  <span>
                    ⇄
                  </span>

                  COMPARE CANDIDATES
                </button>

                <div className="result-tabs">

                  <button
                    className={
                      active === "A"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActive("A")
                    }
                  >
                    A · Rohan
                  </button>

                  <button
                    className={
                      active === "B"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActive("B")
                    }
                  >
                    B · Ananya
                  </button>

                  {results.CUSTOM && (
                    <button
                      className={
                        active ===
                        "CUSTOM"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActive(
                          "CUSTOM"
                        )
                      }
                    >
                      C · Custom
                    </button>
                  )}

                </div>

              </div>

            </div>

            <CandidateResult
              name={currentName}
              result={currentResult}
              revealed={
                revealed[active]
              }
              onReveal={
                revealDecision
              }
            />

          </section>
        )}

        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {!results && (
          <section className="preview">

            <div>

              <span className="kicker">
                THE PIPELINE
              </span>

              <h2>
                What the judges will see
              </h2>

            </div>

            <div className="preview-grid">

              <div>
                <b>01</b>

                <h3>
                  Profile Builder
                </h3>

                <p>
                  Extracts claims,
                  skills, experience
                  and source evidence.
                </p>
              </div>

              <div>
                <b>02</b>

                <h3>
                  Four independent
                  agents
                </h3>

                <p>
                  Technical ·
                  HR/Culture · Hiring
                  Manager · Skeptic.
                </p>
              </div>

              <div>
                <b>03</b>

                <h3>
                  Evidence debate
                </h3>

                <p>
                  Agents challenge
                  conclusions and can
                  visibly revise
                  opinions.
                </p>
              </div>

              <div>
                <b>04</b>

                <h3>
                  Final reasoning
                </h3>

                <p>
                  A decision based
                  on evidence and
                  confidence, not
                  averaging.
                </p>
              </div>

            </div>

          </section>
        )}

      </div>

      {/* =================================================
          COMPARISON MODAL
          ================================================= */}

      <style jsx>{`
        .vh-job-card { margin-top:14px; margin-bottom:28px; border:1px solid #273247; border-radius:16px; overflow:hidden; background:#090e15; box-shadow:0 18px 50px rgba(0,0,0,.18); }
        .vh-job-header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:24px 26px; border-bottom:1px solid #202938; background:#0c1119; }
        .vh-job-eyebrow { margin-bottom:8px; color:#74819a; font-size:10px; font-weight:700; letter-spacing:.14em; }
        .vh-job-header h3 { margin:0; color:#e6eaf1; font-size:22px; font-weight:650; line-height:1.3; letter-spacing:-.02em; }
        .vh-job-header p { margin:7px 0 0; color:#7f8a9c; font-size:12px; }
        .vh-locked { flex-shrink:0; display:flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid #303b4e; border-radius:8px; background:#0b1119; color:#8994a7; font-size:10px; font-weight:700; letter-spacing:.08em; }
        .vh-job-body { padding:26px; }
        .vh-job-section { margin-bottom:28px; }
        .vh-section-heading { display:flex; align-items:center; gap:11px; margin-bottom:13px; color:#8792a5; font-size:10px; letter-spacing:.13em; line-height:1; }
        .vh-section-heading > span { display:inline-flex; align-items:center; justify-content:center; width:25px; height:25px; flex-shrink:0; border:1px solid #303b50; border-radius:6px; background:#101722; color:#8291b9; font-size:8px; font-weight:700; letter-spacing:0; }
        .vh-section-heading strong { font-weight:700; }
        .vh-job-description { margin:0; padding:15px 17px; border:1px solid #202a3a; border-radius:10px; background:#0c121a; color:#aeb8c7; font-size:13px; line-height:1.7; }
        .vh-responsibilities { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
        .vh-responsibility { display:flex; align-items:flex-start; gap:12px; min-height:78px; padding:14px; box-sizing:border-box; border:1px solid #202a3a; border-radius:10px; background:#0c121a; transition:border-color .18s ease,background .18s ease,transform .18s ease; }
        .vh-responsibility:hover { border-color:#3d4b65; background:#101722; transform:translateY(-1px); }
        .vh-responsibility > span { display:inline-flex; align-items:center; justify-content:center; width:25px; height:25px; flex-shrink:0; border-radius:6px; background:#131b29; color:#7587b4; font-size:8px; font-weight:700; }
        .vh-responsibility p { margin:1px 0 0; color:#aeb8c7; font-size:12px; line-height:1.55; }
        .vh-job-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .vh-job-tags span { display:inline-flex; align-items:center; padding:8px 11px; border:1px solid #273247; border-radius:7px; background:#0d141e; color:#aab5c6; font-size:10px; font-weight:550; white-space:nowrap; transition:border-color .18s ease,background .18s ease,color .18s ease; }
        .vh-job-tags span:hover { border-color:#43516b; background:#121a26; color:#d1d8e3; }
        .vh-job-note { display:flex; align-items:flex-start; gap:12px; padding:15px 17px; border:1px solid #222e42; border-radius:10px; background:#0d1521; }
        .vh-note-mark { display:flex; align-items:center; justify-content:center; width:26px; height:26px; flex-shrink:0; border-radius:7px; background:#121b2a; color:#8192c0; font-size:13px; }
        .vh-job-note strong { display:block; margin-bottom:4px; color:#c1cad8; font-size:11px; font-weight:650; }
        .vh-job-note p { margin:0; color:#7f8b9e; font-size:11px; line-height:1.55; }
        @media (max-width:750px) { .vh-job-header { align-items:flex-start; flex-direction:column; padding:20px; } .vh-job-body { padding:20px; } .vh-responsibilities { grid-template-columns:1fr; } }
      `}</style>

      {results &&
        results.A &&
        results.B &&
        showComparison && (
          <ComparisonModal
            results={{
              A: results.A,
              B: results.B,
            }}
            onClose={() =>
              setShowComparison(
                false
              )
            }
          />
        )}

    </main>
  );
}