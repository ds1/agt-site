/**
 * Pre-built agent configuration templates for common agent types.
 * Used in the dashboard and onboarding flows to help users get started quickly.
 */

export interface AgentTemplate {
  id: string;
  label: string;
  description: string;
  config: {
    name?: string;
    description?: string;
    protocols: string[];
    capabilities: string[];
    pricing: string;
  };
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "chatbot",
    label: "Chatbot",
    description: "A conversational AI assistant",
    config: {
      description: "Conversational AI assistant",
      protocols: ["http"],
      capabilities: ["chat", "question-answering"],
      pricing: "free",
    },
  },
  {
    id: "researcher",
    label: "Research Agent",
    description: "Deep research with source citation",
    config: {
      description: "Deep research and source citation across academic and web sources",
      protocols: ["mcp", "http"],
      capabilities: ["research", "summarization", "citation"],
      pricing: "freemium",
    },
  },
  {
    id: "code-assistant",
    label: "Code Assistant",
    description: "Code generation, review, and debugging",
    config: {
      description: "Code generation, review, and debugging assistant",
      protocols: ["mcp"],
      capabilities: ["code-generation", "code-review", "debugging"],
      pricing: "paid",
    },
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    description: "Data analysis and visualization",
    config: {
      description: "Structured data analysis and insight generation",
      protocols: ["mcp", "http"],
      capabilities: ["data-analysis", "data-visualization", "report-generation"],
      pricing: "paid",
    },
  },
  {
    id: "content-writer",
    label: "Content Writer",
    description: "Blog posts, docs, and marketing copy",
    config: {
      description: "Content writing for blogs, documentation, and marketing",
      protocols: ["http"],
      capabilities: ["content-writing", "summarization", "translation"],
      pricing: "freemium",
    },
  },
  {
    id: "monitor",
    label: "Monitor / Alert Agent",
    description: "System monitoring and alerting",
    config: {
      description: "Automated monitoring and alert agent",
      protocols: ["http", "ws"],
      capabilities: ["monitoring", "alerting", "log-analysis"],
      pricing: "paid",
    },
  },
  {
    id: "web-scraper",
    label: "Web Scraper",
    description: "Web data extraction and structuring",
    config: {
      description: "Automated web scraping and data extraction",
      protocols: ["mcp", "http"],
      capabilities: ["web-scraping", "data-extraction", "api-integration"],
      pricing: "freemium",
    },
  },
];
