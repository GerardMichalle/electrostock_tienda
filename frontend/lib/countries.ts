// Países para el selector de código telefónico del checkout. Lista acotada a
// Latinoamérica + España + EE.UU. (el grueso de clientes de una tienda peruana).
// `min`/`max` = cantidad de dígitos del número nacional (sin el código de país).

export type Country = {
  iso: string; // ISO 3166-1 alpha-2, minúscula (para la bandera)
  name: string;
  dial: string; // sin "+"
  min: number;
  max: number;
  example: string; // número nacional de ejemplo (placeholder)
};

export const COUNTRIES: Country[] = [
  { iso: "pe", name: "Perú", dial: "51", min: 9, max: 9, example: "987 654 321" },
  { iso: "ar", name: "Argentina", dial: "54", min: 10, max: 10, example: "9 11 2345 6789" },
  { iso: "bo", name: "Bolivia", dial: "591", min: 8, max: 8, example: "71 234 567" },
  { iso: "br", name: "Brasil", dial: "55", min: 10, max: 11, example: "11 91234 5678" },
  { iso: "cl", name: "Chile", dial: "56", min: 9, max: 9, example: "9 1234 5678" },
  { iso: "co", name: "Colombia", dial: "57", min: 10, max: 10, example: "300 123 4567" },
  { iso: "cr", name: "Costa Rica", dial: "506", min: 8, max: 8, example: "8312 3456" },
  { iso: "ec", name: "Ecuador", dial: "593", min: 9, max: 9, example: "99 123 4567" },
  { iso: "es", name: "España", dial: "34", min: 9, max: 9, example: "612 34 56 78" },
  { iso: "us", name: "Estados Unidos", dial: "1", min: 10, max: 10, example: "201 555 0123" },
  { iso: "mx", name: "México", dial: "52", min: 10, max: 10, example: "55 1234 5678" },
  { iso: "pa", name: "Panamá", dial: "507", min: 8, max: 8, example: "6123 4567" },
  { iso: "py", name: "Paraguay", dial: "595", min: 9, max: 9, example: "961 234 567" },
  { iso: "uy", name: "Uruguay", dial: "598", min: 8, max: 9, example: "94 231 234" },
  { iso: "ve", name: "Venezuela", dial: "58", min: 10, max: 10, example: "412 123 4567" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Perú

export function findCountry(iso: string): Country {
  return COUNTRIES.find((c) => c.iso === iso) ?? DEFAULT_COUNTRY;
}

/** Solo dígitos, recortado al máximo del país. */
export function sanitizeNational(raw: string, country: Country): string {
  return raw.replace(/\D/g, "").slice(0, country.max);
}

export function isValidNational(national: string, country: Country): boolean {
  const n = national.replace(/\D/g, "");
  return n.length >= country.min && n.length <= country.max;
}

/** Número final que se guarda en el pedido, formato internacional: +51987654321 */
export function composePhone(national: string, country: Country): string {
  return `+${country.dial}${national.replace(/\D/g, "")}`;
}
