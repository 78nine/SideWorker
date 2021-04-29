const _uuid = () => URL.createObjectURL(new Blob()).split('/').pop()

function SideWorker({ debug, init } = {}, ...args) {
  const blobStr = insideWorker.toString()
    .replace(
      /^\(?([a-z]+)\)?\s*=>\s*{/,
      (_, p) => `const ${p}=${debug?1:0};`
    )
    .replace(/}$/, '')

  const blobUrl = URL.createObjectURL(new Blob([blobStr], { type: 'text/javascript' }))

  this.worker = new Worker(blobUrl)
  URL.revokeObjectURL(blobUrl)

  this.func = null
  this._cb = new Map()
  this.run = {}
  this.callFunction = (name, ...args) => {
    this.worker.postMessage(name)
    this.worker.postMessage(args)
  }

  this.define = (name, func) => {
    this.callFunction('define', name, func.toString())
    this.run[name] = (...args) => {
      return new Promise((resolve, reject) => {
        const uuid = `${name}:${_uuid()}`
        this._cb.set(uuid, { resolve, reject });

        this.callFunction(uuid, ...args)
      })
    }
  }

  this.worker.addEventListener('message', e => {
    if (!this.func) {
      this.func = e.data
    } else {
      const [ err, ...response ] = e.data
      const handler = this._cb.get(this.func)

      !err ? handler.resolve(...response) : handler.reject(err)

      this._cb.delete(this.func);
      this.func = null
    }
  })

  if (init) {
    this.define('init', init)
    this.run.init(args)
  }
}

export default SideWorker

const insideWorker = (debug) => {
  if (debug) {
    console.debug('SideWorker initialised.')
  }

  const ERROR_NOT_DEFINED = 'ERROR! FUNCTION NOT DEFINED!'
  const SEPARATOR = ':'
  const _split = arg => arg.split(SEPARATOR)
  const _join = (...args) => args.join(SEPARATOR)

  function SideWorker() {
    this.func = false
    this.define = (name, strfunc) => {
      const runner = new Function('return ' + strfunc)()

      this[name] = (id, args) => {
        self.postMessage(_join(name, id))

        try {
          const response = runner.apply(this, args)
          self.postMessage([, response])
        } catch (err) {
          self.postMessage([err])
        }

        this.func = false
      }
    }
  }

  const worker = new SideWorker()

  self.addEventListener('message', (e) => {
    if (!worker.func) {
      worker.func = e.data

      const [ name ] = _split(e.data)

      if (!worker[name]) {
        console.error(ERROR_NOT_DEFINED, name)
      }
    } else {
      const func = worker.func
      const [ name, id ] = _split(func)

      worker.func = false

      if (debug) {
        if(name === 'define') {
          console.debug(`Defining "${e.data[0]}"`)
        } else {
          console.debug(`Calling "${name}" (id: ${id})`)
        }
      }

      if (worker[name]) {
        const data = (name === 'define' && !id) ? e.data : [id, e.data];
        worker[name].apply(worker, data)
      } else {
        console.error(ERROR_NOT_DEFINED, worker[name])
      }
    }
  })
}
