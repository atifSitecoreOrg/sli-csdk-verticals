/**
 * Compare xmcloud.build.json renderingHosts keys with editing hosts
 * on an XM Cloud project. Prints names and ids only — never variable values.
 *
 * Usage (from the repo root, after `dotnet sitecore cloud login`):
 *   node scripts/check-editing-hosts.mjs --project-id <project-id>
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const projectId = readProjectId(process.argv.slice(2));
const expected = Object.keys(readBuild().renderingHosts ?? {});

if (expected.length === 0) {
  console.error('No renderingHosts keys in xmcloud.build.json');
  process.exit(1);
}

let raw;
try {
  raw = execFileSync(
    'dotnet',
    ['sitecore', 'cloud', 'environment', 'list', '--project-id', projectId, '--json'],
    { encoding: 'utf8' }
  );
} catch (error) {
  const detail = `${error.stdout ?? ''}${error.stderr ?? error.message}`;
  console.error(detail.trim() || 'Failed to list environments. Run: dotnet sitecore cloud login');
  process.exit(1);
}

const environments = parseEnvironments(raw);
const editingHosts = environments.filter((environment) => isEditingHost(environment));
const presentNames = new Set(editingHosts.map((environment) => environment.name));

console.log(`Project ${projectId}`);
console.log('');
console.log('Editing host                         Status');
console.log('-----------------------------------  --------');

let missing = 0;
for (const name of expected) {
  const status = presentNames.has(name) ? 'present' : 'MISSING';
  if (status === 'MISSING') missing += 1;
  console.log(`${name.padEnd(35)}  ${status}`);
}

const extra = editingHosts.filter((environment) => !expected.includes(environment.name));
if (extra.length > 0) {
  console.log('');
  console.log('Editing hosts on the project that are not keys in xmcloud.build.json:');
  for (const environment of extra) {
    console.log(`  ${environment.name}`);
  }
}

console.log('');
if (missing === 0) {
  console.log(`All ${expected.length} rendering hosts have an editing host.`);
  process.exit(0);
}

console.log(`${missing} editing host(s) missing. Create them in Deploy → Editing hosts.`);
console.log('The name must match the renderingHosts key exactly, including case.');
process.exit(1);

function readProjectId(args) {
  const flag = args.indexOf('--project-id');
  const value = flag >= 0 ? args[flag + 1] : undefined;
  if (!value) {
    console.error('Usage: node scripts/check-editing-hosts.mjs --project-id <project-id>');
    process.exit(1);
  }
  return value;
}

function readBuild() {
  return JSON.parse(readFileSync(new URL('../xmcloud.build.json', import.meta.url), 'utf8'));
}

function parseEnvironments(raw) {
  const start = raw.indexOf('[');
  const objectStart = raw.indexOf('{');
  const sliceFrom = start >= 0 ? start : objectStart;
  if (sliceFrom < 0) {
    throw new Error('environment list did not return JSON');
  }
  const parsed = JSON.parse(raw.slice(sliceFrom));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.environments)) return parsed.environments;
  if (Array.isArray(parsed.items)) return parsed.items;
  throw new Error('Could not find an environment array in the CLI JSON');
}

function isEditingHost(environment) {
  const type = String(environment.type ?? environment.hostType ?? '').toLowerCase();
  return type === 'eh' || type.includes('editing');
}
