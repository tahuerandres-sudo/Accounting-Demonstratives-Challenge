import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { AttemptResult } from '../types';

export async function createCertificatePdfBytes(data: {
  apprenticeName: string;
  program: string;
  ficha: string;
  score: number;
  percentage: number;
  date: string;
  performanceLabel?: string;
  activityType?: 'activity1' | 'activity2';
  activityTitle?: string;
  customCommendation1?: string;
  customCommendation2?: string;
}): Promise<Uint8Array> {
  // Landscape A4: 841.89 x 595.28 points
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const isActivity2 = data.activityType === 'activity2';

  // Palette: Navy Blue, Gold, Slate
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

  // Inner Fine Gold Border
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: gold,
    borderWidth: 1.2,
  });

  // Corner Accent Diamonds
  const cornerOffset = 40;
  const corners = [
    { x: cornerOffset, y: height - cornerOffset },
    { x: width - cornerOffset, y: height - cornerOffset },
    { x: cornerOffset, y: cornerOffset },
    { x: width - cornerOffset, y: cornerOffset },
  ];

  corners.forEach(c => {
    page.drawSquare({
      x: c.x - 4,
      y: c.y - 4,
      size: 8,
      color: gold,
    });
  });

  // Top Organization Banner
  const subOrg = 'GESTIÓN CONTABLE Y DE INFORMACIÓN FINANCIERA • ENGLISH FOR ACCOUNTING';
  const subOrgWidth = fontHelveticaBold.widthOfTextAtSize(subOrg, 9.5);
  page.drawText(subOrg, {
    x: (width - subOrgWidth) / 2,
    y: height - 72,
    size: 9.5,
    font: fontHelveticaBold,
    color: gold,
  });

  // Main Activity Tag
  const activityTag = isActivity2
    ? 'ACTIVITY 2 • ENGLISH LISTENING & SENTENCE BUILDER'
    : 'ACTIVITY 1 • ACCOUNTING DEMONSTRATIVES CHALLENGE';
  const activityWidth = fontHelveticaBold.widthOfTextAtSize(activityTag, 13);
  page.drawText(activityTag, {
    x: (width - activityWidth) / 2,
    y: height - 94,
    size: 13,
    font: fontHelveticaBold,
    color: navy,
  });

  // Decorative Horizontal Divider
  page.drawLine({
    start: { x: width / 2 - 120, y: height - 106 },
    end: { x: width / 2 + 120, y: height - 106 },
    thickness: 1,
    color: gold,
  });

  // Main Title: CERTIFICATE OF COMPLETION
  const titleText = 'CERTIFICATE OF COMPLETION';
  const titleWidth = fontTimesBold.widthOfTextAtSize(titleText, 32);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 148,
    size: 32,
    font: fontTimesBold,
    color: deepNavy,
  });

  // "This certificate is presented to"
  const presentedText = 'This certificate is proudly presented to:';
  const presentedWidth = fontTimesRoman.widthOfTextAtSize(presentedText, 14);
  page.drawText(presentedText, {
    x: (width - presentedWidth) / 2,
    y: height - 188,
    size: 14,
    font: fontTimesRoman,
    color: slateDark,
  });

  // Apprentice Name (Large & Highlighted)
  const nameText = data.apprenticeName.toUpperCase();
  const nameWidth = fontTimesBold.widthOfTextAtSize(nameText, 26);
  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height - 232,
    size: 26,
    font: fontTimesBold,
    color: navy,
  });

  // Underline beneath apprentice name
  page.drawLine({
    start: { x: (width - Math.max(nameWidth + 60, 300)) / 2, y: height - 240 },
    end: { x: (width + Math.max(nameWidth + 60, 300)) / 2, y: height - 240 },
    thickness: 1.5,
    color: gold,
  });

  // Commendation Text
  const bodyText1 = isActivity2
    ? (data.customCommendation1 || 'For successfully listening to and correctly assembling all 20 accounting sentences in English and')
    : (data.customCommendation1 || 'For successfully achieving 30 consecutive correct answers (in a row) within 20s and');
  const bodyText2 = isActivity2
    ? (data.customCommendation2 || 'demonstrating auditory mastery of demonstrative pronouns and financial terminology.')
    : (data.customCommendation2 || 'demonstrating proficiency in the contextual use of THIS, THAT, THESE and THOSE in English.');
  const b1Width = fontHelvetica.widthOfTextAtSize(bodyText1, 11.5);
  const b2Width = fontHelvetica.widthOfTextAtSize(bodyText2, 11.5);

  page.drawText(bodyText1, {
    x: (width - b1Width) / 2,
    y: height - 275,
    size: 11.5,
    font: fontHelvetica,
    color: slateDark,
  });

  page.drawText(bodyText2, {
    x: (width - b2Width) / 2,
    y: height - 295,
    size: 11.5,
    font: fontHelvetica,
    color: slateDark,
  });

  // Student Details Box (Training Program & Ficha)
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

  // Detail Items inside Box
  const programLabel = 'PROGRAM:';
  const programValue = data.program || 'Gestión Contable y de Información Financiera';
  page.drawText(`${programLabel} ${programValue}`, {
    x: boxX + 24,
    y: boxY + 36,
    size: 11,
    font: fontHelveticaBold,
    color: deepNavy,
  });

  const fichaLabel = `TRAINING GROUP (FICHA): ${data.ficha || 'N/A'}`;
  const scoreLabel = isActivity2
    ? `SCORE: ${data.score}/20 (${data.percentage}%)`
    : `FINAL SCORE: ${data.score}/100 (${data.percentage}%)`;
  const dateLabel = `DATE: ${data.date}`;

  page.drawText(fichaLabel, {
    x: boxX + 24,
    y: boxY + 14,
    size: 10,
    font: fontHelvetica,
    color: slateDark,
  });

  page.drawText(scoreLabel, {
    x: boxX + 230,
    y: boxY + 14,
    size: 10,
    font: fontHelveticaBold,
    color: navy,
  });

  page.drawText(dateLabel, {
    x: boxX + 410,
    y: boxY + 14,
    size: 10,
    font: fontHelvetica,
    color: slateDark,
  });

  // Bottom Sign-off / Instructor section
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

  // Seal / Badge on bottom left
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

  return await pdfDoc.save();
}

