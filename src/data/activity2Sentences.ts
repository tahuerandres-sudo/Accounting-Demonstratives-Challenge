import { Demonstrative } from '../types';

export interface WordToken {
  id: string; // Unique id for React key & tracking (e.g. s1-word-0)
  text: string; // The word text to display
  cleanText: string; // Normalized text without punctuation for matching
}

export interface Activity2Sentence {
  id: string;
  order: number; // 1 to 20
  sentence: string; // Target complete English sentence (MAX 5 WORDS)
  tokens: string[]; // Ordered list of words (max 5 items)
  demonstrative: Demonstrative;
  translation: string; // Colombian Spanish translation for SENA apprentices
  accountingTopic: string;
  phonetics: string; // Phonetic spelling / IPA guide
  grammarNote: string; // Explanation of demonstrative usage
  vocabularyNotes: { term: string; meaning: string }[];
}

/**
 * 20 Authentic Accounting sentences for SENA Apprentices.
 * STRICT REQUIREMENT: Maximum 5 words per sentence for clean, accessible listening & builder.
 * Balanced across demonstratives: 5 THIS, 5 THAT, 5 THESE, 5 THOSE.
 */
export const ACTIVITY_2_SENTENCES: Activity2Sentence[] = [
  {
    id: 'act2-s1',
    order: 1,
    sentence: 'This is our invoice.',
    tokens: ['This', 'is', 'our', 'invoice.'],
    demonstrative: 'THIS',
    translation: 'Esta es nuestra factura.',
    accountingTopic: 'Facturación y Ventas (Invoicing)',
    phonetics: '/ðɪs ɪz ˈaʊər ˈɪnvɔɪs/',
    grammarNote: '"THIS" se usa para un documento singular en la mano o sobre el escritorio (cerca).',
    vocabularyNotes: [
      { term: 'Invoice', meaning: 'Factura comercial de venta' },
      { term: 'Our', meaning: 'Nuestro / nuestra (posesivo de la empresa)' }
    ]
  },
  {
    id: 'act2-s2',
    order: 2,
    sentence: 'That ledger is balanced.',
    tokens: ['That', 'ledger', 'is', 'balanced.'],
    demonstrative: 'THAT',
    translation: 'Ese libro mayor está cuadrado.',
    accountingTopic: 'Libro Mayor (General Ledger)',
    phonetics: '/ðæt ˈlɛdʒər ɪz ˈbælənst/',
    grammarNote: '"THAT" se usa para un libro contable singular ubicado a cierta distancia (lejos).',
    vocabularyNotes: [
      { term: 'Ledger', meaning: 'Libro mayor contable' },
      { term: 'Balanced', meaning: 'Cuadrado / saldos iguales (débito = crédito)' }
    ]
  },
  {
    id: 'act2-s3',
    order: 3,
    sentence: 'These receipts are ready.',
    tokens: ['These', 'receipts', 'are', 'ready.'],
    demonstrative: 'THESE',
    translation: 'Estos recibos están listos.',
    accountingTopic: 'Recibos y Comprobantes (Receipts)',
    phonetics: '/ðiːz rɪˈsiːts ɑːr ˈrɛdi/',
    grammarNote: '"THESE" se usa para varios documentos en plural que tienes en mano (cerca).',
    vocabularyNotes: [
      { term: 'Receipts', meaning: 'Recibos de caja o comprobantes' },
      { term: 'Ready', meaning: 'Listos / preparados para contabilizar' }
    ]
  },
  {
    id: 'act2-s4',
    order: 4,
    sentence: 'Those reports are audited.',
    tokens: ['Those', 'reports', 'are', 'audited.'],
    demonstrative: 'THOSE',
    translation: 'Aquellos informes están auditados.',
    accountingTopic: 'Auditoría Contable (Audit Reports)',
    phonetics: '/ðoʊz rɪˈpɔːrts ɑːr ˈɔːdɪtɪd/',
    grammarNote: '"THOSE" se usa para varios informes en plural guardados a distancia en el estante (lejos).',
    vocabularyNotes: [
      { term: 'Reports', meaning: 'Informes o reportes financieros' },
      { term: 'Audited', meaning: 'Auditados / verificados por control interno' }
    ]
  },
  {
    id: 'act2-s5',
    order: 5,
    sentence: 'This is petty cash.',
    tokens: ['This', 'is', 'petty', 'cash.'],
    demonstrative: 'THIS',
    translation: 'Esta es la caja menor.',
    accountingTopic: 'Caja Menor (Petty Cash)',
    phonetics: '/ðɪs ɪz ˈpɛti kæʃ/',
    grammarNote: '"THIS" se refiere a la caja o fondo de efectivo singular que tienes aquí en la oficina.',
    vocabularyNotes: [
      { term: 'Petty cash', meaning: 'Caja menor / fondo fijo de gastos menores' },
      { term: 'Cash', meaning: 'Efectivo disponible' }
    ]
  },
  {
    id: 'act2-s6',
    order: 6,
    sentence: 'That check is signed.',
    tokens: ['That', 'check', 'is', 'signed.'],
    demonstrative: 'THAT',
    translation: 'Ese cheque está firmado.',
    accountingTopic: 'Títulos Valores (Checks & Payments)',
    phonetics: '/ðæt tʃɛk ɪz saɪnd/',
    grammarNote: '"THAT" se usa para un cheque singular sobre la mesa de tesorería (lejos).',
    vocabularyNotes: [
      { term: 'Check', meaning: 'Cheque bancario / orden de pago' },
      { term: 'Signed', meaning: 'Firmado con firma autorizada' }
    ]
  },
  {
    id: 'act2-s7',
    order: 7,
    sentence: 'These accounts are reconciled.',
    tokens: ['These', 'accounts', 'are', 'reconciled.'],
    demonstrative: 'THESE',
    translation: 'Estas cuentas están conciliadas.',
    accountingTopic: 'Conciliación Bancaria (Reconciliation)',
    phonetics: '/ðiːz əˈkaʊnts ɑːr ˈrɛkənsaɪld/',
    grammarNote: '"THESE" se emplea para varias cuentas bancarias en plural que estás verificando hoy.',
    vocabularyNotes: [
      { term: 'Accounts', meaning: 'Cuentas contables o bancarias' },
      { term: 'Reconciled', meaning: 'Conciliadas / cotejadas con el extracto' }
    ]
  },
  {
    id: 'act2-s8',
    order: 8,
    sentence: 'Those taxes are paid.',
    tokens: ['Those', 'taxes', 'are', 'paid.'],
    demonstrative: 'THOSE',
    translation: 'Aquellos impuestos están pagados.',
    accountingTopic: 'Obligaciones Tributarias (Taxes)',
    phonetics: '/ðoʊz ˈtæksɪz ɑːr peɪd/',
    grammarNote: '"THOSE" se usa para declaraciones o impuestos en plural de períodos anteriores archivados.',
    vocabularyNotes: [
      { term: 'Taxes', meaning: 'Impuestos / tributos (DIAN, IVA, Renta)' },
      { term: 'Paid', meaning: 'Pagados / cancelados oportunamente' }
    ]
  },
  {
    id: 'act2-s9',
    order: 9,
    sentence: 'This balance is correct.',
    tokens: ['This', 'balance', 'is', 'correct.'],
    demonstrative: 'THIS',
    translation: 'Este saldo está correcto.',
    accountingTopic: 'Balance de Comprobación (Trial Balance)',
    phonetics: '/ðɪs ˈbæləns ɪz kəˈrɛkt/',
    grammarNote: '"THIS" se usa para el saldo o balance singular en la pantalla frente a ti.',
    vocabularyNotes: [
      { term: 'Balance', meaning: 'Saldo contable / balance' },
      { term: 'Correct', meaning: 'Correcto / exacto sin discrepancias' }
    ]
  },
  {
    id: 'act2-s10',
    order: 10,
    sentence: 'That voucher is valid.',
    tokens: ['That', 'voucher', 'is', 'valid.'],
    demonstrative: 'THAT',
    translation: 'Ese comprobante es válido.',
    accountingTopic: 'Comprobantes de Pago (Payment Vouchers)',
    phonetics: '/ðæt ˈvaʊtʃər ɪz ˈvælɪd/',
    grammarNote: '"THAT" señala un comprobante de egreso singular ubicado en la ventanilla (lejos).',
    vocabularyNotes: [
      { term: 'Voucher', meaning: 'Comprobante de egreso o soporte contable' },
      { term: 'Valid', meaning: 'Válido y legalmente vigente' }
    ]
  },
  {
    id: 'act2-s11',
    order: 11,
    sentence: 'These bills are pending.',
    tokens: ['These', 'bills', 'are', 'pending.'],
    demonstrative: 'THESE',
    translation: 'Estas facturas están pendientes.',
    accountingTopic: 'Cuentas por Pagar (Accounts Payable)',
    phonetics: '/ðiːz bɪlz ɑːr ˈpɛndɪŋ/',
    grammarNote: '"THESE" se usa para facturas por pagar en plural que tienes en tu carpeta actual.',
    vocabularyNotes: [
      { term: 'Bills', meaning: 'Facturas de proveedores por pagar' },
      { term: 'Pending', meaning: 'Pendientes de aprobación o giro' }
    ]
  },
  {
    id: 'act2-s12',
    order: 12,
    sentence: 'Those files are archived.',
    tokens: ['Those', 'files', 'are', 'archived.'],
    demonstrative: 'THOSE',
    translation: 'Aquellos expedientes están archivados.',
    accountingTopic: 'Archivo Documental (Archives)',
    phonetics: '/ðoʊz faɪlz ɑːr ˈɑːrkaɪvd/',
    grammarNote: '"THOSE" se refiere a expedientes o carpetas en plural en la estantería del fondo.',
    vocabularyNotes: [
      { term: 'Files', meaning: 'Expedientes / legajos contables' },
      { term: 'Archived', meaning: 'Archivados en custodia documental' }
    ]
  },
  {
    id: 'act2-s13',
    order: 13,
    sentence: 'This audit is complete.',
    tokens: ['This', 'audit', 'is', 'complete.'],
    demonstrative: 'THIS',
    translation: 'Esta auditoría está completa.',
    accountingTopic: 'Auditoría Interna (Internal Audit)',
    phonetics: '/ðɪs ˈɔːdɪt ɪz kəmˈpliːt/',
    grammarNote: '"THIS" se usa para el proceso o informe de auditoría singular recién finalizado aquí.',
    vocabularyNotes: [
      { term: 'Audit', meaning: 'Auditoría o revisión fiscal' },
      { term: 'Complete', meaning: 'Completa y dictaminada' }
    ]
  },
  {
    id: 'act2-s14',
    order: 14,
    sentence: 'That invoice has VAT.',
    tokens: ['That', 'invoice', 'has', 'VAT.'],
    demonstrative: 'THAT',
    translation: 'Esa factura tiene IVA.',
    accountingTopic: 'Impuesto al Valor Agregado (VAT / IVA)',
    phonetics: '/ðæt ˈɪnvɔɪs hæz viː-eɪ-tiː/',
    grammarNote: '"THAT" señala una factura singular que está en el escritorio contiguo.',
    vocabularyNotes: [
      { term: 'VAT', meaning: 'Value Added Tax (IVA en Colombia: 19%)' },
      { term: 'Invoice', meaning: 'Factura con discriminación tributaria' }
    ]
  },
  {
    id: 'act2-s15',
    order: 15,
    sentence: 'These debts are settled.',
    tokens: ['These', 'debts', 'are', 'settled.'],
    demonstrative: 'THESE',
    translation: 'Estas deudas están saldadas.',
    accountingTopic: 'Pasivos y Deudas (Liabilities & Debts)',
    phonetics: '/ðiːz dɛts ɑːr ˈsɛtəld/',
    grammarNote: '"THESE" se emplea para varias deudas o pasivos en plural que figuran saldados en la lista.',
    vocabularyNotes: [
      { term: 'Debts', meaning: 'Deudas o pasivos financieros' },
      { term: 'Settled', meaning: 'Saldadas / liquidadas en su totalidad' }
    ]
  },
  {
    id: 'act2-s16',
    order: 16,
    sentence: 'Those assets are depreciated.',
    tokens: ['Those', 'assets', 'are', 'depreciated.'],
    demonstrative: 'THOSE',
    translation: 'Aquellos activos están depreciados.',
    accountingTopic: 'Propiedad, Planta y Equipo (Fixed Assets)',
    phonetics: '/ðoʊz ˈæsɛts ɑːr dɪˈpriːʃieɪtɪd/',
    grammarNote: '"THOSE" describe activos fijos en plural ubicados en la planta o sucursal lejana.',
    vocabularyNotes: [
      { term: 'Assets', meaning: 'Activos fijos (maquinaria, equipos)' },
      { term: 'Depreciated', meaning: 'Depreciados contablemente' }
    ]
  },
  {
    id: 'act2-s17',
    order: 17,
    sentence: 'This budget is approved.',
    tokens: ['This', 'budget', 'is', 'approved.'],
    demonstrative: 'THIS',
    translation: 'Este presupuesto está aprobado.',
    accountingTopic: 'Presupuesto Empresarial (Budgeting)',
    phonetics: '/ðɪs ˈbʌdʒɪt ɪz əˈpruːvd/',
    grammarNote: '"THIS" se usa para el presupuesto singular que la junta tiene sobre la mesa.',
    vocabularyNotes: [
      { term: 'Budget', meaning: 'Presupuesto de ingresos y gastos' },
      { term: 'Approved', meaning: 'Aprobado por gerencia general' }
    ]
  },
  {
    id: 'act2-s18',
    order: 18,
    sentence: 'That loss was recorded.',
    tokens: ['That', 'loss', 'was', 'recorded.'],
    demonstrative: 'THAT',
    translation: 'Esa pérdida fue registrada.',
    accountingTopic: 'Estado de Resultados (Income Statement)',
    phonetics: '/ðæt lɔːs wʌz rɪˈkɔːrdɪd/',
    grammarNote: '"THAT" señala una pérdida financiera singular asentada en el libro del período pasado.',
    vocabularyNotes: [
      { term: 'Loss', meaning: 'Pérdida contable o deterioro' },
      { term: 'Recorded', meaning: 'Asentada o registrada en libros' }
    ]
  },
  {
    id: 'act2-s19',
    order: 19,
    sentence: 'These notes are verified.',
    tokens: ['These', 'notes', 'are', 'verified.'],
    demonstrative: 'THESE',
    translation: 'Estas notas están verificadas.',
    accountingTopic: 'Notas Contables (Accounting Notes)',
    phonetics: '/ðiːz noʊts ɑːr ˈvɛrɪfaɪd/',
    grammarNote: '"THESE" se usa para notas débito o crédito en plural que tienes ante ti.',
    vocabularyNotes: [
      { term: 'Notes', meaning: 'Notas débito, crédito o de contabilidad' },
      { term: 'Verified', meaning: 'Verificadas y auditadas con soportes' }
    ]
  },
  {
    id: 'act2-s20',
    order: 20,
    sentence: 'Those journals are closed.',
    tokens: ['Those', 'journals', 'are', 'closed.'],
    demonstrative: 'THOSE',
    translation: 'Aquellos libros diarios están cerrados.',
    accountingTopic: 'Cierre Contable Anual (Closing Journals)',
    phonetics: '/ðoʊz ˈdʒɜːrnəlz ɑːr kloʊzd/',
    grammarNote: '"THOSE" se usa para libros diarios en plural del ejercicio anterior archivados (lejos).',
    vocabularyNotes: [
      { term: 'Journals', meaning: 'Libros diarios o asientos de diario' },
      { term: 'Closed', meaning: 'Cerrados tras el balance final' }
    ]
  }
];

// Helper to get scrambled tokens for a sentence with unique item IDs
export function getScrambledTokens(sentence: Activity2Sentence): WordToken[] {
  const cleanPunctuation = (w: string) => w.replace(/[.,?!]/g, '');

  const tokens: WordToken[] = sentence.tokens.map((word, idx) => ({
    id: `${sentence.id}-w${idx}-${word}`,
    text: word,
    cleanText: cleanPunctuation(word).toLowerCase()
  }));

  // Fisher-Yates shuffle that guarantees it is not in identical target order
  const shuffled = [...tokens];
  let isIdentical = true;
  let attempts = 0;

  while (isIdentical && attempts < 10) {
    attempts++;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Check if shuffled matches original order
    isIdentical = shuffled.every((token, index) => token.id === tokens[index].id);
  }

  return shuffled;
}

// Normalizes a string for sentence comparison
export function normalizeSentence(str: string): string {
  return str
    .replace(/[.,?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
