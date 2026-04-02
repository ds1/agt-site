/**
 * .agt Capability Registry
 *
 * Structured vocabulary for agent capabilities. This is the single source of
 * truth — all UI components, spec pages, and documentation import from here.
 *
 * Wire format: capabilities are stored as flat `agt-cap={id}` DNS TXT records.
 * Categories and descriptions are a presentation/documentation concern only.
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type CapabilityCategory =
  | "language"
  | "code"
  | "data"
  | "search"
  | "media"
  | "communication"
  | "automation"
  | "security";

export interface CapabilityCategoryDef {
  id: CapabilityCategory;
  label: string;
  description: string;
  order: number;
}

export interface Capability {
  /** Wire-format ID used in agt-cap= records. Lowercase, hyphen-separated. */
  id: string;
  /** Human-readable label for UI display. */
  label: string;
  /** One-sentence description of what this capability means. */
  description: string;
  /** Category this capability belongs to. */
  category: CapabilityCategory;
  /** If true, hidden from selection UI but still parsed and displayed. */
  deprecated?: boolean;
  /** Alternative IDs that resolve to this capability. */
  aliases?: string[];
}

// ── Categories ──────────────────────────────────────────────────────────────

export const CAPABILITY_CATEGORIES: CapabilityCategoryDef[] = [
  { id: "language",       label: "Language",          description: "Text understanding, generation, and transformation",      order: 1 },
  { id: "code",           label: "Code",              description: "Software development and engineering",                    order: 2 },
  { id: "data",           label: "Data",              description: "Processing, analysis, and computation",                   order: 3 },
  { id: "search",         label: "Search & Retrieval", description: "Finding and accessing information",                      order: 4 },
  { id: "media",          label: "Media",             description: "Image, audio, video, and multimedia",                     order: 5 },
  { id: "communication",  label: "Communication",     description: "Interaction, messaging, and presentation",                order: 6 },
  { id: "automation",     label: "Automation",        description: "Workflows, scheduling, and system operations",            order: 7 },
  { id: "security",       label: "Security",          description: "Protection, compliance, and threat management",           order: 8 },
];

// ── Capabilities ────────────────────────────────────────────────────────────

