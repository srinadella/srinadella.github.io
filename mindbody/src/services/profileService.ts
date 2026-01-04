export function getProfiles() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("profiles") || "[]");
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("profiles", JSON.stringify(profiles));
  } catch {
    // ignore write failures
  }
}
