
function SideWorker({ debug, init } = {}, ...args) {
  const blob = new Blob([insideWorker(debug)], { type: 'text/javascript' })
  const blobUrl = window.URL.createObjectURL(blob)

  this.worker = new Worker(blobUrl)
  window.URL.revokeObjectURL(blobUrl)

  this.func = null
  this._cb = {}
  this.callFunction = function (name, ...args) {
    this.worker.postMessage(name)
    this.worker.postMessage(args)
  }

  this.define = function (name, func, cb) {
    this.callFunction('method', name, func.toString())
    this[name] = function () {
      this.callFunction(name, ...arguments)
    }.bind(this)
    this._cb[name] = cb ? cb : null
  }.bind(this)

  this.worker.addEventListener('message', function (e) {
    if (!this.func)
      this.func = e.data
    else {
      if (this._cb[this.func])
        this._cb[this.func](e.data)
      this.func = null
    }
  }.bind(this))

  if (init) {
    this.define('init', init)
    this.init.apply(this, args)
  }
}

export default SideWorker

const insideWorker = (debug = false) => (`
${debug && `console.debug('SideWorker initialised.')`}
[DUPA]
var ERROR_NOT_DEFINED = 'ERROR! FUNCTION NOT DEFINED!'

function SideWorker() {
  this.func = null
  this.method = function (name, strfunc) {
    eval('var func = ' + strfunc)

    this[name] = function () {
      var response = func.apply(this, arguments)
      self.postMessage(name)
      self.postMessage(response)
      this.func = null
    }
  }
}

SideWorker.prototype.loadLibrary = function () {
  importScripts().call(arguments)
}

worker = new SideWorker()

self.addEventListener('message', function (e) {
  if (!worker.func) {
    worker.func = e.data
    if (!worker[worker.func])
      console.error(ERROR_NOT_DEFINED, worker.func)
  } else {
    var func = worker.func
    worker.func = null

    ${debug && `
    if(func === 'method')
      console.debug('Defining "' + e.data[0] + '".')
    else
      console.debug('Calling "' + func + '".')
    `}

    if (worker[func])
      worker[func].apply(worker, e.data)
    else
      console.error(ERROR_NOT_DEFINED, worker[func])
  }
})
`)
