
import { AsyncLocalStorage } from 'async_hooks';

export interface Context {
    tenantId?: string;
    userId?: string;
    roles?: string[];
    requestId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<Context>();

export const runWithContext = <T>(context: Context, callback: () => T): T => {
    return asyncLocalStorage.run(context, callback);
};

export const getContext = (): Context | undefined => {
    return asyncLocalStorage.getStore();
};

export const getTenantId = (): string | undefined => {
    return asyncLocalStorage.getStore()?.tenantId;
};

// Express Middleware
export const contextMiddleware = (req: any, res: any, next: any) => {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
    const userId = req.headers['x-user-id']; // In real app, from JWT
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();

    const context: Context = {
        tenantId: typeof tenantId === 'string' ? tenantId : undefined,
        userId: typeof userId === 'string' ? userId : undefined,
        requestId: typeof requestId === 'string' ? requestId : undefined,
    };

    runWithContext(context, () => {
        next();
    });
};
