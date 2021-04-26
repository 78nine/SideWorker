const { expect } = chai

let SideWorker

describe('SideWorker', () => {
  before(async () => {
    const module = await import('../sideworker.js')
    SideWorker = module.default
  })

  it('should be a function', () => {
    expect(SideWorker).to.be.a('function')
  })

  it('should be a constructor', () => {
    const _test = () => {
      const w = new SideWorker()
      w.worker.terminate()
    }
    expect(() => _test()).not.to.throw()
  })

  describe('when creating an instance', () => {
    let instance

    before(() => {
      instance = new SideWorker()
    })

    it('should expose `define` method', () => {
      expect(instance.define).to.be.a('function')
    })

    it('should expose `run` property of type `Object`', () => {
      expect(instance.run).to.be.an('object')
    })

    it('should expose `worker` containing a Web Worker instance', () => {
      expect(instance.worker).to.be.an.instanceof(Worker)
    })

    describe('when defining a method', () => {
      before(() => {
        instance.define('test', () => 42)
      })

      it('should expose it in the `run` object', () => {
        expect(instance.run.test).to.be.a('function')
      })

      it('should return a Promise when the method is called', () => {
        expect(instance.run.test()).to.be.a('promise')
      })

      it('should eventually return the methods result', async () => {
        expect(await instance.run.test()).to.equal(42)
      })
    })

    describe('when defining an error-prone method', () => {
      before(() => {
        instance.define(
          'errorProne',
          () => { throw new Error('Error in test!') }
        )
      })

      it('should reject the Promise', async () => {
        try {
          const result = await instance.run.errorProne()
        } catch(err) {
          expect(err).to.be.an.instanceof(Error)
          expect(err.message).to.equal('Error in test!')
        }
      })
    })

    after(() => {
      instance.worker.terminate()
    })
  })

  describe('when creating an instance with `init` option', () => {
    let instance

    before(() => {
      instance = new SideWorker({
        init: () => {
          self.testResult = 'passed'
          self.getFirst = () => 'test'
        }
      })
    })

    it('should expose the `init` method in the `run` object', () => {
      expect(instance.run.init).to.be.a('function')
    })

    it('should allow it to define globally available variables and functions', async () => {
      instance.define('conclude', () => [getFirst(), testResult].join(' '))
      expect(await instance.run.conclude()).to.equal('test passed')
    })

    after(() => {
      instance.worker.terminate()
    })
  })
})
