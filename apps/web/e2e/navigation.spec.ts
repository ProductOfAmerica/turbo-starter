import { expect, test } from './fixtures';

test.describe('Navigation', () => {
	test('anchor link scrolls to features section', async ({ page, _homePage }) => {
		await page.locator('a[href="#features"]').first().click();
		await expect(page.locator('section#features')).toBeInViewport();
	});

	test('anchor link scrolls to quick start section', async ({ page, _homePage }) => {
		await page.locator('a[href="#quick-start"]').first().click();
		await expect(page.locator('section#quick-start')).toBeInViewport();
	});

	test('404 page renders for non-existent route', async ({ page }) => {
		await page.goto('/this-page-does-not-exist');
		await expect(page.getByText('404')).toBeVisible();
		await expect(page.getByText('Page not found')).toBeVisible();
	});

	test('external links have correct hrefs', async ({ page, _homePage }) => {
		const githubLink = page.locator('a[href="https://github.com/ProductOfAmerica/turbo-starter"]').first();
		await expect(githubLink).toBeVisible();

		const docsLink = page.locator('a[href="https://turbo.build/repo/docs"]').first();
		await expect(docsLink).toBeVisible();
	});
});

test.describe('Responsive: mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('mobile menu button is visible', async ({ page, _homePage }) => {
		const menuButton = page.getByRole('button', { name: /menu/i });
		await expect(menuButton).toBeVisible();
	});
});

test.describe('Responsive: desktop', () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test('desktop nav links are visible', async ({ page, _homePage }) => {
		await expect(page.locator('nav a[href="#features"]')).toBeVisible();
		await expect(page.locator('nav a[href="#quick-start"]')).toBeVisible();
	});
});
