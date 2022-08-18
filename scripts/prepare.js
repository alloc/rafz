const exec = require('@cush/exec')
const path = require('path')

process.chdir(path.resolve(__dirname, '..'))

if (exec.sync('git status --porcelain').length) {
  console.error('[!] Cannot publish with uncommitted changes')
  process.exit(1)
}
