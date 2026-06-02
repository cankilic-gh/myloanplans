export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.floor(performance.now()).toString(36)}`;
}

export const today = () => new Date().toISOString().slice(0, 10);
export const nowISO = () => new Date().toISOString();
