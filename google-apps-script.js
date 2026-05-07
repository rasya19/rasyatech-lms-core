/**
 * KODE UNTUK GOOGLE APPS SCRIPT (DATABASE PUSAT)
 * Tempel kode ini di Extensions > Apps Script pada Spreadsheet Anda.
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = e.parameter.sheet || ss.getSheets()[0].getName();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return errorResponse("Sheet '" + sheetName + "' tidak ditemukan.");
    
    var data = sheet.getDataRange().getValues();
    return successResponse(data);
  } catch (e) {
    return errorResponse(e.toString());
  }
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheetName = contents.sheet; // 'Siswa', 'Guru', dll
    var rows = contents.rows;       // Array of arrays (data rows)
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Bersihkan data lama dan masukkan data baru (Overwrite)
    // Atau jika ingin append (menambah), kodenya berbeda. 
    // Di sini kita gunakan overwrite agar data di Sheet = data di Platform.
    sheet.clear();
    
    if (rows && rows.length > 0) {
      sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    return successResponse({ "status": "success", "message": "Data " + sheetName + " berhasil diperbarui." });
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ "error": msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
