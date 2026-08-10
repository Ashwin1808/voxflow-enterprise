import { createEnvelopeClient } from "../apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const publicClient = createEnvelopeClient(BASE_URL);
