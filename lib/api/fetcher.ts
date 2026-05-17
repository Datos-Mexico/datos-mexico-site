const API_BASE = "https://api.datos-itam.org";

class ApiError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApiData<T>(endpoint: string): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      next: { revalidate: false },
      headers: {
        Accept: "application/json",
        "User-Agent": "datosmexico.org/build",
      },
    });
  } catch (networkError) {
    throw new ApiError(
      `Network error fetching ${url}: ${networkError instanceof Error ? networkError.message : String(networkError)}`,
      endpoint,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `API returned ${response.status} for ${url}`,
      endpoint,
      response.status,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new ApiError(
      `Failed to parse JSON from ${url}: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      endpoint,
    );
  }

  return data as T;
}

export { ApiError };
