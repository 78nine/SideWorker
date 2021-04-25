# SideWorker

SideWorker is a minimal JavaScript library to make using Web Workers as painless as possible.

It has been based on the [WorkerB](https://github.com/lukeschaefer/WorkerB) library by [Luke Schaefer](https://github.com/lukeschaefer).

The main purpose of SideWorker is NOT having to create a seperate file for code that is run in a different thread.
The Web Workers can be created inline to the main code and be communicated with asynchronously.

The idea is to consolidate the seperate script and the logic to interact with that script into one JS object.


# Usage


## Installation

SideWorker has no dependencies. You can install it via NPM:

```bash
npm install @79nine/SideWorker
```

and then use it in your code:

```js
import SideWorker from '@78nine/sideworker' // ES Module style
// or
const SideWorker = require('@78nine/sideworker') // Node style
```

Another option is to simply include the [minified](./sideworker.min.js) file in your project (e.g. through the UnPKG):

```html
<script src='https://unpkg.com/@78nine/sideworker'></script>
```

This option will expose a global `SideWorker` variable available on you web page.


## Usage example:

```js
// Create a new, empty SideWorker
const worker = new SideWorker();

// Define a method that will be run later in your code. This method needs:
  //  A name -> 'countToX'
  //  A function it will perform

worker.define('countToX', (x) => {
  for(let i = 0; i < x; i++) {
    continue;
  }
  return i;
}

// Use the defined method where you need it, and handle it's result via Promise:
worker.run.countToX(42).then((res) => console.log('X is', res));

// or with async/await syntax
const res = await worker.run.countToX(128);

console.log('Now the X is', res);

// The method's operation is non-blocking and performed in a seperate thread.
```

## Options:

When creating an instance of the SideWorker you can pass it and object with two options:

### debug

_Default: false_

If the `debug` option will be set to `true` the SideWorker will give you some additional information about it's work inside the browser's console.

```js
const worker = new SideWorker({ debug: true });
```

### init

_Default: undefined_

The `init` option can be used to pass a function, which then will be automatically called upon the Web Worker's creation.
This can be very useful for instance to `importScripts()` and define worker-scoped variables or function needed later.

```js
const worker = new SideWorker({
  init: () => {
    importScripts('https://unpkg.com/faker@5.5.3/dist/faker.min.js');

    self.someGlobalFunction = () => {
      // do something
    }
  }
});

// and then inside another method:
worker.define('doSomething', () => {
  // `faker` is a globally available variable
  // `someGlobalFunction()` is a globally available function
});
```

It is also possible to pass additional arguments to the init function that are available in your main script's scope:

```js
const answer = 42;
const persona = {
  firstName: 'Arthur',
  lastName: 'Dent'
}

const worker = new SideWorker({
  init: (num, obj) => {
    self.answer = num; // the `num` value is `42`
    self.him = obj; // the `obj` value is `{ firstName: 'Arthur', lastName: 'Dent' }`
  }
}, answer, persona);
```

---

Note: examples of all the basic functionality can be also explored in the [examples](./examples) folder.
