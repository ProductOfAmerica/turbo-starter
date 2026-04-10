import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ homePage: void }>({
	homePage: async ({ page }, use) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');
		await use();
	},
});

export async function checkA11y(page: import('@playwright/test').Page) {
	const results = await new AxeBuilder({ page })
		.disableRules(['region', 'color-contrast']) // Known issues tracked in TODOS.md
		.analyze();
	expect(results.violations).toEqual([]);
}

export { expect };
