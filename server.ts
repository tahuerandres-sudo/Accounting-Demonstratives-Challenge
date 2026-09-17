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

// POST /api/certificate - Generate PDF certificate via Node.js
app.post('/api/certificate', async (req, res) => {
  try {
    const {
      apprenticeName = 'Apprentice',
      program = 'Gestión Contable y de Información Financiera',
      ficha = 'N/A',
      score = 0,
      percentage = 0,
      date = new Date().toLocaleDateString('es-CO'),
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
    const lightGold = rgb(0.95, 0.91, 0.82);
    const slateDark = rgb(0.2, 0.25, 0.3);
    const slateLight = rgb(0.45, 0.5, 0.55);
    const bgOffWhite = rgb(0.985, 0.985, 0.99);

    // Background tint
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgOffWhite,
    });

    // Outer Border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      borderColor: navy,
      borderWidth: 3.5,
    });

    // Inner Gold Border
    page.drawRectangle({
      x: 34,
      y: 34,
      width: width - 68,
      height: height - 68,
      borderColor: gold,
      borderWidth: 1.2,
    });

    // Corner accents
    const corners = [
      { x: 40, y: height - 40 },
      { x: width - 40, y: height - 40 },
      { x: 40, y: 40 },
      { x: width - 40, y: 40 },
    ];
    corners.forEach(c => {
      page.drawSquare({ x: c.x - 4, y: c.y - 4, size: 8, color: gold });
    });

    // Top Header Banner
    const subOrg = 'GESTIÓN CONTABLE Y DE INFORMACIÓN FINANCIERA • ENGLISH FOR ACCOUNTING';
    const subOrgWidth = fontHelveticaBold.widthOfTextAtSize(subOrg, 9.5);
    page.drawText(subOrg, {
      x: (width - subOrgWidth) / 2,
      y: height - 72,
      size: 9.5,
      font: fontHelveticaBold,
      color: gold,
    });

    const activityTag = 'ACCOUNTING DEMONSTRATIVES CHALLENGE';
    const activityWidth = fontHelveticaBold.widthOfTextAtSize(activityTag, 13);
    page.drawText(activityTag, {
      x: (width - activityWidth) / 2,
      y: height - 94,
      size: 13,
      font: fontHelveticaBold,
      color: navy,
    });

    // Decorative divider
    page.drawLine({
      start: { x: width / 2 - 120, y: height - 106 },
      end: { x: width / 2 + 120, y: height - 106 },
      thickness: 1,
      color: gold,
    });

    // Main Certificate Title
    const titleText = 'CERTIFICATE OF COMPLETION';
    const titleWidth = fontTimesBold.widthOfTextAtSize(titleText, 32);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 148,
      size: 32,
      font: fontTimesBold,
      color: deepNavy,
    });

    const presentedText = 'This certificate is proudly presented to:';
    const presentedWidth = fontTimesRoman.widthOfTextAtSize(presentedText, 14);
    page.drawText(presentedText, {
      x: (width - presentedWidth) / 2,
      y: height - 188,
      size: 14,
      font: fontTimesRoman,
      color: slateDark,
    });

    // Apprentice Name
    const nameText = String(apprenticeName).toUpperCase();
    const nameWidth = fontTimesBold.widthOfTextAtSize(nameText, 26);
    page.drawText(nameText, {
      x: (width - nameWidth) / 2,
      y: height - 232,
      size: 26,
      font: fontTimesBold,
      color: navy,
    });

    page.drawLine({
      start: { x: (width - Math.max(nameWidth + 60, 300)) / 2, y: height - 240 },
      end: { x: (width + Math.max(nameWidth + 60, 300)) / 2, y: height - 240 },
      thickness: 1.5,
      color: gold,
    });

    // Commendation
    const bodyText1 = 'For successfully completing the Accounting Demonstratives Challenge and';
    const bodyText2 = 'practicing the accurate contextual use of THIS, THAT, THESE and THOSE in English.';
    const b1Width = fontHelvetica.widthOfTextAtSize(bodyText1, 12);
    const b2Width = fontHelvetica.widthOfTextAtSize(bodyText2, 12);

    page.drawText(bodyText1, {
      x: (width - b1Width) / 2,
      y: height - 275,
      size: 12,
      font: fontHelvetica,
      color: slateDark,
    });

    page.drawText(bodyText2, {
      x: (width - b2Width) / 2,
      y: height - 295,
      size: 12,
      font: fontHelvetica,
      color: slateDark,
    });

    // Information Box
    const boxWidth = 560;
    const boxHeight = 60;
    const boxX = (width - boxWidth) / 2;
    const boxY = height - 375;

    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      color: lightGold,
      borderColor: gold,
      borderWidth: 1,
    });

    page.drawText(`PROGRAM: ${program}`, {
      x: boxX + 24,
      y: boxY + 36,
      size: 11,
      font: fontHelveticaBold,
      color: deepNavy,
    });

    page.drawText(`TRAINING GROUP (FICHA): ${ficha}`, {
      x: boxX + 24,
      y: boxY + 14,
      size: 10,
      font: fontHelvetica,
      color: slateDark,
    });

    page.drawText(`FINAL SCORE: ${score}/100 (${percentage}%)`, {
      x: boxX + 230,
      y: boxY + 14,
      size: 10,
      font: fontHelveticaBold,
      color: navy,
    });

    page.drawText(`DATE: ${date}`, {
      x: boxX + 410,
      y: boxY + 14,
      size: 10,
      font: fontHelvetica,
      color: slateDark,
    });

    // Instructor sign-off
    const signX = width / 2 - 130;
    const signY = 95;

    page.drawLine({
      start: { x: signX, y: signY },
      end: { x: signX + 260, y: signY },
      thickness: 1.2,
      color: navy,
    });

    const instructorTitle = 'English Instructor';
    const instWidth = fontHelveticaBold.widthOfTextAtSize(instructorTitle, 12);
    page.drawText(instructorTitle, {
      x: (width - instWidth) / 2,
      y: signY - 18,
      size: 12,
      font: fontHelveticaBold,
      color: deepNavy,
    });

    const deptTitle = 'Financial & Accounting Management Training Program';
    const deptWidth = fontHelvetica.widthOfTextAtSize(deptTitle, 9);
    page.drawText(deptTitle, {
      x: (width - deptWidth) / 2,
      y: signY - 32,
      size: 9,
      font: fontHelvetica,
      color: slateLight,
    });

    // Seal
    page.drawCircle({
      x: 100,
      y: 100,
      size: 38,
      borderColor: gold,
      borderWidth: 2,
      color: lightGold,
    });
    page.drawCircle({
      x: 100,
      y: 100,
      size: 32,
      borderColor: navy,
      borderWidth: 1,
    });
    const sealLine1 = 'VERIFIED';
    const sealLine2 = 'SENA';
    const s1W = fontHelveticaBold.widthOfTextAtSize(sealLine1, 8);
    const s2W = fontHelveticaBold.widthOfTextAtSize(sealLine2, 10);
    page.drawText(sealLine1, { x: 100 - s1W / 2, y: 106, size: 8, font: fontHelveticaBold, color: gold });
    page.drawText(sealLine2, { x: 100 - s2W / 2, y: 92, size: 10, font: fontHelveticaBold, color: navy });

    const pdfBytes = await pdfDoc.save();

    const sanitizedName = String(apprenticeName).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Accounting_Demonstratives_${sanitizedName}.pdf"`);
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
