/// <reference types="vite/client" />

/**
 * Extend the Vite environment variables that you expose to the client.
 * Add any additional VITE_… variables you reference in the codebase.
 */
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // e.g. readonly VITE_OTHER_VAR: string;
}
