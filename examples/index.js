const debug = true
const init = (value = 11) => {
  console.debug(`:: init(${value})`)
  importScripts('https://unpkg.com/wots')
  self.value = value
}
const w = new SideWorker({ debug, init }, 21)

w.define(
  'ask',
  (num = 1) => {
    console.debug(`:: ask(${num})`)
    return num * self.value
  }
)

w.run.ask(2).then(res => console.log(`the 'ask' result is: ${res}`))

const hasNameHandler = ({ name, exists }) => console.log(`worker.${name}() ${exists ? 'exists' : 'does NOT exist'}`)
w.define(
  'check',
  (name) => {
    console.debug(`:: check('${name}')`)
    return { name, exists: !!worker[name] && wots(worker[name]) === 'function' }
  }
)

w.run.check('loadLibrary').then(hasNameHandler)
w.run.check('ask').then(hasNameHandler)

;(async () => {
  hasNameHandler(await w.run.check('check'))
})()

w.run.check('WHAT_EVER').then(hasNameHandler)

w.define(
  'errorProne',
  () => { throw new Error('something bad happened') }
)

w.run.errorProne().catch(err => {
  console.warn('!!!', err)
})
