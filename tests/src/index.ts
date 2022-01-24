import 'colors';
import { tests } from './tests';
import { timeoutAfter } from './util';

async function main() {
    let failureCount = 0;

    for (let [ i, test ] of tests.entries()) {
        process.stdout.write(`Running test ${i + 1} (${test.name})...`);
        let failureReason: string | undefined;

        try {
            failureReason = await timeoutAfter(test.timeout ?? 1, test.f());
        }
        catch (err) {
            await eraseLine();
            console.log(`Test ${i + 1} (${test.name}) failed: Runtime error: ${(err as Error).stack}`.red);
            failureCount++;
            continue;
        }

        await eraseLine();

        if (failureReason) {
            console.log(`Test ${i + 1} (${test.name}) failed: ${failureReason}`.red);
            failureCount++;
        }
        else {
            console.log(`Test ${i + 1} (${test.name}) passed.`.green);
        }
    }

    if (failureCount === 0) {
        console.log(`All ${tests.length} tests passed.`);
        process.exit(0);
    }

    console.log(`${failureCount}/${tests.length} tests failed.`);
    process.exit(1);
}

async function eraseLine() {
    await new Promise<void>(resolve => process.stdout.clearLine(0, resolve));
    await new Promise<void>(resolve => process.stdout.cursorTo(0, resolve));
}

main().catch(err => {
    console.error(`Unexpected error: ${err.stack}`);
    process.exit(1);
});
