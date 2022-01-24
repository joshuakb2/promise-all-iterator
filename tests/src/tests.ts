import * as pkg from '../..';
import { range, sleep } from './util';

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
                await sleep(Math.random() * 10000);
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
        timeout: 11
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
                await sleep(Math.random() * 10000);
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
        timeout: 11
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
                await sleep(Math.random() * 10000);
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
        timeout: 11
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
                await sleep(Math.random() * 10000);
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
        timeout: 11
    }
];
