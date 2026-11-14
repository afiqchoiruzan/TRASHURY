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
 * Konfigurasi Preprocessing Gambar untuk Model ONNX
 */
export const KONFIGURASI_PREPROCESSING_AI = {
  klasifikasi: {
    lebar: 224,
    tinggi: 224,
    mean: [0.485, 0.456, 0.406] as const,
    std: [0.229, 0.224, 0.225] as const,
  },
  deteksi: {
    lebar: 640,
    tinggi: 640,
    ambangConfidenceDefault: 0.25,
    ambangIouDefault: 0.45,
  },
} as const;

export interface KotakDeteksiSampah {
  /** Koordinat sudut kiri atas X dalam skala input (0..640) */
  x: number;
  /** Koordinat sudut kiri atas Y dalam skala input (0..640) */
  y: number;
  /** Lebar kotak dalam skala input (0..640) */
  width: number;
  /** Tinggi kotak dalam skala input (0..640) */
  height: number;
  /** Indeks kelas (0..11) */
  index: number;
  /** Nama kelas asli pada model */
  label_model: LabelModelAi;
  /** Objek definisi kategori TRASHURY */
  kategori: DefinisiKategoriSampah;
  /** Skor keyakinan deteksi (0..1) */
  confidence: number;
}

export interface HasilDeteksiYolo {
  /** Daftar seluruh objek sampah yang lolos filter confidence dan NMS */
  kotak: KotakDeteksiSampah[];
  /** Rekomendasi kategori utama untuk form kasir (berdasarkan mayoritas/confidence tertinggi) */
  rekomendasi_utama: {
    kategori: DefinisiKategoriSampah;
    confidence: number;
    jumlah_objek_sejenis: number;
  } | null;
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
 * Mengubah output raw logits model klasifikasi menjadi hasil prediksi berlabel
 */
export function terjemahkanLogitsKlasifikasi(logits: number[]): {
  index: number;
  label_model: LabelModelAi;
  kategori: DefinisiKategoriSampah;
  confidence: number;
} {
  const probs = hitungSoftmax(logits);
  let bestIdx = 0;
  let maxProb = probs[0] ?? 0;

  for (let i = 1; i < probs.length; i++) {
    if ((probs[i] ?? 0) > maxProb) {
      maxProb = probs[i]!;
      bestIdx = i;
    }
  }

  const label = DAFTAR_KELAS_MODEL[bestIdx] ?? 'Paper';
  const definisi = MASTER_KATEGORI_SAMPAH[bestIdx] ?? MASTER_KATEGORI_SAMPAH[0]!;

  return {
    index: bestIdx,
    label_model: label,
    kategori: definisi,
    confidence: maxProb,
  };
}

/**
 * Menghitung Intersection over Union (IoU) antara dua kotak deteksi
 */
export function hitungIoU(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): number {
  const xA = Math.max(a.x, b.x);
  const yA = Math.max(a.y, b.y);
  const xB = Math.min(a.x + a.width, b.x + b.width);
  const yB = Math.min(a.y + a.height, b.y + b.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  if (interArea === 0) return 0;

  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

/**
 * Non-Maximum Suppression (NMS) untuk menyaring kotak deteksi yang tumpang tindih
 */
export function terapkanNMS(
  kotakList: KotakDeteksiSampah[],
  ambangIou: number = KONFIGURASI_PREPROCESSING_AI.deteksi.ambangIouDefault
): KotakDeteksiSampah[] {
  const urut = [...kotakList].sort((a, b) => b.confidence - a.confidence);
  const terpilih: KotakDeteksiSampah[] = [];

  while (urut.length > 0) {
    const utama = urut.shift()!;
    terpilih.push(utama);

    for (let i = urut.length - 1; i >= 0; i--) {
      const kandidat = urut[i]!;
      if (hitungIoU(utama, kandidat) >= ambangIou) {
        urut.splice(i, 1);
      }
    }
  }

  return terpilih;
}

/**
 * Menerjemahkan tensor keluaran mentah YOLOv8-Nano (`[1, 16, 8400]`) menjadi
 * daftar kotak deteksi bersih, rekomendasi kategori dominan, dan peringatan kontaminasi.
 *
 * Struktur tensor YOLOv8 `[1, 16, numAnchors]`:
 * - Baris 0..3: `cx, cy, w, h`
 * - Baris 4..15: skor probabilitas untuk 12 kelas sampah
 */
export function terjemahkanOutputYolo(
  outputData: Float32Array | number[],
  opsi?: {
    jumlahAnchor?: number;
    ambangConfidence?: number;
    ambangIou?: number;
  }
): HasilDeteksiYolo {
  const jumlahKelas = DAFTAR_KELAS_MODEL.length; // 12
  const jumlahBaris = 4 + jumlahKelas; // 16
  const jumlahAnchor = opsi?.jumlahAnchor ?? Math.floor(outputData.length / jumlahBaris);
  const ambangConfidence =
    opsi?.ambangConfidence ?? KONFIGURASI_PREPROCESSING_AI.deteksi.ambangConfidenceDefault;
  const ambangIou = opsi?.ambangIou ?? KONFIGURASI_PREPROCESSING_AI.deteksi.ambangIouDefault;

  const kandidatKotak: KotakDeteksiSampah[] = [];

  for (let a = 0; a < jumlahAnchor; a++) {
    let bestClassIdx = 0;
    let maxScore = -Infinity;

    for (let c = 0; c < jumlahKelas; c++) {
      const score = outputData[(4 + c) * jumlahAnchor + a] ?? 0;
      if (score > maxScore) {
        maxScore = score;
        bestClassIdx = c;
      }
    }

    if (maxScore >= ambangConfidence) {
      const cx = outputData[0 * jumlahAnchor + a] ?? 0;
      const cy = outputData[1 * jumlahAnchor + a] ?? 0;
      const w = outputData[2 * jumlahAnchor + a] ?? 0;
      const h = outputData[3 * jumlahAnchor + a] ?? 0;

      const x = Math.max(0, cx - w / 2);
      const y = Math.max(0, cy - h / 2);
      const label = DAFTAR_KELAS_MODEL[bestClassIdx] ?? 'Paper';
      const kategori = MASTER_KATEGORI_SAMPAH[bestClassIdx] ?? MASTER_KATEGORI_SAMPAH[0]!;

      kandidatKotak.push({
        x,
        y,
        width: w,
        height: h,
        index: bestClassIdx,
        label_model: label,
        kategori,
        confidence: maxScore,
      });
    }
  }

  const kotakBersih = terapkanNMS(kandidatKotak, ambangIou);

  // Hitung kategori dominan (berdasarkan akumulasi skor confidence & jumlah objek)
  let rekomendasiUtama: HasilDeteksiYolo['rekomendasi_utama'] = null;
  if (kotakBersih.length > 0) {
    const statistikKelas = new Map<
      number,
      { count: number; totalConf: number; maxConf: number }
    >();

    for (const k of kotakBersih) {
      const stat = statistikKelas.get(k.index) ?? { count: 0, totalConf: 0, maxConf: 0 };
      stat.count += 1;
      stat.totalConf += k.confidence;
      if (k.confidence > stat.maxConf) stat.maxConf = k.confidence;
      statistikKelas.set(k.index, stat);
    }

    let bestIndex = kotakBersih[0]!.index;
    let bestTotalConf = -1;

    for (const [idx, stat] of statistikKelas.entries()) {
      if (stat.totalConf > bestTotalConf) {
        bestTotalConf = stat.totalConf;
        bestIndex = idx;
      }
    }

    const statTerbaik = statistikKelas.get(bestIndex)!;
    rekomendasiUtama = {
      kategori: MASTER_KATEGORI_SAMPAH[bestIndex]!,
      confidence: statTerbaik.maxConf,
      jumlah_objek_sejenis: statTerbaik.count,
    };
  }

  // Cek peringatan kontaminasi (food waste = index 11, Glass Shards = index 2)
  const peringatan: string[] = [];
  if (kotakBersih.some((k) => k.index === 11)) {
    peringatan.push(
      'Terdeteksi sampah organik / sisa makanan (food waste). Mohon pisahkan dari tumpukan daur ulang.'
    );
  }
  if (kotakBersih.some((k) => k.index === 2)) {
    peringatan.push(
      'Terdeteksi pecahan kaca (Glass Shards). Harap gunakan sarung tangan pelindung saat menimbang.'
    );
  }

  return {
    kotak: kotakBersih,
    rekomendasi_utama: rekomendasiUtama,
    peringatan_kontaminasi: peringatan,
  };
}
