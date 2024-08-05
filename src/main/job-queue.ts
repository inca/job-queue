import { JobTimeoutError } from './errors.js';

export type Job<T> = () => Promise<T>;

export interface JobQueueOptions {
    concurrency: number;
}

type JobQueueItem<T> = {
    job: Job<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
    timeout?: number;
};

export class JobQueue {
    private queue: Array<JobQueueItem<any>> = [];
    private runningJobs: number = 0;

    constructor(public options: JobQueueOptions) {}

    public run<T>(job: Job<T>, timeout?: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ job, resolve, reject, timeout });
            this.processQueue();
        });
    }

    private processQueue() {
        const { concurrency } = this.options;
        if (this.runningJobs >= concurrency || this.queue.length === 0) {
            return;
        }
        this.runningJobs += 1;
        const { job, resolve, reject, timeout } = this.queue.shift()!;
        const promise = timeout ? this.executeWithTimeout(job, timeout) : job();
        promise
            .then(res => resolve(res), err => reject(err))
            .then(() => {
                this.runningJobs -= 1;
                return this.processQueue();
            });
    }

    private executeWithTimeout<T>(job: Job<T>, timeout: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new JobTimeoutError('Job timed out'));
            }, timeout);
            job()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }
}
