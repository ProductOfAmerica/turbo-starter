import { expect, test } from './fixtures';

test.describe('Theme toggle', () => {
	test('theme toggle button is visible and clickable', async ({ page, homePage }) => {
		const themeButton = page.getByRole('button', { name: /theme/i });
		await expect(themeButton).toBeVisible();
		await themeButton.click();
		// Button should remain visible after click (icon may change)
		await expect(themeButton).toBeVisible();
	});
});

test.describe('Copy to clipboard', () => {
	test('copy button exists and is clickable', async ({ page, homePage }) => {
		const copyButton = page.locator('button[aria-label*="Copy"]').first();
		await copyButton.scrollIntoViewIfNeeded();
		await expect(copyButton).toBeVisible();
		await copyButton.click();
		await expect(copyButton).toBeVisible();
	});
});
