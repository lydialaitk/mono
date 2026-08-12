import type { HealthResponse, StatusResponse } from "shared/contracts/status";

export async function getHealth(endpoint: string): Promise<HealthResponse> {
  const response = await fetch(`${endpoint}/health`);
  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}

export async function getStatus(endpoint: string): Promise<StatusResponse> {
  const response = await fetch(`${endpoint}/status`);
  if (!response.ok) {
    throw new Error(`Status request failed with status ${response.status}`);
  }
  return (await response.json()) as StatusResponse;
}

