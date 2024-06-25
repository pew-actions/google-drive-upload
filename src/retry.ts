import * as core from '@actions/core'

const backoffRate: number = 1.5
const maxRetries: number = Math.max(1, parseInt(core.getInput('retries', { required: false })))

export class Retries {
	private maxAttemps: number

	constructor() {
		this.maxAttemps = maxRetries
	}

	async execute<T>(action: () => Promise<T>): Promise<T> {

		// initial sleep rand [5,10) seconds
		var sleepSeconds = Math.random() * 10  + 5

		// run N-1 attempts, retying on failure
		var attempt = 1;
		while (attempt < this.maxAttemps) {
			try {
				return await action()
			} catch (err) {
				core.info( (err as any)?.message )
			}

			// sleep before retrying
			core.info(`Sleeping for ${sleepSeconds} before retrying`)
			await this.sleepForSeconds(sleepSeconds);

			++attempt;

			// back-off on retries
			sleepSeconds *= backoffRate
		}

		// run the last attempt, and late failure propagate
		return await action();
	}

	private async sleepForSeconds(seconds: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, seconds*1000))
	}
}

export async function execute<T>(action: () => Promise<T>): Promise<T> {
	const retries = new Retries();
	return await retries.execute(action);
}
