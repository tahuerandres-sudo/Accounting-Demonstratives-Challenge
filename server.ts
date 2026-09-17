import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- DATABASE SETUP (File-backed JSON Database) ---
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'history.json');

function ensureDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    // Initial sample seed records for accounting apprentices to demonstrate historical tracking
    const initialData = [
      {
        id: 'seed-1',
        apprenticeName: 'Carlos Mendoza',
        program: 'Gestión Contable y de Información Financiera',
        ficha: '2698741',
        score: 100,
        totalQuestions: 10,
        correctAnswers: 10,
        incorrectAnswers: 0,
        percentage: 100,
        performanceCategory: 'excellent',
        performanceLabel: 'Excellent performance',
        date: '15/09/2026',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'seed-2',
        apprenticeName: 'Laura Valentina Gómez',
        program: 'Gestión Contable y de Información Financiera',
        ficha: '2698741',
        score: 90,
        totalQuestions: 10,
        correctAnswers: 9,
        incorrectAnswers: 1,
        percentage: 90,
        performanceCategory: 'excellent',
        performanceLabel: 'Excellent performance',
        date: '16/09/2026',
        timestamp: Date.now() - 86400000,
      },
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readHistory(): any[] {
  ensureDatabase();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

function writeHistory(records: any[]) {
  ensureDatabase();
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

function readProgress(): any {
  ensureDatabase();
  try {
    if (!fs.existsSync(PROGRESS_FILE)) return null;
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading progress file:', err);
    return null;
  }
}

function writeProgress(progressData: any) {
  ensureDatabase();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progressData, null, 2), 'utf-8');
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Accounting Demonstratives Challenge API' });
});

