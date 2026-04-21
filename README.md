# Latihan JavaScript - PWEB

Project ini berisi 1 halaman web dengan seamless tab button yang mencakup 3 latihan:

1. Form registrasi mahasiswa dengan autocomplete nama dan validasi.
2. Pencarian kode pos Indonesia berdasarkan Provinsi -> Kabupaten/Kota -> Kecamatan.
3. Demo dropdown dinamis kamera populer (brand -> model).

Autocomplete nama mahasiswa mengambil data dari API publik dan menyimpan cache di localStorage.
Jika API gagal, sistem otomatis fallback ke data lokal.

Untuk field mata kuliah dan dosen, aplikasi mengambil data dari halaman resmi
Departemen Teknik Informatika ITS (daftar dosen dan kurikulum) melalui endpoint
proxy read-only agar bisa diproses di browser. Jika fetch gagal, sistem tetap
pakai fallback lokal.

Saat ini mode live fetch ITS dimatikan secara default di browser karena endpoint
proxy publik sering terkena batasan CORS/rate-limit. Form tetap menggunakan
cache + daftar fallback berbasis data ITS agar tetap stabil.

## Cara Menjalankan

Karena ini project vanilla HTML/CSS/JS, cukup buka file `index.html` di browser.

Agar fetch API berjalan lebih aman, disarankan jalankan lewat local server sederhana.
Contoh (jika punya Node.js):

```bash
npx serve .
```

Lalu buka URL lokal yang ditampilkan server.

## API yang Dipakai

- Wilayah Indonesia (provinsi, kabupaten/kota, kecamatan):
  - `https://emsifa.github.io/api-wilayah-indonesia/api`
- Lookup kode pos:
  - `https://kodepos.vercel.app/search/?q=...`
- Rekomendasi nama mahasiswa:
  - `https://randomuser.me/api/?results=120&nat=id&inc=name`
  - `https://fakerapi.it/api/v1/persons?_quantity=120&_locale=id_ID`
- Sumber dosen ITS TI:
  - `http://www.its.ac.id/informatika/id/dosen-staff/daftar-dosen/`
- Sumber kurikulum ITS TI:
  - `http://www.its.ac.id/informatika/id/akademik/kurikulum-silabus-s1/`
- Proxy read-only untuk parsing konten:
  - `https://r.jina.ai/http://...`

## Aturan Validasi Form

- Semua field wajib diisi.
- Nama mahasiswa hanya huruf dan spasi.
- NRP wajib angka dengan panjang tepat 10 digit.
- Error ditampilkan per field saat submit.
