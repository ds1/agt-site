#!/usr/bin/env node
// Set agt-* TXT records on a Freename .agt domain in a single batch API call.
//
// Usage:
//   node scripts/set-agt-records.js <domain> <manifest.json>
//
// Example manifest.json:
//   {
//     "name": "Scrape Agent",
//     "description": "Web scraping and data extraction agent",
//     "protocols": ["mcp", "http"],
//     "capabilities": ["web-scraping", "api-integration"],
//     "endpoints": { "mcp": "https://example.com/mcp", "http": "https://example.com/api" },
//     "pricing": "free",
//     "owner": "0x1234...",
//     "icon": "https://example.com/icon.png",
//     "website": "https://example.com"
//   }
//
// Environment:
//   FREENAME_API_KEY — Reseller API authorization token
//   FREENAME_ZONE_UUID — Zone UUID for the domain (find via Reseller API or Freename dashboard)

const fs = require('fs');

const API_BASE = 'https://apis.freename.io/api/v1/reseller-logic';

function buildTxtRecords(manifest) {
  const records = [
    { type: 'TXT', name: '@', value: 'agt-version=1', ttl: 300 },
  ];

  if (manifest.name) {
    records.push({ type: 'TXT', name: '@', value: `agt-name=${manifest.name}`, ttl: 300 });
  }
  if (manifest.description) {
    records.push({ type: 'TXT', name: '@', value: `agt-description=${manifest.description}`, ttl: 300 });
  }
  if (manifest.icon) {
    records.push({ type: 'TXT', name: '@', value: `agt-icon=${manifest.icon}`, ttl: 300 });
  }
  if (manifest.website) {
    records.push({ type: 'TXT', name: '@', value: `agt-website=${manifest.website}`, ttl: 300 });
  }
  if (manifest.owner) {
    records.push({ type: 'TXT', name: '@', value: `agt-owner=${manifest.owner}`, ttl: 300 });
  }
  if (manifest.pricing) {
    records.push({ type: 'TXT', name: '@', value: `agt-pricing=${manifest.pricing}`, ttl: 300 });
  }
  for (const proto of manifest.protocols || []) {
    records.push({ type: 'TXT', name: '@', value: `agt-protocol=${proto}`, ttl: 300 });
  }
  for (const cap of manifest.capabilities || []) {
    records.push({ type: 'TXT', name: '@', value: `agt-cap=${cap}`, ttl: 300 });
  }
  for (const [proto, url] of Object.entries(manifest.endpoints || {})) {
    records.push({ type: 'TXT', name: '@', value: `agt-endpoint-${proto}=${url}`, ttl: 300 });
  }

  return records;
}

async function main() {
  const [,, domain, manifestPath] = process.argv;

  if (!domain || !manifestPath) {
    console.error('Usage: node scripts/set-agt-records.js <domain> <manifest.json>');
    console.error('\nExample: node scripts/set-agt-records.js scrape.agt manifests/scrape.json');
    process.exit(1);
  }

  const apiKey = process.env.FREENAME_API_KEY;
  const zoneUuid = process.env.FREENAME_ZONE_UUID;

  if (!apiKey || !zoneUuid) {
    console.error('Set FREENAME_API_KEY and FREENAME_ZONE_UUID environment variables.');
    console.error('Find the zone UUID in your Freename dashboard or via the Reseller API.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const records = buildTxtRecords(manifest);

  console.log(`Setting ${records.length} TXT records on ${domain}:\n`);
  for (const r of records) {
    console.log(`  ${r.value}`);
  }
  console.log();

  const resp = await fetch(`${API_BASE}/records?zone=${zoneUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify(records),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error(`API error ${resp.status}: ${text}`);
    process.exit(1);
  }

  const result = await resp.json();
  console.log(`Created ${result.size || result.data?.length || 0} records.`);
}

main().catch(err => { console.error(err); process.exit(1); });
