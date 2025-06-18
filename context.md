# 1. Pendahuluan

Sistem ini dirancang sebagai repositori digital interaktif untuk mencatat **silsilah keluarga dan riwayat komunitas** dalam suatu kampung adat di Indonesia. Inspirasi utama dari proyek ini berasal dari **kampung ayah saya sendiri**, di mana ada wacana dari para tokoh adat untuk mulai mendokumentasikan seluruh silsilah keluarga kampung tersebut ke dalam satu sistem digital.

## a. Latar Belakang

Kampung tempat ayah saya berasal didominasi oleh masyarakat **Suku Simabua**. Hampir semua warga di sana secara turun-temurun berasal dari satu garis keturunan, sementara warga dari suku lain yang tinggal di kampung itu umumnya adalah pendatang. Mayoritas penduduknya berasal dari satu garis keturunan, dan terdapat keyakinan lokal bahwa jika semua warga kampung dicatat silsilahnya, seluruhnya akan terhubung ke satu keluarga besar. Para tokoh adat berpendapat "_Kalau dicatokan urang kampuang ko sadonyo, ujua-ujuannyo indak kabana basambung jo paruik nan samo._"

Wacana pelestarian silsilah ini menjadi perhatian serius beberapa tokoh adat di kampung tersebut. Mereka menyadari bahwa jika tidak segera didokumentasikan secara sistematis, informasi-informasi penting—seperti struktur kekerabatan, cerita adat, dan partisipasi individu dalam peristiwa adat—akan hilang seiring berjalannya waktu.

---

## b. Permasalahan yang Ingin Diselesaikan

1. **Informasi silsilah tersebar di ingatan lisan, tidak terdokumentasi.**
2. **Bagan kertas tidak mampu menampilkan relasi kompleks antar individu.**
3. **Narasi sejarah dan peran adat sulit diakses atau bisa hilang.**
4. **Generasi muda kurang memiliki akses ke struktur keluarga besar mereka.**

---

## c. Alasan Pemilihan MongoDB / NoSQL

Sistem ini menggunakan **MongoDB**, database NoSQL bertipe document-based, karena fleksibilitas dan kemampuannya dalam menangani data semi-terstruktur yang sangat cocok dengan model data genealogis dan adat. Dalam konteks ini, **MongoDB** (sebagai Document Database) adalah pilihan yang sangat kuat. Meskipun Graph Database (seperti Neo4j) secara _native_ memang didesain untuk hubungan graf, MongoDB dapat memodelkan graf secara efektif dan memberikan fleksibilitas skema yang luar biasa yang krusial untuk data genealogi dan budaya.

### Kelebihan MongoDB dalam Konteks Ini:

- **Skema fleksibel**: Individu bisa punya atribut yang berbeda, seperti banyak foto, tidak ada tanggal lahir, atau memiliki peran adat.
- **Relasi dinamis**: Hubungan antar individu (ayah-anak, pasangan, dll) bisa disimpan sebagai dokumen terpisah atau reference antar ID, tanpa perlu tabel join seperti RDBMS.
- **Data naratif**: Biografi, narasi adat, dan deskripsi peristiwa bisa disimpan sebagai teks panjang tanpa batasan struktur.
- **Scalable dan extendable**: Koleksi bisa tumbuh tanpa perlu merombak skema.

---

## d. Analisis Kebutuhan & Konseptual Database

### Entitas yang Diidentifikasi:

1. **Individu (`people`)**
   - Memiliki atribut dasar seperti nama, tempat/tanggal lahir, pendidikan.
   - Dapat memiliki beberapa pekerjaan dan peran adat.
   - Bisa menyertakan foto dan catatan naratif.

2. **Hubungan antar individu (`relationships`)**
   - Menjelaskan relasi: pasangan, anak, saudara.
   - Bisa menyertakan metadata tambahan seperti tanggal nikah, status hubungan, dan catatan.

3. **Peristiwa komunitas (`events`)**
   - Mencatat upacara adat, musyawarah, peringatan, dan lain-lain.
   - Mencantumkan daftar partisipan (referensi ke `people`).
   - Menyimpan deskripsi naratif dan media dokumentasi.

### Alasan Pembagian Menjadi 3 Koleksi

- **`people` sebagai pusat entitas utama**: Fokus utama sistem adalah individu dalam komunitas, sehingga mereka menjadi titik awal semua referensi dan relasi.
- **`relationships` sebagai entitas relasi eksplisit**: Karena hubungan antar manusia bisa kompleks, disimpan sebagai koleksi tersendiri agar bisa ditelusuri sebagai graf dan memungkinkan kueri eksplisit (misal: siapa anaknya si A).
- **`events` sebagai konteks sosial dan historis**: Peristiwa adat menghubungkan banyak individu secara simultan; disimpan secara terpisah agar bisa dianalisis terlepas dari `people`.

### Representasi Konseptual:
![image](image.png)

---

## e. Contoh Data dari Setiap Koleksi

#### 1). Koleksi `people` (Individu)
```json
{
  "full_name": "Rangkayo Siti Ramadhani",
  "native_name": "Niniak Siti",
  "gender": "female",
  "birth_date": "1930-03-15",
  "death_date": "2020-01-01",
  "place_of_birth": "Nagari Sungai Puar, Agam",
  "education_level": "SD",
  "occupations": ["Ibu Rumah Tangga", "Penulis Naskah Kaba"],
  "roles_in_community": [
    {"role": "Bundo Kanduang", "period": "1970-2020"},
    {"role": "Penasihat Adat", "period": "1985-2020"}
  ],
  "suku": "Chaniago",
  "biography": "...",
  "photos": [{"url": "...", "caption": "..."}],
  "notes": "..."
}
```

---

#### 2). Koleksi `relationships` (Hubungan)

```json
{
  "person_id_1": "ID Niniak Siti",
  "person_id_2": "ID Datuak Rajo",
  "type": "spouse",
  "start_date": "1948-03-01",
  "end_date": "1998-05-10",
  "status": "widowed",
  "notes": "Pernikahan adat"
}
```

---

#### 3). Koleksi `events` (Peristiwa Adat/Komunitas)

```json
{
  "event_name": "Batagak Penghulu Datuak Rajo Nan Sati",
  "type": "upacara_adat",
  "date": "1960-11-20",
  "location": "Rumah Gadang Suku Koto, Nagari Sungai Puar",
  "description": "...",
  "participants": ["ID Niniak Siti", "ID Datuak Rajo", "ID Sutan Marajo"],
  "media_url": ["..."],
  "notes": "..."
}
```

#### 4). Koleksi `users`
```json
{
  "_id": {
    "$oid": "684edb43009139a20848564b"
  },
  "username": "dzaki",
  "email": "dzakisultan012@gmail.com",
  "password_hash": "$2b$10$VxYJpmWBkU6M3aZ1yazX.eJMe7t5Eu1GtPYKbX1uy5J66D9jOp7dO",
  "role": "admin",
  "linked_person_id": "6846929be045300b15f58cfc",
  "created_at": "2025-06-10T08:00:00Z",
  "last_login": "2025-06-13T14:12:00Z",
  "is_active": true
}
```

---

## f. Tujuan Proyek

Dengan sistem ini, diharapkan:

* Komunitas lokal bisa **melestarikan identitas dan silsilah mereka secara digital.**
* Generasi muda dapat **mengetahui sejarah keluarga dan adat istiadat.**
* Data komunitas bisa dianalisis untuk **riset sosial, adat, dan kekerabatan.**

Sistem ini masih dalam pengembangan tahap awal, namun telah menjadi fondasi penting menuju pelestarian warisan budaya berbasis data.