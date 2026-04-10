import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 30_000,
	retries: 0,
	use: {
		baseURL: 'http://localhost:3000',
		browserName: 'chromium',
		viewport: { width: 1280, height: 720 },
	},
	webServer: {
		command: 'pnpm start',
		port: 3000,
		reuseExistingServer: !process.env.CI,
	},
});
