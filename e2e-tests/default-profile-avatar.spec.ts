import { test, expect } from '@playwright/test';

test('Default profile icon keeps its color and can be replaced by an uploaded photo', async ({ page }) => {
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('sliced-demo-v1'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Explore demo', exact: true }).click();

  const username = await page.getByLabel('Username', { exact: true }).inputValue();
  const profileImage = page.getByRole('main').getByRole('img', { name: username, exact: true }).first();
  await expect(profileImage).toHaveAttribute('src', /^data:image\/svg\+xml/);
  const defaultSource = (await profileImage.getAttribute('src'))!;
  const svg = decodeURIComponent(defaultSource.slice(defaultSource.indexOf(',') + 1));
  expect(svg).toContain('<circle cx="40" cy="29" r="11"/>');
  expect(svg).toMatch(/fill="#(?:c65d3b|647b58|557b91|886b87|956c35|e74008)"/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(profileImage).toHaveAttribute('src', defaultSource);

  await page.getByLabel('Change photo', { exact: true }).setInputFiles({
    name: 'my-profile.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1cAAAAASUVORK5CYII=', 'base64'),
  });
  await page.getByRole('button', { name: 'Save my profile', exact: true }).click();
  await expect(profileImage).toHaveAttribute('src', /^data:image\/png;base64,/);
  const uploadedSource = (await profileImage.getAttribute('src'))!;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(profileImage).toHaveAttribute('src', uploadedSource);
});
