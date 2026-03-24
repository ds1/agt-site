// lib/agent-capabilities.js
// Shared vocabulary for .agt agent configuration

export const CAPABILITIES = [
  { id: 'research', label: 'Research' },
  { id: 'summarization', label: 'Summarization' },
  { id: 'translation', label: 'Translation' },
  { id: 'code-generation', label: 'Code Generation' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'data-analysis', label: 'Data Analysis' },
  { id: 'image-generation', label: 'Image Generation' },
  { id: 'image-analysis', label: 'Image Analysis' },
  { id: 'audio-transcription', label: 'Audio Transcription' },
  { id: 'web-scraping', label: 'Web Scraping' },
  { id: 'api-integration', label: 'API Integration' },
  { id: 'workflow-automation', label: 'Workflow Automation' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'content-writing', label: 'Content Writing' },
  { id: 'chat', label: 'Chat' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'math', label: 'Math' },
  { id: 'search', label: 'Search' },
  { id: 'embedding', label: 'Embedding' },
];

export const PROTOCOLS = [
  { id: 'mcp', label: 'MCP', description: 'Model Context Protocol (Anthropic)' },
  { id: 'a2a', label: 'A2A', description: 'Agent-to-Agent Protocol (Google)' },
  { id: 'http', label: 'HTTP', description: 'REST API' },
  { id: 'ws', label: 'WebSocket', description: 'Real-time communication' },
  { id: 'grpc', label: 'gRPC', description: 'High-performance RPC' },
];

export const PRICING_OPTIONS = [
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
  { id: 'freemium', label: 'Freemium' },
  { id: 'contact', label: 'Contact for Pricing' },
];
