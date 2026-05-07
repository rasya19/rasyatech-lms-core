# Panduan Koneksi Google Spreadsheet ke LuminaLMS

## Langkah 1: Siapkan Spreadsheet
1. Buat Google Spreadsheet baru.
2. Buat header di Baris 1 dengan kolom berikut secara berurutan:
   `Nama, NISN, NIPD, NIK, Password, JK, Tempat Lahir, Tanggal Lahir, Agama, Alamat, Anak Ke, Paket, Status, No HP, Nama Ayah, Pekerjaan Ayah, Nama Ibu, Pekerjaan Ibu`

## Langkah 2: Pasang Scrip
1. Di Spreadsheet, buka menu **Extensions** > **Apps Script**.
2. Salin kode dari file `google-apps-script.js` yang ada di folder ini.
3. Simpan proyek script dengan nama "API Sekolah".

## Langkah 3: Publikasikan (Deploy)
1. Klik tombol **Deploy** biru di pojok kanan atas.
2. Pilih **New Deployment**.
3. Pilih jenis **Web App**.
4. Set "Who has access" ke **Anyone**.
5. Klik **Deploy**.
6. Salin **Web App URL** yang diberikan (biasanya diawali `https://script.google.com/...`).

## Langkah 4: Konfigurasi Aplikasi
1. Buka file `.env` (atau set di Vercel).
2. Masukkan URL tersebut ke:
   `VITE_APP_URL=URL_YANG_ANDA_COPY_TADI`
3. Restart aplikasi.

## Langkah 5: Cara Penggunaan (Sinkronisasi Dua Arah)
Aplikasi ini sekarang mendukung sinkronisasi dua arah:

1. **Tombol "Ambil Cloud" (Emerald/Hijau Muda)**:
   - Gunakan ini untuk **menarik data** dari Spreadsheet masuk ke aplikasi.
   - Berguna jika Anda baru saja mengedit massal data di Excel/Spreadsheet.

2. **Tombol "Simpan Cloud" (Biru/Putih)**:
   - Gunakan ini untuk **mengirim data** hasil input Anda di aplikasi ke Spreadsheet.
   - Spreadsheet akan otomatis membuat Sheet baru (Siswa, Guru, Alumni, Keuangan) jika belum ada.
   - **PENTING**: Ini akan menimpa (overwrite) data di Sheet tersebut dengan data terbaru dari aplikasi agar data selalu sinkron.

## Contoh Struktur Tabel di Spreadsheet
Apps Script akan otomatis mengatur kolom jika Anda menggunakan tombol "Simpan Cloud". Secara umum urutannya adalah:
- **Siswa**: Nama, NISN, NIPD, NIK, Password, JK, Tempat Lahir, Tgl Lahir, Agama, Alamat, Anak Ke, Paket, Status, No HP, Ayah, Ibu.
- **Guru**: Nama, NIP, Email, Telepon, Mata Pelajaran, Alamat.
- **Keuangan**: Tanggal, Keterangan, Kategori, Tipe, Jumlah, Status.
