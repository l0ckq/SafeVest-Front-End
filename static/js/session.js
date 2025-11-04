// Gerencia o armazenamento local dos tokens JWT

export function saveTokens(access, refresh) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
}

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

export function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

export function isLoggedIn() {
    return !!getAccessToken();
}
