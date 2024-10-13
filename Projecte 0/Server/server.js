const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 27158;

// Habilitar CORS
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Ruta para obtener todas las preguntas (Read)
app.get('/preguntes', (req, res) => {
    fs.readFile('preguntas.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo');
        }
        res.send(JSON.parse(data));
    });
});

// Ruta para crear una nueva pregunta (Create)
app.post('/preguntes', (req, res) => {
    const nuevaPregunta = req.body; // La nueva pregunta llega en el cuerpo de la solicitud

    // Leer el archivo JSON de preguntas
    fs.readFile('preguntas.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo:', err);
            return res.status(500).send('Error leyendo el archivo');
        }

        let preguntas;
        try {
            preguntas = JSON.parse(data); // Parsear el archivo JSON
        } catch (parseError) {
            console.error('Error parseando el JSON:', parseError);
            return res.status(500).send('Error en el formato del archivo JSON');
        }

        // Verificar que el array 'preguntes' exista
        if (preguntas && preguntas.preguntes && Array.isArray(preguntas.preguntes)) {
            // Generar un nuevo ID de manera incremental
            const nuevoId = preguntas.preguntes.length > 0
                ? preguntas.preguntes[preguntas.preguntes.length - 1].id + 1
                : 1; // Si el array está vacío, iniciar el ID en 1
            nuevaPregunta.id = nuevoId; // Asignar el nuevo ID a la nueva pregunta

            // Agregar la nueva pregunta al array de preguntas
            preguntas.preguntes.push(nuevaPregunta);

            // Guardar el archivo actualizado
            fs.writeFile('preguntas.json', JSON.stringify(preguntas, null, 2), (err) => {
                if (err) {
                    console.error('Error escribiendo el archivo:', err);
                    return res.status(500).send('Error guardando la nueva pregunta');
                }

                // Responder con éxito
                res.status(201).json({ message: 'Pregunta creada exitosamente', nuevaPregunta });
            });
        } else {
            console.error("El formato de preguntas o preguntes no es correcto.");
            return res.status(500).send('Error en el formato de las preguntas');
        }
    });
});



// Ruta para actualizar una pregunta específica (Update)
app.put('/preguntes/:id', (req, res) => {
    const id = parseInt(req.params.id); // Convertir a número
    const preguntaActualizada = req.body;

    fs.readFile('preguntas.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo');
        }

        const preguntas = JSON.parse(data);

        const preguntaIndex = preguntas.preguntes.findIndex(p => p.id === id); // Buscar la pregunta por ID
        if (preguntaIndex === -1) {
            return res.status(404).send('Pregunta no encontrada');
        }

        preguntas.preguntes[preguntaIndex] = preguntaActualizada; // Actualizar la pregunta

        fs.writeFile('preguntas.json', JSON.stringify(preguntas, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error escribiendo el archivo');
            }
            res.send('Pregunta actualizada correctamente');
        });
    });
});

// Ruta para eliminar una pregunta específica (Delete)
app.delete('/preguntes/:id', (req, res) => {
    const id = parseInt(req.params.id); // Convertir a número
  
    fs.readFile('preguntas.json', 'utf-8', (err, data) => {
      if (err) {
        return res.status(500).send('Error leyendo el archivo');
      }
  
      const preguntas = JSON.parse(data);
      const preguntaIndex = preguntas.preguntes.findIndex(p => p.id === id); // Buscar la pregunta por ID
  
      if (preguntaIndex === -1) {
        return res.status(404).send('Pregunta no encontrada');
      }
  
      preguntas.preguntes.splice(preguntaIndex, 1); // Eliminar la pregunta
  
      fs.writeFile('preguntas.json', JSON.stringify(preguntas, null, 2), (err) => {
        if (err) {
          return res.status(500).send('Error escribiendo el archivo');
        }
        res.send('Pregunta eliminada correctamente');
      });
    });
  });
  

app.post('/getPregunta', (req, res) => {
    const { num } = req.body;  // Número de preguntas a solicitar

    fs.readFile('preguntas.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo');
        }

        const preguntas = JSON.parse(data).preguntes;
        const preguntasSeleccionadas = preguntas.slice(0, num); // Seleccionar la cantidad solicitada de preguntas

        res.json({
            sessionId: "session_" + Date.now(),
            preguntes: preguntasSeleccionadas
        });
    });
});

// Ruta para recibir las respuestas del usuario (/finalista)
// Ruta para recibir las respuestas del usuario (/finalista)
app.post('/finalista', (req, res) => {
    const { sessionId, userAnswers } = req.body;

    // Leer el archivo JSON para obtener las preguntas
    fs.readFile('preguntas.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error leyendo el archivo');
        }

        const preguntas = JSON.parse(data).preguntes;
        let correctAnswersCount = 0;

        // Comparar respuestas del usuario con las respuestas correctas
        userAnswers.forEach((respuesta, index) => {
            const pregunta = preguntas[index];
            if (pregunta && pregunta.resposta_correcta === respuesta) {
                correctAnswersCount++;
            }
        });

        // Crear el objeto de resultados
        const resultado = {
            sessionId: sessionId,
            correctAnswers: correctAnswersCount,
            totalQuestions: userAnswers.length,
            userAnswers: userAnswers
        };

        // Guardar el resultado en un archivo JSON único
        const fileName = `resultado_${sessionId}.json`;
        fs.writeFile(fileName, JSON.stringify(resultado, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error guardando el archivo de respuestas');
            }

            // Enviar la respuesta de éxito al cliente
            res.json({
                message: 'Respuestas guardadas correctamente',
                success: correctAnswersCount,
                total: userAnswers.length
            });
        });
    });
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
