import {
  APIRequestContext,
  Browser,
  BrowserContext,
  expect,
  Page,
  TestInfo,
} from '@playwright/test';
import { RegistrationData } from './test-data';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';
const apiBaseURL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3000';

type SessionBootstrap = {
  context: BrowserContext;
  page: Page;
};

export async function createAuthenticatedPage(
  browser: Browser,
  request: APIRequestContext,
  testInfo: TestInfo,
  account: RegistrationData,
): Promise<SessionBootstrap> {
  const userAgent = `pw-e2e-${Date.now()}-${testInfo.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}`;

  const registerResponse = await request.post(`${apiBaseURL}/auth/register`, {
    data: {
      company: account.company,
      username: account.username,
      email: account.email,
      password: account.password,
    },
    headers: {
      Platform: 'web',
      'User-Agent': userAgent,
    },
  });

  expect(registerResponse.ok(), `Register failed with ${registerResponse.status()}`).toBeTruthy();

  const loginResponse = await request.post(`${apiBaseURL}/auth/login`, {
    data: {
      email: account.email,
      password: account.password,
    },
    headers: {
      Platform: 'web',
      'User-Agent': userAgent,
    },
  });

  expect(loginResponse.ok(), `Login failed with ${loginResponse.status()}`).toBeTruthy();

  const loginBody = (await loginResponse.json()) as {
    data: { accessToken: string; refreshToken: string; userId: string };
  };
  const payload = decodeJwtPayload(loginBody.data.accessToken) as { companyId?: string };

  const context = await browser.newContext({
    baseURL,
    userAgent,
    viewport: { width: 1440, height: 960 },
  });

  await context.addCookies([
    {
      name: 'boilerplate_access',
      value: loginBody.data.accessToken,
      url: baseURL,
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'boilerplate_refresh',
      value: loginBody.data.refreshToken,
      url: baseURL,
      httpOnly: true,
      sameSite: 'Lax',
    },
    {
      name: 'userId',
      value: loginBody.data.userId,
      url: baseURL,
      sameSite: 'Lax',
    },
  ]);

  const page = await context.newPage();
  await page.addInitScript(
    ({ companyId, userId }) => {
      if (companyId) {
        sessionStorage.setItem('boilerplate_company_id', companyId);
      }
      document.cookie = `userId=${userId}; path=/`;
    },
    {
      companyId: payload.companyId ?? '',
      userId: loginBody.data.userId,
    },
  );

  return { context, page };
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  if (!payload) {
    return {};
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
}
