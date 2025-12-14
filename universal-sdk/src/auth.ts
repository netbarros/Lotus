
export interface User {
    id: string;
    email: string;
    role: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
    // TODO: Implement actual auth check with Directus or Auth provider
    return {
        id: 'mock-user-id',
        email: 'demo@magicsaas.com',
        role: 'admin'
    };
};
