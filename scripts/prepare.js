const exec = require('@cush/exec')
const path = require('path')
const fs = require('saxon/sync')

process.chdir(path.resolve(__dirname, '..'))

if (exec.sync('git status --porcelain').length) {
  const { yellow } = require('kleur')
  console.error('[!] Cannot publish with uncommitted changes')
  process.exit(1)
}

const subPackages = ['jest', 'throttle', 'timeout']
subPackages.forEach(name => {
  const pkg = {
    name: '@rafz/' + name,
    version: require('../package.json').version,
    main: `../cjs/${name}.js`,
    module: `../esm/${name}.js`,
    sideEffects: true,
  }
  fs.mkdir(name)
  fs.write(
    path.join(name, 'package.json'), //
    JSON.stringify(pkg, null, 2) + '\n'
  )
})
