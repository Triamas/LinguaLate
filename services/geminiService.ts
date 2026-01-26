import { GoogleGenAI } from "@google/genai";
import { CEFRLevel } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Translates text incrementally, paragraph by paragraph.
 * This allows the user to see the beginning of the translation immediately.
 */
export const translateTextStream = async (
  text: string,
  sourceLang: string,
  targetLang: string,
  level: CEFRLevel,
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!text.trim()) return;

  // Split text by double newlines to identify paragraphs, capturing the delimiter.
  // Example: "Para1\n\nPara2" -> ["Para1", "\n\n", "Para2"]
  // This helps us preserve the original spacing structure.
  const parts = text.split(/(\n\s*\n)/);
  
  // Maintain context from the strictly previous paragraph to ensure continuity
  let previousContext = "";

  for (const part of parts) {
    // If the part is just whitespace/newlines, stream it directly without processing
    if (!part.trim()) {
      onChunk(part);
      continue;
    }

    // Process the paragraph
    let translatedParagraph = "";
    await translateParagraph(
      part,
      previousContext,
      sourceLang,
      targetLang,
      level,
      (chunk) => {
        translatedParagraph += chunk;
        onChunk(chunk);
      }
    );

    // Update context: strictly use the paragraph we just translated for the next iteration
    // This ensures the model has the immediate preceding context for flow and pronouns.
    if (translatedParagraph.trim()) {
        previousContext = translatedParagraph;
    }
  }
};

/**
 * Handles the translation/adaptation of a single paragraph using the 2-step process.
 */
const translateParagraph = async (
  text: string,
  context: string,
  sourceLang: string,
  targetLang: string,
  level: CEFRLevel,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const modelName = 'gemini-3-flash-preview';
  
  // Detect if this is a translation or a same-language simplification/complication
  const isSameLang = targetLang === 'source' || sourceLang === targetLang || (sourceLang === 'auto' && /^[a-zA-Z]/.test(text));
  const isFinnish = targetLang === 'fi' || (targetLang === 'source' && sourceLang === 'fi');
  
  const actionType = isSameLang ? "Paraphrase and Rewrite" : "Translate";
  const effectiveTargetLang = targetLang === 'source' ? "the same language as the input text" : targetLang;

  // Step 1: Initial Draft (Non-streaming, fast)
  const draftSystemInstruction = `
    You are a professional linguist and CEFR specialist.
    Task: ${actionType} the input text segment into ${effectiveTargetLang}.
    Target Level: ${level}.
    
    CONTEXT HANDLING:
    The input text is a segment of a larger document. 
    Use the "Previous Context" to maintain continuity (tone, pronouns, specific terminology).
    DO NOT translate or repeat the "Previous Context". Only translate the "Input Text Segment".
    
    CEFR Guidelines:
    1. Preserve the original meaning and tone.
    2. Adapt vocabulary and sentence structure to fit the ${level} level.
    3. Keep proper nouns (names, places) unchanged unless there is a standard translation.
    4. Return ONLY the result text. No explanations.
  `;

  const draftPrompt = `
    Source Language: ${sourceLang === 'auto' ? 'Auto-detect' : sourceLang}
    
    Previous Context (for continuity only):
    "${context}"

    Input Text Segment (Translate this):
    "${text}"
  `;

  let hasContent = false;

  try {
    const draftResponse = await ai.models.generateContent({
      model: modelName,
      contents: draftPrompt,
      config: {
        systemInstruction: draftSystemInstruction,
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
      }
    });

    let draftText = draftResponse.text;
    
    // Robustness Check 1: Empty Draft
    // If the draft is missing or empty, fallback to the original text for the verification step.
    if (!draftText || !draftText.trim()) {
        console.warn("Draft generation returned empty. Falling back to original text for verification step.");
        draftText = text;
    }

    // Step 2: Verification and Adaptation (Streaming)
    // Optimization: The "Gatekeeper". Strict rules to enforce the specific math of CEFR levels.
    const verificationSystemInstruction = `
      You are a Strict CEFR Auditor.
      Your task is to review the Draft Text and REWRITE it to strictly match the grammatical and lexical constraints of CEFR Level ${level} in ${effectiveTargetLang}.

      STRICT GRAMMAR & VOCABULARY RULES FOR ${level}:
      ${getCefrRules(level, isFinnish)}

      Universal Rules:
      - **Do Not Summarize**: Ensure full fidelity to the content of the draft.
      - **No Bleeding**: Content must remain within its respective paragraph.
      - If the draft is too complex for ${level}, breakdown sentences and simplify words.
      - If the draft is too simple for ${level} (and the level is B2+), use more precise vocabulary and varied structures.
      - Output ONLY the final text.
    `;

    const verificationPrompt = `
      Draft Text:
      "${draftText}"

      Target Language: ${effectiveTargetLang}
      Target Level: ${level}
    `;

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: verificationPrompt,
      config: {
        systemInstruction: verificationSystemInstruction,
        temperature: 0.15,
        topP: 0.85,
        topK: 32,
      }
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
            hasContent = true;
            onChunk(chunk.text);
        }
    }

    // Robustness Check 2: Empty Stream
    // If streaming yielded no results, output the draft text (which might be the original text)
    if (!hasContent) {
        console.warn("Verification stream empty. Fallback to draft text.");
        onChunk(draftText!); 
        hasContent = true;
    }

  } catch (error) {
    console.error("Translation error segment:", error);
    
    // Fatal Error Check
    // We re-throw errors that imply the service is completely broken/unavailable
    // so the UI can show a proper error message instead of silently failing.
    const errorStr = String(error);
    const isFatal = 
        errorStr.includes('400') || 
        errorStr.includes('401') || 
        errorStr.includes('403') || 
        errorStr.includes('429') || 
        errorStr.toLowerCase().includes('api key');

    if (isFatal) {
        throw error;
    }

    // Robustness Check 3: Exception Handling for non-fatal errors
    // If we encounter a transient error and haven't streamed any content yet, 
    // fallback to the original text to ensure the user doesn't lose content.
    if (!hasContent) {
        onChunk(text);
    }
    // For non-fatal errors, we swallow the error so the main loop continues.
  }
};

