/** Fail closed until verified application sessions and protected roles are installed.
 * Never replace this with a browser flag, a shared password, or a Telegram command.
 */
export function requireLiveAdminAccess(): never {
  throw new Error("Live administration is unavailable until secure accounts are configured.");
}

export function telegramCanGrantAdmin(): false {
  return false;
}