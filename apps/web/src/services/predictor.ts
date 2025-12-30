import type { EventType, GameEvent, ProbabilityUpdate, Team } from './types';

interface EventLikelihoods {
	blueGivenBlueWin: number;
	blueGivenRedWin: number;
}

const EVENT_LIKELIHOODS: Record<EventType, EventLikelihoods> = {
	kill: { blueGivenBlueWin: 0.55, blueGivenRedWin: 0.45 },
	dragon: { blueGivenBlueWin: 0.6, blueGivenRedWin: 0.4 },
	baron: { blueGivenBlueWin: 0.7, blueGivenRedWin: 0.3 },
	tower: { blueGivenBlueWin: 0.58, blueGivenRedWin: 0.42 },
	inhibitor: { blueGivenBlueWin: 0.75, blueGivenRedWin: 0.25 },
	roshan: { blueGivenBlueWin: 0.65, blueGivenRedWin: 0.35 },
};

const BLUE_TEAMS: Team[] = ['blue', 'radiant', 'team1'];

export class BayesianPredictor {
	private posterior: number;
	private updateCount: number;
	private processedEventIds: Set<string>;
	private history: ProbabilityUpdate[];

	constructor(prior = 0.5) {
		this.posterior = prior;
		this.updateCount = 0;
		this.processedEventIds = new Set();
		this.history = [{ posterior: prior, timestamp: new Date() }];
	}

	update(event: GameEvent): boolean {
		if (this.processedEventIds.has(event.eventId)) {
			return false;
		}

		this.processedEventIds.add(event.eventId);
		const likelihoods = EVENT_LIKELIHOODS[event.eventType];
		if (!likelihoods) {
			return false;
		}

		const isBlueEvent = BLUE_TEAMS.includes(event.team);

		let pEventGivenBlue: number;
		let pEventGivenRed: number;

		if (isBlueEvent) {
			pEventGivenBlue = likelihoods.blueGivenBlueWin;
			pEventGivenRed = likelihoods.blueGivenRedWin;
		} else {
			pEventGivenBlue = 1 - likelihoods.blueGivenBlueWin;
			pEventGivenRed = 1 - likelihoods.blueGivenRedWin;
		}

		const pEvent = pEventGivenBlue * this.posterior + pEventGivenRed * (1 - this.posterior);

		if (pEvent > 0) {
			this.posterior = (pEventGivenBlue * this.posterior) / pEvent;
		}

		this.updateCount++;
		this.history.push({
			posterior: this.posterior,
			timestamp: new Date(),
			eventType: event.eventType,
			team: event.team,
		});

		return true;
	}

	getPosterior(): number {
		return this.posterior;
	}

	getUpdateCount(): number {
		return this.updateCount;
	}

	getHistory(): ProbabilityUpdate[] {
		return [...this.history];
	}

	reset(prior = 0.5): void {
		this.posterior = prior;
		this.updateCount = 0;
		this.processedEventIds.clear();
		this.history = [{ posterior: prior, timestamp: new Date() }];
	}
}
