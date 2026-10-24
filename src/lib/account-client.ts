import { createAuthClient } from "better-auth/react";
export const accountClient = createAuthClient({ basePath: "/api/public/auth" });