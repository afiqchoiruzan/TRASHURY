# Panduan Integrasi AI ke Frontend PWA (untuk Frontend Engineer)

Dokumen ini adalah panduan praktis siap pakai untuk mengintegrasikan seluruh modul AI **TRASHURY** ke Frontend PWA (`frontend/`):
1. **Klasifikasi Sampah Hybrid Cloud-Edge** (`SigLIP-SO400M` di Hugging Face Spaces saat online → otomatis *fallback* ke `EfficientNet-B2` ONNX lokal saat offline/timeout).
2. **Top-3 Smart Suggestion & Peringatan Kontaminasi**.
3. **Peramalan Volume Setoran (*Forecasting*)** untuk grafik dasbor.

Semua kontrak tipe, UUID kategori, helper Hybrid Router, dan engine *forecasting* sudah tersedia di paket **`@trashury/shared`**.

---

## 1. Persiapan Paket & Aset Model

### 1.1 Install Dependensi di `frontend/`
```bash
npm --workspace @trashury/frontend install @gradio/client onnxruntime-web
```

### 1.2 Salin Model Edge ONNX ke Folder Public PWA
Salin berkas model dari root repo `models/klasifikasi-sampah-v3.onnx` (`29.41 MB`) ke:
```text
frontend/public/models/klasifikasi-sampah-v3.onnx
```
*(Pastikan Service Worker PWA ikut men-cache `/models/klasifikasi-sampah-v3.onnx` agar tetap bisa berjalan saat perangkat 100% offline.)*

---

## 2. Service Klasifikasi Hybrid Cloud-Edge (`src/services/aiKlasifikasi.ts`)

Buat 1 file service di frontend — contoh kode di bawah sudah siap copy-paste:

```ts
import { Client, handle_file } from '@gradio/client';
import * as ort from 'onnxruntime-web';
import {
  KONFIGURASI_HYBRID_AI,
  KONFIGURASI_PREPROCESSING_AI,
  klasifikasiHybridAi,
  terjemahkanLogitsKlasifikasi,
  validasiResponCloudAi,
  type HasilKlasifikasiAi,
  type HasilKlasifikasiHybrid,
} from '@trashury/shared';

let sesiEdgeCache: ort.InferenceSession | null = null;
let klienGradioCache: Client | null = null;

/** Memuat sesi ONNX Edge lokal sekali saja lalu di-cache di memori */
async function dapatkanSesiEdge(): Promise<ort.InferenceSession> {
  if (!sesiEdgeCache) {
    sesiEdgeCache = await ort.InferenceSession.create(
      KONFIGURASI_HYBRID_AI.edgeModelPath,
      { executionProviders: ['wasm'] }
    );
  }
  return sesiEdgeCache;
}

/** Preprocessing gambar ke tensor Float32 [1, 3, 260, 260] normalisasi ImageNet */
async function gambarKeTensorEdge(blob: Blob): Promise<ort.Tensor> {
  const { lebar, tinggi, mean, std } = KONFIGURASI_PREPROCESSING_AI.klasifikasi;
  const bitmap = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = lebar;
  canvas.height = tinggi;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D tidak tersedia');
  ctx.drawImage(bitmap, 0, 0, lebar, tinggi);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, lebar, tinggi);
  const luas = lebar * tinggi;
  const floatData = new Float32Array(3 * luas);

  for (let i = 0; i < luas; i++) {
    const r = data[i * 4]! / 255;
    const g = data[i * 4 + 1]! / 255;
    const b = data[i * 4 + 2]! / 255;
    floatData[i] = (r - mean[0]) / std[0];
    floatData[luas + i] = (g - mean[1]) / std[1];
    floatData[2 * luas + i] = (b - mean[2]) / std[2];
  }

  return new ort.Tensor('float32', floatData, [1, 3, tinggi, lebar]);
}

/** Inferensi Cloud AI (SigLIP-SO400M di Hugging Face Spaces) */
async function jalankanCloudSiglip(blob: Blob, beratKg: number): Promise<HasilKlasifikasiAi> {
  if (!klienGradioCache) {
    klienGradioCache = await Client.connect(KONFIGURASI_HYBRID_AI.cloudSpaceId);
  }
  const res = await klienGradioCache.predict(KONFIGURASI_HYBRID_AI.cloudApiEndpoint, {
    image: handle_file(blob),
    berat_kg: beratKg,
  });

  // Gradio mengembalikan [labelScores, detailJson]; detailJson ada di indeks 1
  const data = res.data as unknown[];
  return validasiResponCloudAi(data[1]);
}

/** Inferensi Edge AI Lokal (EfficientNet-B2 ONNX di browser) */
async function jalankanEdgeOnnx(blob: Blob): Promise<HasilKlasifikasiAi> {
  const sesi = await dapatkanSesiEdge();
  const tensor = await gambarKeTensorEdge(blob);
  const inputName = sesi.inputNames[0] ?? 'input';
  const outputMap = await sesi.run({ [inputName]: tensor });
  const outputName = sesi.outputNames[0] ?? 'output';
  const logits = Array.from(outputMap[outputName]!.data as Float32Array);
  return terjemahkanLogitsKlasifikasi(logits, 3);
}

/**
 * Fungsi utama yang dipanggil komponen UI Kasir saat petugas memotret/upload foto sampah.
 */
export async function prediksiSampahHybrid(
  fotoBlob: Blob,
  beratKg = 1.0
): Promise<HasilKlasifikasiHybrid> {
  return klasifikasiHybridAi({
    isOnline: navigator.onLine,
    timeoutMs: KONFIGURASI_HYBRID_AI.cloudTimeoutMs, // 5000 ms
    panggilCloud: () => jalankanCloudSiglip(fotoBlob, beratKg),
    panggilEdge: () => jalankanEdgeOnnx(fotoBlob),
  });
}
```

