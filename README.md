# promise-all-iterator
Takes a finite iterable of promises and returns an async iterable of their results in the order that they finish.

## Examples
Import functions:
```ts
import { iterate, iterateIgnoreRejections, iterateRejections, iterateUnsafe, collect } from 'promise-all-iterator';
```

Handle both successes and failures:
```ts
declare let promises: Promise<number>[];

for await (let result of iterate(promises)) {
  if (result.ok) {
    let n = result.value;
    // Do something with n
  }
  else {
    let err = result.err;
    // Do something with error
  }
}
```

Ignore any that fail:
```ts
declare let promises: Promise<number>[];

for await (let n of iterateIgnoreRejections(promises)) {
  // Do something with n
}
```

Ignore any that succeed, only handle errors:
```ts
declare let promises: Set<Promise<number>>;

for await (let err of iterateRejections(promises)) {
  // Do something with error
}
```

Expect that all promises will succeed, and throw as soon as one rejects:
```ts
declare let promises: Promise<number>[];

try {
  for await (let n of iterateUnsafe(promises)) {
    // Do something with n
  }
}
catch (err) {
  // Do something with error
}
```

Collect all successful results in the order they were produced, ignoring errors.
```ts
declare let promises: Set<Promise<number>>;

let results = await collect(iterateIgnoreErrors(promises));
// results: number[]
// Do something with results
```
