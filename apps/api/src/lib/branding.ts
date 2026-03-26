// Single source of truth for brand colours and name.
// Override via env vars to change the entire platform look.

export const BRAND = {
  name: process.env.BRAND_NAME ?? "Gutenberg Platform",
  // Primary = purple
  primaryColor: process.env.BRAND_COLOR_PRIMARY ?? "#7c3aed",
  primaryDark: process.env.BRAND_COLOR_PRIMARY_DARK ?? "#6d28d9",
  // Secondary = blue
  secondaryColor: process.env.BRAND_COLOR_SECONDARY ?? "#2563eb",
  secondaryDark: process.env.BRAND_COLOR_SECONDARY_DARK ?? "#1d4ed8",
}
