const ss = SpreadsheetApp.openById(SHEET_ID);
const sh = ss.getSheetByName('Fotos Checklist'); // nome, não gid
// sh.getRange(...).setValues(...)
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.openById('1ZNc9YQH-3fYZWFf87Pv57NiquPIMLJSd091zIxI6_mM');

  // Mapa gid->Sheet
  const mapById = Object.fromEntries(
    ss.getSheets().map(sh => [String(sh.getSheetId()), sh])
  );

  for (const [key, rows] of Object.entries(payload.sheets || {})) {
    // key pode ser "1977077338" (gid) OU "Fotos Checklist" (nome)
    const sh =
      mapById[String(key)] ||
      ss.getSheetByName(key);

    if (!sh) {
      throw new Error(`Aba não encontrada para chave '${key}' (gid ou nome).`);
    }

    if (!Array.isArray(rows) || rows.length === 0) continue;

    // Garante cabeçalhos e alinha colunas
    const headers = ensureHeaders(sh, Object.keys(rows[0]));
    const values = rows.map(obj => headers.map(h => obj[h] ?? ""));
    sh.getRange(sh.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Cria cabeçalhos se não existem e acrescenta novas colunas conforme necessário
function ensureHeaders(sh, wanted) {
  const lastCol = Math.max(1, sh.getLastColumn());
  let headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].filter(Boolean);

  if (headers.length === 0) {
    headers = wanted.slice();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    return headers;
  }

  const toAdd = wanted.filter(h => !headers.includes(h));
  if (toAdd.length) {
    sh.getRange(1, headers.length + 1, 1, toAdd.length).setValues([toAdd]);
    headers = headers.concat(toAdd);
  }
  return headers;
}
