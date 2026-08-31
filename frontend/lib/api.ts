// Cliente HTTP central hacia el backend (Express en :4000 en dev).
// Todo el frontend habla con la API a través de aquí.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  /** Token JWT para el header Authorization (peticiones de admin). */
  token?: string | null;
};

/**
 * `fetch` a la API que parsea JSON y convierte los errores en `ApiError`
 * con el mensaje en español que devuelve el backend (`{ error: "..." }`).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  // No forzamos Content-Type: si el body es FormData el navegador pone el
  // boundary correcto; si es JSON lo ponen los llamadores.

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. ¿Está encendida la API?");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null) ?? `Error ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Convierte una ruta relativa de subida (`/uploads/products/x.jpg`) en URL
 * absoluta hacia la API. Deja pasar `data:`, `http(s):` y cadenas vacías.
 */
export function assetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/uploads")) return `${API_URL}${url}`;
  return url;
}
