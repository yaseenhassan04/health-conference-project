// components/home/avatarFallback.js
// Shared fallback avatar URL, previously retyped inline in 4 places across app/page.js.

export function avatarFallbackUrl(name, size = 300) {
  return `https://ui-avatars.com/api/?background=1B365D&color=D4AF37&bold=true&size=${size}&name=${encodeURIComponent(name)}`;
}
