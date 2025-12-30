import type { GameEvent, GameType, Team } from './types';

interface PandaScoreEvent {
	timestamp?: string;
	type?: string;
	killer_team?: string;
	monster_type?: string;
	building_type?: string;
}

interface PandaScoreFrame {
	events?: PandaScoreEvent[];
}

interface PandaScoreData {
	frames?: PandaScoreFrame[];
	finished?: boolean;
	status?: string;
}

interface OpenDotaObjective {
	time?: number;
	type?: string;
	team?: number;
}

interface OpenDotaData {
	objectives?: OpenDotaObjective[];
	duration?: number;
	radiant_win?: boolean;
}

function parseLoLEvents(rawData: PandaScoreData): GameEvent[] {
	const events: GameEvent[] = [];
	const frames = rawData.frames || [];

	for (const frame of frames) {
		for (const event of frame.events || []) {
			const eventId = `${event.timestamp}_${event.type}`;
			const eventType = (event.type || '').toLowerCase();
			const team = (event.killer_team || 'unknown').toLowerCase() as Team;
			const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

			if (eventType === 'champion_kill' || eventType === 'kill') {
				events.push({
					eventType: 'kill',
					team,
					timestamp,
					eventId,
					details: event,
				});
			} else if (eventType === 'dragon_kill' || eventType === 'elite_monster_kill') {
				const monster = (event.monster_type || '').toLowerCase();
				if (monster.includes('dragon')) {
					events.push({
						eventType: 'dragon',
						team,
						timestamp,
						eventId,
						details: event,
					});
				} else if (monster.includes('baron')) {
					events.push({
						eventType: 'baron',
						team,
						timestamp,
						eventId,
						details: event,
					});
				}
			} else if (eventType === 'building_kill') {
				const building = (event.building_type || '').toLowerCase();
				if (building.includes('tower')) {
					events.push({
						eventType: 'tower',
						team,
						timestamp,
						eventId,
						details: event,
					});
				} else if (building.includes('inhibitor')) {
					events.push({
						eventType: 'inhibitor',
						team,
						timestamp,
						eventId,
						details: event,
					});
				}
			}
		}
	}

	return events;
}

function parseDotaEvents(rawData: OpenDotaData): GameEvent[] {
	const events: GameEvent[] = [];
	const objectives = rawData.objectives || [];

	for (const obj of objectives) {
		const eventId = `${obj.time}_${obj.type}`;
		const objType = (obj.type || '').toLowerCase();
		const team: Team = obj.team === 2 ? 'radiant' : 'dire';

		if (objType === 'roshan') {
			events.push({
				eventType: 'roshan',
				team,
				timestamp: new Date(),
				eventId,
				details: obj,
			});
		} else if (objType.includes('tower')) {
			events.push({
				eventType: 'tower',
				team,
				timestamp: new Date(),
				eventId,
				details: obj,
			});
		} else if (objType.includes('barracks')) {
			events.push({
				eventType: 'inhibitor',
				team,
				timestamp: new Date(),
				eventId,
				details: obj,
			});
		}
	}

	return events;
}

export function parseEvents(rawData: unknown, gameType: GameType): GameEvent[] {
	if (gameType === 'lol') {
		return parseLoLEvents(rawData as PandaScoreData);
	}
	if (gameType === 'dota') {
		return parseDotaEvents(rawData as OpenDotaData);
	}
	return [];
}

export function isMatchComplete(rawData: unknown, gameType: GameType): boolean {
	if (gameType === 'lol') {
		const data = rawData as PandaScoreData;
		return data.finished === true || data.status === 'finished';
	}
	if (gameType === 'dota') {
		const data = rawData as OpenDotaData;
		return data.duration !== undefined && data.radiant_win !== undefined;
	}
	return false;
}
