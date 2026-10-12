# Employee Attendance & Monitoring System (Enterprise Fullstack)

> **Created by Nisfal Filsa** &bull; Fullstack Developer Skill Test

Sistem Absensi Karyawan WFH dan Monitoring HRD berbasis **NestJS Microservices Architecture**, **React.js**, **Dual Database Separation**, **Message Queue / Event Streaming**, dan **Realtime WebSockets (Socket.io)**.

---

## 🚀 Fitur Utama

### 1. Aplikasi Absensi WFH Karyawan (Mobile & Desktop Responsive)
- **Autentikasi**: Login menggunakan kombinasi email perusahaan dan password dengan JWT token.
- **Profil Karyawan**:
  - Menampilkan informasi profil lengkap: Nama, Email Perusahaan, Foto Profil, Posisi/Jabatan, dan Nomor Handphone.
  - Karyawan dapat memperbarui Foto Profil, Nomor Handphone, dan Password.
  - **Realtime Alert ke Admin**: Begitu profil diubah, popup alert otomatis muncul seketika di dashboard Admin HRD via **Socket.io**.
  - **Asynchronous Data Stream / Audit Logging**: Event pembaruan profil dikirimkan via **Message Queue / Event Stream** ke **Audit Microservice** dan dicatat ke **Database Audit terpisah**.
- **Absen Masuk & Pulang**:
  - Melakukan absensi masuk (Clock In) dan absensi pulang (Clock Out).
  - Menangkap tanggal, waktu real-time, dan status kehadiran (`MASUK` / `PULANG`).
- **Summary Absensi**:
  - Menampilkan riwayat absensi dengan tampilan default awal bulan berjalan s/d hari ini.
  - Dilengkapi fitur pencarian dengan filter rentang tanggal (*Date Range Picker*: From - To).
  - Menampilkan Tanggal, Jam Masuk, dan Jam Pulang.

### 2. Aplikasi Monitoring Karyawan (HRD Admin)
- **Master Data Karyawan**:
  - Menambahkan data karyawan baru.
  - Memperbarui data karyawan yang sudah ada.
- **Monitoring Absensi Real-time (Read Only)**:
  - Melihat seluruh rekaman absensi yang telah disubmit oleh semua karyawan.
  - Pencarian dan filter berdasarkan tanggal serta nama karyawan.
- **Live Notification Banner & Toast**:
  - Menerima notifikasi langsung tanpa refresh halaman saat ada karyawan yang memperbarui nomor HP atau foto profil.
- **Audit Logs Viewer (Bonus)**:
  - Memantau log perubahan data yang berhasil diproses oleh microservice di database audit terpisah.

---

## 🏗️ Arsitektur Sistem

```
+-----------------------------------------------------------------------------------+
|                        Frontend Web (React.js + Tailwind CSS)                     |
|         [Portal Karyawan WFH]               [Portal Admin HRD Monitoring]         |
+-----------------------------------------------------------------------------------+
             | REST API                                    ^ WebSocket (Socket.io)
             v                                             |
+-----------------------------------------------------------------------------------+
|                  NestJS API Gateway & Core Service (Port 3000)                    |
|  - Auth & JWT Guard         - Employee Service         - Attendance Service       |
|  - Prisma Client (App DB)   - Event Publisher          - WebSocket Gateway        |
+-----------------------------------------------------------------------------------+
             |                                             |
             | (1) Simpan Data Operasional                 | (2) Publish Event
             v                                             v
+-----------------------------+               +-------------------------------------+
| Primary Database (App DB)   |               | Message Queue / Event Broker        |
| - Users / Employees         |               | Queue: 'employee.profile.updated'   |
| - Attendances (In / Out)    |               +-------------------------------------+
+-----------------------------+                                    |
                                                                   v (3) Consume Event
                                              +-------------------------------------+
                                              | Audit Microservice (Port 3001)      |
                                              | - Event Consumer / Worker           |
                                              | - Prisma Client (Audit DB)          |
                                              +-------------------------------------+
                                                                   |
                                                                   v (4) Simpan Log
                                              +-------------------------------------+
                                              | Separate Audit Database             |
                                              | - Audit Logs / Activity History     |
                                              +-------------------------------------+
```

---

## 🛠️ Tech Stack

- **Backend**:
  - **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
  - **Architecture**: Modular Microservices Pattern
  - **Realtime**: `@nestjs/websockets` + Socket.io
  - **Message Queue**: RabbitMQ Client / NestJS Event Stream Microservice
  - **ORM**: Prisma ORM v6
  - **Databases**:
    - `Primary App DB`: PostgreSQL (atau SQLite lokal untuk evaluasi cepat tanpa Docker)
    - `Audit Log DB`: PostgreSQL Terpisah (atau SQLite Audit DB terpisah)
