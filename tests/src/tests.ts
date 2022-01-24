import * as pkg from '../..';
import { range, setsAreEqual, sleep } from './util';

export type Test = {
    name: string;
    f: () => Promise<string | undefined>;
    timeout?: number; // seconds
};

export const tests: Test[] = [
    {
        name: 'iterate produces correct number of results [1]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i => i % 2 === 0 ? Promise.resolve(i) : Promise.reject(i));

            let k = 0;
            for await (let value of pkg.iterate(inputs)) {
                k++;
            }

            if (k !== n) return `Expected ${n} results but got ${k} instead.`;

            return undefined;
        }
    }, {
        name: 'iterate produces correct number of results [2]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(async i => {
                await sleep(Math.random() * 5000);
                if (i % 2 === 0) return i;
                else throw i;
            });

            let k = 0;
            for await (let value of pkg.iterate(inputs)) {
                k++;
            }

            if (k !== n) return `Expected ${n} results but got ${k} instead.`;

            return undefined;
        },
        timeout: 6
    }, {
        name: 'iterateIgnoreRejections produces correct number of results [1]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i => i % 2 === 0 ? Promise.resolve(i) : Promise.reject(i));

            let k = 0;
            for await (let value of pkg.iterateIgnoreRejections(inputs)) {
                k++;
            }

            let expected = n % 2 === 0 ? (n / 2) : ((n + 1) / 2);

            if (k !== expected) return `Expected ${expected} results but got ${k} instead.`;

            return undefined;
        }
    }, {
        name: 'iterateIgnoreRejections produces correct number of results [2]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(async i => {
                await sleep(Math.random() * 5000);
                if (i % 2 === 0) return i;
                else throw i;
            });

            let k = 0;
            for await (let value of pkg.iterateIgnoreRejections(inputs)) {
                k++;
            }

            let expected = n % 2 === 0 ? (n / 2) : ((n + 1) / 2);

            if (k !== expected) return `Expected ${expected} results but got ${k} instead.`;

            return undefined;
        },
        timeout: 6
    }, {
        name: 'iterateRejections produces correct number of results [1]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i => i % 2 === 0 ? Promise.resolve(i) : Promise.reject(i));

            let k = 0;
            for await (let value of pkg.iterateRejections(inputs)) {
                k++;
            }

            let expected = n % 2 === 0 ? (n / 2) : ((n - 1) / 2);

            if (k !== expected) return `Expected ${expected} results but got ${k} instead.`;

            return undefined;
        }
    }, {
        name: 'iterateRejections produces correct number of results [2]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(async i => {
                await sleep(Math.random() * 5000);
                if (i % 2 === 0) return i;
                else throw i;
            });

            let k = 0;
            for await (let value of pkg.iterateRejections(inputs)) {
                k++;
            }

            let expected = n % 2 === 0 ? (n / 2) : ((n - 1) / 2);

            if (k !== expected) return `Expected ${expected} results but got ${k} instead.`;

            return undefined;
        },
        timeout: 6
    }, {
        name: 'iterate produces correct result types [1]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i => i % 2 === 0 ? Promise.resolve(i) : Promise.reject(i));

            for await (let value of pkg.iterate(inputs)) {
                let i = value.ok ? value.value : value.err as number;
                let expectedOk = i % 2 === 0;
                if (value.ok !== expectedOk) return `Expected ${expectedOk ? 'ok' : 'error'} for item ${i} but got ${value.ok ? 'ok' : 'error'}`;
            }

            return undefined;
        }
    }, {
        name: 'iterate produces correct result types [2]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(async i => {
                await sleep(Math.random() * 5000);
                if (i % 2 === 0) return i;
                else throw i;
            });

            for await (let value of pkg.iterate(inputs)) {
                let i = value.ok ? value.value : value.err as number;
                let expectedOk = i % 2 === 0;
                if (value.ok !== expectedOk) return `Expected ${expectedOk ? 'ok' : 'error'} for ${i} but got ${value.ok ? 'ok' : 'error'}`;
            }

            return undefined;
        },
        timeout: 6
    }, {
        name: 'iterate produces results in the correct order',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(async () => {
                let t = Math.random() * 5000;
                await sleep(t);
                return t;
            });

            let previous = 0;

            for await (let t of pkg.iterateUnsafe(inputs)) {
                if (t < previous) return `Yielded value ${t} is less than previously yielded value ${previous}`;
                previous = t;
            }

            return undefined;
        },
        timeout: 6
    }, {
        name: 'iterateUnsafe throws on error',
        f: async () => {
            let caught = false;

            try {
                for await (let value of pkg.iterateUnsafe([ Promise.resolve(), Promise.reject(), Promise.resolve() ])) {
                    // Do nothing
                }
            }
            catch (err) {
                caught = true;
            }

            if (!caught) return 'No exception was thrown even though the input contained a rejected promise.';

            caught = false;

            try {
                for await (let value of pkg.iterateUnsafe([ Promise.resolve(), Promise.resolve(), Promise.resolve() ])) {
                    // Do nothing
                }
            }
            catch (err) {
                caught = true;
            }

            if (caught) return 'An exception was thrown even though the input did not contain a rejected promise.';

            return undefined;
        }
    }, {
        name: 'collect produces same set of results as Promise.all [1]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i => Promise.resolve(i));

            let collected = new Set(await pkg.collect(pkg.iterateIgnoreRejections(inputs)));
            let promiseAlled = new Set(await Promise.all(inputs));

            if (!setsAreEqual(collected, promiseAlled)) return `Sets of returned values are not equal.`;

            return undefined;
        }
    }, {
        name: 'collect produces same set of results as Promise.all [2]',
        f: async () => {
            let n = 10 + Math.floor(Math.random() * 10);
            let inputs = range(n).map(i =>  sleep(Math.random() * 5000).then(() => i));

            let collected = new Set(await pkg.collect(pkg.iterateIgnoreRejections(inputs)));
            let promiseAlled = new Set(await Promise.all(inputs));

            if (!setsAreEqual(collected, promiseAlled)) return `Sets of returned values are not equal.`;

            return undefined;
        },
        timeout: 6
    }
];
