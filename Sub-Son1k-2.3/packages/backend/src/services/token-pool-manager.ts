import { EventEmitter } from 'events';

// Interface definition for SunoToken based on the proven architecture
export interface SunoToken {
    cookie: string;
    sessionId: string;
    jwt: string;
    isValid: boolean;
    lastUsed: Date | null;
    lastValidated: Date;
    usageCount: number;
    credits: number;
    failureCount: number;
}

export interface TokenStats {
    totalTokens: number;
    validTokens: number;
    totalCredits: number;
    totalUsage: number;
}

export class TokenPoolManager extends EventEmitter {
    public tokens: SunoToken[] = [];
    private keepAliveInterval?: NodeJS.Timeout;
    private refreshInterval?: NodeJS.Timeout;
    private readonly BASE_URL = 'https://studio-api.suno.ai';
    private readonly CLERK_URL = 'https://clerk.suno.ai';

    // Configuración
    private readonly KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutos
    private readonly REFRESH_INTERVAL = 60 * 60 * 1000;   // 1 hora
    private readonly MAX_FAILURES = 3;

    constructor() {
        super();
    }

    /**
     * Inicializar pool de tokens
     */
    async initializePool(): Promise<void> {
        console.log('🔄 Initializing token pool...');

        // Support both env vars for backwards compatibility/ease of use
        const cookiesEnv = process.env.SUNO_COOKIES || process.env.SUNO_COOKIE;

        if (!cookiesEnv) {
            console.warn('⚠️ SUNO_COOKIES environment variable not set. Pool starting empty.');
            return;
        }

        const cookies = cookiesEnv.split(',').map(c => c.trim()).filter(c => c.length > 0);
        console.log(`📝 Found ${cookies.length} cookies in environment`);

        // Validar y agregar cada token
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            console.log(`🔍 Validating token ${i + 1}/${cookies.length}...`);

            try {
                const tokenData = await this.validateAndExtract(cookie);
                if (tokenData) {
                    this.tokens.push(tokenData);
                    console.log(`✅ Token ${i + 1} validated successfully (${tokenData.credits} credits, Session: ${tokenData.sessionId})`);
                }
            } catch (error: any) {
                console.error(`❌ Token ${i + 1} validation failed:`, error.message);
            }
        }

        if (this.tokens.length === 0) {
            console.warn('⚠️ No valid tokens initialized from environment. Waiting for manual addition or extension.');
        } else {
            console.log(`✅ Token pool initialized with ${this.tokens.length} valid tokens`);
            // Iniciar sistemas automáticos solo si hay tokens
            this.startKeepAlive();
            this.startAutoRefresh();
        }