---

## 3. Panduan Tampilan UI Kasir (Top-3, Badge Mode, & Kontaminasi)

Hasil dari `prediksiSampahHybrid(fotoBlob, beratKg)` berisi field berikut:

| Field | Kegunaan di UI Kasir |
|---|---|
| `kategori.id_kategori` | UUID v4 kategori terpilih otomatis (siap kirim ke `POST /api/v1/transaksi`) |
| `kategori.nama_kategori` | Nama lokal Bahasa Indonesia (misal `"Botol Plastik (PET)"`) |
| `confidence` | Skor keyakinan `0..1` (tampilkan sebagai `(confidence * 100).toFixed(0) + '%'`) |
| `kandidat_teratas` | Array **Top-3 Smart Suggestion**: pilih #1 otomatis, tampilkan #2 & #3 sebagai tombol chip 1-klik |
| `peringatan_kontaminasi` | Array string: tampilkan banner kuning/merah jika tidak kosong (`food waste` / `Glass Shards`) |
| `mode` | `'cloud-siglip'` → tampilkan badge **Cloud AI (Akurasi Tinggi)**; `'edge-efficientnet'` → tampilkan badge **Offline Edge AI** |
| `latency_ms` | Opsional untuk indikator kecepatan inferensi |

### Mencatat `sumber_klasifikasi` untuk Transaksi
* Jika petugas langsung menerima rekomendasi #1 atau memilih dari `kandidat_teratas` → kirim `sumber_klasifikasi: 'ai'`.
* Jika petugas mengganti ke kategori lain di luar rekomendasi AI → kirim `sumber_klasifikasi: 'manual'`.

---

## 4. Integrasi Forecasting di Dasbor (`ramalVolumeSetoran`)

Untuk menampilkan proyeksi berat sampah, estimasi kebutuhan dana kas, dan target reduksi $\text{CO}_2\text{e}$ 3 bulan ke depan di halaman Dasbor:

```ts
import { ramalVolumeSetoran, MASTER_KATEGORI_SAMPAH } from '@trashury/shared';

const kategoriPet = MASTER_KATEGORI_SAMPAH[8]!; // Botol Plastik (PET)

const hasilForecast = ramalVolumeSetoran(
  [
    { bulan: '2026-07', total_berat_kg: 120 },
    { bulan: '2026-08', total_berat_kg: 138 },
    { bulan: '2026-09', total_berat_kg: 152 },
  ],
  {
    namaKategori: kategoriPet.nama_kategori,
    hargaPerKg: kategoriPet.harga_per_kg,
    faktorCo2ePerKg: kategoriPet.faktor_co2e_per_kg,
    jumlahBulanKedepan: 3,
  }
);

// hasilForecast.proyeksi -> array { bulan, prediksi_berat_kg, batas_bawah_kg, batas_atas_kg, estimasi_nilai_rupiah, estimasi_co2e_kg }
// hasilForecast.tren_persen_per_bulan -> angka persentase tren bulanan
```

---

## 5. Checklist Pengujian Integrasi & Demo

1. **Tes Mode Online:** Pastikan internet aktif → ambil foto botol plastik → hasil harus menampilkan `mode: "cloud-siglip"` (~1–2 detik).
2. **Tes Mode Offline:** Buka DevTools → tab **Network** → centang **Offline** → ambil foto lagi → hasil harus otomatis menampilkan `mode: "edge-efficientnet"` tanpa error.
3. **Warmup Sebelum Demo:** Buka [huggingface.co/spaces/afiqmc777/trashury-siglip-api](https://huggingface.co/spaces/afiqmc777/trashury-siglip-api) **3–5 menit sebelum presentasi** agar Space tidak sedang *sleep*.
