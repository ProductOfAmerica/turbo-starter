import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const matchId = searchParams.get('matchId');

	if (!matchId) {
		return NextResponse.json({ error: 'Missing matchId parameter' }, { status: 400 });
	}

	try {
		const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			return NextResponse.json({ error: `OpenDota API error: ${response.status}` }, { status: response.status });
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Dota fetch error:', error);
		return NextResponse.json({ error: 'Failed to fetch Dota match data' }, { status: 500 });
	}
}
