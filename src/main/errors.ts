export class JobTimeoutError extends Error {
    override name = this.constructor.name;
}
