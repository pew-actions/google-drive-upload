import * as core from '@actions/core'

const maxRetries: number = parseInt(core.getInput('retries', { required: false }));

export class Retries {
	private maxAttemps: number

	constructor() {
		this.maxAttemps = maxRetries
	}

	async execute<T>(action: () => Promise<T>): Promise<T> {
		// run N-1 attempts
		var attempt = 1;
		while (attempt < this.maxAttemps) {
			try {
				return await action()
			} catch (err) {
				core.info( (err as any)?.message )
			}

			// sleep before retrying
			const seconds = Math.random() * 10 + 5
			core.info(`Sleeping for ${seconds} before retrying`)
			await this.sleepForSeconds(seconds);
			++attempt;
		}

		// run the last attempt
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
