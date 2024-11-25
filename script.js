const { exec } = require('child_process');
const fs = require('fs');

// Obtener el nombre de la última imagen construida usando PowerShell
exec('powershell -Command "docker images --format \\"{{.Repository}}:{{.Tag}}\\" | Select-Object -First 1"', (error, imageName, stderr) => {
    if (error) {
        console.error(`Error obteniendo la última imagen: ${error}`);
        return;
    }

    if (!imageName.trim()) {
        console.error('No se encontró ninguna imagen construida.');
        return;
    }

    console.log(`Usando la imagen: ${imageName.trim()}`);

    // Ejecutar Docker Bench Security usando la imagen obtenida
    exec(`docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --security-opt seccomp=unconfined docker/docker-bench-security ${imageName.trim()}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando Docker Bench: ${error}`);
            return;
        }

        // Crear el contenido HTML que se insertará en el archivo
        const informeHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Informe de Seguridad Docker</title>
        </head>
        <body>
            <h1>Informe de Seguridad Docker</h1>
            <pre>${stdout}</pre>
        </body>
        </html>
        `;

        // Guarda el informe en un archivo HTML
        fs.writeFileSync('informe.html', informeHTML, 'utf8');
        console.log('Informe guardado como informe.html');
    });
});
