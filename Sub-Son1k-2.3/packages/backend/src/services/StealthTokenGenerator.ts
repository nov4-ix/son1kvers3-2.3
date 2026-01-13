import puppeteer, { Browser, Page } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

puppeteer.use(StealthPlugin());

/**
 * Generador COMPLETAMENTE AUTOMÁTICO de tokens
 * El usuario NUNCA sabe que Suno existe
 * Todo es transparente y automático
 */
export class StealthTokenGenerator {
    private prisma: PrismaClient;
    private userAgents: string[];
    private tempEmailProviders: string[];
    private activeBrowsers: Map<string, Browser> = new Map();
    private generationInterval: number;
    private harvestInterval: number;

    constructor() {
        this.prisma = new PrismaClient();

        // User agents realistas
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0'
        ];

        // Proveedores de email temporal
        this.tempEmailProviders = [
            'tempmail.com',
            'guerrillamail.com',
            'temp-mail.org'
        ];

        // Generar 5 cuentas nuevas cada 24 horas
        this.generationInterval = 24 * 60 * 60 * 1000;

        // Harvestear cada 5 minutos
        this.harvestInterval = 5 * 60 * 1000;
    }

    /**
     * Inicia el sistema completo
     */
    async start() {
        console.log('🕵️ Iniciando Sistema Stealth de Tokens...');

        // 1. Generar pool inicial si está vacío
        const tokenCount = await this.prisma.token.count({
            where: { source: 'stealth_auto', isActive: true }
        });

        if (tokenCount < 10) {
            console.log('📦 Pool vacío, generando 10 cuentas iniciales...');
            await this.generateInitialPool(10);
        }

        // 2. Iniciar ciclo de harvesting
        this.startHarvestCycle();

        // 3. Iniciar ciclo de generación de nuevas cuentas
        this.startGenerationCycle();

        console.log('✅ Sistema Stealth activo y operando en segundo plano');
    }

    /**
     * Genera pool inicial de cuentas
     */
    private async generateInitialPool(count: number) {
        const results = [];

        for (let i = 0; i < count; i++) {
            try {
                console.log(`[${i + 1}/${count}] Generando cuenta stealth...`);
                const result = await this.generateStealthAccount();
                results.push(result);

                // Delay entre generaciones (3-7 min)
                const delay = (3 + Math.random() * 4) * 60 * 1000;
                await this.sleep(delay);

            } catch (error) {
                console.error(`Error generando cuenta ${i + 1}:`, error);
            }
        }

        console.log(`✅ Pool inicial creado: ${results.filter(r => r).length}/${count} exitosas`);
    }

    /**
     * Genera una cuenta Suno completamente automática
     */
    private async generateStealthAccount(): Promise<boolean> {
        let browser: Browser | null = null;

        try {
            // 1. Generar credenciales
            const email = await this.generateTempEmail();
            const password = this.generateSecurePassword();

            console.log(`📧 Email generado: ${email}`);

            // 2. Abrir navegador en modo stealth
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-dev-shm-usage'
                ]
            });

            const page = await browser.newPage();

            // 3. Configurar como humano
            await this.setupHumanBehavior(page);

            // 4. Ir a Suno signup
            console.log('🌐 Navegando a Suno...');
            await page.goto('https://suno.com/signup', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 5. Comportamiento humano (scroll, movimientos)
            await this.simulateHumanBehavior(page);

            // 6. Rellenar formulario
            console.log('✍️ Rellenando formulario...');
            await page.waitForSelector('input[type="email"]', { timeout: 10000 });

            await this.humanType(page, 'input[type="email"]', email);
            await this.sleep(500 + Math.random() * 1000);

            await this.humanType(page, 'input[type="password"]', password);
            await this.sleep(300 + Math.random() * 700);

            // 7. Submit
            await page.click('button[type="submit"]');
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // 8. Verificar éxito (redirect a dashboard)
            const isSuccess = page.url().includes('dashboard') ||
                page.url().includes('home') ||
                !page.url().includes('signup');

            if (!isSuccess) {
                throw new Error('Signup failed - no dashboard redirect');
            }

            console.log('✅ Cuenta creada exitosamente');

            // 9. Capturar tokens iniciales
            const tokens = await this.captureTokens(page);

            // 10. Guardar cookies de sesión
            const cookies = await page.cookies();

            // 11. Guardar en DB
            await this.saveStealthAccount({
                email,
                password, // Encriptado
                cookies: JSON.stringify(cookies),
                tokens
            });

            // 12. Mantener navegador abierto para harvesting
            const accountId = `stealth_${Date.now()}`;
            this.activeBrowsers.set(accountId, browser);

            console.log(`💾 Cuenta guardada (ID: ${accountId})`);

            return true;

        } catch (error: any) {
            console.error('❌ Error en generación stealth:', error.message);
            if (browser) await browser.close();
            return false;
        }
    }

    /**
     * Genera email temporal
     */
    private async generateTempEmail(): Promise<string> {
        // Opción 1: Usar API de email temporal
        try {
            const response = await fetch('https://api.mail.tm/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: `son1k_${Date.now()}_${this.randomString(8)}`,
                    password: this.generateSecurePassword()
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.address;
            }
        } catch (error) {
            console.warn('Temp email API failed, using fallback');
        }

        // Opción 2: Formato aleatorio (si tienes dominio propio con catch-all)
        return `neural_${Date.now()}_${this.randomString(8)}@son1k-engine.com`;
    }

    /**
     * Genera password seguro
     */
    private generateSecurePassword(): string {
        return crypto.randomBytes(16).toString('base64').substring(0, 20);
    }

    /**
     * String aleatorio
     */
    private randomString(length: number): string {
        return crypto.randomBytes(length)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, length);
    }

    /**
     * Configura page para parecer humano
     */
    private async setupHumanBehavior(page: Page) {
        // User agent aleatorio
        const ua = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        await page.setUserAgent(ua);

        // Viewport realista
        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 1080 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1
        });

        // Timezone y locale
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });
    }

    /**
     * Simula comportamiento humano
     */
    private async simulateHumanBehavior(page: Page) {
        // Scroll aleatorio
        await page.evaluate(() => {
            window.scrollBy(0, Math.random() * 500);
        });
        await this.sleep(1000 + Math.random() * 2000);

        // Mover mouse
        await page.mouse.move(
            Math.random() * 1000,
            Math.random() * 800
        );
        await this.sleep(500 + Math.random() * 1000);
    }

    /**
     * Escribe como humano (con delays)
     */
    private async humanType(page: Page, selector: string, text: string) {
        await page.click(selector);
        await this.sleep(100 + Math.random() * 200);

        for (const char of text) {
            await page.keyboard.type(char, {
                delay: 50 + Math.random() * 150
            });
        }
    }

    /**
     * Captura tokens de la sesión
     */
    private async captureTokens(page: Page): Promise<string[]> {
        const tokens = new Set<string>();

        // Interceptar requests
        await page.setRequestInterception(true);

        page.on('request', (request) => {
            const headers = request.headers();
            const auth = headers['authorization'];

            if (auth && auth.startsWith('Bearer ')) {
                tokens.add(auth.replace('Bearer ', ''));
            }

            request.continue();
        });

        // Trigger requests
        await page.evaluate(() => {
            Promise.all([
                fetch('/api/user/credits'),
                fetch('/api/user/profile')
            ]);
        });

        await this.sleep(3000);

        return Array.from(tokens);
    }

    /**
     * Guarda cuenta stealth en DB
     */
    private async saveStealthAccount(data: {
        email: string;
        password: string;
        cookies: string;
        tokens: string[];
    }) {
        const accountId = `stealth_${Date.now()}_${this.randomString(6)}`;
        const encryptedPassword = this.encrypt(data.password);

        // Guardar cuenta
        await this.prisma.stealthAccount.create({
            data: {
                id: accountId,
                email: data.email,
                encryptedPassword,
                sessionCookies: data.cookies,
                isActive: true,
                lastHarvest: new Date(),
                tokensCollected: data.tokens.length
            }
        });

        // Guardar tokens
        for (const token of data.tokens) {
            await this.prisma.token.create({
                data: {
                    hash: `stealth_${Date.now()}_${this.randomString(8)}`,
                    encryptedToken: Buffer.from(token).toString('base64'),
                    email: data.email,
                    source: 'stealth_auto',
                    tier: 'SYSTEM',
                    poolPriority: 2, // Prioridad media
                    isActive: true,
                    isValid: true,
                    metadata: JSON.stringify({
                        accountId,
                        generatedAt: new Date().toISOString(),
                        method: 'auto_stealth'
                    })
                }
            });
        }
    }

    /**
     * Ciclo de harvesting (cada 5 min)
     */
    private startHarvestCycle() {
        setInterval(async () => {
            try {
                console.log('🌾 Harvesting de cuentas stealth...');

                const accounts = await this.prisma.stealthAccount.findMany({
                    where: { isActive: true }
                });

                for (const account of accounts) {
                    await this.harvestAccount(account);
                }
            } catch (error) {
                console.error('Error en harvest cycle:', error);
            }
        }, this.harvestInterval);
    }

    /**
     * Harvest de una cuenta
     */
    private async harvestAccount(account: any) {
        try {
            let browser = this.activeBrowsers.get(account.id);

            if (!browser || !browser.isConnected()) {
                // Recrear sesión
                browser = await this.restoreSession(account);
                this.activeBrowsers.set(account.id, browser);
            }

            const page = await browser.newPage();

            // Capturar tokens
            const tokens = await this.captureTokens(page);

            if (tokens.length > 0) {
                // Guardar en pool
                for (const token of tokens) {
                    await this.prisma.token.create({
                        data: {
                            hash: `harvest_${Date.now()}_${this.randomString(8)}`,
                            encryptedToken: Buffer.from(token).toString('base64'),
                            source: 'stealth_auto',
                            tier: 'SYSTEM',
                            poolPriority: 2,
                            isActive: true,
                            isValid: true
                        }
                    });
                }

                console.log(`✅ [${account.email}] ${tokens.length} tokens harvested`);
            }

            await page.close();

        } catch (error) {
            console.error(`Error harvesting ${account.email}:`, error);
        }
    }

    /**
     * Restaura sesión desde cookies
     */
    private async restoreSession(account: any): Promise<Browser> {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Restaurar cookies
        const cookies = JSON.parse(account.sessionCookies);
        await page.setCookie(...cookies);

        return browser;
    }

    /**
     * Ciclo de generación de nuevas cuentas
     */
    private startGenerationCycle() {
        setInterval(async () => {
            try {
                console.log('🔄 Generando nuevas cuentas stealth...');

                // Generar 3-5 cuentas nuevas
                const count = 3 + Math.floor(Math.random() * 3);

                for (let i = 0; i < count; i++) {
                    await this.generateStealthAccount();

                    // Delay entre cuentas
                    await this.sleep((5 + Math.random() * 10) * 60 * 1000);
                }

            } catch (error) {
                console.error('Error en generation cycle:', error);
            }
        }, this.generationInterval);
    }

    /**
     * Encripta texto
     */
    private encrypt(text: string): string {
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Stats del sistema
     */
    async getStats() {
        const accounts = await this.prisma.stealthAccount.count({
            where: { isActive: true }
        });

        const tokens = await this.prisma.token.count({
            where: { source: 'stealth_auto', isActive: true }
        });

        return {
            totalStealthAccounts: accounts,
            tokensInPool: tokens,
            activeBrowsers: this.activeBrowsers.size,
            systemStatus: 'operational'
        };
    }
}

// Singleton
let stealthInstance: StealthTokenGenerator | null = null;

export function getStealthGenerator(): StealthTokenGenerator {
    if (!stealthInstance) {
        stealthInstance = new StealthTokenGenerator();
    }
    return stealthInstance;
}
