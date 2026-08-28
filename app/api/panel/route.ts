import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";

/* =========================================================
   TYPES
   ========================================================= */

type Evidence = {
  quote: string;
  source: string;
  why: string;
};

type Opinion = {
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

/* =========================================================
   PROFILE SCHEMA
   ========================================================= */

const schema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },

    education: {
      type: "array",
      items: {
        type: "string",
      },
    },

    skills: {
      type: "array",
      items: {
        type: "string",
      },
    },

    experience: {
      type: "array",
      items: {
        type: "string",
      },
    },

    projects: {
      type: "array",
      items: {
        type: "string",
      },
    },

    claims: {
      type: "array",
      items: {
        type: "string",
      },
    },

    importantEvidence: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "name",
    "education",
    "skills",
    "experience",
    "projects",
    "claims",
    "importantEvidence",
  ],

  propertyOrdering: [
    "name",
    "education",
    "skills",
    "experience",
    "projects",
    "claims",
    "importantEvidence",
  ],
};

/* =========================================================
   OPINION SCHEMA
   ========================================================= */

const opinionSchema = {
  type: "object",

  properties: {
    agent: {
      type: "string",
    },

    score: {
      type: ["integer", "null"],
    },

    confidence: {
      type: "number",
    },

    recommendation: {
      type: "string",
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },

    concerns: {
      type: "array",
      items: {
        type: "string",
      },
    },

    evidence: {
      type: "array",

      items: {
        type: "object",

        properties: {
          quote: {
            type: "string",
          },

          source: {
            type: "string",
          },

          why: {
            type: "string",
          },
        },

        required: [
          "quote",
          "source",
          "why",
        ],
      },
    },

    insufficientInfo: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "agent",
    "score",
    "confidence",
    "recommendation",
    "strengths",
    "concerns",
    "evidence",
    "insufficientInfo",
  ],
};

/* =========================================================
   DEBATE SCHEMA
   ========================================================= */

const debateSchema = {
  type: "object",

  properties: {
    turns: {
      type: "array",

      items: {
        type: "object",

        properties: {
          speaker: {
            type: "string",
          },

          respondingTo: {
            type: "string",
          },

          response: {
            type: "string",
          },

          changedMind: {
            type: "boolean",
          },

          updatedScore: {
            type: ["integer", "null"],
          },

          evidence: {
            type: "array",

            items: {
              type: "object",

              properties: {
                quote: {
                  type: "string",
                },

                source: {
                  type: "string",
                },

                why: {
                  type: "string",
                },
              },

              required: [
                "quote",
                "source",
                "why",
              ],
            },
          },
        },

        required: [
          "speaker",
          "respondingTo",
          "response",
          "changedMind",
          "updatedScore",
          "evidence",
        ],
      },
    },
  },

  required: ["turns"],
};

/* =========================================================
   FINAL DECISION SCHEMA
   ========================================================= */

const finalSchema = {
  type: "object",

  properties: {
    recommendation: {
      type: "string",
    },

    confidence: {
      type: "number",
    },

    reasoning: {
      type: "string",
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },

    concerns: {
      type: "array",
      items: {
        type: "string",
      },
    },

    unresolvedDisagreements: {
      type: "array",
      items: {
        type: "string",
      },
    },

    evidence: {
      type: "array",

      items: {
        type: "object",

        properties: {
          quote: {
            type: "string",
          },

          source: {
            type: "string",
          },

          why: {
            type: "string",
          },
        },

        required: [
          "quote",
          "source",
          "why",
        ],
      },
    },
  },

  required: [
    "recommendation",
    "confidence",
    "reasoning",
    "strengths",
    "concerns",
    "unresolvedDisagreements",
    "evidence",
  ],
};

/* =========================================================
   GENERATE JSON
   ========================================================= */

async function generateJSON<T>(
  prompt: string,
  responseSchema: object
): Promise<T> {
  const response =
    await ai.models.generateContent({
      model: MODEL,

      contents: prompt,

      config: {
        responseMimeType:
          "application/json",

        responseJsonSchema:
          responseSchema,

        temperature: 0.3,
      },
    });

  if (!response.text) {
    throw new Error(
      "The model returned an empty response."
    );
  }

  return JSON.parse(
    response.text
  ) as T;
}

