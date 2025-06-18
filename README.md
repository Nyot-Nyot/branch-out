<<<<<<< HEAD
# Akar Budaya - Sistem Repositori Digital Silsilah Keluarga

Sistem ini dirancang sebagai repositori digital interaktif untuk mencatat **silsilah keluarga dan riwayat komunitas** dalam suatu kampung adat di Indonesia. 

## 🎯 Project Overview

Proyek ini berhasil mengintegrasikan:
- ✅ MongoDB Atlas sebagai database cloud
- ✅ Flask sebagai backend API
- ✅ Frontend modern dengan Tailwind CSS
- ✅ Sistem CRUD lengkap untuk People, Relationships, dan Events
- ✅ Dashboard statistik real-time
- ✅ Interface yang responsif dan user-friendly

## 🚀 Quick Start

### Langkah Tercepat untuk Menjalankan Aplikasi:

1. **Buka Terminal/PowerShell di folder project**
2. **Jalankan aplikasi**: `python app.py`
3. **Buka browser**: http://localhost:5000

## Struktur Database
### Koleksi `people` (Anggota Keluarga)
```json
{
  "full_name": "Nama Lengkap",
  "native_name": "Nama Adat", 
  "gender": "male/female",
  "birth_date": "YYYY-MM-DD",
  "death_date": "YYYY-MM-DD",
  "place_of_birth": "Tempat Lahir",
  "education_level": "Tingkat Pendidikan",
  "occupations": ["Pekerjaan1", "Pekerjaan2"],
  "roles_in_community": [
    {"role": "Peran Adat", "period": "Periode"}
  ],
  "suku": "Nama Suku",
  "biography": "Biografi lengkap",
  "photos": [],
  "notes": "Catatan tambahan"
}
```

### Koleksi `relationships` (Hubungan)
```json
{
  "person_id_1": "ID Orang Pertama",
  "person_id_2": "ID Orang Kedua", 
  "type": "spouse/parent/child/sibling",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "status": "active/inactive",
  "notes": "Catatan hubungan"
}
```

### Koleksi `events` (Peristiwa)
```json
{
  "event_name": "Nama Peristiwa",
  "type": "upacara_adat/pernikahan/kelahiran/kematian/musyawarah",
  "date": "YYYY-MM-DD",
  "location": "Lokasi Peristiwa", 
  "description": "Deskripsi lengkap",
  "participants": ["ID1", "ID2", "ID3"],
  "media_url": ["URL1", "URL2"],
  "notes": "Catatan tambahan"
}
```
### Koleksi `users` (Pengguna)
```json
{
  "_id": {
    "$oid": "id"
  },
  "username": "nama",
  "email": "email",
  "password_hash": "password yang sudah di hash",
  "role": "admin/user/",
  "linked_person_id": "id orang di koleksi people",
  "created_at": "tanggal",
  "last_login": "tanggal",
  "is_active": true/false
}
```

## API Endpoints

### People (Anggota Keluarga)
- `GET /api/people` - Get semua anggota
- `GET /api/people/<id>` - Get anggota spesifik
- `POST /api/people` - Tambah anggota baru
- `PUT /api/people/<id>` - Update anggota
- `DELETE /api/people/<id>` - Hapus anggota

### Relationships (Hubungan)
- `GET /api/relationships` - Get semua hubungan
- `POST /api/relationships` - Tambah hubungan baru
- `DELETE /api/relationships/<id>` - Hapus hubungan

### Events (Peristiwa)
- `GET /api/events` - Get semua peristiwa
- `POST /api/events` - Tambah peristiwa baru
- `DELETE /api/events/<id>` - Hapus peristiwa

### Utilities
- `GET /api/statistics` - Get statistik dashboard
- `GET /api/family-tree/<id>` - Get data pohon keluarga

## Penggunaan Aplikasi

### 1. Dashboard
- Menampilkan statistik total anggota, hubungan, dan peristiwa
- Distribusi gender
- Informasi umum tentang data

### 2. Silsilah Keluarga
- Visualisasi anggota keluarga dalam bentuk kartu
- Klik "Detail" untuk melihat informasi lengkap
- Klik "+ Hubungan" untuk menambah hubungan baru
- Fitur zoom in/out dan center untuk navigasi

### 3. Timeline Peristiwa
- Menampilkan kronologi peristiwa adat dan komunitas
- Klik peristiwa untuk melihat detail dan partisipan
- Fitur edit dan hapus peristiwa

### 4. Tambah Anggota
- Form lengkap untuk menambah anggota keluarga baru
- Support untuk multiple pekerjaan dan peran adat
- Validasi data otomatis

### 5. Tambah Peristiwa
- Form untuk mendokumentasikan peristiwa baru
- Pemilihan partisipan dari daftar anggota
- Berbagai jenis peristiwa (adat, pernikahan, kelahiran, dll)

## Kontribusi

Sistem ini merupakan bagian dari tugas Praktikum Basis Data dan dapat dikembangkan lebih lanjut dengan fitur-fitur seperti:

- Authentication dan authorization
- Upload foto dan media
- Export data ke PDF/Excel
- Visualisasi pohon keluarga yang lebih kompleks
- Fitur pencarian dan filter lanjutan
- Notifikasi untuk hari-hari penting
- Backup dan restore data
