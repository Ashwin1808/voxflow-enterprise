const PORTS = {
  auth: 8081,
  fraud: 8082,
  insurance: 8083,
  inbound: 8084
};

const BASE_URL = "http://localhost";
let authToken = null;

export function setToken(token) {
  authToken = token;
}

export async function request(service, path, options = {}) {
  const port = PORTS[service];
  if (!port) {
    throw new Error(`Unknown service: ${service}`);
  }
  const url = `${BASE_URL}:${port}${path}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("unauthorized"));
    }
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP Error ${response.status}: ${errorText}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  const json = await response.json().catch(() => null);
  if (json && json.data !== undefined && (typeof json.success === "boolean" || typeof json.status === "string")) {
    if (json.success === false || json.status === "ERROR") {
      throw new Error(json.message || "API Error");
    }
    return json.data;
  }
  return json;
}
