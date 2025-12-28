'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<html lang="en">
			<body>
				<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
						<h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#666', marginBottom: '16px' }}>Error</h1>
						<h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Something went wrong</h2>
						<p style={{ color: '#666', marginBottom: '24px' }}>A critical error occurred. Please try again.</p>
						<button
							type="button"
							onClick={() => reset()}
							style={{
								padding: '12px 24px',
								backgroundColor: '#000',
								color: '#fff',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
							}}
						>
							Try again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
