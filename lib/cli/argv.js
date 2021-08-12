const fs = require('fs')
const path = require('path')
const Data = require('../Data')
const add = require('./add')
const search = require('./search')
const link = require('./link')

module.exports = function (argv) {
  const that = this
  const action = argv._[0]
  const args = argv._.splice(1)
  let rv = {}
  let inputRv

  const outputDir = argv.outputDir || argv.o
  const inputDir = argv.inputDir || argv.i

  const data = new Data()

  const save = function () {
    if (rv.status === data.StatusEnum.OK) {
      if (outputDir) {
        data.write(outputDir)
      } else {
        that.error('No output directory specified. Your data will not be saved.\nUse -o to specify an output directory.')
      }
    }
  }

  const run = function (actionFunction) {
    const actionRv = actionFunction.apply(undefined, [data].concat(args))
    if (actionRv.message) {
      that.error(actionRv.message)
    }
    return actionRv
  }

  if (inputDir) {
    inputRv = data.read(inputDir)
    if (inputRv.message) {
      this.error(inputRv.message)
    }
    if (inputRv.status === data.StatusEnum.ERROR) {
      this.exit(1)
    }
  } else {
    this.error('No input directory specified. Operating on empty data set.\nUse -i to specify a data directory.')
  }

  switch (action) {
    case 'add':
      rv = run(add)
      save()
      break

    case 'link':
      rv = run(link)
      save()
      break

    case 'search':
      rv = run(search)
      if (rv.status === data.StatusEnum.OK) {
        this.dir(rv.results)
      }
      break

    default:
      this.error(fs.readFileSync(path.join(__dirname, '..', '..', 'doc', 'cli', 'help.txt'), 'utf8'))
      rv = { status: data.StatusEnum.ERROR }
  }
  const code = rv.status === data.StatusEnum.OK ? 0 : 1
  this.exit(code)
}
