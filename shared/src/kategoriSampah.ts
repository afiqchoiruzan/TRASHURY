import type { KategoriSampah } from './tipe.js';

/**
 * 12 Kelas output model AI sesuai urutan labels.txt dan tensor ONNX
 */
export const DAFTAR_KELAS_MODEL = [
  'Cardboard Boxes', // 0
  'Glass Bottles',   // 1
  'Glass Shards',    // 2
  'Jug',             // 3
  'Metal Can',       // 4
  'Paper',           // 5
  'Paper Bag',       // 6
  'Paper Cup',       // 7
  'Plastic Bottle',  // 8
  'Plastic Cup',     // 9
  'Plastic bag',     // 10
  'food waste',      // 11
] as const;

export type LabelModelAi = (typeof DAFTAR_KELAS_MODEL)[number];

export interface DefinisiKategoriSampah extends KategoriSampah {
  label_model: LabelModelAi;
  deskripsi: string;
}

/**
 * Nilai acuan standar harga dan faktor emisi reduksi CO2e (berdasarkan IPCC / KLHK).
 * Menggunakan UUID v4 deterministik agar 100% kompatibel dengan skema PostgreSQL & validasi Zod di Backend.
 */
export const MASTER_KATEGORI_SAMPAH: readonly DefinisiKategoriSampah[] = [
  {
    id_kategori: '00000000-0000-4000-8000-000000000001',
    nama_kategori: 'Kardus / Karton',
    label_model: 'Cardboard Boxes',
    harga_per_kg: 1500,
    faktor_co2e_per_kg: 1.10,
    aktif: true,
    deskripsi: 'Kardus bergelombang, box kemasan cokelat kering',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000002',
    nama_kategori: 'Botol Kaca Utuh',
    label_model: 'Glass Bottles',
    harga_per_kg: 500,
    faktor_co2e_per_kg: 0.35,
    aktif: true,
    deskripsi: 'Botol sirup, kecap, atau minuman kaca dalam kondisi utuh',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000003',
    nama_kategori: 'Pecahan Kaca',
    label_model: 'Glass Shards',
    harga_per_kg: 200,
    faktor_co2e_per_kg: 0.30,
    aktif: true,
    deskripsi: 'Belahan atau pecahan kaca (butuh penanganan hati-hati)',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000004',
    nama_kategori: 'Jeriken / Botol HDPE',
    label_model: 'Jug',
    harga_per_kg: 3000,
    faktor_co2e_per_kg: 1.80,
    aktif: true,
    deskripsi: 'Wadah plastik tebal, jeriken minyak, botol shampo',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000005',
    nama_kategori: 'Kaleng / Logam',
    label_model: 'Metal Can',
    harga_per_kg: 4000,
    faktor_co2e_per_kg: 4.00,
    aktif: true,
    deskripsi: 'Kaleng minuman aluminium, kaleng biskuit atau seng',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000006',
    nama_kategori: 'Kertas / HVS / Buku',
    label_model: 'Paper',
    harga_per_kg: 1200,
    faktor_co2e_per_kg: 1.30,
    aktif: true,
    deskripsi: 'Kertas dokumen HVS, majalah, koran, dan buku tulis',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000007',
    nama_kategori: 'Kantong Kertas',
    label_model: 'Paper Bag',
    harga_per_kg: 1000,
    faktor_co2e_per_kg: 1.00,
    aktif: true,
    deskripsi: 'Paper bag belanja dan kantong kertas kraft',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000008',
    nama_kategori: 'Gelas Kertas',
    label_model: 'Paper Cup',
    harga_per_kg: 500,
    faktor_co2e_per_kg: 0.50,
    aktif: true,
    deskripsi: 'Gelas kopi kertas sekali pakai',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000009',
    nama_kategori: 'Botol Plastik (PET)',
    label_model: 'Plastic Bottle',
    harga_per_kg: 3500,
    faktor_co2e_per_kg: 2.10,
    aktif: true,
    deskripsi: 'Botol air mineral transparan bening atau biru muda',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000010',
    nama_kategori: 'Gelas Plastik (PP)',
    label_model: 'Plastic Cup',
    harga_per_kg: 2500,
    faktor_co2e_per_kg: 1.70,
    aktif: true,
    deskripsi: 'Gelas plastik air mineral / minuman boba',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000011',
    nama_kategori: 'Kantong Plastik / Kresek',
    label_model: 'Plastic bag',
    harga_per_kg: 500,
    faktor_co2e_per_kg: 1.20,
    aktif: true,
    deskripsi: 'Kantong kresek belanjaan LDPE/HDPE tipis',
  },
  {
    id_kategori: '00000000-0000-4000-8000-000000000012',
    nama_kategori: 'Sampah Makanan / Organik',
    label_model: 'food waste',
    harga_per_kg: 0,
    faktor_co2e_per_kg: 0.25,
    aktif: true,
    deskripsi: 'Sisa makanan organik (bahan kompos / pakan ternak)',
  },
];

