import { test, expect } from '@playwright/test';

test('A cute generated username persists and can be changed at signup and in Profile', async ({ page }) => {
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Explore demo', exact: true }).click();

  const username = page.getByLabel('Username', { exact: true });
  await expect(username).toHaveValue(/^[A-Z][a-z]+[A-Z][a-z]+\d{3}$/);
  const generatedName = await username.inputValue();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(username).toHaveValue(generatedName);

  await page.getByRole('button', { name: 'Sign out of demo', exact: true }).click();
  await page.getByRole('button', { name: 'Demo sign up', exact: true }).click();
  await expect(username).toHaveValue(generatedName);
  await username.fill('CozyOtter007');
  await page.getByLabel('Email address', { exact: true }).fill('nickname@example.com');
  await page.getByRole('button', { name: 'Create demo profile', exact: true }).click();
  await expect(username).toHaveValue('CozyOtter007');
  await expect(page.getByRole('heading', { name: 'CozyOtter007', exact: true })).toBeVisible();

  await username.fill('Luna');
  await page.getByRole('button', { name: 'Save my profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Luna', exact: true })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(username).toHaveValue('Luna');
  await expect(page.getByRole('heading', { name: 'Luna', exact: true })).toBeVisible();
});
