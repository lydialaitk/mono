export function getBackendEndpoint(): string {
  const endpoint = (typeof __BACKEND_ENDPOINT__ === "string" ? __BACKEND_ENDPOINT__ : "").trim();
  if (!endpoint) {
    throw new Error("Missing backend endpoint configuration");
  }

  try {
    const url = new URL(endpoint);
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("Malformed backend endpoint configuration");
  }
}

