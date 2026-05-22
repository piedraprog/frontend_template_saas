export type RegistrationData = {
  company: string;
  username: string;
  email: string;
  password: string;
  clientIp: string;
};

export function buildRegistrationData(prefix: string): RegistrationData {
  const token = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const prefixSlug = prefix
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .slice(0, 8);
  const uniqueSuffix = token.slice(-10);
  const slug = `${prefixSlug}${uniqueSuffix}`;

  return {
    company: `E2E ${prefix} ${token}`,
    username: slug,
    email: `${slug}@example.test`,
    password: 'BoilerE2E!123',
    clientIp: `198.51.${Number(token.slice(-4, -2)) % 100}.${10 + (Number(token.slice(-2)) % 200)}`,
  };
}
