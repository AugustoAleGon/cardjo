import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const excluded = new Set(['.git', '.agents', 'node_modules', 'dist', 'coverage', 'test-results'])

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return excluded.has(entry.name) ? [] : markdownFiles(path)
    return entry.name.endsWith('.md') ? [path] : []
  }))
  return files.flat().sort()
}

function strings(value) {
  if (typeof value === 'string') return [value]
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

const linter = '.agents/skills/asd-ste100/scripts/ste-lint.py'
const markdown = spawnSync('python3', [linter, ...await markdownFiles('.')], { stdio: 'inherit' })
const messages = JSON.parse(await readFile('src/messages.json', 'utf8'))
const gameText = spawnSync('python3', [linter], {
  input: strings(messages).join('\n\n'),
  encoding: 'utf8',
  stdio: ['pipe', 'inherit', 'inherit'],
})
if (markdown.error) console.error(markdown.error.message)
if (gameText.error) console.error(gameText.error.message)
process.exit(markdown.status === 0 && gameText.status === 0 ? 0 : 1)
