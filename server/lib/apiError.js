export class ApiError extends Error {
  constructor(status, body) {
    const payload = typeof body === "string" ? { error: body } : body;
    super(payload?.error || "API Error");
    this.status = status;
    this.body = payload;
  }
}
