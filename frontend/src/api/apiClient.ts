import axios, { AxiosError, type AxiosResponse } from "axios";
import keycloak from "../auth/keycloak";
import type { ApiEnvelope } from "../types/fraud";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function ensureFreshToken(): Promise<void> {
  if (!keycloak.authenticated) {
    throw new ApiError(401, "Not authenticated");
  }
  try {
    await keycloak.updateToken(30);
  } catch {
    keycloak.logout({ redirectUri: window.location.origin });
    throw new ApiError(401, "Session expired — please sign in again");
  }
}

apiClient.interceptors.request.use(async (config) => {
  await ensureFreshToken();
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as ApiEnvelope<unknown> | undefined;
    if (body && typeof body === "object" && "data" in body && "status" in body) {
      response.data = (body as ApiEnvelope<unknown>).data;
    }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const message =
        error.response.data?.message ??
        (error.response.status === 401
          ? "Unauthorized — check your session"
          : error.response.status >= 500
            ? "Server error — try again shortly"
            : "Request failed");
      return Promise.reject(new ApiError(error.response.status, message));
    }
    return Promise.reject(new ApiError(0, "Network error — is the service reachable?"));
  }
);

export default apiClient;
