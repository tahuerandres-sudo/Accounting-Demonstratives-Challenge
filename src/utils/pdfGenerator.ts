import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ConsolidatedCertificateData, AttemptResult } from '../types';

export function formatTimeWorked(seconds: number): string {
  if (!seconds || seconds <= 0) return 'Menos de 1 min';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} seg`;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs} h ${remMins} min ${secs} seg`;
  }
  return `${mins} min ${secs} seg`;
}

/**
 * Creates the single, official consolidated certificate PDF byte stream.
 * Displays all results for BOTH activities:
 * - Apprentice name & Ficha
 * - Time worked (Tiempo trabajado)
 * - Activities completed (Actividades que realizó)
 * - Activities pending (Actividades que no realizó)
 * - Date and training program name
 */
export async function createConsolidatedCertificatePdfBytes(
  data: ConsolidatedCertificateData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // Landscape A4
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Elegant Academic Palette
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

  // Background Canvas
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bgOffWhite,
  });

  // Outer Border (Navy)
  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: navy,
    borderWidth: 3.5,
  });

  // Inner Border (Gold)
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: gold,
    borderWidth: 1.2,
  });

  // Corner Accent Diamonds
  const cornerOffset = 38;
  const corners = [
    { x: cornerOffset, y: height - cornerOffset },
    { x: width - cornerOffset, y: height - cornerOffset },
    { x: cornerOffset, y: cornerOffset },
    { x: width - cornerOffset, y: cornerOffset },
  ];
  corners.forEach((c) => {
    page.drawSquare({
      x: c.x - 4,
      y: c.y - 4,
      size: 8,
      color: gold,
    });
  });

  // --- 1. TOP INSTITUTIONAL HEADER ---
  const headerOrg = 'SERVICIO NACIONAL DE APRENDIZAJE - SENA • CENTRO DE SERVICIOS FINANCIEROS';
  const hOrgWidth = fontHelveticaBold.widthOfTextAtSize(headerOrg, 9.5);
  page.drawText(headerOrg, {
    x: (width - hOrgWidth) / 2,
    y: height - 62,
    size: 9.5,
    font: fontHelveticaBold,
    color: gold,
  });

  const headerDept = 'GESTIÓN CONTABLE Y DE INFORMACIÓN FINANCIERA • ENGLISH FOR ACCOUNTING';
  const hDeptWidth = fontHelveticaBold.widthOfTextAtSize(headerDept, 11);
  page.drawText(headerDept, {
    x: (width - hDeptWidth) / 2,
    y: height - 78,
    size: 11,
    font: fontHelveticaBold,
    color: navy,
  });

  // Thin Decorative Divider
  page.drawLine({
    start: { x: width / 2 - 160, y: height - 86 },
    end: { x: width / 2 + 160, y: height - 86 },
    thickness: 1,
    color: gold,
  });

  // --- 2. MAIN TITLE ---
  const titleText = 'CERTIFICADO CONSOLIDADO DE COMPETENCIA BILINGÜE';
  const titleWidth = fontTimesBold.widthOfTextAtSize(titleText, 21);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 114,
    size: 21,
    font: fontTimesBold,
    color: deepNavy,
  });

  const subTitleText = 'EVALUACIÓN INTEGRAL DE ACTIVIDADES: FOTOGRAFÍAS Y COMPRENSIÓN AUDITIVA';
  const subTitleWidth = fontHelveticaBold.widthOfTextAtSize(subTitleText, 9);
  page.drawText(subTitleText, {
    x: (width - subTitleWidth) / 2,
    y: height - 128,
    size: 9,
    font: fontHelveticaBold,
    color: slateLight,
  });

  // --- 3. APPRENTICE PRESENTATION ---
  const certPreamble = 'El Servicio Nacional de Aprendizaje (SENA) certifica el desempeño académico de:';
  const preWidth = fontTimesRoman.widthOfTextAtSize(certPreamble, 12);
  page.drawText(certPreamble, {
    x: (width - preWidth) / 2,
    y: height - 152,
    size: 12,
    font: fontTimesRoman,
    color: slateDark,
  });

  // Large Apprentice Name
  const apprenticeName = (data.apprenticeName || 'APRENDIZ SENA').toUpperCase();
  const nameWidth = fontTimesBold.widthOfTextAtSize(apprenticeName, 22);
  page.drawText(apprenticeName, {
    x: (width - nameWidth) / 2,
    y: height - 180,
    size: 22,
    font: fontTimesBold,
    color: navy,
  });

  // Gold accent bar below name
  page.drawLine({
    start: { x: (width - Math.max(nameWidth + 80, 320)) / 2, y: height - 188 },
    end: { x: (width + Math.max(nameWidth + 80, 320)) / 2, y: height - 188 },
    thickness: 1.5,
    color: gold,
  });

  // Program & Ficha
  const programStr = `PROGRAMA: ${data.program || 'Gestión Contable y de Información Financiera'}`;
  const fichaStr = `FICHA: ${data.ficha || 'N/A'}`;
  const progFichaLine = `${programStr}   |   ${fichaStr}`;
  const pfWidth = fontHelveticaBold.widthOfTextAtSize(progFichaLine, 10.5);
  page.drawText(progFichaLine, {
    x: (width - pfWidth) / 2,
    y: height - 206,
    size: 10.5,
    font: fontHelveticaBold,
    color: deepNavy,
  });

  // --- 4. SUMMARY METRICS BAR (FECHA & TIEMPO TRABAJADO) ---
  const barY = height - 248;
  const barWidth = 752;
  const barX = (width - barWidth) / 2;
  const barHeight = 32;

  page.drawRectangle({
    x: barX,
    y: barY,
    width: barWidth,
    height: barHeight,
    color: lightGold,
    borderColor: gold,
    borderWidth: 1,
  });

  // Items inside summary bar
  const dateText = `FECHA: ${data.date || new Date().toLocaleDateString('es-CO')}`;
  page.drawText(dateText, {
    x: barX + 16,
    y: barY + 11,
    size: 10,
    font: fontHelveticaBold,
    color: deepNavy,
  });

  const timeWorkedText = `TIEMPO TRABAJADO: ${data.timeWorkedFormatted || '0 min 0 seg'}`;
  page.drawText(timeWorkedText, {
    x: barX + 235,
    y: barY + 11,
    size: 10,
    font: fontHelveticaBold,
    color: navy,
  });

  const actDoneCount = (data.activitiesCompleted.activity1 ? 1 : 0) + (data.activitiesCompleted.activity2 ? 1 : 0);
  const statusStr = actDoneCount === 2 
    ? 'ESTADO: 100% COMPLETADO (2/2 Actividades)' 
    : actDoneCount === 1 
    ? 'ESTADO: 50% EN CURSO (1/2 Realizada)' 
    : 'ESTADO: INICIANDO FORMACIÓN (0/2)';
  page.drawText(statusStr, {
    x: barX + 490,
    y: barY + 11,
    size: 10,
    font: fontHelveticaBold,
    color: actDoneCount === 2 ? emerald : actDoneCount === 1 ? gold : slateDark,
  });

  // --- 5. TWO DETAILED SECTIONS: ACTIVIDADES REALIZADAS VS NO REALIZADAS ---
  const boxWidth = 368;
  const boxHeight = 150;
  const boxY = height - 412;

  // --- BOX A: ACTIVIDADES REALIZADAS (LEFT) ---
  const boxLeftX = barX;
  page.drawRectangle({
    x: boxLeftX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: lightEmerald,
    borderColor: emerald,
    borderWidth: 1.2,
  });

  // Header strip for Box A
  page.drawRectangle({
    x: boxLeftX,
    y: boxY + boxHeight - 24,
    width: boxWidth,
    height: 24,
    color: emerald,
  });

  page.drawText('ACTIVIDADES REALIZADAS (COMPLETED)', {
    x: boxLeftX + 14,
    y: boxY + boxHeight - 16,
    size: 9.5,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  // Populate Completed Activities
  let actLeftOffsetY = boxY + boxHeight - 44;

  if (!data.activitiesCompleted.activity1 && !data.activitiesCompleted.activity2) {
    page.drawText('Ninguna actividad completada a la fecha.', {
      x: boxLeftX + 14,
      y: actLeftOffsetY,
      size: 9.5,
      font: fontHelvetica,
      color: slateDark,
    });
    page.drawText('El aprendiz se encuentra en proceso de desarrollo.', {
      x: boxLeftX + 14,
      y: actLeftOffsetY - 16,
      size: 8.5,
      font: fontHelvetica,
      color: slateLight,
    });
  }

  if (data.activitiesCompleted.activity1) {
    const act1 = data.activitiesCompleted.activity1;
    page.drawText('✓ ACTIVIDAD 1: RETO DE FOTOGRAFÍAS (30 IN A ROW)', {
      x: boxLeftX + 14,
      y: actLeftOffsetY,
      size: 9.5,
      font: fontHelveticaBold,
      color: deepNavy,
    });
    page.drawText(`• Puntuación: ${act1.score}/100   • Racha lograda: ${act1.streak}/30 in a row`, {
      x: boxLeftX + 22,
      y: actLeftOffsetY - 14,
      size: 8.5,
      font: fontHelveticaBold,
      color: emerald,
    });
    page.drawText('• Identificación contextual de THIS, THAT, THESE y THOSE.', {
      x: boxLeftX + 22,
      y: actLeftOffsetY - 28,
      size: 8,
      font: fontHelvetica,
      color: slateDark,
    });
    actLeftOffsetY -= 52;
  }

  if (data.activitiesCompleted.activity2) {
    const act2 = data.activitiesCompleted.activity2;
    page.drawText('✓ ACTIVIDAD 2: AUDIO & SENTENCE BUILDER (20 FRASES)', {
      x: boxLeftX + 14,
      y: actLeftOffsetY,
      size: 9.5,
      font: fontHelveticaBold,
      color: deepNavy,
    });
    page.drawText(`• Frases armadas: ${act2.completedSentences}/${act2.totalSentences}   • Precisión: ${act2.percentage}%`, {
      x: boxLeftX + 22,
      y: actLeftOffsetY - 14,
      size: 8.5,
      font: fontHelveticaBold,
      color: emerald,
    });
    page.drawText('• Frases contables sencillas de máximo 5 palabras.', {
      x: boxLeftX + 22,
      y: actLeftOffsetY - 28,
      size: 8,
      font: fontHelvetica,
      color: slateDark,
    });
  }

  // --- BOX B: ACTIVIDADES NO REALIZADAS / PENDIENTES (RIGHT) ---
  const boxRightX = barX + boxWidth + 16;
  const isFullDone = actDoneCount === 2;

  page.drawRectangle({
    x: boxRightX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    color: isFullDone ? lightGold : lightAmber,
    borderColor: isFullDone ? gold : alertRose,
    borderWidth: 1.2,
  });

  // Header strip for Box B
  page.drawRectangle({
    x: boxRightX,
    y: boxY + boxHeight - 24,
    width: boxWidth,
    height: 24,
    color: isFullDone ? gold : rgb(0.35, 0.38, 0.44),
  });

  page.drawText('ACTIVIDADES NO REALIZADAS / PENDIENTES', {
    x: boxRightX + 14,
    y: boxY + boxHeight - 16,
    size: 9.5,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  // Populate Pending Activities
  let actRightOffsetY = boxY + boxHeight - 44;

  if (isFullDone) {
    page.drawText('★ ¡NINGUNA ACTIVIDAD PENDIENTE!', {
      x: boxRightX + 14,
      y: actRightOffsetY,
      size: 10,
      font: fontHelveticaBold,
      color: emerald,
    });
    page.drawText('El aprendiz completó el 100% de las actividades formativas', {
      x: boxRightX + 14,
      y: actRightOffsetY - 16,
      size: 8.5,
      font: fontHelvetica,
      color: slateDark,
    });
    page.drawText('(Reto de 30 fotos consecutivas y 20 frases de audio contable).', {
      x: boxRightX + 14,
      y: actRightOffsetY - 30,
      size: 8.5,
      font: fontHelveticaBold,
      color: navy,
    });
    page.drawText('Cumplimiento total de evidencias académicas bilingües.', {
      x: boxRightX + 14,
      y: actRightOffsetY - 46,
      size: 8,
      font: fontHelvetica,
      color: slateLight,
    });
  } else {
    // List pending activities explicitly
    if (!data.activitiesCompleted.activity1) {
      page.drawText('✗ ACTIVIDAD 1: RETO DE FOTOGRAFÍAS CONTABLES', {
        x: boxRightX + 14,
        y: actRightOffsetY,
        size: 9.5,
        font: fontHelveticaBold,
        color: alertRose,
      });
      page.drawText('• Estado: PENDIENTE POR REALIZAR', {
        x: boxRightX + 22,
        y: actRightOffsetY - 14,
        size: 8.5,
        font: fontHelveticaBold,
        color: slateDark,
      });
      page.drawText('• Requisito: Superar 30 aciertos consecutivos in a row.', {
        x: boxRightX + 22,
        y: actRightOffsetY - 28,
        size: 8,
        font: fontHelvetica,
        color: slateLight,
      });
      actRightOffsetY -= 52;
    }

    if (!data.activitiesCompleted.activity2) {
      page.drawText('✗ ACTIVIDAD 2: AUDIO & SENTENCE BUILDER', {
        x: boxRightX + 14,
        y: actRightOffsetY,
        size: 9.5,
        font: fontHelveticaBold,
        color: alertRose,
      });
      page.drawText('• Estado: PENDIENTE POR REALIZAR', {
        x: boxRightX + 22,
        y: actRightOffsetY - 14,
        size: 8.5,
        font: fontHelveticaBold,
        color: slateDark,
      });
      page.drawText('• Requisito: Escuchar y armar 20 frases contables cortas.', {
        x: boxRightX + 22,
        y: actRightOffsetY - 28,
        size: 8,
        font: fontHelvetica,
        color: slateLight,
      });
    }
  }

  // --- 6. FOOTER: VERIFICATION SEAL & INSTRUCTOR SIGN-OFF ---
  const signY = 92;

  // Instructor signature line
  const signX = width - 290;
  page.drawLine({
    start: { x: signX, y: signY },
    end: { x: signX + 230, y: signY },
    thickness: 1.2,
    color: navy,
  });

  const instTitle = 'Instructor(a) de Bilingüismo';
  const instWidth = fontHelveticaBold.widthOfTextAtSize(instTitle, 10.5);
  page.drawText(instTitle, {
    x: signX + (230 - instWidth) / 2,
    y: signY - 14,
    size: 10.5,
    font: fontHelveticaBold,
    color: deepNavy,
  });

  const deptSign = 'Gestión Contable y de Información Financiera - SENA';
  const deptSignWidth = fontHelvetica.widthOfTextAtSize(deptSign, 8);
  page.drawText(deptSign, {
    x: signX + (230 - deptSignWidth) / 2,
    y: signY - 26,
    size: 8,
    font: fontHelvetica,
    color: slateLight,
  });

  // Center Academic Commendation Note
  const centerNote1 = 'Certificación expedida con base en los registros consolidados del sistema.';
  const centerNote2 = 'Competencia: Comunicar en idioma inglés según requerimientos del entorno laboral contable.';
  page.drawText(centerNote1, {
    x: 210,
    y: signY - 8,
    size: 8,
    font: fontHelvetica,
    color: slateDark,
  });
  page.drawText(centerNote2, {
    x: 210,
    y: signY - 22,
    size: 7.5,
    font: fontHelveticaBold,
    color: navy,
  });

  // Official SENA Stamp / Seal (Bottom Left)
  page.drawCircle({
    x: 110,
    y: 95,
    size: 36,
    borderColor: gold,
    borderWidth: 2,
    color: lightGold,
  });

  page.drawCircle({
    x: 110,
    y: 95,
    size: 30,
    borderColor: navy,
    borderWidth: 1,
  });

  const seal1 = 'SENA';
  const seal2 = 'VERIFIED';
  const seal3 = 'CONSOLIDADO';
  const s1W = fontHelveticaBold.widthOfTextAtSize(seal1, 10);
  const s2W = fontHelveticaBold.widthOfTextAtSize(seal2, 7.5);
  const s3W = fontHelvetica.widthOfTextAtSize(seal3, 6);

  page.drawText(seal1, { x: 110 - s1W / 2, y: 102, size: 10, font: fontHelveticaBold, color: navy });
  page.drawText(seal2, { x: 110 - s2W / 2, y: 92, size: 7.5, font: fontHelveticaBold, color: gold });
  page.drawText(seal3, { x: 110 - s3W / 2, y: 83, size: 6, font: fontHelvetica, color: slateDark });

  return await pdfDoc.save();
}

/**
 * Downloads the single, consolidated certificate for both activities
 */
export async function downloadConsolidatedCertificatePdf(
  data: ConsolidatedCertificateData
): Promise<void> {
  const sanitizedName = (data.apprenticeName || 'Apprentice')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);
  const fichaStr = data.ficha ? `_Ficha_${data.ficha}` : '';
  const filename = `SENA_Certificado_Consolidado_${sanitizedName}${fichaStr}.pdf`;

  const pdfBytes = await createConsolidatedCertificatePdfBytes(data);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  triggerDownload(blob, filename);
}

/**
 * Legacy download handler pointing to the consolidated certificate
 */
export async function downloadAnyCertificatePdf(record: any): Promise<void> {
  // If record is already ConsolidatedCertificateData, use directly
  if (record.activitiesCompleted !== undefined) {
    await downloadConsolidatedCertificatePdf(record);
    return;
  }

  // Otherwise, adapt record into ConsolidatedCertificateData
  const isAct2 = record.activityType === 'activity2';
  const consolidated: ConsolidatedCertificateData = {
    apprenticeName: record.apprenticeName || 'Aprendiz SENA',
    program: record.program || 'Gestión Contable y de Información Financiera',
    ficha: record.ficha || 'N/A',
    date: record.date || new Date().toLocaleDateString('es-CO'),
    timeWorkedFormatted: record.timeWorkedFormatted || '12 min 30 seg',
    timeWorkedSeconds: record.timeWorkedSeconds || 750,
    activitiesCompleted: {
      activity1: !isAct2 ? {
        title: 'Reto de Fotografías Contables',
        score: record.score || 100,
        streak: record.streakAchieved || 30,
        date: record.date,
      } : undefined,
      activity2: isAct2 ? {
        title: 'Audio & Sentence Builder',
        completedSentences: record.score || 20,
        totalSentences: 20,
        percentage: record.percentage || 100,
        date: record.date,
      } : undefined,
    },
    activitiesPending: isAct2 
      ? ['Actividad 1: Reto de Fotografías (Pendiente)']
      : ['Actividad 2: Audio & Sentence Builder (Pendiente)'],
    overallPercentage: isAct2 ? 50 : 50,
    overallStatus: 'partial',
  };

  await downloadConsolidatedCertificatePdf(consolidated);
}

export async function downloadCertificatePdf(result: AttemptResult): Promise<void> {
  await downloadAnyCertificatePdf(result);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
