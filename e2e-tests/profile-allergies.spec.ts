import { test, expect } from '@playwright/test';

test('Save multiple profile allergies and a custom Other allergy', async ({ page }) => {
  await page.goto('/profile');
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload();
  await page.getByRole('button', { name: 'Explore demo', exact: true }).click();

  const picker = page.getByRole('button', { name: 'Choose allergies', exact: true });
  const otherInput = page.getByRole('textbox', { name: 'Other allergy or food restriction', exact: true });
  await expect(otherInput).not.toBeVisible();
  await picker.click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveCount(21);
  await page.getByRole('menuitemcheckbox', { name: 'Peanuts', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Sesame', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Other', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Done', exact: true }).click();
  await expect(otherInput).toBeVisible();
  await otherInput.fill('Kiwi');
  await page.getByRole('button', { name: 'Save my profile', exact: true }).click();
  await expect(page.getByText('Your profile is looking good', { exact: true })).toBeVisible();

  await page.reload();
  await expect(picker).toHaveText('Peanuts, Sesame, Other');
  await expect(otherInput).toHaveValue('Kiwi');
  await picker.click();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Peanuts', exact: true })).toBeChecked();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Sesame', exact: true })).toBeChecked();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Other', exact: true })).toBeChecked();

  await page.getByRole('menuitemcheckbox', { name: 'Other', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Done', exact: true }).click();
  await expect(otherInput).not.toBeVisible();
  await page.getByRole('button', { name: 'Save my profile', exact: true }).click();
  await expect(page.getByText('Your profile is looking good', { exact: true })).toBeVisible();
  await page.reload();
  await expect(picker).toHaveText('Peanuts, Sesame');
  await expect(otherInput).not.toBeVisible();
  await picker.click();
  await expect(page.getByRole('menuitemcheckbox', { name: 'Other', exact: true })).not.toBeChecked();
});
