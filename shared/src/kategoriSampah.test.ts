import { describe, expect, it } from 'vitest';
import {
  DAFTAR_KELAS_MODEL,
  MASTER_KATEGORI_SAMPAH,
  hitungIoU,
  hitungSoftmax,
  terjemahkanLogitsKlasifikasi,
  terjemahkanOutputYolo,
} from './kategoriSampah.js';

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('kategoriSampah & AI helpers', () => {
  it('memiliki 12 kelas model yang terpetakan ke master kategori dengan UUID v4 yang sah', () => {
    expect(DAFTAR_KELAS_MODEL).toHaveLength(12);
    expect(MASTER_KATEGORI_SAMPAH).toHaveLength(12);

    for (let i = 0; i < 12; i++) {
      const kat = MASTER_KATEGORI_SAMPAH[i]!;
      expect(kat.label_model).toBe(DAFTAR_KELAS_MODEL[i]);
      expect(kat.id_kategori).toMatch(POLA_UUID);
      expect(kat.harga_per_kg).toBeGreaterThanOrEqual(0);
      expect(kat.faktor_co2e_per_kg).toBeGreaterThanOrEqual(0);
    }
  });

  it('menghitung softmax dengan benar', () => {
    const logits = [2.0, 1.0, 0.1];
    const probs = hitungSoftmax(logits);

    expect(probs).toHaveLength(3);
    const sum = probs.reduce((acc, p) => acc + p, 0);
    expect(sum).toBeCloseTo(1.0, 5);
    expect(probs[0]).toBeGreaterThan(probs[1]!);
    expect(probs[1]).toBeGreaterThan(probs[2]!);
  });

  it('menerjemahkan output logits klasifikasi ke kategori yang benar', () => {
    const dummyLogits = new Array(12).fill(0.1);
    dummyLogits[8] = 5.0; // Index 8: Plastic Bottle

    const hasil = terjemahkanLogitsKlasifikasi(dummyLogits);
    expect(hasil.index).toBe(8);
    expect(hasil.label_model).toBe('Plastic Bottle');
    expect(hasil.kategori.nama_kategori).toBe('Botol Plastik (PET)');
    expect(hasil.kategori.harga_per_kg).toBe(3500);
    expect(hasil.confidence).toBeGreaterThan(0.9);
  });

  it('menghitung IoU antara dua kotak deteksi', () => {
    const kotakA = { x: 10, y: 10, width: 100, height: 100 };
    const kotakIdentik = { x: 10, y: 10, width: 100, height: 100 };
    const kotakTerpisah = { x: 300, y: 300, width: 50, height: 50 };

    expect(hitungIoU(kotakA, kotakIdentik)).toBeCloseTo(1.0, 5);
    expect(hitungIoU(kotakA, kotakTerpisah)).toBe(0);
  });

  it('menerjemahkan tensor YOLOv8, menerapkan NMS, dan mendeteksi peringatan kontaminasi', () => {
    const jumlahAnchor = 10;
    const tensor = new Float32Array(16 * jumlahAnchor).fill(0);

    // Anchor 0 & Anchor 1: Dua kotak Botol Plastik (index 8) yang tumpang tindih (harus disaring NMS jadi 1)
    // Baris 0..3 adalah cx, cy, w, h
    tensor[0 * jumlahAnchor + 0] = 200; // cx
    tensor[1 * jumlahAnchor + 0] = 200; // cy
    tensor[2 * jumlahAnchor + 0] = 100; // w
    tensor[3 * jumlahAnchor + 0] = 100; // h
    tensor[(4 + 8) * jumlahAnchor + 0] = 0.92; // skor kelas 8 (Plastic Bottle)

    tensor[0 * jumlahAnchor + 1] = 205; // cx hampir sama
    tensor[1 * jumlahAnchor + 1] = 205; // cy hampir sama
    tensor[2 * jumlahAnchor + 1] = 100;
    tensor[3 * jumlahAnchor + 1] = 100;
    tensor[(4 + 8) * jumlahAnchor + 1] = 0.85; // skor lebih rendah, harus tereliminasi NMS

    // Anchor 2: Satu kotak kontaminasi food waste (index 11) di lokasi berbeda
    tensor[0 * jumlahAnchor + 2] = 500;
    tensor[1 * jumlahAnchor + 2] = 500;
    tensor[2 * jumlahAnchor + 2] = 80;
    tensor[3 * jumlahAnchor + 2] = 80;
    tensor[(4 + 11) * jumlahAnchor + 2] = 0.65;

    const hasil = terjemahkanOutputYolo(tensor, {
      jumlahAnchor,
      ambangConfidence: 0.25,
      ambangIou: 0.45,
    });

    // Dari 3 anchor di atas ambang, 2 tumpang tindih -> tersisa 2 kotak bersih
    expect(hasil.kotak).toHaveLength(2);
    expect(hasil.rekomendasi_utama).not.toBeNull();
    expect(hasil.rekomendasi_utama?.kategori.nama_kategori).toBe('Botol Plastik (PET)');
    expect(hasil.rekomendasi_utama?.confidence).toBeCloseTo(0.92, 2);

    // Peringatan kontaminasi food waste harus muncul
    expect(hasil.peringatan_kontaminasi).toHaveLength(1);
    expect(hasil.peringatan_kontaminasi[0]).toContain('food waste');
  });
});
