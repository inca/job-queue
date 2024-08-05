import assert from 'assert';

import { JobQueue } from '../main/job-queue.js';

describe('JobQueue', () => {

    context('concurrency = 1, no timeout', () => {
        it('executes job one by one', async () => {
            const { events, results } = await runTest(1, 3, 10);
            assert.deepStrictEqual(events, [
                '0 start',
                '0 end',
                '1 start',
                '1 end',
                '2 start',
                '2 end',
            ]);
            assert.deepStrictEqual(results, [0, 1, 2]);
        });
    });

    context('concurrency = 2, no timeout', () => {
        it('executes two jobs at a time', async () => {
            const { events, results } = await runTest(2, 3, 10);
            assert.deepStrictEqual(events, [
                '0 start',
                '1 start',
                '0 end',
                '2 start',
                '1 end',
                '2 end',
            ]);
            assert.deepStrictEqual(results, [0, 1, 2]);
        });
    });

    context('concurrency = 3, no timeout', () => {
        it('executes three jobs at a time', async () => {
            const { events, results } = await runTest(3, 3, 10);
            assert.deepStrictEqual(events, [
                '0 start',
                '1 start',
                '2 start',
                '0 end',
                '1 end',
                '2 end',
            ]);
            assert.deepStrictEqual(results, [0, 1, 2]);
        });
    });

    context('concurrency = 1, timeout', () => {
        it('executes one job, the others take too long', async () => {
            const { results } = await runTest(1, 3, 20, 10);
            assert.deepStrictEqual(results, [
                0, 'JobTimeoutError', 'JobTimeoutError'
            ]);
        });
    });

});

async function runTest(concurrency: number, count: number, delay: number, timeout?: number) {
    const events: string[] = [];
    const jobQueue = new JobQueue({
        concurrency,
    });
    const promises: Promise<any>[] = [];
    for (let i = 0; i < count; i++) {
        const promise = jobQueue.run(async () => {
            events.push(`${i} start`);
            await sleep(delay * i);
            events.push(`${i} end`);
            return i;
        }, timeout).catch(err => err.name);
        promises.push(promise);
    }
    const results = await Promise.all(promises);
    return {
        events,
        results,
    };
}

function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}