// GET /api/progress - Retrieve current in-progress session
app.get('/api/progress', (req, res) => {
  try {
    const progress = readProgress();
    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/progress - Save current in-progress session
app.post('/api/progress', (req, res) => {
  try {
    writeProgress(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/progress - Clear current in-progress session
app.delete('/api/progress', (req, res) => {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/history - Retrieve all attempts

app.get('/api/history', (req, res) => {
  try {
    const records = readHistory();
    // Sort by timestamp descending
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const totalAttempts = records.length;
    const avgScore = totalAttempts > 0
      ? Math.round(records.reduce((sum, r) => sum + (r.score || 0), 0) / totalAttempts)
      : 0;

    res.json({
      success: true,
      totalAttempts,
      averageScore: avgScore,
      records,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/history - Save new apprentice attempt
app.post('/api/history', (req, res) => {
  try {
    const {
      apprenticeName,
      program,
      ficha,
      score,
      totalQuestions = 10,
      correctAnswers,
      incorrectAnswers,
      percentage,
      performanceCategory,
      performanceLabel,
      date,
      details,
    } = req.body;

    if (!apprenticeName || !program || !ficha) {
      return res.status(400).json({ success: false, message: 'Missing required apprentice fields' });
    }

    const newRecord = {
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      apprenticeName: apprenticeName.trim(),
      program: program.trim(),
      ficha: ficha.trim(),
      score: Number(score) || 0,
      totalQuestions: Number(totalQuestions) || 10,
      correctAnswers: Number(correctAnswers) || 0,
      incorrectAnswers: Number(incorrectAnswers) || 0,
      percentage: Number(percentage) || 0,
      performanceCategory: performanceCategory || 'good',
      performanceLabel: performanceLabel || 'Completed',
      date: date || new Date().toLocaleDateString('es-CO'),
      timestamp: Date.now(),
      details: details || [],
    };

    const records = readHistory();
    records.unshift(newRecord);
    // Keep last 100 records
    if (records.length > 100) records.length = 100;
    writeHistory(records);

    res.status(201).json({ success: true, record: newRecord });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/certificate - Generate PDF consolidated certificate via Node.js
app.post('/api/certificate', async (req, res) => {
  try {
    const {
      apprenticeName = 'Aprendiz SENA',
      program = 'Gestión Contable y de Información Financiera',
      ficha = 'N/A',
      date = new Date().toLocaleDateString('es-CO'),
      timeWorkedFormatted = '10 min 0 seg',
      activitiesCompleted = {},
      activitiesPending = [],
    } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // Landscape A4
    const { width, height } = page.getSize();

    const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const navy = rgb(0.08, 0.18, 0.36);
    const deepNavy = rgb(0.04, 0.09, 0.20);
    const gold = rgb(0.79, 0.63, 0.22);
    const lightGold = rgb(0.96, 0.93, 0.85);
    const emerald = rgb(0.12, 0.52, 0.32);
    const lightEmerald = rgb(0.93, 0.98, 0.94);
    const alertRose = rgb(0.75, 0.22, 0.22);
    const lightAmber = rgb(0.98, 0.96, 0.92);
    const slateDark = rgb(0.2, 0.25, 0.3);
    const slateLight = rgb(0.45, 0.5, 0.55);
    const bgOffWhite = rgb(0.99, 0.99, 0.995);

    // Canvas background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgOffWhite,
    });

    // Outer Navy Border
    page.drawRectangle({
      x: 22,
      y: 22,
      width: width - 44,
      height: height - 44,
      borderColor: navy,
      borderWidth: 3.5,
    });

    // Inner Gold Border
    page.drawRectangle({
      x: 32,
      y: 32,
      width: width - 64,
      height: height - 64,
      borderColor: gold,
      borderWidth: 1.2,
    });

    // Corners
    [
      { x: 38, y: height - 38 },
      { x: width - 38, y: height - 38 },
      { x: 38, y: 38 },
      { x: width - 38, y: 38 },
    ].forEach((c) => {
      page.drawSquare({ x: c.x - 4, y: c.y - 4, size: 8, color: gold });
    });

    // Top Header Banner
    const org = 'SERVICIO NACIONAL DE APRENDIZAJE - SENA • CENTRO DE SERVICIOS FINANCIEROS';
    const oW = fontHelveticaBold.widthOfTextAtSize(org, 9.5);
    page.drawText(org, { x: (width - oW) / 2, y: height - 62, size: 9.5, font: fontHelveticaBold, color: gold });

    const dept = 'GESTIÓN CONTABLE Y DE INFORMACIÓN FINANCIERA • ENGLISH FOR ACCOUNTING';
    const dW = fontHelveticaBold.widthOfTextAtSize(dept, 11);
    page.drawText(dept, { x: (width - dW) / 2, y: height - 78, size: 11, font: fontHelveticaBold, color: navy });

    // Divider
    page.drawLine({
      start: { x: width / 2 - 160, y: height - 86 },
      end: { x: width / 2 + 160, y: height - 86 },
      thickness: 1,
      color: gold,
    });

    // Main Certificate Title
    const titleText = 'CERTIFICADO CONSOLIDADO DE COMPETENCIA BILINGÜE';
    const tW = fontTimesBold.widthOfTextAtSize(titleText, 21);
    page.drawText(titleText, { x: (width - tW) / 2, y: height - 114, size: 21, font: fontTimesBold, color: deepNavy });

    const subTitleText = 'EVALUACIÓN INTEGRAL DE ACTIVIDADES: FOTOGRAFÍAS Y COMPRENSIÓN AUDITIVA';
    const stW = fontHelveticaBold.widthOfTextAtSize(subTitleText, 9);
    page.drawText(subTitleText, { x: (width - stW) / 2, y: height - 128, size: 9, font: fontHelveticaBold, color: slateLight });

    // Preamble
    const pre = 'El Servicio Nacional de Aprendizaje (SENA) certifica el desempeño académico de:';
    const pW = fontTimesRoman.widthOfTextAtSize(pre, 12);
    page.drawText(pre, { x: (width - pW) / 2, y: height - 152, size: 12, font: fontTimesRoman, color: slateDark });

    // Apprentice Name
    const nameUpper = String(apprenticeName).toUpperCase();
    const nW = fontTimesBold.widthOfTextAtSize(nameUpper, 22);
    page.drawText(nameUpper, { x: (width - nW) / 2, y: height - 180, size: 22, font: fontTimesBold, color: navy });

    page.drawLine({
      start: { x: (width - Math.max(nW + 80, 320)) / 2, y: height - 188 },
      end: { x: (width + Math.max(nW + 80, 320)) / 2, y: height - 188 },
      thickness: 1.5,
      color: gold,
    });

    // Program and Ficha
    const progFicha = `PROGRAMA: ${program}   |   FICHA: ${ficha}`;
    const pfW = fontHelveticaBold.widthOfTextAtSize(progFicha, 10.5);
    page.drawText(progFicha, { x: (width - pfW) / 2, y: height - 206, size: 10.5, font: fontHelveticaBold, color: deepNavy });

    // Summary Bar (Time Worked & Date)
    const barY = height - 248;
    const barWidth = 752;
    const barX = (width - barWidth) / 2;
    page.drawRectangle({
      x: barX,
      y: barY,
      width: barWidth,
      height: 32,
      color: lightGold,
      borderColor: gold,
      borderWidth: 1,
    });

    page.drawText(`FECHA: ${date}`, { x: barX + 16, y: barY + 11, size: 10, font: fontHelveticaBold, color: deepNavy });
    page.drawText(`TIEMPO TRABAJADO: ${timeWorkedFormatted}`, { x: barX + 235, y: barY + 11, size: 10, font: fontHelveticaBold, color: navy });

    const hasAct1 = Boolean(activitiesCompleted.activity1);
    const hasAct2 = Boolean(activitiesCompleted.activity2);
    const doneCount = (hasAct1 ? 1 : 0) + (hasAct2 ? 1 : 0);
    const statusText = doneCount === 2 ? 'ESTADO: 100% COMPLETADO (2/2 Actividades)' : doneCount === 1 ? 'ESTADO: 50% EN CURSO (1/2 Realizada)' : 'ESTADO: EN FORMACIÓN (0/2)';
    page.drawText(statusText, { x: barX + 490, y: barY + 11, size: 10, font: fontHelveticaBold, color: doneCount === 2 ? emerald : gold });

    // Two Content Boxes (368 width each)
    const boxW = 368;
    const boxH = 150;
    const boxY = height - 412;

    // Box A: Realizadas
    page.drawRectangle({ x: barX, y: boxY, width: boxW, height: boxH, color: lightEmerald, borderColor: emerald, borderWidth: 1.2 });
    page.drawRectangle({ x: barX, y: boxY + boxH - 24, width: boxW, height: 24, color: emerald });
    page.drawText('ACTIVIDADES REALIZADAS (COMPLETED)', { x: barX + 14, y: boxY + boxH - 16, size: 9.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });

    let leftY = boxY + boxH - 44;
    if (!hasAct1 && !hasAct2) {
      page.drawText('Ninguna actividad completada a la fecha.', { x: barX + 14, y: leftY, size: 9.5, font: fontHelvetica, color: slateDark });
    }
    if (hasAct1) {
      const a1 = activitiesCompleted.activity1;
      page.drawText('✓ ACTIVIDAD 1: RETO DE FOTOGRAFÍAS (30 IN A ROW)', { x: barX + 14, y: leftY, size: 9.5, font: fontHelveticaBold, color: deepNavy });
      page.drawText(`• Puntuación: ${a1.score || 100}/100   • Racha: ${a1.streak || 30}/30 in a row`, { x: barX + 22, y: leftY - 14, size: 8.5, font: fontHelveticaBold, color: emerald });
      page.drawText('• Identificación contextual de THIS, THAT, THESE y THOSE.', { x: barX + 22, y: leftY - 28, size: 8, font: fontHelvetica, color: slateDark });
      leftY -= 52;
    }
    if (hasAct2) {
      const a2 = activitiesCompleted.activity2;
      page.drawText('✓ ACTIVIDAD 2: AUDIO & SENTENCE BUILDER (20 FRASES)', { x: barX + 14, y: leftY, size: 9.5, font: fontHelveticaBold, color: deepNavy });
      page.drawText(`• Frases armadas: ${a2.completedSentences || 20}/20   • Precisión: ${a2.percentage || 100}%`, { x: barX + 22, y: leftY - 14, size: 8.5, font: fontHelveticaBold, color: emerald });
      page.drawText('• Frases contables sencillas de máximo 5 palabras.', { x: barX + 22, y: leftY - 28, size: 8, font: fontHelvetica, color: slateDark });
    }

    // Box B: No Realizadas / Pendientes
    const rightX = barX + boxW + 16;
    const allDone = doneCount === 2;
    page.drawRectangle({ x: rightX, y: boxY, width: boxW, height: boxH, color: allDone ? lightGold : lightAmber, borderColor: allDone ? gold : alertRose, borderWidth: 1.2 });
    page.drawRectangle({ x: rightX, y: boxY + boxH - 24, width: boxW, height: 24, color: allDone ? gold : rgb(0.35, 0.38, 0.44) });
    page.drawText('ACTIVIDADES NO REALIZADAS / PENDIENTES', { x: rightX + 14, y: boxY + boxH - 16, size: 9.5, font: fontHelveticaBold, color: rgb(1, 1, 1) });

    let rightY = boxY + boxH - 44;
    if (allDone) {
      page.drawText('★ ¡NINGUNA ACTIVIDAD PENDIENTE!', { x: rightX + 14, y: rightY, size: 10, font: fontHelveticaBold, color: emerald });
      page.drawText('El aprendiz completó el 100% de las actividades formativas', { x: rightX + 14, y: rightY - 16, size: 8.5, font: fontHelvetica, color: slateDark });
      page.drawText('(Reto de 30 fotos consecutivas y 20 frases de audio contable).', { x: rightX + 14, y: rightY - 30, size: 8.5, font: fontHelveticaBold, color: navy });
      page.drawText('Cumplimiento total de evidencias académicas bilingües.', { x: rightX + 14, y: rightY - 46, size: 8, font: fontHelvetica, color: slateLight });
    } else {
      if (!hasAct1) {
        page.drawText('✗ ACTIVIDAD 1: RETO DE FOTOGRAFÍAS CONTABLES', { x: rightX + 14, y: rightY, size: 9.5, font: fontHelveticaBold, color: alertRose });
        page.drawText('• Estado: PENDIENTE POR REALIZAR', { x: rightX + 22, y: rightY - 14, size: 8.5, font: fontHelveticaBold, color: slateDark });
        page.drawText('• Requisito: Superar 30 aciertos consecutivos in a row.', { x: rightX + 22, y: rightY - 28, size: 8, font: fontHelvetica, color: slateLight });
        rightY -= 52;
      }
      if (!hasAct2) {
        page.drawText('✗ ACTIVIDAD 2: AUDIO & SENTENCE BUILDER', { x: rightX + 14, y: rightY, size: 9.5, font: fontHelveticaBold, color: alertRose });
        page.drawText('• Estado: PENDIENTE POR REALIZAR', { x: rightX + 22, y: rightY - 14, size: 8.5, font: fontHelveticaBold, color: slateDark });
        page.drawText('• Requisito: Escuchar y armar 20 frases contables cortas.', { x: rightX + 22, y: rightY - 28, size: 8, font: fontHelvetica, color: slateLight });
      }
    }

    // Signatures and Footer
    const signY = 92;
    const signX = width - 290;
    page.drawLine({ start: { x: signX, y: signY }, end: { x: signX + 230, y: signY }, thickness: 1.2, color: navy });
    const instT = 'Instructor(a) de Bilingüismo';
    const itW = fontHelveticaBold.widthOfTextAtSize(instT, 10.5);
    page.drawText(instT, { x: signX + (230 - itW) / 2, y: signY - 14, size: 10.5, font: fontHelveticaBold, color: deepNavy });
    const deptS = 'Gestión Contable y de Información Financiera - SENA';
    const dsW = fontHelvetica.widthOfTextAtSize(deptS, 8);
    page.drawText(deptS, { x: signX + (230 - dsW) / 2, y: signY - 26, size: 8, font: fontHelvetica, color: slateLight });

    // Seal
    page.drawCircle({ x: 110, y: 95, size: 36, borderColor: gold, borderWidth: 2, color: lightGold });
    page.drawCircle({ x: 110, y: 95, size: 30, borderColor: navy, borderWidth: 1 });
    page.drawText('SENA', { x: 97, y: 102, size: 10, font: fontHelveticaBold, color: navy });
    page.drawText('VERIFIED', { x: 92, y: 92, size: 7.5, font: fontHelveticaBold, color: gold });
    page.drawText('CONSOLIDADO', { x: 86, y: 83, size: 6, font: fontHelvetica, color: slateDark });

    const pdfBytes = await pdfDoc.save();

    const sanitizedName = String(apprenticeName).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SENA_Certificado_Consolidado_${sanitizedName}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- SERVER START & VITE MIDDLEWARE ---
async function startServer() {
  ensureDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
