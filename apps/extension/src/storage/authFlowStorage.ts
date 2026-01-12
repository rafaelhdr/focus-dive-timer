export type LoginStep = "email" | "token";

const STEP_KEY = "focusdive.login.step";
const EMAIL_KEY = "focusdive.login.email";

export function getLoginStep(): LoginStep {
  const v = localStorage.getItem(STEP_KEY);
  return v === "token" ? "token" : "email";
}

export function setLoginStep(step: LoginStep) {
  localStorage.setItem(STEP_KEY, step);
}

export function clearLoginStep() {
  localStorage.removeItem(STEP_KEY);
}

export function getLoginEmail(): string {
  return localStorage.getItem(EMAIL_KEY) ?? "";
}

export function setLoginEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearLoginEmail() {
  localStorage.removeItem(EMAIL_KEY);
}

export function clearLoginFlow() {
  clearLoginStep();
  clearLoginEmail();
}

