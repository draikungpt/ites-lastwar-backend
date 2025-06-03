const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS solo para Netlify
app.use(cors()); // Acepta cualquier origen

// Parsear JSON en requests
app.use(bodyParser.json());

// Cargar credenciales desde variables de entorno
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

// Configurar acceso a la hoja de Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1JifUqUTquqiHOkFTqu9oDjH6c0oSnuW3-Lex2kYcXoA";
const SHEET_NAME = "Full 1";

app.post("/actualizar", async (req, res) => {
  const { x, y, estado } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:D`,
    });

    const values = response.data.values;
    const rowIndex = values.findIndex(
      (row) => parseInt(row[1]) === x && parseInt(row[2]) === y
    );

    if (rowIndex === -1) {
      return res.status(404).send("Coordenadas no encontradas");
    }

    const rangeToUpdate = `${SHEET_NAME}!D${rowIndex + 2}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeToUpdate,
      valueInputOption: "RAW",
      requestBody: {
        values: [[estado]],
      },
    });

    res.send("Actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).send("Error al actualizar en Google Sheets");
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
