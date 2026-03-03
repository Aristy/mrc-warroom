export class ApiError extends Error {
    constructor(status, body) {
        super(`API error ${status}`);
        this.status = status;
        this.body = body;
    }
}
export async function apiFetch(path, options) {
    const res = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
    if (res.status === 401) {
        window.location.href = '/login';
        throw new ApiError(401, null);
    }
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body);
    }
    return res.json();
}
export async function apiPost(path, body) {
    return apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
}
export async function apiPut(path, body) {
    return apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
}
