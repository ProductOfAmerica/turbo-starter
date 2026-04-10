import { checkA11y, expect, test } from './fixtures';

test.describe('Homepage rendering', () => {
	test('hero section renders with heading and CTAs', async ({ page, _homePage }) => {
		await expect(page.locator('h1', { hasText: 'Build faster with' })).toBeVisible();
		await expect(page.locator('a', { hasText: 'Get Started' })).toBeVisible();
		await expect(page.locator('a', { hasText: 'Read Documentation' })).toBeVisible();
	});

	test('tech stack badges render in hero', async ({ page, _homePage }) => {
		const badges = [
			'Next.js 16',
			'Turborepo',
			'Shadcn UI',
			'Tailwind CSS',
			'Biome.js',
			'TypeScript',
			'Docker',
			'pnpm',
		];
		for (const badge of badges) {
			// Use the Badge component near the hero section
			await expect(page.getByRole('link', { name: badge }).first()).toBeVisible();
		}
	});

	test('features section renders all 6 cards', async ({ page, _homePage }) => {
		await expect(page.locator('section#features')).toBeVisible();
		await expect(page.locator('h2', { hasText: 'Everything you need to ship' })).toBeVisible();

		const featureTitles = [
			'Lightning Fast',
			'Modern UI',
			'Production Ready',
			'Developer Experience',
			'Containerized',
			'Monorepo Structure',
		];
		for (const title of featureTitles) {
			await expect(page.locator('section#features').getByText(title)).toBeVisible();
		}
	});

	test('quick start section renders with install commands', async ({ page, _homePage }) => {
		await expect(page.locator('section#quick-start')).toBeVisible();
		await expect(page.locator('h2', { hasText: 'Get up and running' })).toBeVisible();
		await expect(page.getByText('pnpm install')).toBeVisible();
		await expect(page.getByText('pnpm dev').first()).toBeVisible();
	});

	test('CTA section renders with both buttons', async ({ page, _homePage }) => {
		await expect(page.locator('h2', { hasText: 'Ready to build something amazing?' })).toBeVisible();
		await expect(page.locator('a', { hasText: 'Clone Repository' })).toBeVisible();
		await expect(page.locator('a', { hasText: 'Deploy to Vercel' })).toBeVisible();
	});

	test('footer renders with credits', async ({ page, _homePage }) => {
		await expect(page.locator('footer')).toBeVisible();
		await expect(page.locator('footer').getByText('ProductOfAmerica')).toBeVisible();
	});

	test('page passes accessibility checks', async ({ page, _homePage }) => {
		await checkA11y(page);
	});

	// Skip screenshot comparison in CI (font rendering differs across OS)
	// Run locally with: npx playwright test --grep "screenshot"
	// biome-ignore lint/correctness/noUnusedFunctionParameters: fixture triggers navigation
	test.skip(!!process.env.CI, 'Screenshot baselines are platform-specific');
	test('full page screenshot matches baseline', async ({ page, _homePage }) => {
		await expect(page).toHaveScreenshot('homepage.png', {
			fullPage: true,
			maxDiffPixelRatio: 0.05,
		});
	});
});
