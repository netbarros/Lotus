
import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';

export interface MagicSaaSConfig {
    url: string;
    token?: string;
}

export const createMagicClient = (config: MagicSaaSConfig) => {
    const client = createDirectus(config.url)
        .with(rest())
        .with(authentication());

    if (config.token) {
        client.setToken(config.token);
    }

    return client;
};
