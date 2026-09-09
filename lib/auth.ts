export const AUTH_COOKIE_NAME = "maul_thrift_auth_token";
export const DEFAULT_PIN = "123456";

export function getExpectedPin(): string {
  return process.env.APP_PIN_SECRET || DEFAULT_PIN;
}

export function isValidPin(inputPin: string): boolean {
  const expected = getExpectedPin();
  return inputPin.trim() === expected.trim();
}
