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
            <style>
                body {
                    background-color: rgb(43, 43, 83);
                    color: white;
                    margin: 0;
                    padding: 0;
                    font-family: Arial, Helvetica, sans-serif;
                }
                h1 {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    margin-left: 10px;
                }
                #informe {
                    color: white;
                    margin: 20px;
                }
                .botones {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                }
                .botones button {
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    margin: 5px;
                    cursor: pointer;
                    border-radius: 5px;
                }
                .botones button:hover {
                    background-color: #45a049;
                }
            </style>
        </head>
        <body>
            <div class="botones">
                <button id="descargar-txt">Descargar TXT</button>
                <button id="descargar-json">Descargar JSON</button>
            </div>
            <h1>Informe de Seguridad Docker</h1>
            <div id="informe">
                <pre>${stdout}</pre>
            </div>
            <script>
                // Función para descargar contenido como archivo
                function descargarArchivo(contenido, nombreArchivo, tipo) {
                    const blob = new Blob([contenido], { type: tipo });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = nombreArchivo;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

                // Obtener el contenido del informe
                function obtenerContenidoInforme() {
                    return document.getElementById('informe').innerText;
                }

                // Descargar como TXT
                document.getElementById('descargar-txt').addEventListener('click', () => {
                    const contenido = obtenerContenidoInforme();
                    descargarArchivo(contenido, 'informe.txt', 'text/plain');
                });

                // Descargar como JSON
                document.getElementById('descargar-json').addEventListener('click', () => {
                    const contenido = obtenerContenidoInforme();
                    const json = JSON.stringify({ informe: contenido }, null, 2);
                    descargarArchivo(json, 'informe.json', 'application/json');
                });
            </script>
        </body>
        </html>
        `;

        // Guarda el informe en un archivo HTML
        fs.writeFileSync('informe.html', informeHTML, 'utf8');
        console.log('Informe guardado como informe.html');
    });
});
