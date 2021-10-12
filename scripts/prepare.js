const exec = require('@cush/exec')
const path = require('path')
const fs = require('saxon/sync')

process.chdir(path.resolve(__dirname, '..'))

if (exec.sync('git status --porcelain').length) {
  const { yellow } = require('kleur')
  console.error('[!] Cannot publish with uncommitted changes')
  process.exit(1)
}
