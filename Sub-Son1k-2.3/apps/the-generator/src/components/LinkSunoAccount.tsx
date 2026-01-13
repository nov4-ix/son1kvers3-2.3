// apps/the-generator/src/components/LinkSunoAccount.tsx
import React, { useState, useEffect } from 'react';

interface LinkedAccount {
    id: string;
    email: string;
    isActive: boolean;
    tier: string;
    lastHarvest: string | null;
    tokensCollected: number;
    createdAt: string;
}

interface LinkSunoAccountProps {
    userId: string;
    userTier: string;
}

export function LinkSunoAccount({ userId, userTier }: LinkSunoAccountProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [showForm, setShowForm] = useState(false);

    const maxAccounts = {
        FREE: 1,
        CREATOR: 2,
        PRO: 3,
        STUDIO: 5
    }[userTier] || 1;

    const canAddMore = linkedAccounts.filter(a => a.isActive).length < maxAccounts;

    useEffect(() => {
        loadLinkedAccounts();
    }, [userId]);

    const loadLinkedAccounts = async () => {
        try {
            const response = await fetch(`/api/suno-accounts/linked/${userId}`);
            const data = await response.json();

            if (data.success) {
                setLinkedAccounts(data.accounts);
            }
        } catch (error) {
            console.error('Error cargando cuentas:', error);
        }
    };

    const handleLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/suno-accounts/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, sunoEmail: email, sunoPassword: password })
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Cuenta vinculada! Recolectaremos tokens automáticamente.');
                setEmail('');
                setPassword('');
                setShowForm(false);
                await loadLinkedAccounts();
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            alert('Error de conexión');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async (accountId: string) => {
        if (!confirm('¿Desvincular esta cuenta?')) return;

        try {
            const response = await fetch(`/api/suno-accounts/link/${accountId}`, { method: 'DELETE' });
            const data = await response.json();

            if (data.success) {
                alert('✅ Cuenta desvinculada');
                await loadLinkedAccounts();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">🔗 Cuentas Suno</h3>
                <span className="text-sm text-gray-400">
                    {linkedAccounts.filter(a => a.isActive).length}/{maxAccounts}
                </span>
            </div>

            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-400 mb-2">💡 Beneficios</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>✅ Tokens automáticos cada 5 min</li>
                    <li>✅ {maxAccounts} cuenta(s) - tier {userTier}</li>
                    <li>✅ Sin límites de generación</li>
                </ul>
            </div>

            {linkedAccounts.map(account => (
                <div key={account.id} className={`border rounded-lg p-4 mb-3 ${account.isActive ? 'border-green-700 bg-green-900/10' : 'border-gray-700'
                    }`}>
                    <div className="flex justify-between">
                        <div>
                            <span className="font-mono text-sm">{account.email}</span>
                            <div className="text-xs text-gray-400 mt-1">
                                Tokens: {account.tokensCollected} | Última: {formatDate(account.lastHarvest)}
                            </div>
                        </div>
                        {account.isActive && (
                            <button onClick={() => handleUnlink(account.id)}
                                className="text-red-400 text-sm px-3 py-1 border border-red-700 rounded">
                                Desvincular
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {canAddMore && !showForm && (
                <button onClick={() => setShowForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg">
                    + Vincular cuenta
                </button>
            )}

            {canAddMore && showForm && (
                <form onSubmit={handleLink} className="space-y-3">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email de Suno" required
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg" />

                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña" required
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg" />

                    <div className="flex gap-2">
                        <button type="submit" disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-lg">
                            {loading ? 'Verificando...' : 'Vincular'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)}
                            className="px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                            Cancelar
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">🔒 Encriptado con AES-256</p>
                </form>
            )}
        </div>
    );
}