export const CAPABILITIES: Capability[] = [
  // ── Language ──────────────────────────────────────────
  { id: "research",           label: "Research",            description: "Gathers, synthesizes, and cites information from multiple sources.",                        category: "language" },
  { id: "summarization",      label: "Summarization",       description: "Condenses long-form content into concise summaries.",                                      category: "language" },
  { id: "translation",        label: "Translation",         description: "Translates text between natural languages.",                                               category: "language" },
  { id: "content-writing",    label: "Content Writing",     description: "Generates articles, blog posts, documentation, or other long-form written content.",       category: "language" },
  { id: "copywriting",        label: "Copywriting",         description: "Produces marketing copy, ad text, taglines, and promotional content.",                     category: "language" },
  { id: "editing",            label: "Editing",             description: "Proofreads, corrects grammar, and improves style and clarity.",                            category: "language" },
  { id: "paraphrasing",       label: "Paraphrasing",        description: "Restates text in different words while preserving meaning.",                               category: "language" },
  { id: "extraction",         label: "Extraction",          description: "Pulls structured data from unstructured text (entities, dates, amounts).",                 category: "language" },
  { id: "classification",     label: "Classification",      description: "Categorizes text by topic, sentiment, intent, or other criteria.",                         category: "language" },
  { id: "question-answering", label: "Question Answering",  description: "Answers questions using provided context or general knowledge.",                           category: "language" },
  { id: "fact-checking",      label: "Fact Checking",       description: "Verifies claims against authoritative sources.",                                          category: "language" },
  { id: "reasoning",          label: "Reasoning",           description: "Performs multi-step logical reasoning and problem solving.",                               category: "language" },
  { id: "brainstorming",      label: "Brainstorming",       description: "Generates creative ideas, alternatives, and divergent options.",                           category: "language" },

  // ── Code ──────────────────────────────────────────────
  { id: "code-generation",    label: "Code Generation",     description: "Writes source code from natural language specifications.",                                 category: "code" },
  { id: "code-review",        label: "Code Review",         description: "Analyzes code for bugs, style issues, and improvement opportunities.",                     category: "code" },
  { id: "code-explanation",   label: "Code Explanation",    description: "Explains what code does in plain language.",                                               category: "code" },
  { id: "debugging",          label: "Debugging",           description: "Identifies and fixes software bugs.",                                                     category: "code" },
  { id: "testing",            label: "Testing",             description: "Writes or executes tests and reports results.",                                            category: "code" },
  { id: "refactoring",        label: "Refactoring",         description: "Restructures code for clarity or performance without changing behavior.",                  category: "code" },
  { id: "code-documentation", label: "Code Documentation",  description: "Generates docstrings, READMEs, and technical reference for code.",                         category: "code" },
  { id: "database-query",     label: "Database Query",      description: "Generates, optimizes, or explains SQL and database queries.",                              category: "code" },
  { id: "code-completion",    label: "Code Completion",     description: "Provides inline code suggestions and autocompletion.",                                     category: "code" },

  // ── Data ──────────────────────────────────────────────
  { id: "data-analysis",        label: "Data Analysis",        description: "Performs statistical analysis and extracts insights from structured data.",              category: "data" },
  { id: "data-visualization",   label: "Data Visualization",   description: "Creates charts, graphs, dashboards, and visual data representations.",                  category: "data" },
  { id: "data-cleaning",        label: "Data Cleaning",        description: "Normalizes, deduplicates, and corrects data quality issues.",                           category: "data" },
  { id: "data-transformation",  label: "Data Transformation",  description: "Converts data between formats, schemas, or structures (ETL).",                         category: "data" },
  { id: "math",                 label: "Math",                 description: "Solves mathematical problems and performs symbolic or numeric computation.",             category: "data" },
  { id: "forecasting",          label: "Forecasting",          description: "Builds predictive models and generates time-series forecasts.",                         category: "data" },
  { id: "anomaly-detection",    label: "Anomaly Detection",    description: "Identifies outliers and unexpected patterns in data.",                                  category: "data" },
  { id: "reporting",            label: "Reporting",            description: "Generates structured reports and executive summaries from data.",                        category: "data" },
  { id: "embedding",            label: "Embedding",            description: "Generates vector embeddings for text, images, or other inputs.",                        category: "data" },
  { id: "clustering",           label: "Clustering",           description: "Groups similar items together based on features or content.",                           category: "data" },
  { id: "ranking",              label: "Ranking",              description: "Scores and prioritizes items by relevance, quality, or other criteria.",                category: "data" },

  // ── Search & Retrieval ────────────────────────────────
  { id: "web-search",           label: "Web Search",           description: "Searches the public internet for information.",                                         category: "search" },
  { id: "semantic-search",      label: "Semantic Search",      description: "Retrieves results based on meaning rather than keyword matching.",                      category: "search" },
  { id: "document-search",      label: "Document Search",      description: "Searches across document collections, PDFs, or knowledge bases.",                      category: "search" },
  { id: "knowledge-retrieval",  label: "Knowledge Retrieval",  description: "Queries structured knowledge bases or performs retrieval-augmented generation.",         category: "search" },
  { id: "citation",             label: "Citation",             description: "Finds, formats, and verifies references and source attributions.",                      category: "search" },

  // ── Media ─────────────────────────────────────────────
  { id: "image-generation",     label: "Image Generation",     description: "Creates images from text prompts or other inputs.",                                     category: "media" },
  { id: "image-editing",        label: "Image Editing",        description: "Modifies, enhances, or transforms existing images.",                                   category: "media" },
  { id: "image-analysis",       label: "Image Analysis",       description: "Extracts information, labels, or descriptions from images.",                            category: "media" },
  { id: "video-generation",     label: "Video Generation",     description: "Creates video content from text, images, or other inputs.",                             category: "media" },
  { id: "video-analysis",       label: "Video Analysis",       description: "Extracts information, scenes, or transcripts from video.",                              category: "media" },
  { id: "audio-transcription",  label: "Audio Transcription",  description: "Converts spoken audio into text.",                                                     category: "media" },
  { id: "audio-generation",     label: "Audio Generation",     description: "Produces speech, music, or sound effects from text or other inputs.",                   category: "media" },
  { id: "ocr",                  label: "OCR",                  description: "Extracts text from images, scans, or documents via optical character recognition.",      category: "media" },
  { id: "design",               label: "Design",               description: "Creates UI mockups, graphics, layouts, or other visual design work.",                   category: "media" },
  { id: "3d-modeling",          label: "3D Modeling",           description: "Generates or manipulates three-dimensional models and scenes.",                         category: "media" },

  // ── Communication ─────────────────────────────────────
  { id: "chat",                 label: "Chat",                 description: "Engages in real-time conversational interaction with users or other agents.",            category: "communication" },
  { id: "email-drafting",       label: "Email Drafting",       description: "Composes, formats, and suggests email messages.",                                       category: "communication" },
  { id: "meeting-notes",        label: "Meeting Notes",        description: "Transcribes, summarizes, and extracts action items from meetings.",                     category: "communication" },
  { id: "presentation",         label: "Presentation",         description: "Creates slides, pitch decks, and structured visual presentations.",                     category: "communication" },
  { id: "tutoring",             label: "Tutoring",             description: "Provides educational instruction, explanations, and guided learning.",                  category: "communication" },
  { id: "customer-support",     label: "Customer Support",     description: "Handles support queries, troubleshooting, and issue resolution.",                       category: "communication" },
  { id: "negotiation",          label: "Negotiation",          description: "Facilitates structured dialogue toward agreement or compromise.",                       category: "communication" },

  // ── Automation ────────────────────────────────────────
  { id: "web-scraping",         label: "Web Scraping",         description: "Extracts structured data from web pages.",                                              category: "automation" },
  { id: "api-integration",      label: "API Integration",      description: "Connects to and orchestrates third-party APIs.",                                        category: "automation" },
  { id: "workflow-automation",   label: "Workflow Automation",  description: "Automates multi-step business or technical workflows.",                                 category: "automation" },
  { id: "scheduling",           label: "Scheduling",           description: "Manages time-based tasks, reminders, and calendar operations.",                         category: "automation" },
  { id: "monitoring",           label: "Monitoring",           description: "Observes systems, services, or data streams and reports on status changes.",             category: "automation" },
  { id: "deployment",           label: "Deployment",           description: "Manages CI/CD pipelines, releases, and software deployments.",                          category: "automation" },
  { id: "file-management",      label: "File Management",      description: "Organizes, converts, moves, and manages files and directories.",                        category: "automation" },
  { id: "notification",         label: "Notification",         description: "Sends alerts, messages, and notifications across channels.",                            category: "automation" },
  { id: "data-entry",           label: "Data Entry",           description: "Fills forms, inputs data, and automates manual entry tasks.",                           category: "automation" },

  // ── Security ──────────────────────────────────────────
  { id: "vulnerability-scanning", label: "Vulnerability Scanning", description: "Assesses systems and code for security weaknesses.",                                category: "security" },
  { id: "compliance-checking",    label: "Compliance Checking",    description: "Verifies adherence to policies, regulations, and standards.",                        category: "security" },
  { id: "threat-detection",       label: "Threat Detection",       description: "Identifies potential security threats and suspicious activity.",                     category: "security" },
  { id: "access-control",         label: "Access Control",         description: "Manages permissions, roles, and authentication policies.",                           category: "security" },
  { id: "encryption",             label: "Encryption",             description: "Handles data encryption, decryption, and key management.",                           category: "security" },
];