- **Frontend**:
  - **Framework**: [React.js](https://react.dev/) 19 (Vite + TypeScript)
  - **Styling**: Tailwind CSS + Lucide React Icons
  - **Client State & HTTP**: Axios, React Router v7
  - **Realtime Client**: `socket.io-client`

---

## 📁 Struktur Direktori

```
ess/
├── apps/
│   ├── api-gateway/            # NestJS API Gateway & Realtime Socket.io Server
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema Primary Database
│   │   └── src/
│   │       ├── auth/           # Login, JWT, Roles
│   │       ├── employees/      # Profil & update data
│   │       ├── attendance/     # Clock-in/out & Summary
│   │       ├── admin/          # HRD Admin management & monitoring
│   │       ├── websocket/      # Socket.io notification gateway
│   │       └── messaging/      # Message Queue publisher
│   │
│   ├── audit-service/          # NestJS Microservice Consumer
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Schema Audit Log Database (Terpisah)
│   │   └── src/
│   │       └── audit/          # Queue consumer & audit log persistence
│   │
│   └── web/                    # React.js Frontend Application
│       └── src/
│           ├── components/     # Custom Reusable Components (Modal, Toast, Card, dll)
│           ├── pages/
│           │   ├── employee/   # Profil, Absen Masuk/Pulang, Summary Absensi
│           │   ├── admin/      # Kelola Karyawan, Monitoring Absensi, Audit Logs
│           │   └── auth/       # Login Karyawan & Admin
│           └── services/       # Axios API client & WebSocket client
│
├── docker-compose.yml          # Konfigurasi container PostgreSQL & RabbitMQ
├── .gitignore
└── README.md
```

---

## ⚡ Panduan Menjalankan Aplikasi (Quick Start)

### 1. Prasyarat
- **Node.js** (v18 ke atas, disarankan v20+)
- **npm** atau **yarn**
- *(Opsional)* Docker & Docker Compose (jika ingin menjalankan PostgreSQL & RabbitMQ via container)

### 2. Konfigurasi Environment
Salin file `.env.example` ke `.env` pada masing-masing sub-folder atau gunakan nilai default yang telah disiapkan secara out-of-the-box.

### 3. Instalasi Dependensi
Jalankan perintah berikut di root folder:
```bash
npm run install:all
```
*Atau masuk ke masing-masing folder (`apps/api-gateway`, `apps/audit-service`, `apps/web`) dan jalankan `npm install`.*

### 4. Setup Database & Seeding
Inisialisasi schema dan data sample:
```bash
npm run db:setup
```
Data awal yang telah disiapkan:
- **Akun HRD Admin**:
  - Email: `admin.hrd@company.com`
  - Password: `Password123!`
- **Akun Karyawan WFH**:
  - Email: `budi.santoso@company.com`
  - Password: `Password123!`
  - Email: `siti.aminah@company.com`
  - Password: `Password123!`

### 5. Menjalankan Semua Layanan
Jalankan seluruh service secara simultan:
```bash
npm run start:dev
```
Layanan akan aktif di alamat:
- **Frontend Web**: `http://localhost:5173`
- **NestJS API Gateway**: `http://localhost:3000`
- **NestJS Audit Microservice**: `http://localhost:3001`
- **Socket.io Gateway**: `ws://localhost:3000`

---

## 🧪 Alur Pengujian Fitur (Testing Flow)

1. **Buka Dua Tab Browser**:
   - Tab 1: Login sebagai **Admin HRD** (`admin.hrd@company.com` / `Password123!`).
   - Tab 2: Buka di window terpisah / incognito, login sebagai **Karyawan** (`budi.santoso@company.com` / `Password123!`).
2. **Uji Realtime Alert & Message Queue**:
   - Di Tab Karyawan, masuk ke menu **Profil Karyawan**.
   - Ubah Nomor Handphone atau Foto Profil, lalu klik **Simpan**.
   - Perhatikan Tab Admin HRD: **Popup Alert notifikasi langsung muncul di layar Admin secara realtime tanpa refresh!**
   - Buka tab Admin menu **Audit Log** (atau cek database audit) untuk melihat bahwa payload perubahan telah berhasil masuk ke Database Audit terpisah melalui Message Queue.
3. **Uji Absensi Masuk & Pulang**:
   - Di Tab Karyawan, klik menu **Absen**.
   - Klik tombol **Absen Masuk**, amati rekaman jam masuk tercatat.
   - Klik tombol **Absen Pulang**, amati status berganti menjadi telah absen pulang.
4. **Uji Summary Absensi**:
   - Klik menu **Summary Absen**.
   - Secara default data menampilkan riwayat bulan berjalan s/d hari ini.
   - Coba gunakan filter rentang tanggal (*From - To*) lalu klik **Cari**.
5. **Uji Admin HRD Monitoring**:
   - Masuk ke menu **Monitoring Absen** untuk melihat data seluruh karyawan secara read-only.
   - Masuk ke menu **Master Karyawan** untuk menambah atau mengupdate data karyawan.

---

## 📄 Ringkasan Endpoint REST API

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Login user (karyawan / admin) | Public |
| `GET` | `/api/v1/auth/me` | Cek profil user login aktif | Authenticated |
| `GET` | `/api/v1/employees/profile` | Ambil data profil karyawan | Employee |
| `PUT` | `/api/v1/employees/profile` | Update foto, no handphone, password | Employee |
| `POST` | `/api/v1/attendance/clock-in` | Absen masuk hari ini | Employee |
| `POST` | `/api/v1/attendance/clock-out` | Absen pulang hari ini | Employee |
| `GET` | `/api/v1/attendance/today` | Status absensi hari ini | Employee |
| `GET` | `/api/v1/attendance/summary` | Summary absensi (date range filter) | Employee |
| `GET` | `/api/v1/admin/employees` | List seluruh data karyawan | Admin HRD |
| `POST` | `/api/v1/admin/employees` | Tambah karyawan baru | Admin HRD |
| `PUT` | `/api/v1/admin/employees/:id` | Update data karyawan | Admin HRD |
| `GET` | `/api/v1/admin/attendance` | Monitoring absensi seluruh karyawan | Admin HRD |
| `GET` | `/api/v1/admin/audit-logs` | List log audit dari database terpisah | Admin HRD |