/* =========================================================
   PROFILE BUILDER
   ========================================================= */

async function buildProfile(
  job: string,
  resume: string,
  transcript: string
) {
  return generateJSON(
    `
You are the Candidate Profile Builder for a hiring system.

Extract only facts explicitly supported by the supplied material.

Never invent missing facts.

The job description is context, not evidence about the candidate.

JOB DESCRIPTION:
${job}

RESUME:
${resume}

INTERVIEW TRANSCRIPT:
${transcript}
`,
    schema
  );
}

/* =========================================================
   AGENTS
   ========================================================= */

const agentInstructions: Record<
  string,
  string
> = {
  "Technical Agent": `
Evaluate technical skill, technical depth,
project understanding, and technical claims.

Ignore personality and culture except where
directly relevant to technical work.
`,

  "HR / Culture Agent": `
Evaluate communication, teamwork,
professionalism, honesty, collaboration,
and culture-related evidence.

Do not inflate technical skill scores.
`,

  "Hiring Manager Agent": `
Evaluate whether the candidate is worth
hiring for the supplied role.

Consider role fit, demonstrated capability,
risks, and learning potential.

Stay grounded in evidence.
`,

  "Skeptic Agent": `
Actively search for contradictions,
exaggeration, unsupported claims,
vague answers, inconsistencies between
resume and transcript, and red flags.

Do not invent red flags.
`,
};

/* =========================================================
   INDEPENDENT OPINION
   ========================================================= */

async function independentOpinion(
  agent: string,
  job: string,
  profile: unknown,
  resume: string,
  transcript: string
): Promise<Opinion> {
  return generateJSON(
    `
You are ${agent} in a multi-agent hiring panel.

YOUR JOB:
${agentInstructions[agent]}

IMPORTANT INDEPENDENCE RULE:

This is the independent stage.

You have NOT seen and must NOT infer
the conclusions of any other agent.

Do not mention other agents.

Every important conclusion must be backed
by a specific quote or concrete fact from
the resume or transcript.

If there is not enough information to judge
something, put it in insufficientInfo and
use null for score when a meaningful score
cannot be justified.

Use the job description to understand the
role, but do not treat the job description
as proof that the candidate has a skill.

JOB DESCRIPTION:
${job}

SHARED CANDIDATE PROFILE:
${JSON.stringify(profile)}

SOURCE RESUME:
${resume}

SOURCE INTERVIEW TRANSCRIPT:
${transcript}
`,
    opinionSchema
  );
}

/* =========================================================
   DEBATE
   ========================================================= */

async function debate(
  job: string,
  profile: unknown,
  opinions: Opinion[],
  resume: string,
  transcript: string
): Promise<DebateTurn[]> {
  const result =
    await generateJSON<{
      turns: DebateTurn[];
    }>(
      `
You are the debate coordinator for a
multi-agent hiring panel.

The independent opinions below are now
visible to the debate stage.

They were produced separately and are the
only conclusions the agents are allowed
to see.

Create a real debate with at least 4 turns.

Each turn must directly respond to another
agent's point.

At least ONE agent must genuinely change
its mind because of another agent's evidence.

If changing a score is not justified by
the evidence, leave changedMind false
rather than forcing it.

Every response must remain grounded in
the supplied resume/transcript.

Include a concrete quote or fact as evidence.

JOB DESCRIPTION:
${job}

CANDIDATE PROFILE:
${JSON.stringify(profile)}

INDEPENDENT OPINIONS:
${JSON.stringify(opinions)}

RESUME:
${resume}

TRANSCRIPT:
${transcript}
`,
      debateSchema
    );

  return result.turns;
}

/* =========================================================
   FINAL DECISION
   ========================================================= */

