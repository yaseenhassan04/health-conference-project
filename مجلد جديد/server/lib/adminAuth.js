/**
 * التحقق من توكن الإدارة المُرسل في هيدر x-admin-token.
 * fallbackToken يُستخدم فقط في المسارات التي كانت أصلاً تعتمد على قيمة افتراضية
 * (samoud2025) عند عدم ضبط ADMIN_TOKEN في البيئة.
 */
export function isAdminAuthorized(req, fallbackToken) {
  const expectedToken = process.env.ADMIN_TOKEN || fallbackToken;
  return req.headers.get("x-admin-token") === expectedToken;
}
