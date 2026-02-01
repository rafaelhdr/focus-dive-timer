import { get, set, remove } from "@focusdive/storage";

export type LoginStep = "email" | "token";

const STEP_KEY = "focusdive.login.step";
const EMAIL_KEY = "focusdive.login.email";

function isLoginStep(v: unknown): v is LoginStep {
  return v === "email" || v === "token";
}

export async function getLoginStep(): Promise<LoginStep> {
  const v = await get(STEP_KEY);
  return isLoginStep(v) ? v : "email";
}

export async function setLoginStep(step: LoginStep): Promise<void> {
  await set(STEP_KEY, step);
}

export async function clearLoginStep(): Promise<void> {
  await remove(STEP_KEY);
}

export async function getLoginEmail(): Promise<string> {
  return (await get(EMAIL_KEY)) ?? "";
}

export async function setLoginEmail(email: string): Promise<void> {
  await set(EMAIL_KEY, email);
}

export async function clearLoginEmail(): Promise<void> {
  await remove(EMAIL_KEY);
}

export async function clearLoginFlow(): Promise<void> {
  await Promise.all([clearLoginStep(), clearLoginEmail()]);
}