/**
 * Konfigurasi Preprocessing Gambar untuk Model Klasifikasi ONNX (EfficientNet-B2)
 */
export const KONFIGURASI_PREPROCESSING_AI = {
  klasifikasi: {
    lebar: 260,
    tinggi: 260,
    mean: [0.485, 0.456, 0.406] as const,
    std: [0.229, 0.224, 0.225] as const,
  },
} as const;

export interface KandidatPrediksiAi {
  index: number;
  label_model: LabelModelAi;
  kategori: DefinisiKategoriSampah;
  confidence: number;
}

export interface HasilKlasifikasiAi extends KandidatPrediksiAi {
  /** Top-3 kandidat kategori teratas (konsep AI Visual Checkout Scale) */
  kandidat_teratas: KandidatPrediksiAi[];
  /** Peringatan jika terdeteksi sampah organik (food waste) atau pecahan kaca berbahaya */
  peringatan_kontaminasi: string[];
}

/**
 * Menghitung probabilitas Softmax dari array logits mentah
 */
export function hitungSoftmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const maxVal = Math.max(...logits);
  const expScores = logits.map((val) => Math.exp(val - maxVal));
  const totalExp = expScores.reduce((sum, val) => sum + val, 0);
  return expScores.map((val) => (totalExp > 0 ? val / totalExp : 0));
}

/**
 * Mengubah output raw logits model klasifikasi (EfficientNet-B0) menjadi hasil prediksi berlabel
 * beserta Top-3 Smart Suggestion dan peringatan kontaminasi.
 */
export function terjemahkanLogitsKlasifikasi(
  logits: number[],
  topK = 3
): HasilKlasifikasiAi {
  const probs = hitungSoftmax(logits);

  const semuaKandidat: KandidatPrediksiAi[] = probs.map((prob, idx) => ({
    index: idx,
    label_model: DAFTAR_KELAS_MODEL[idx] ?? 'Paper',
    kategori: MASTER_KATEGORI_SAMPAH[idx] ?? MASTER_KATEGORI_SAMPAH[0]!,
    confidence: prob,
  }));

  semuaKandidat.sort((a, b) => b.confidence - a.confidence);
  const kandidatTeratas = semuaKandidat.slice(0, Math.max(1, topK));
  const terbaik = kandidatTeratas[0] ?? {
    index: 0,
    label_model: DAFTAR_KELAS_MODEL[0],
    kategori: MASTER_KATEGORI_SAMPAH[0]!,
    confidence: 0,
  };

  const peringatan: string[] = [];
  if (kandidatTeratas.some((k) => k.index === 11 && k.confidence >= 0.2)) {
    peringatan.push(
      'Terdeteksi sampah organik / sisa makanan (food waste). Mohon pisahkan dari tumpukan daur ulang.'
    );
  }
  if (kandidatTeratas.some((k) => k.index === 2 && k.confidence >= 0.2)) {
    peringatan.push(
      'Terdeteksi pecahan kaca (Glass Shards). Harap gunakan sarung tangan pelindung saat menimbang.'
    );
  }

  return {
    ...terbaik,
    kandidat_teratas: kandidatTeratas,
    peringatan_kontaminasi: peringatan,
  };
}
