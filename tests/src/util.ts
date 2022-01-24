export const range = (n: number) => Array.from({ length: n }, (v, i) => i);
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const enumerate = async function*<T>(values: AsyncIterable<T>): AsyncIterable<[number, T]> {
    let i = 0;

    for await (let v of values) {
        yield [i, v];
    }
};

export const timeoutAfter = <T>(n: number, p: Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        p.then(resolve, reject);
        sleep(1000 * n).then(() => reject(new Error(`Timed out after ${n} seconds.`)));
    });
};
