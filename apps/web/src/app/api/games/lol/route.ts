import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const matchId = searchParams.get('matchId');

	if (!matchId) {
		return NextResponse.json({ error: 'Missing matchId parameter' }, { status: 400 });
	}

	const apiKey = process.env.PANDASCORE_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ error: 'PandaScore API key not configured' }, { status: 500 });
	}

	try {
		const response = await fetch(`https://api.pandascore.co/lol/matches/${matchId}/live`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: `PandaScore API error: ${response.status}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('LoL fetch error:', error);
		return NextResponse.json({ error: 'Failed to fetch LoL match data' }, { status: 500 });
	}
}
