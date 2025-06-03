import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { google } from 'googleapis';

const app = express();
const port = process.env.PORT || 3000;

// 🔓 Permitir CORS desde cualquier origen (solo en desarrollo)
app.use(cors());
app.use(bodyParser.json());

// 📜 Cargar credenciales desde variable de entorno
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// 🔑 Configurar autenticación con Google
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

// 🧠 ID de la hoja de cálculo (puedes cambiarlo si hace falta)
const spreadsheetId = '1JifUqUTquqiHOkFTqu9oDjH6c0oSnuW3-Lex2kYcXoA'; // <- O el tuyo

// ✅ Ruta de actualización
app.post('/actualizar', async (req, res) => {
  try {
    const { x, y, estado } = req.body;
    const rango = 'Hoja1!A2:D'; // Ajusta si tu hoja tiene otro nombre

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rango,
    });

    const filas = response.data.values || [];

    const index = filas.findIndex(fila =>
      parseInt(fila[1]) === x && parseInt(fila[2]) === y
    );

    if (index === -1) {
      return res.status(404).send('Coordenadas no encontradas');
    }

    // Actualizar estado
    const filaIndex = index + 2; // +2 porque empieza en A2
    const updateRange = `Hoja1!D${filaIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[estado]],
      },
    });

    res.send('Estado actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).send('Error en el servidor');
  }
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
