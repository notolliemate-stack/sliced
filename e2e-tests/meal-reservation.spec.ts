import { test, expect } from '@playwright/test';

test('Reserve a friend’s meal, retain it after reload, and release the portions on cancellation', async ({ page }) => {
  // Reset only this test browser's local prototype data, then use the app's own samples.
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload();
  await page.getByRole('link', { name: 'Meals', exact: true }).click();
  await expect(page).toHaveURL(/\/meals$/);

  // Tomorrow's sample meal remains upcoming regardless of the time this test runs.
  const mealName = 'Lemon & herb roast chicken';
  const openMeal = page.getByRole('button', { name: `View ${mealName}`, exact: true });
  const mealCard = page.getByRole('article').filter({ has: openMeal });
  const dialog = page.getByRole('dialog', { name: mealName, exact: true });

  await expect(mealCard.getByText('5 portions left', { exact: true })).toBeVisible();
  await openMeal.click();
  const portions = dialog.getByRole('combobox', { name: 'Number of portions to reserve' });
  await expect(portions.getByRole('option')).toHaveCount(5);
  await portions.selectOption('2');
  await dialog.getByRole('button', { name: 'Save me a plate', exact: true }).click();
  await expect(dialog.getByText('You have 2 portions reserved', { exact: true })).toBeVisible();
  await expect(dialog.getByText('You · 2 portions', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(mealCard.getByText('3 portions left', { exact: true })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'My reservations', exact: true }).click();
  await expect(mealCard.getByText('Reserved', { exact: true })).toBeVisible();
  await expect(mealCard.getByText('3 portions left', { exact: true })).toBeVisible();
  await openMeal.click();
  await expect(dialog.getByText('You have 2 portions reserved', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel my reservation', exact: true }).click();
  await expect(dialog.getByText('You have 2 portions reserved', { exact: true })).not.toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Save me a plate', exact: true })).toBeEnabled();
  await expect(dialog.getByRole('combobox', { name: 'Number of portions to reserve' }).getByRole('option')).toHaveCount(5);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your next delicious thing awaits', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Upcoming', exact: true }).click();
  await expect(mealCard.getByText('5 portions left', { exact: true })).toBeVisible();
  await expect(mealCard.getByText('Reserved', { exact: true })).not.toBeVisible();
});
