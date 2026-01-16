import { v4 as uuidv4 } from 'uuid';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005';

export function getAnonymousId() {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('se_anon');
    if (!id) {
        id = uuidv4();
        localStorage.setItem('se_anon', id);
    }
    return id;
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
    const anonId = getAnonymousId();

    const headers = {
        'Content-Type': 'application/json',
        'x-anonymous-id': anonId,
        ...options.headers,
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || `Request failed: ${res.status}`);
    }

    return res.json();
}
