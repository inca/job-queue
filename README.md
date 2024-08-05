# Simple Promise Queue

## Highlights

- 🔥 Zero dependencies
- 🗜 Tidy and compact
- 💻 ESM, works in browser
- 🔬 Strongly typed

## Usage

```ts
import { JobQueue } from '@inca/job-queue';

const jobQueue = new JobQueue({ concurrency: 1 });

async function sleep(ms: number) {
    await new Promise(r => setTimeout(r, ms));
}

const [
    res1,
    res2,
    res3,
] = Promise.all([
    jobQueue.run(() => sleep(10).then(() => 'foo')),
    jobQueue.run(() => sleep(10).then(() => 'bar')),
    jobQueue.run(() => sleep(10).then(() => 'baz')),
]);

// Only one promise runs at a time,
// each one waits for all previous to complete
assert.strictEqual(res1, 'foo');
assert.strictEqual(res2, 'bar');
assert.strictEqual(res3, 'baz');
```
