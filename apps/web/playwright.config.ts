import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:3000',
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'tablet',
			use: { ...devices['iPad Mini'] },
		},
		{
			name: 'mobile',
			use: { ...devices['iPhone 13'] },
		},
	],
	webServer: {
		command: 'pnpm start',
		port: 3000,
		reuseExistingServer: !process.env.CI,
	},
});
