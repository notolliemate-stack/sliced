import { test, expect } from '@playwright/test';

test('New visitors start logged out, can explore the demo, and can sign out again', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  const welcome = page.getByRole('heading', { name: 'There’s a place for you.', exact: true });
  const explore = page.getByRole('button', { name: 'Explore demo', exact: true });
  await expect(welcome).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Something good is cooking.', exact: true })).not.toBeVisible();
  await explore.click();
  await expect(page.getByRole('heading', { name: 'Something good is cooking.', exact: true })).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Something good is cooking.', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out of demo', exact: true }).click();
  await expect(welcome).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(welcome).toBeVisible();

  await page.goto('/schedule', { waitUntil: 'domcontentloaded' });
  await expect(welcome).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A week of good things.', exact: true })).not.toBeVisible();
  await explore.click();
  await expect(page).toHaveURL(/\/schedule$/);
  await expect(page.getByRole('heading', { name: 'A week of good things.', exact: true })).toBeVisible();
});

test('A logged-out invitation recipient enters the demo and continues to the invited group', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.goto('/groups?invite=family-table-demo', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'There’s a place for you.', exact: true })).toBeVisible();
  await page.getByLabel('Email address', { exact: true }).fill('visitor@example.com');
  await page.getByRole('button', { name: 'Enter the demo', exact: true }).click();

  const invitation = page.getByRole('dialog', { name: 'You’re invited to Family Table', exact: true });
  await expect(invitation).toBeVisible();
  await invitation.getByRole('button', { name: 'Return to this group', exact: true }).click();
  await expect(invitation).not.toBeVisible();
  await expect(page).toHaveURL(/\/groups$/);
  await expect(page.getByRole('heading', { name: 'Family Table', exact: true })).toBeVisible();
});