/**
 * Downloads the certificate for either Activity 1 or Activity 2
 */
export async function downloadAnyCertificatePdf(record: any): Promise<void> {
  const isAct2 = record.activityType === 'activity2';
  const sanitizedName = (record.apprenticeName || 'Apprentice')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);
  const fichaStr = record.ficha ? `_Ficha_${record.ficha}` : '';
  const prefix = isAct2 ? 'SENA_Certificado_Activity2_' : 'SENA_Certificado_Activity1_';
  const filename = `${prefix}${sanitizedName}${fichaStr}.pdf`;

  const pdfBytes = await createCertificatePdfBytes({
    apprenticeName: record.apprenticeName || 'Apprentice',
    program: record.program || 'Gestión Contable y de Información Financiera',
    ficha: record.ficha || 'N/A',
    score: record.score || (isAct2 ? 20 : 100),
    percentage: record.percentage || 100,
    date: record.date || new Date().toLocaleDateString('es-CO'),
    performanceLabel: record.performanceLabel || (isAct2 ? 'Activity 2: 20/20 Sentences' : '30 in a row - Excellent'),
    activityType: isAct2 ? 'activity2' : 'activity1',
    customCommendation1: isAct2 
      ? 'For successfully listening to and correctly assembling all 20 accounting sentences in English and' 
      : undefined,
    customCommendation2: isAct2 
      ? 'demonstrating auditory mastery of demonstrative pronouns and financial terminology.' 
      : undefined,
  });

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  triggerDownload(blob, filename);
}

/**
 * Downloads the certificate to the user's browser (Activity 1 AttemptResult)
 */
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
