import { Role } from "@prisma/client";

export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
        phone: string | null;
    };
}
