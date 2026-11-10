import { test, expect } from '@playwright/test';

// Leave time for repeated navigation when the Tests panel uses slow-motion playback.
test.describe.configure({ timeout: 60_000 });
// Surface the stalled action instead of exhausting the entire test timeout.
test.use({ actionTimeout: 10_000, navigationTimeout: 15_000 });

async function openNextWeek(page: import('@playwright/test').Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'There’s a place for you.', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Explore demo', exact: true }).click();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('heading', { name: 'A peek at your week', exact: true }).scrollIntoViewIfNeeded();
  const dates = await page.evaluate(() => {
    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + 7);
    const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const tuesday = new Date(monday);
    tuesday.setDate(tuesday.getDate() + 1);
    return { from: key(monday), to: key(tuesday) };
  });
  await page.getByRole('button', { name: 'Next week', exact: true }).click();
  return dates;
}

test('Moving a cooking day clears the original day, including existing duplicate claims', async ({ page }) => {
  const { from, to } = await openNextWeek(page);
  const originalDay = page.getByTestId(`cooking-day-${from}`);
  const newDay = page.getByTestId(`cooking-day-${to}`);
  await originalDay.getByRole('button', { name: 'Who’s cooking?', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'I’ll cook this day', exact: true }).click();
  await expect(originalDay.getByText('Your cooking day', { exact: true })).toHaveCount(1);

  // Reproduce duplicate entries saved by the old claim behavior in this test browser only.
  await page.evaluate(date => {
    const key = 'sliced-demo-v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    const claim = state.commitments.find((item: { date: string; cookId: string; groupId: string }) => item.date === date && item.cookId === 'you' && item.groupId === 'supper');
    state.commitments.push({ ...claim, id: 'duplicate-claim-regression' });
    localStorage.setItem(key, JSON.stringify(state));
  }, from);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Next week', exact: true }).click();
  await originalDay.getByRole('button', { name: /Your cooking day/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Your day in the kitchen', exact: true });
  await dialog.getByLabel('Need a different day?').fill(to);
  await dialog.getByRole('button', { name: 'Change cooking day', exact: true }).click();

  await expect(originalDay.getByText('Your cooking day', { exact: true })).toHaveCount(0);
  await expect(originalDay.getByRole('button', { name: 'Who’s cooking?', exact: true })).toBeVisible();
  await expect(newDay.getByText('Your cooking day', { exact: true })).toHaveCount(1);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Next week', exact: true }).click();
  await expect(originalDay.getByRole('button', { name: 'Who’s cooking?', exact: true })).toBeVisible();
  await expect(newDay.getByText('Your cooking day', { exact: true })).toHaveCount(1);
});

test('Repeated claim clicks create only one cooking commitment', async ({ page }) => {
  const { from } = await openNextWeek(page);
  const day = page.getByTestId(`cooking-day-${from}`);
  await day.getByRole('button', { name: 'Who’s cooking?', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'I’ll cook this day', exact: true }).evaluate(button => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(day.getByText('Your cooking day', { exact: true })).toHaveCount(1);
});
