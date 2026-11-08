export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        roleId: string;
        role: string;
        permissions: string[];
    };
}
