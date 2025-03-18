const { z } = require("zod");

const loginSchema = z.object({
    username: z.string().email({ message: "username must be email" }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters long" })
        .max(50, { message: "Password cannot exceed 50 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character (@$!%*?&)" }),
    firstname: z.string().min(1, { message: "First name is required" }).optional(),
    lastname: z.string().min(1, { message: "Last name is required" }).optional()
});

module.exports = loginSchema;