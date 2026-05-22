import { expect, Locator, Page } from '@playwright/test';

type FillTarget = {
  locator: Locator;
  kind: 'fill' | 'pressSequentially';
};

async function firstVisibleTarget(page: Page, selectors: string[]): Promise<FillTarget | null> {
  const contexts = [page, ...page.frames()];

  for (const context of contexts) {
    for (const selector of selectors) {
      const locator = context.locator(selector).first();

      try {
        if (await locator.isVisible({ timeout: 1_000 })) {
          return {
            locator,
            kind: selector.includes('autocomplete="cc-number"') ? 'pressSequentially' : 'fill',
          };
        }
      } catch {
        // Try the next selector or frame.
      }
    }
  }

  return null;
}

async function fillAny(page: Page, selectors: string[], value: string): Promise<void> {
  const target = await firstVisibleTarget(page, selectors);

  if (!target) {
    throw new Error(`No visible Stripe field found for selectors: ${selectors.join(', ')}`);
  }

  await target.locator.click();

  if (target.kind === 'pressSequentially') {
    await target.locator.pressSequentially(value, { delay: 40 });
    return;
  }

  await target.locator.fill(value);
}

export async function completeStripeCheckout(page: Page, email?: string): Promise<void> {
  await page.waitForURL(/stripe\.com/, { timeout: 45_000 });

  if (email) {
    const emailTarget = await firstVisibleTarget(page, [
      'input[type="email"]',
      'input[autocomplete="email"]',
      'input[name="email"]',
    ]);

    if (emailTarget) {
      await emailTarget.locator.fill(email);
    }
  }

  await fillAny(page, ['input[autocomplete="cc-name"]', 'input[name="name"]'], 'Test Boiler');
  await fillAny(
    page,
    ['input[autocomplete="cc-number"]', 'input[name="cardNumber"]'],
    '4242424242424242',
  );
  await fillAny(page, ['input[autocomplete="cc-exp"]', 'input[name="cardExpiry"]'], '1234');
  await fillAny(page, ['input[autocomplete="cc-csc"]', 'input[name="cardCvc"]'], '123');
  await fillAny(
    page,
    ['input[autocomplete="postal-code"]', 'input[name="billingPostalCode"]'],
    '10001',
  );

  const submit = page.getByRole('button', { name: /pagar|pay|subscribe|suscrib|iniciar/i }).first();

  await expect(submit).toBeVisible({ timeout: 20_000 });
  await submit.click();
}
