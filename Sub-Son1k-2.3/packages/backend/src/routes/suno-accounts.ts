// packages/backend/src/routes/suno-accounts.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { getHarvester } from '../services/TokenHarvester';

puppeteer.use(StealthPlugin());

const router = Router();
const prisma = new PrismaClient();

function encrypt(text: string): string {
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
    if (key.length !== 32) {
        throw new Error('ENCRYPTION_KEY debe ser 32 bytes (64 caracteres hex)');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

async function verifyCredentials(email: string, password: string): Promise<boolean> {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://suno.com/login', { waitUntil: 'networkidle2', timeout: 30000 });

        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', email);
        await page.type('input[type="password"]', password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ timeout: 15000 });

        const isValid = page.url().includes('dashboard') || page.url().includes('home');

        await browser.close();
        return isValid;

    } catch (error) {
        console.error('Error verificando credenciales:', error);
        if (browser) await browser.close();
        return false;
    }
}

router.post('/link', async (req, res) => {
    try {
        const { userId, sunoEmail, sunoPassword } = req.body;

        if (!userId || !sunoEmail || !sunoPassword) {
            return res.status(400).json({
                error: 'Faltan campos requeridos: userId, sunoEmail, sunoPassword'
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const linkedCount = await prisma.linkedSunoAccount.count({
            where: { userId, isActive: true }
        });

        const maxAccounts = {
            FREE: 1,
            CREATOR: 2,
            PRO: 3,
            STUDIO: 5
        }[user.tier] || 1;

        if (linkedCount >= maxAccounts) {
            return res.status(400).json({
                error: `Límite alcanzado. Tu tier ${user.tier} permite máx ${maxAccounts} cuenta(s)`
            });
        }

        const existing = await prisma.linkedSunoAccount.findFirst({
            where: { email: sunoEmail, isActive: true }
        });

        if (existing) {
            return res.status(400).json({
                error: 'Esta cuenta ya está vinculada a un usuario'
            });
        }

        console.log(`🔐 Verificando credenciales de ${sunoEmail}...`);
        const isValid = await verifyCredentials(sunoEmail, sunoPassword);

        if (!isValid) {
            return res.status(401).json({
                error: 'Credenciales inválidas de Suno'
            });
        }

        const encryptedPassword = encrypt(sunoPassword);

        const linkedAccount = await prisma.linkedSunoAccount.create({
            data: {
                userId,
                email: sunoEmail,
                encryptedPassword,
                isActive: true,
                tier: user.tier
            }
        });

        console.log(`✅ Cuenta ${sunoEmail} vinculada a usuario ${userId}`);

        res.json({
            success: true,
            message: 'Cuenta vinculada exitosamente. Comenzaremos a recolectar tokens automáticamente.',
            account: {
                id: linkedAccount.id,
                email: linkedAccount.email,
                tier: linkedAccount.tier
            }
        });

    } catch (error: any) {
        console.error('❌ Error vinculando cuenta:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/linked/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const accounts = await prisma.linkedSunoAccount.findMany({
            where: { userId },
            select: {
                id: true,
                email: true,
                isActive: true,
                tier: true,
                lastHarvest: true,
                tokensCollected: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            accounts
        });

    } catch (error: any) {
        console.error('❌ Error obteniendo cuentas:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/link/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;

        await prisma.linkedSunoAccount.update({
            where: { id: accountId },
            data: { isActive: false }
        });

        console.log(`🗑️  Cuenta ${accountId} desvinculada`);

        res.json({
            success: true,
            message: 'Cuenta desvinculada exitosamente'
        });

    } catch (error: any) {
        console.error('❌ Error desvinculando cuenta:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/harvester/stats', async (req, res) => {
    try {
        const harvester = getHarvester();
        const stats = await harvester.getStats();

        res.json({
            success: true,
            stats
        });

    } catch (error: any) {
        console.error('❌ Error obteniendo stats:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/harvester/start', async (req, res) => {
    try {
        const { intervalMinutes = 5 } = req.body;

        const harvester = getHarvester(intervalMinutes);
        await harvester.start();

        res.json({
            success: true,
            message: `Harvester iniciado (intervalo: ${intervalMinutes} min)`
        });

    } catch (error: any) {
        console.error('❌ Error iniciando harvester:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/harvester/stop', async (req, res) => {
    try {
        const harvester = getHarvester();
        await harvester.stop();

        res.json({
            success: true,
            message: 'Harvester detenido'
        });

    } catch (error: any) {
        console.error('❌ Error deteniendo harvester:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
