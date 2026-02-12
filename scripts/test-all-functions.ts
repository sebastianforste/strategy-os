import dotenv from "dotenv";
import path from "path";
import module from "module";
import type { PersonaId } from "../utils/personas";

type RequireFn = (id: string) => unknown;
const ModuleProto = module as unknown as { prototype: { require: RequireFn } };
const originalRequire = ModuleProto.prototype.require;
ModuleProto.prototype.require = function (...args: unknown[]) {
  if (args[0] === "server-only") return {};
  return originalRequire.call(this, args[0] as string);
};

dotenv.config({ path: path.join(process.cwd(), ".env") });

const TOPIC = process.argv.slice(2).join(" ").trim() || "Future of lawyers and influence of AI Agents";
const GEMINI_KEY =
  process.env.GOOGLE_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GEMINI_API_KEY ||
  "";

type FunctionResult = {
  ok: boolean;
  detail: string;
};

type PersonaRun = {
  personaId: string;
  processInput: FunctionResult;
  scoreViralityAction: FunctionResult;
  refineAuthorityAction: FunctionResult;
  reviseWithPersonaAction: FunctionResult;
  generateCommentAction: FunctionResult;
};

type GenerateActions = typeof import("../actions/generate");
type PersonaMap = typeof import("../utils/personas")["PERSONAS"];

function success(detail: string): FunctionResult {
  return { ok: true, detail };
}

function failure(detail: string): FunctionResult {
  return { ok: false, detail };
}

function fmt(result: FunctionResult): string {
  return `${result.ok ? "PASS" : "FAIL"} - ${result.detail}`;
}

async function runForPersona(
  personaId: string,
  actions: GenerateActions,
  personas: PersonaMap
): Promise<PersonaRun> {
  let baseText = "";
  const persona = personas[personaId as keyof PersonaMap] || personas.cso;

  const out: PersonaRun = {
    personaId,
    processInput: failure("not run"),
    scoreViralityAction: failure("not run"),
    refineAuthorityAction: failure("not run"),
    reviseWithPersonaAction: failure("not run"),
    generateCommentAction: failure("not run"),
  };

  try {
    const assets = await actions.processInput(TOPIC, { gemini: GEMINI_KEY }, personaId as PersonaId, false);
    baseText = assets.textPost || "";
    if (baseText.trim().length === 0) {
      out.processInput = failure("empty textPost");
    } else {
      out.processInput = success(`textPost length=${baseText.length}`);
    }
  } catch (error) {
    out.processInput = failure(error instanceof Error ? error.message : "unknown error");
  }

  try {
    const inputForScoring = baseText || TOPIC;
    const virality = await actions.scoreViralityAction(inputForScoring, GEMINI_KEY, personaId);
    out.scoreViralityAction = success(`score=${virality.score}`);
  } catch (error) {
    out.scoreViralityAction = failure(error instanceof Error ? error.message : "unknown error");
  }

  try {
    const inputForRefine = baseText || TOPIC;
    const refined = await actions.refineAuthorityAction(inputForRefine, GEMINI_KEY, personaId as PersonaId);
    const len = refined?.textPost?.length || 0;
    out.refineAuthorityAction = len > 0 ? success(`textPost length=${len}`) : failure("empty refined textPost");
  } catch (error) {
    out.refineAuthorityAction = failure(error instanceof Error ? error.message : "unknown error");
  }

  try {
    const inputForRevise = baseText || TOPIC;
    const revised = await actions.reviseWithPersonaAction(
      inputForRevise,
      GEMINI_KEY,
      personaId as PersonaId,
      `Rewrite in ${persona.name} voice with tighter clarity.`
    );
    out.reviseWithPersonaAction =
      revised.trim().length > 0
        ? success(`revised length=${revised.length}`)
        : failure("empty revised text");
  } catch (error) {
    out.reviseWithPersonaAction = failure(error instanceof Error ? error.message : "unknown error");
  }

  try {
    const comment = await actions.generateCommentAction(
      baseText || TOPIC,
      "Contrarian",
      GEMINI_KEY,
      personaId as PersonaId
    );
    out.generateCommentAction =
      comment && String(comment).trim().length > 0
        ? success(`comment length=${String(comment).length}`)
        : failure("empty comment");
  } catch (error) {
    out.generateCommentAction = failure(error instanceof Error ? error.message : "unknown error");
  }

  return out;
}

async function main() {
  if (!GEMINI_KEY) {
    console.error("❌ Missing Gemini key (.env: GOOGLE_API_KEY or GEMINI_API_KEY).");
    process.exit(1);
  }

  const [{ PERSONAS }, actions] = await Promise.all([import("../utils/personas"), import("../actions/generate")]);
  const personaIds = Object.keys(PERSONAS);

  console.log(`\n🧪 Testing functions for all personas`);
  console.log(`Topic: "${TOPIC}"`);
  console.log(`Personas: ${personaIds.join(", ")}\n`);

  const results: PersonaRun[] = [];
  for (const personaId of personaIds) {
    console.log(`\n🎭 Persona: ${personaId}`);
    const personaResult = await runForPersona(personaId, actions, PERSONAS);
    results.push(personaResult);
    console.log(`  processInput: ${fmt(personaResult.processInput)}`);
    console.log(`  scoreViralityAction: ${fmt(personaResult.scoreViralityAction)}`);
    console.log(`  refineAuthorityAction: ${fmt(personaResult.refineAuthorityAction)}`);
    console.log(`  reviseWithPersonaAction: ${fmt(personaResult.reviseWithPersonaAction)}`);
    console.log(`  generateCommentAction: ${fmt(personaResult.generateCommentAction)}`);
  }

  const summary = results.map((r) => {
    const all = [
      r.processInput,
      r.scoreViralityAction,
      r.refineAuthorityAction,
      r.reviseWithPersonaAction,
      r.generateCommentAction,
    ];
    const passed = all.filter((x) => x.ok).length;
    return { personaId: r.personaId, passed, total: all.length };
  });

  const totalPassed = summary.reduce((acc, s) => acc + s.passed, 0);
  const totalChecks = summary.reduce((acc, s) => acc + s.total, 0);

  console.log("\n📊 Summary");
  for (const s of summary) {
    console.log(`  ${s.personaId}: ${s.passed}/${s.total} passed`);
  }
  console.log(`\nOverall: ${totalPassed}/${totalChecks} passed`);

  if (totalPassed < totalChecks) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("❌ Harness crashed:", error);
  process.exit(1);
});