/**
 * Helper to inject specific prompt engineering rules based on level.
 * Defines the "Math" of the language level.
 */
function getCefrRules(level: CEFRLevel, isFinnish: boolean): string {
  const l = level as string;
  let baseRules = "";

  if (l.startsWith('A1')) {
    baseRules = `
      - SENTENCE STRUCTURE: Simple sentences only (Subject-Verb-Object). Max 10-12 words per sentence. No nested clauses.
      - VOCABULARY: strictly restricted to the 500 most frequent words (concrete nouns, basic verbs).
      - TENSES: Present Simple, Imperative. Avoid Past Tense unless absolutely necessary for context (use simple forms).
      - CONNECTORS: Use only: "and", "or". Avoid "because", "so", "but" if possible, or use very simply.
      - PROHIBITED: Passive voice, idioms, metaphors, subjunctive.
    `;
  } else if (l.startsWith('A2')) {
    baseRules = `
      - SENTENCE STRUCTURE: Compound sentences allowed but keep them linear.
      - VOCABULARY: High frequency words (top 1000). Everyday topics (family, shopping, local geography, work).
      - TENSES: Present Simple, Present Continuous, Past Simple, Future with "going to".
      - CONNECTORS: "and", "but", "because", "so", "when".
      - PROHIBITED: Complex passive structures, conditional sentences (except very basic "if" zero conditional).
    `;
  } else if (l.startsWith('B1')) {
    baseRules = `
      - SENTENCE STRUCTURE: Connected text on familiar topics. Subordinate clauses allowed (who, which, that).
      - VOCABULARY: Standard language (~2000 words). Can express opinions, dreams, hopes.
      - TENSES: Present Perfect, basic conditionals (1st/2nd), simple Passive Voice.
      - CONNECTORS: "although", "however", "therefore", "since".
      - STYLE: Clear standard input.
    `;
  } else if (l.startsWith('B2')) {
    baseRules = `
      - SENTENCE STRUCTURE: Complex sentences. Ability to produce clear, detailed text on a wide range of subjects.
      - VOCABULARY: Good range (~4000 words). Can discuss abstract topics and technical discussions in their field.
      - TENSES: Full range of tenses including Past Perfect, Future Perfect, Mixed Conditionals.
      - STYLE: Spontaneous fluency without much strain.
    `;
  } else if (l.startsWith('C1')) {
    baseRules = `
      - SENTENCE STRUCTURE: Flexible and effective. Long, complex texts with clear structure.
      - VOCABULARY: Broad lexical repertoire. Use of idioms and colloquialisms (appropriately).
      - GRAMMAR: High degree of grammatical control. Controlled use of organizational patterns, connectors, and cohesive devices.
      - STYLE: Implicit meaning, irony, emphasis.
    `;
  } else if (l.startsWith('C2')) {
    baseRules = `
      - SENTENCE STRUCTURE: No restriction. Can summarize information from different spoken and written sources.
      - VOCABULARY: Precision. Differentiating finer shades of meaning even in more complex situations.
      - STYLE: Literary, academic, or highly specific professional styles. 
      - INTENT: Convey nuance, subtext, and cultural references naturally.
    `;
  }

  if (isFinnish) {
    if (l.startsWith('A2')) {
        baseRules += `
        FINNISH SPECIFIC RULES (A2):
        - CASE SYSTEM: Focus on local cases (sijamuodot - Missä? Mistä? Mihin?) and basic Partitive. Avoid rare abstract cases.
        - VERBS: Use Present, Imperfect (Past), and Perfect. Avoid Pluperfect.
        - STRUCTURE: Use standard written Finnish (yleiskieli). Sentence structure must be simple and clear. Avoid "lausevastikkeet" (participial phrases) - use "kun" or "koska" clauses instead.
        - POSSESSIVE: Use "minun auto" (genitive + noun) structure rather than complex possessive suffixes if simpler.
        `;
    } else if (l.startsWith('B1')) {
        baseRules += `
        FINNISH SPECIFIC RULES (B1):
        - GRAMMAR: Introduce Conditional mood (-isi-) and Passive voice usage.
        - STRUCTURE: Use subordination (että, joka, kun). Basic participial phrases (lausevastikkeet) are allowed but keep them clear.
        - INFINITIVES: Correct use of MA-infinitives (menossa, menemään, tekemällä).
        - CASES: Use Essive (-na) and Translative (-ksi) to express states and changes.
        `;
    }
  }

  return baseRules;
}