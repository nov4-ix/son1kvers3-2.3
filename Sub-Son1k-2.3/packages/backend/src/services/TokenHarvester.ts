// packages/backend/src/services/TokenHarvester.ts
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, Page } from 'puppeteer';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { TokenManager } from './tokenManager';

puppeteer.use(StealthPlugin());

interface LinkedSunoAccount {
    id: string;
    userId: string;
    email: string;
    encryptedPassword: string;
    sessionCookies: string | null;
    lastHarvest: Date | null;
    tokensCollected: number;
    isActive: boolean;
    tier: string;
}

interface HarvestResult {
    accountId: string;
    email: string;
    tokensCollected: number;
    success: boolean;
    error?: string;
}

export class TokenHarvester {
    private prisma: PrismaClient;
    private tokenManager: TokenManager;
    private activeBrowsers: Map<string, Browser> = new Map();
    private harvestInterval: number;
    private isRunning: boolean = false;
    private intervalId?: NodeJS.Timeout;

    constructor(tokenManager: TokenManager, harvestIntervalMinutes: number = 5) {
        this.prisma = new PrismaClient();
        this.tokenManager = tokenManager;
        this.harvestInterval = harvestIntervalMinutes * 60 * 1000;
    }

    async start() {
        if (this.isRunning) {
            console.log('⚠️  TokenHarvester ya está corriendo');
            return;
        }

        this.isRunning = true;
        console.log(`🚀 TokenHarvester iniciado (intervalo: ${this.harvestInterval / 60000} min)`);

        await this.runHarvestCycle();

        this.intervalId = setInterval(async () => {
            await this.runHarvestCycle();
        }, this.harvestInterval);
    }

    async stop() {
        if (!this.isRunning) return;

        console.log('🛑 Deteniendo TokenHarvester...');

        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        for (const [accountId, browser] of this.activeBrowsers) {
            try {
                await browser.close();
                console.log(`✅ Navegador cerrado para cuenta ${accountId}`);
            } catch (error) {
                console.error(`❌ Error cerrando navegador ${accountId}:`, error);
            }
        }

        this.activeBrowsers.clear();
        this.isRunning = false;
        await this.prisma.$disconnect();

        console.log('✅ TokenHarvester detenido');
    }

