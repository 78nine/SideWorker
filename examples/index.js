const w = new SideWorker({
  debug: true,
  init: (value = 11) => {
    self.value = value
    console.debug(`:: init(${value})`)
  }
}, 21)

w.define(
  'ask',
  (num = 1) => {
    console.debug(`:: ask(${num})`)
    return num * self.value
  },
  res => console.log(`the 'ask' result is: ${res}`)
)

w.ask(2)

w.define(
  'check',
  (name) => {
    console.debug(`:: check('${name}')`)
    return { name, exists: !!worker[name] && typeof worker[name] === 'function' }
  },
  ({ name, exists }) => console.log(`worker.${name}() ${exists ? 'exists' : 'does NOT exist'}`)
)

w.check('loadLibrary')
w.check('ask')
w.check('check')
w.check('WHAT_EVER')
