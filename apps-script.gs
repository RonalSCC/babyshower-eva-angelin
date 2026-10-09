// Backend del RSVP. Se pega en Extensiones > Apps Script de la hoja de Google y se publica como Web App.
// Una fila por invitado (columna A = id); si el invitado cambia su respuesta, se sobrescribe su fila.

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const id = String(d.id || '').slice(0, 64);
    // El apóstrofo evita que un nombre como "=HYPERLINK(...)" se ejecute como fórmula.
    const name = "'" + String(d.name || '').trim().slice(0, 80);
    const attending = d.attending === 'yes' ? 'Sí' : d.attending === 'no' ? 'No' : '';
    const guests = attending === 'Sí' ? Math.max(0, Math.min(5, Number(d.guests) || 0)) : 0;
    if (!id || name.length < 3 || !attending) return json({ ok: false });

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(['id', 'Nombre', 'Asiste', 'Acompañantes', 'Actualizado']);
    const row = [id, name, attending, guests, new Date()];
    const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
    const i = ids.indexOf(id);
    if (i > 0) sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
