export default function validate(schema) {
  return (req, res, next) => {
    const { errors } = schema(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "validation_error", errors });
    }
    next();
  };
}

export const registerSchema = (body) => {
  const errors = [];
  if (!body.name || body.name.trim().length < 2)
    errors.push("name must be at least 2 characters");
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push("valid email is required");
  if (!body.password || body.password.length < 8)
    errors.push("password must be at least 8 characters");
  return { errors };
};

export const loginSchema = (body) => {
  const errors = [];
  if (!body.email || !body.email.includes("@"))
    errors.push("valid email is required");
  if (!body.password)
    errors.push("password is required");
  return { errors };
};

export const createLinkSchema = (body) => {
  const errors = [];
  if (!body.url) {
    errors.push("url is required");
    return { errors };
  }
  try { new URL(body.url); } catch { errors.push("url must be a valid URL"); }
  if (body.url && !body.url.startsWith("http://") && !body.url.startsWith("https://"))
    errors.push("url must start with http:// or https://");
  if (body.customAlias && !/^[a-zA-Z0-9-]+$/.test(body.customAlias))
    errors.push("customAlias may only contain letters, numbers, and hyphens");
  if (body.customAlias && (body.customAlias.length < 3 || body.customAlias.length > 30))
    errors.push("customAlias must be between 3 and 30 characters");
  if (body.expiresAt && isNaN(Date.parse(body.expiresAt)))
    errors.push("expiresAt must be a valid date string");
  if (body.expiresAt && new Date(body.expiresAt) <= new Date())
    errors.push("expiresAt must be in the future");
  return { errors };
};
