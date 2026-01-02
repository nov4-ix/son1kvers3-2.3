// ═══════════════════════════════════════════════════════
// 🍪 SCRIPT PARA EXTRAER COOKIES DE SUNO
// ═══════════════════════════════════════════════════════
// 
// INSTRUCCIONES:
// 1. Ve a: https://suno.com (asegúrate de estar logueado)
// 2. Abre DevTools (F12)
// 3. Ve a la pestaña "Console"
// 4. Pega este script completo
// 5. Presiona Enter
// 6. Las cookies se copiarán al portapapeles automáticamente
//
// ═══════════════════════════════════════════════════════

(function extractSunoCookies() {
    console.log('🍪 Extrayendo cookies de Suno...');

    // Obtener todas las cookies
    const cookies = document.cookie;

    if (!cookies) {
        console.error('❌ No se encontraron cookies. ¿Estás logueado en suno.com?');
        return;
    }

    console.log('✅ Cookies encontradas!');
    console.log('📋 Copiando al portapapeles...');

    // Copiar al portapapeles
    navigator.clipboard.writeText(cookies).then(() => {
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ ¡COOKIES COPIADAS AL PORTAPAPELES!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('📝 Próximo paso:');
        console.log('1. Ve a Railway → Tu proyecto backend');
        console.log('2. Variables → SUNO_COOKIES');
        console.log('3. Pega el valor (Ctrl+V)');
        console.log('');
        console.log('💡 Tip: Si tienes múltiples cuentas, repite este proceso');
        console.log('   para cada cuenta y separa las cookies con comas');
        console.log('');
        console.log('Ejemplo con 3 cuentas:');
        console.log('cookie1,cookie2,cookie3');
        console.log('');
        console.log('═══════════════════════════════════════════════════════');

        // Mostrar preview de las cookies (truncado para seguridad)
        const preview = cookies.substring(0, 100) + '...';
        console.log('');
        console.log('Preview (primeros 100 caracteres):');
        console.log(preview);

    }).catch(err => {
        console.error('❌ Error al copiar:', err);
        console.log('');
        console.log('🔧 Copia manualmente desde aquí:');
        console.log('═══════════════════════════════════════════════════════');
        console.log(cookies);
        console.log('═══════════════════════════════════════════════════════');
    });
})();
