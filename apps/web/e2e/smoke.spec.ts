import { expect, test } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
	const response = await page.goto('/');
	expect(response?.status()).toBe(200);
});

test('homepage has a title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/.+/);
});
