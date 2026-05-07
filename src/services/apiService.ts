import { Student } from '../pages/Siswa';

// Fungsi Generic untuk mengambil data mentah dari spreadsheet
async function getRawDataFromSheet(url: string, sheetName?: string): Promise<any[][]> {
  const finalUrl = sheetName ? `${url}${url.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}` : url;
  const response = await fetch(finalUrl);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return [];
  
  // Cek apakah baris pertama adalah header (biasanya string semua)
  const hasHeader = data[0].every((cellValue: any) => typeof cellValue === 'string' && cellValue.length > 0);
  return hasHeader ? data.slice(1) : data;
}

// 1. Sinkronisasi SISWA
export async function fetchSpreadsheetData(url: string): Promise<Student[]> {
  const rows = await getRawDataFromSheet(url, 'Siswa');
  return rows.map((row: any[], index: number) => ({
    id: `sheet-siswa-${Date.now()}-${index}`,
    name: String(row[0] || ''),
    nisn: String(row[1] || ''),
    nipd: String(row[2] || ''),
    nik: String(row[3] || ''),
    password: String(row[4] || '12345'),
    jk: String(row[5] || 'Laki-Laki'),
    tempatLahir: String(row[6] || ''),
    tanggalLahir: String(row[7] || ''),
    agama: String(row[8] || 'Islam'),
    alamat: String(row[9] || ''),
    anakKe: parseInt(row[10]) || 1,
    paket: String(row[11] || 'Paket C'),
    status: String(row[12] || 'Aktif'),
    noHp: String(row[13] || ''),
    namaAyah: String(row[14] || ''),
    pekerjaanAyah: String(row[15] || ''),
    namaIbu: String(row[16] || ''),
    pekerjaanIbu: String(row[17] || ''),
    mustChangePassword: false
  }));
}

// 2. Sinkronisasi GURU
export async function fetchGuruFromSheet(url: string) {
  const rows = await getRawDataFromSheet(url, 'Guru');
  return rows.map((row: any[], index: number) => ({
    id: `sheet-guru-${Date.now()}-${index}`,
    name: String(row[0] || ''),
    nip: String(row[1] || row[2] || ''),
    email: String(row[3] || ''),
    phone: String(row[4] || ''),
    mataPelajaran: String(row[5] || ''),
    alamat: String(row[6] || '')
  }));
}

// 3. Sinkronisasi ALUMNI
export async function fetchAlumniFromSheet(url: string) {
  const rows = await getRawDataFromSheet(url, 'Alumni');
  return rows.map((row: any[], index: number) => ({
    id: `sheet-alumni-${Date.now()}-${index}`,
    name: String(row[0] || ''),
    nisn: String(row[1] || ''),
    lulus: String(row[2] || ''),
    program: String(row[3] || 'Paket C'),
    status: String(row[4] || 'Alumni')
  }));
}

// 4. Sinkronisasi KEUANGAN
export async function fetchKeuanganFromSheet(url: string) {
  const rows = await getRawDataFromSheet(url, 'Keuangan');
  return rows.map((row: any[], index: number) => ({
    id: `sheet-keu-${Date.now()}-${index}`,
    date: String(row[0] || new Date().toISOString().split('T')[0]),
    title: String(row[1] || ''),
    category: (row[2] || 'Lainnya') as any,
    type: (row[3] || 'pemasukan').toLowerCase() as any,
    amount: Number(row[4]) || 0,
    status: (row[5] || 'selesai').toLowerCase() as any
  }));
}

// 5. Sinkronisasi KELAS/ROMBEL
export async function fetchKelasFromSheet(url: string) {
  const rows = await getRawDataFromSheet(url, 'Kelas');
  return rows.map((row: any[], index: number) => ({
    id: `sheet-kelas-${Date.now()}-${index}`,
    name: String(row[0] || ''),
    wali: String(row[1] || ''),
    label: String(row[2] || 'A'),
    siswaCount: Number(row[3]) || 0
  }));
}

// 6. FUNGSI UNTUK MENGIRIM DATA (PUSH) KE SPREADSHEET
export async function pushDataToSheet(url: string, sheetName: string, rows: any[][]) {
  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "no-cors", // Apps Script Web App sering membutuhkan no-cors untuk bypass CORS di browser
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheet: sheetName,
        rows: rows
      })
    });
    
    // Karena mode no-cors, kita tidak bisa membaca response JSON secara detail 
    // tapi data tetap sampai ke Google.
    return { status: "sent", message: "Instruksi pengiriman data telah dikirim." };
  } catch (error) {
    console.error("Gagal mengirim data ke spreadsheet:", error);
    throw error;
  }
}