async function finalDecision(
  job: string,
  profile: unknown,
  opinions: Opinion[],
  debateTurns: DebateTurn[],
  resume: string,
  transcript: string
) {
  return generateJSON(
    `
You are the final decision maker in a
hiring panel.

Make a reasoned final hiring recommendation.

DO NOT average the agents' scores.

Weigh:

1. Quality and directness of evidence.
2. Confidence of evidence-backed claims.
3. Contradictions and red flags.
4. What changed during the debate.
5. Fit against the actual job description.
6. Unresolved disagreements.

If evidence is insufficient for a conclusion,
explicitly say so rather than inventing certainty.

The final recommendation can be:

Hire
Reject
Needs More Evidence

Your final report must cite concrete facts
or quotes from the source material.

JOB DESCRIPTION:
${job}

CANDIDATE PROFILE:
${JSON.stringify(profile)}

INDEPENDENT OPINIONS:
${JSON.stringify(opinions)}

DEBATE:
${JSON.stringify(debateTurns)}

SOURCE RESUME:
${resume}

SOURCE TRANSCRIPT:
${transcript}
`,
    finalSchema
  );
}

/* =========================================================
   PROCESS ONE CANDIDATE
   ========================================================= */

async function processCandidate(
  job: string,
  resume: string,
  transcript: string
) {
  const profile =
    await buildProfile(
      job,
      resume,
      transcript
    );

  const agents =
    Object.keys(agentInstructions);

  const opinions: Opinion[] = [];

  /*
   * Keep these independent.
   * Each agent sees the source material,
   * but not another agent's conclusion.
   */

  for (const agent of agents) {
    opinions.push(
      await independentOpinion(
        agent,
        job,
        profile,
        resume,
        transcript
      )
    );
  }

  const debateTurns =
    await debate(
      job,
      profile,
      opinions,
      resume,
      transcript
    );

  const final =
    await finalDecision(
      job,
      profile,
      opinions,
      debateTurns,
      resume,
      transcript
    );

  return {
    profile,
    opinions,
    debate: debateTurns,
    finalDecision: final,
  };
}

/* =========================================================
   POST API
   ========================================================= */

export async function POST(
  request: Request
) {
  try {

    /* -----------------------------------------
       CHECK API KEY
       ----------------------------------------- */

    if (
      !process.env.GEMINI_API_KEY
    ) {
      return Response.json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it to .env.local and restart the dev server.",
        },
        {
          status: 500,
        }
      );
    }

    /* -----------------------------------------
       READ REQUEST
       ----------------------------------------- */

    const body =
      await request.json();

    const {
      job,
      candidates,
      custom,
    } = body;

    if (!job) {
      return Response.json(
        {
          error:
            "Job description is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       CUSTOM CANDIDATE
       ===================================================== */

    if (custom) {

      if (
        !custom.resume ||
        !custom.transcript
      ) {
        return Response.json(
          {
            error:
              "Custom candidate requires both a resume and interview transcript.",
          },
          {
            status: 400,
          }
        );
      }

      const customResult =
        await processCandidate(
          job,
          custom.resume,
          custom.transcript
        );

      return Response.json({
        custom: customResult,
      });
    }

    /* =====================================================
       NORMAL A/B CANDIDATES
       ===================================================== */

    if (
      !candidates?.A ||
      !candidates?.B
    ) {
      return Response.json(
        {
          error:
            "Both candidates are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !candidates.A.resume ||
      !candidates.A.transcript
    ) {
      return Response.json(
        {
          error:
            "Candidate A requires both a resume and interview transcript.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !candidates.B.resume ||
      !candidates.B.transcript
    ) {
      return Response.json(
        {
          error:
            "Candidate B requires both a resume and interview transcript.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       RUN BOTH CANDIDATES
       ----------------------------------------- */

    const [A, B] =
      await Promise.all([
        processCandidate(
          job,
          candidates.A.resume,
          candidates.A.transcript
        ),

        processCandidate(
          job,
          candidates.B.resume,
          candidates.B.transcript
        ),
      ]);

    /* -----------------------------------------
       RETURN RESULTS
       ----------------------------------------- */

    return Response.json({
      A,
      B,
    });

  } catch (error) {

    console.error(
      "PANEL ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}