        // Emitir evento de inicialización
        this.emit('initialized', { tokenCount: this.tokens.length });
    }

    /**
     * Add a token manually (e.g. from Extension)
     */
    async addToken(cookie: string): Promise<boolean> {
        try {
            const tokenData = await this.validateAndExtract(cookie);
            if (tokenData) {
                // Check if exists
                const existsIndex = this.tokens.findIndex(t => t.sessionId === tokenData.sessionId);
                if (existsIndex >= 0) {
                    // Update existing
                    this.tokens[existsIndex] = tokenData;
                    console.log(`🔄 Token upgraded/refreshed via manual add: ${tokenData.sessionId}`);
                } else {
                    this.tokens.push(tokenData);
                    console.log(`✅ New token added via manual add: ${tokenData.sessionId}`);
                }

                // Ensure services are running if this was the first token
                if (!this.keepAliveInterval) this.startKeepAlive();
                if (!this.refreshInterval) this.startAutoRefresh();

                return true;
            }
        } catch (e) {
            console.error("Failed to add manual token", e);
        }
        return false;
    }

    /**
     * Validar cookie y extraer información
     */
    private async validateAndExtract(cookie: string): Promise<SunoToken | null> {
        try {
            // 1. Obtener JWT del session
            // Note: Clerk sometimes requires specific User-Agent or Referer, adding generic ones just in case
            const sessionResponse = await fetch(`${this.CLERK_URL}/v1/client/sessions`, {
                headers: {
                    'Cookie': cookie,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://app.suno.ai/'
                }
            });

            if (!sessionResponse.ok) {
                throw new Error(`Failed to get session: ${sessionResponse.status} ${sessionResponse.statusText}`);
            }

            const sessionData = await sessionResponse.json() as any;
            const jwt = sessionData?.response?.last_active_session_id || sessionData?.last_active_session_id;

            if (!jwt) {
                console.warn('Full session data:', JSON.stringify(sessionData).substring(0, 200));
                throw new Error('No JWT found in session response');
            }

            // 2. Obtener créditos para validar y asegurar que el JWT funciona
            const creditsResponse = await fetch(`${this.BASE_URL}/api/billing/info/`, {
                headers: {
                    'Cookie': cookie,
                    'Authorization': `Bearer ${jwt}`,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!creditsResponse.ok) {
                throw new Error(`Failed to get credits: ${creditsResponse.status}`);
            }

            const creditsData = await creditsResponse.json() as any;

            // 3. Extraer session ID de la cookie
            const sessionMatch = cookie.match(/__session=([^;]+)/);
            const sessionId = sessionMatch ? sessionMatch[1] : `sess_${Date.now()}`; // Fallback ID if not found regex

            return {
                cookie,
                sessionId: sessionId.slice(0, 16), // Primeros 16 chars para identificación
                jwt,
                isValid: true,
                lastUsed: null,
                lastValidated: new Date(),
                usageCount: 0,
                credits: creditsData.total_credits_left || 0,
                failureCount: 0
            };
        } catch (error: any) {
            console.error('Token validation error details:', error);
            return null;
        }
    }

    /**
     * Obtener token óptimo del pool
     */
    async getOptimalToken(): Promise<SunoToken> {
        // Filtrar tokens válidos
        const validTokens = this.tokens.filter(t =>
            t.isValid && t.failureCount < this.MAX_FAILURES
        );

        if (validTokens.length === 0) {
            // Intentar revalidar todos los tokens
            console.log('⚠️ No valid tokens, attempting revalidation...');
            await this.revalidateAllTokens();

            const revalidatedTokens = this.tokens.filter(t => t.isValid);
            if (revalidatedTokens.length === 0) {
                throw new Error('No valid tokens available in pool. Please add SUNO_COOKIES or check connection.');
            }

            return revalidatedTokens[0];
        }

        // Ordenar por prioridad:
        // 1. Mayor cantidad de créditos
        // 2. Menor cantidad de usos
        // 3. Menor cantidad de fallos
        validTokens.sort((a, b) => {
            if (a.credits !== b.credits) return b.credits - a.credits;
            if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount;
            return a.failureCount - b.failureCount;
        });

        const selectedToken = validTokens[0];
        selectedToken.lastUsed = new Date();
        selectedToken.usageCount++;

        console.log(`🎯 Selected token ${selectedToken.sessionId} (${selectedToken.credits} credits, ${selectedToken.usageCount} uses)`);

        return selectedToken;
    }

    /**
     * Reportar fallo de token
     */
    async reportTokenFailure(token: SunoToken, error: Error): Promise<void> {
        token.failureCount++;

        console.warn(`⚠️ Token ${token.sessionId} failed (${token.failureCount}/${this.MAX_FAILURES}):`, error.message);

        if (token.failureCount >= this.MAX_FAILURES) {
            token.isValid = false;
            console.error(`❌ Token ${token.sessionId} marked as invalid after ${this.MAX_FAILURES} failures`);
            this.emit('tokenInvalid', { sessionId: token.sessionId });

            // Intentar revalidar el token en el futuro
            setTimeout(() => this.revalidateToken(token), 5 * 60 * 1000); // Reintentar en 5 min
        }
    }

    /**
     * Sistema de Keep-Alive automático
     */
    private startKeepAlive(): void {
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        console.log('🔄 Starting keep-alive system...');

        // Run immediately first time
        // this.runKeepAliveCycle(); 

        this.keepAliveInterval = setInterval(() => this.runKeepAliveCycle(), this.KEEP_ALIVE_INTERVAL);
    }

    private async runKeepAliveCycle() {
        console.log('💓 Running keep-alive for all tokens...');

        const keepAlivePromises = this.tokens
            .filter(t => t.isValid)
            .map(token => this.keepTokenAlive(token));

        const results = await Promise.allSettled(keepAlivePromises);

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`✅ Keep-alive complete: ${successful} successful, ${failed} failed`);

        this.emit('keepAliveComplete', { successful, failed });
    }

    /**
     * Mantener token vivo con request que no consume créditos
     */
    private async keepTokenAlive(token: SunoToken): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/api/billing/info/`, {
                headers: {
                    'Cookie': token.cookie,
                    'Authorization': `Bearer ${token.jwt}`,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Try to refresh JWT immediately if 401
                    console.log(`🔄 401 on keep-alive for ${token.sessionId}, trying JWT refresh...`);
                    await this.refreshJWT(token);
                    return;
                }
                throw new Error(`Keep-alive failed: ${response.status}`);
            }

            const data = await response.json() as any;
            token.credits = data.total_credits_left || token.credits;
            token.lastValidated = new Date();
            token.failureCount = 0; // Reset failures on success

            // console.log(`✅ Token ${token.sessionId} kept alive (${token.credits} credits)`);
        } catch (error: any) {
            console.error(`❌ Keep-alive failed for token ${token.sessionId}:`, error.message);
            throw error;
        }
    }

    /**
     * Sistema de auto-refresh de JWT
     */
    private startAutoRefresh(): void {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        console.log('🔄 Starting auto-refresh system...');

        this.refreshInterval = setInterval(async () => {
            console.log('🔄 Refreshing JWT tokens...');

            const refreshPromises = this.tokens
                .filter(t => t.isValid)
                .map(token => this.refreshJWT(token));

            const results = await Promise.allSettled(refreshPromises);

            const successful = results.filter(r => r.status === 'fulfilled').length;
            console.log(`✅ JWT refresh complete: ${successful}/${this.tokens.length} tokens refreshed`);

            this.emit('jwtRefreshComplete', { successful, total: this.tokens.length });
        }, this.REFRESH_INTERVAL);
    }

    /**
     * Refrescar JWT de un token
     */
    private async refreshJWT(token: SunoToken): Promise<void> {
        try {
            const response = await fetch(`${this.CLERK_URL}/v1/client/sessions`, {
                headers: {
                    'Cookie': token.cookie,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`JWT refresh failed: ${response.status}`);
            }

            const data = await response.json() as any;
            const newJWT = data?.response?.last_active_session_id || data?.last_active_session_id;

            if (newJWT && newJWT !== token.jwt) {
                token.jwt = newJWT;
                console.log(`✅ JWT refreshed for token ${token.sessionId}`);
            } else if (!newJWT) {
                throw new Error("No JWT in refresh response");
            }
        } catch (error: any) {
            console.error(`❌ JWT refresh failed for token ${token.sessionId}:`, error.message);
            token.failureCount++;
            throw error;
        }
    }

    /**
     * Revalidar un token específico
     */
    private async revalidateToken(token: SunoToken): Promise<void> {
        // console.log(`🔄 Attempting to revalidate token ${token.sessionId}...`);

        try {
            const validatedToken = await this.validateAndExtract(token.cookie);
            if (validatedToken) {
                Object.assign(token, validatedToken);
                token.failureCount = 0;
                token.isValid = true;
                console.log(`✅ Token ${token.sessionId} revalidated successfully`);
                this.emit('tokenRevalidated', { sessionId: token.sessionId });
            } else {
                console.warn(`Failed to revalidate token ${token.sessionId}`);
            }
        } catch (error: any) {
            console.error(`❌ Token revalidation failed:`, error.message);
        }
    }

    /**
     * Revalidar todos los tokens
     */
    private async revalidateAllTokens(): Promise<void> {
        console.log('🔄 Revalidating all tokens...');

        const revalidatePromises = this.tokens.map(token =>
            this.revalidateToken(token)
        );

        await Promise.allSettled(revalidatePromises);
    }

    /**
     * Obtener estadísticas del pool
     */
    getStats(): TokenStats {
        const validTokens = this.tokens.filter(t => t.isValid);

        return {
            totalTokens: this.tokens.length,
            validTokens: validTokens.length,
            totalCredits: validTokens.reduce((sum, t) => sum + t.credits, 0),
            totalUsage: this.tokens.reduce((sum, t) => sum + t.usageCount, 0)
        };
    }

    /**
     * Obtener información detallada de todos los tokens
     */
    getDetailedInfo(): any[] {
        return this.tokens.map(t => ({
            sessionId: t.sessionId,
            isValid: t.isValid,
            credits: t.credits,
            usageCount: t.usageCount,
            failureCount: t.failureCount,
            lastUsed: t.lastUsed,
            lastValidated: t.lastValidated
        }));
    }

    /**
     * Detener todos los intervalos
     */
    stop(): void {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            console.log('⏹️ Keep-alive stopped');
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            console.log('⏹️ Auto-refresh stopped');
        }
    }
}

// Global Singleton Instance
export const tokenPool = new TokenPoolManager();