// ── Computed Lookup Maps ────────────────────────────────────────────────────

const CAPABILITY_MAP = new Map<string, Capability>(
  CAPABILITIES.map((c) => [c.id, c])
);

const ALIAS_MAP = new Map<string, string>();
for (const c of CAPABILITIES) {
  if (c.aliases) {
    for (const alias of c.aliases) {
      ALIAS_MAP.set(alias, c.id);
    }
  }
}

const CATEGORY_MAP = new Map<CapabilityCategory, CapabilityCategoryDef>(
  CAPABILITY_CATEGORIES.map((c) => [c.id, c])
);

// ── Helper Functions ────────────────────────────────────────────────────────

/** Format an unknown capability ID into a human-readable label. */
function formatCustomCapLabel(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Get a Capability by ID, returns undefined for unknown/custom IDs. */
export function getCapability(id: string): Capability | undefined {
  return CAPABILITY_MAP.get(id) || CAPABILITY_MAP.get(ALIAS_MAP.get(id) || "");
}

/** Get the display label for a capability ID. Formats unknown IDs gracefully. */
export function getCapabilityLabel(id: string): string {
  return getCapability(id)?.label || formatCustomCapLabel(id);
}

/** Get the description for a capability ID, or null for unknown. */
export function getCapabilityDescription(id: string): string | null {
  return getCapability(id)?.description || null;
}

/** Get all capabilities in a given category. */
export function getCapabilitiesByCategory(category: CapabilityCategory): Capability[] {
  return CAPABILITIES.filter((c) => c.category === category && !c.deprecated);
}

/** Get capabilities grouped by category, in display order. */
export function getCapabilitiesGrouped(): { category: CapabilityCategoryDef; capabilities: Capability[] }[] {
  return CAPABILITY_CATEGORIES
    .sort((a, b) => a.order - b.order)
    .map((cat) => ({
      category: cat,
      capabilities: getCapabilitiesByCategory(cat.id),
    }))
    .filter((g) => g.capabilities.length > 0);
}

/** Check whether a capability ID is in the known registry. */
export function isKnownCapability(id: string): boolean {
  return CAPABILITY_MAP.has(id) || ALIAS_MAP.has(id);
}

/** Resolve an alias to its canonical ID, or return the ID unchanged. */
export function resolveCapabilityAlias(id: string): string {
  return ALIAS_MAP.get(id) || id;
}

/** Search capabilities by query string (matches id, label, description, category label). */
export function searchCapabilities(query: string): Capability[] {
  if (!query.trim()) return CAPABILITIES.filter((c) => !c.deprecated);
  const q = query.toLowerCase();
  return CAPABILITIES.filter((c) => {
    if (c.deprecated) return false;
    const catLabel = CATEGORY_MAP.get(c.category)?.label || "";
    return (
      c.id.includes(q) ||
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      catLabel.toLowerCase().includes(q)
    );
  });
}

// ── Protocols (unchanged) ───────────────────────────────────────────────────

export const PROTOCOLS = [
  { id: "mcp",  label: "MCP",       description: "Model Context Protocol (Anthropic)" },
  { id: "a2a",  label: "A2A",       description: "Agent-to-Agent Protocol (Google)" },
  { id: "http", label: "HTTP",      description: "REST API" },
  { id: "ws",   label: "WebSocket", description: "Real-time communication" },
  { id: "grpc", label: "gRPC",      description: "High-performance RPC" },
];

// ── Pricing (unchanged) ─────────────────────────────────────────────────────

export const PRICING_OPTIONS = [
  { id: "free",     label: "Free" },
  { id: "paid",     label: "Paid" },
  { id: "freemium", label: "Freemium" },
  { id: "contact",  label: "Contact for Pricing" },
];
