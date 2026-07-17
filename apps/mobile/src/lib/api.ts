import { createApiClient } from '@veda/api-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://vedaapi-production.up.railway.app';

export const api = createApiClient(API_URL);

export * from '@veda/api-client';