    private async runHarvestCycle() {
        console.log('\n🌾 === INICIANDO CICLO DE RECOLECCIÓN ===');
        const startTime = Date.now();

        try {
            const accounts = await this.getActiveAccounts();
            console.log(`📊 Cuentas activas: ${accounts.length}`);

            if (accounts.length === 0) {
                console.log('⚠️  No hay cuentas vinculadas para recolectar');
                return;
            }

            const batchSize = 5;
            const results: HarvestResult[] = [];

            for (let i = 0; i < accounts.length; i += batchSize) {
                const batch = accounts.slice(i, i + batchSize);
                const batchResults = await Promise.allSettled(
                    batch.map(account => this.harvestAccount(account))
                );

                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        results.push(result.value);
                    } else {
                        results.push({
                            accountId: batch[index].id,
                            email: batch[index].email,
                            tokensCollected: 0,
                            success: false,
                            error: result.reason?.message || 'Error desconocido'
                        });
                    }
                });
            }

            const successful = results.filter(r => r.success).length;
            const totalTokens = results.reduce((sum, r) => sum + r.tokensCollected, 0);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            console.log('\n📈 === RESUMEN DEL CICLO ===');
            console.log(`✅ Exitosas: ${successful}/${results.length}`);
            console.log(`🎫 Tokens recolectados: ${totalTokens}`);
            console.log(`⏱️  Duración: ${duration}s`);
            console.log('=========================\n');

        } catch (error) {
            console.error('❌ Error en ciclo de recolección:', error);
        }
    }

    private async getActiveAccounts(): Promise<LinkedSunoAccount[]> {
        return await this.prisma.linkedSunoAccount.findMany({
            where: { isActive: true }
        }) as any;
    }

    private async harvestAccount(account: LinkedSunoAccount): Promise<HarvestResult> {
        const startTime = Date.now();
        console.log(`\n🔄 [${account.email}] Iniciando recolección...`);

        try {
            let browser = this.activeBrowsers.get(account.id);

            if (!browser || !browser.isConnected()) {
                console.log(`🌐 [${account.email}] Creando nueva sesión...`);
                browser = await this.createSession(account);
                this.activeBrowsers.set(account.id, browser);
            }

            const page = await browser.newPage();

            const capturedTokens = new Set<string>();

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const headers = request.headers();
                const authHeader = headers['authorization'];

                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.replace('Bearer ', '');
                    capturedTokens.add(token);
                }

                request.continue();
            });

            console.log(`📍 [${account.email}] Navegando a dashboard...`);
            await page.goto('https://suno.com/dashboard', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            if (page.url().includes('login') || page.url().includes('sign-in')) {
                console.log(`🔐 [${account.email}] Sesión expirada, re-autenticando...`);
                await this.performLogin(page, account);
            }

            console.log(`🎯 [${account.email}] Capturando tokens...`);
            await page.evaluate(() => {
                return Promise.all([
                    fetch('/api/user/credits'),
                    fetch('/api/user/profile'),
                    fetch('/api/feed')
                ]);
            });

            await new Promise(resolve => setTimeout(resolve, 3000));

            const tokensArray = Array.from(capturedTokens);
            if (tokensArray.length > 0) {
                await this.saveToPool(tokensArray, account);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ [${account.email}] ${tokensArray.length} tokens en ${duration}s`);

            await page.close();

            return {
                accountId: account.id,
                email: account.email,
                tokensCollected: tokensArray.length,
                success: true
            };

        } catch (error: any) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.error(`❌ [${account.email}] Error en ${duration}s:`, error.message);

            await this.markAccountIssue(account.id, error.message);

            return {
                accountId: account.id,
                email: account.email,
                tokensCollected: 0,
                success: false,
                error: error.message
            };
        }
    }

    private async createSession(account: LinkedSunoAccount): Promise<Browser> {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        });

        if (account.sessionCookies) {
            try {
                const cookies = JSON.parse(account.sessionCookies);
                await page.setCookie(...cookies);
                console.log(`🍪 [${account.email}] Cookies restauradas`);
            } catch (error) {
                console.log(`⚠️  [${account.email}] Error restaurando cookies, haremos login`);
                await this.performLogin(page, account);
            }
        } else {
            await this.performLogin(page, account);
        }

        await page.close();
        return browser;
    }

    private async performLogin(page: Page, account: LinkedSunoAccount) {
        console.log(`🔐 [${account.email}] Iniciando login...`);

        await page.goto('https://suno.com/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const decryptedPassword = this.decrypt(account.encryptedPassword);

        await page.waitForSelector('input[type="email"]', { timeout: 10000 });

        await page.type('input[type="email"]', account.email, { delay: 100 });
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.type('input[type="password"]', decryptedPassword, { delay: 100 });
        await new Promise(resolve => setTimeout(resolve, 500));

        await page.click('button[type="submit"]');
        // Wait for navigation - wait for URL to change or timeout
        const startUrl = page.url();
        await Promise.race([
          page.waitForFunction(
            (url) => page.url() !== url,
            { timeout: 30000 },
            startUrl
          ),
          new Promise(resolve => setTimeout(resolve, 5000)) // Max 5s wait
        ]);

        const cookies = await page.cookies();
        await this.prisma.linkedSunoAccount.update({
            where: { id: account.id },
            data: { sessionCookies: JSON.stringify(cookies) }
        });

        console.log(`✅ [${account.email}] Login exitoso, cookies guardadas`);
    }

    private async saveToPool(tokens: string[], account: LinkedSunoAccount) {
        const user = await this.prisma.user.findUnique({
            where: { id: account.userId }
        });

        const tier = (user?.tier || 'FREE') as 'FREE' | 'PREMIUM' | 'ENTERPRISE';
        let savedCount = 0;

        for (const token of tokens) {
            try {
                // Use TokenManager to properly add token with encryption
                await this.tokenManager.addToken(
                    token,
                    account.userId,
                    account.email,
                    tier,
                    {
                        source: 'auto_harvest',
                        harvestedAt: new Date().toISOString(),
                        accountTier: user?.tier,
                        accountEmail: account.email,
                        linkedAccountId: account.id
                    }
                );
                savedCount++;
            } catch (error: any) {
                // Skip if token already exists
                if (error.message?.includes('already exists') || error.code === 'P2002') {
                    continue;
                }
                console.error(`Error guardando token para ${account.email}:`, error.message);
            }
        }

        if (savedCount > 0) {
            await this.prisma.linkedSunoAccount.update({
                where: { id: account.id },
                data: {
                    lastHarvest: new Date(),
                    tokensCollected: { increment: savedCount }
                }
            });
            console.log(`✅ [${account.email}] ${savedCount} token(s) guardado(s) en el pool`);
        }
    }


    private decrypt(encrypted: string): string {
        try {
            const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
            const [ivHex, encryptedHex, authTagHex] = encrypted.split(':');

            const iv = Buffer.from(ivHex, 'hex');
            const encryptedText = Buffer.from(encryptedHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');

            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedText, undefined, 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('❌ Error decriptando password:', error);
            throw new Error('Failed to decrypt password');
        }
    }

    private async markAccountIssue(accountId: string, error: string) {
        await this.prisma.linkedSunoAccount.update({
            where: { id: accountId },
            data: {
                metadata: JSON.stringify({
                    lastError: error,
                    errorAt: new Date().toISOString()
                })
            }
        });
    }

    async getStats() {
        const accounts = await this.prisma.linkedSunoAccount.findMany({
            where: { isActive: true }
        });

        // Contar tokens recolectados automáticamente (buscando en metadata)
        const allTokens = await this.prisma.token.findMany({
            where: { isActive: true }
        });

        const autoHarvestTokens = allTokens.filter(t => {
            try {
                const metadata = typeof t.metadata === 'string' 
                    ? JSON.parse(t.metadata) 
                    : t.metadata || {};
                return metadata.source === 'auto_harvest';
            } catch {
                return false;
            }
        });

        const totalTokens = autoHarvestTokens.length;

        // Agrupar por tier manualmente
        const tokensByTier: Record<string, number> = {};
        autoHarvestTokens.forEach(token => {
            const tier = token.tier || 'FREE';
            tokensByTier[tier] = (tokensByTier[tier] || 0) + 1;
        });

        return {
            isRunning: this.isRunning,
            harvestIntervalMinutes: this.harvestInterval / 60000,
            activeAccounts: accounts.length,
            activeBrowsers: this.activeBrowsers.size,
            totalTokensHarvested: totalTokens,
            tokensByTier,
            accounts: accounts.map(acc => ({
                id: acc.id,
                email: acc.email,
                tier: acc.tier,
                tokensCollected: acc.tokensCollected,
                lastHarvest: acc.lastHarvest
            }))
        };
    }
}

let harvesterInstance: TokenHarvester | null = null;

export function getHarvester(tokenManager: TokenManager, intervalMinutes: number = 5): TokenHarvester {
    if (!harvesterInstance) {
        harvesterInstance = new TokenHarvester(tokenManager, intervalMinutes);
    }
    return harvesterInstance;
}
