export type PromiseResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    err: any;
};

export const iterateUnsafe = async function*<T>(promisesIter: Iterable<Promise<T>>): AsyncIterable<T> {
    for await (let result of iterate(promisesIter)) {
        if (!result.ok) throw result.err;
        yield result.value;
    }
};

export const iterateIgnoreRejections = async function*<T>(promisesIter: Iterable<Promise<T>>): AsyncIterable<T> {
    for await (let result of iterate(promisesIter)) {
        if (!result.ok) continue;
        yield result.value;
    }
};

export const iterateRejections = async function*<T>(promisesIter: Iterable<Promise<T>>): AsyncIterable<any> {
    for await (let result of iterate(promisesIter)) {
        if (result.ok) continue;
        yield result.err;
    }
};

export const iterate = <T>(promisesIter: Iterable<Promise<T>>): AsyncIterable<PromiseResult<T>> => {
    const promises = [ ...promisesIter ];

    type Next = IteratorResult<PromiseResult<T>>;

    let yieldNext: ((next: Next) => void) | undefined;
    let queue: PromiseResult<T>[] = [];
    let finishedPromises = 0;

    const onPromiseFinished = () => {
        finishedPromises++;
        kick();
    };

    const kick = () => {
        if (yieldNext) {
            if (queue.length > 0 && yieldNext) {
                yieldNext({ done: false, value: queue.shift()! });
                yieldNext = undefined;
            }
            else if (finishedPromises === promises.length) {
                yieldNext({ done: true, value: undefined });
                yieldNext = undefined;
            }
        }
    };

    promises.forEach(p => p.then(
        value => { queue.push({ ok: true, value }); onPromiseFinished(); },
        err => { queue.push({ ok: false, err }); onPromiseFinished(); },
    ));

    return {
        [Symbol.asyncIterator]() {
            return {
                next() {
                    return new Promise<Next>(resolve => {
                        yieldNext = resolve;
                        kick();
                    });
                }
            };
        }
    };
};
