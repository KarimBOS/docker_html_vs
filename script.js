const { exec } = require('child_process');
const fs = require('fs');

// Ejecuta Docker Bench Security
exec('docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --security-opt seccomp=unconfined docker/docker-bench-security', (error, stdout, stderr) => {
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

    // Escribir el informe en un archivo HTML
    fs.writeFile('informe.html', informeHTML, (err) => {
        if (err) {
            console.error('Error al guardar el informe:', err);
            return;
        }
        console.log('Informe guardado en informe.html');
    });
});
