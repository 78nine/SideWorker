const debug = true
const init = (value = 11) => {
  console.debug(`:: init(${value})`)

  importScripts('https://unpkg.com/wots')

  self.value = value

  self.getDefaultErrorMessage = () => 'something bad happened'
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

const isNumberHandler = ({ arg, is }) => console.log(`${arg} is ${is ? 'a' : 'NOT a'} number`)
w.define(
  'check',
  arg => {
    console.debug(`:: check('${arg}')`)
    return { arg, is: wots(arg) === 'number' }
  }
)

w.run.check(42).then(isNumberHandler)
w.run.check(null * undefined).then(isNumberHandler)

;(async () => {
  isNumberHandler(await w.run.check(789))
})()

w.run.check('WHAT_EVER').then(isNumberHandler)

w.define(
  'errorProne',
  () => { throw new Error(getDefaultErrorMessage()) }
)

w.run.errorProne().catch(err => {
  console.warn('!!!', err)
})
