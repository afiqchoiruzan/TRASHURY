import { describe, expect, it } from 'vitest';
import {
  DAFTAR_KELAS_MODEL,
  KONFIGURASI_PREPROCESSING_AI,
  MASTER_KATEGORI_SAMPAH,
  hitungSoftmax,
  terjemahkanLogitsKlasifikasi,
} from './kategoriSampah.js';

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('kategoriSampah & AI helpers (EfficientNet-B0)', () => {
  it('memiliki 12 kelas model yang terpetakan ke master kategori dengan UUID v4 yang sah', () => {
    expect(DAFTAR_KELAS_MODEL).toHaveLength(12);
    expect(MASTER_KATEGORI_SAMPAH).toHaveLength(12);
    expect(KONFIGURASI_PREPROCESSING_AI.klasifikasi.lebar).toBe(260);
    expect(KONFIGURASI_PREPROCESSING_AI.klasifikasi.tinggi).toBe(260);

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

  it('menerjemahkan output logits klasifikasi ke kategori yang benar beserta Top-3 Smart Suggestion', () => {
    const dummyLogits = new Array(12).fill(0.1);
    dummyLogits[8] = 5.0; // Index 8: Plastic Bottle (Top-1)
    dummyLogits[9] = 3.2; // Index 9: Plastic Cup (Top-2)
    dummyLogits[1] = 2.0; // Index 1: Glass Bottles (Top-3)

    const hasil = terjemahkanLogitsKlasifikasi(dummyLogits);
    expect(hasil.index).toBe(8);
    expect(hasil.label_model).toBe('Plastic Bottle');
    expect(hasil.kategori.nama_kategori).toBe('Botol Plastik (PET)');
    expect(hasil.kategori.harga_per_kg).toBe(3500);
    expect(hasil.confidence).toBeGreaterThan(0.75);

    // Top-3 Smart Suggestion
    expect(hasil.kandidat_teratas).toHaveLength(3);
    expect(hasil.kandidat_teratas[0]?.label_model).toBe('Plastic Bottle');
    expect(hasil.kandidat_teratas[1]?.label_model).toBe('Plastic Cup');
    expect(hasil.kandidat_teratas[2]?.label_model).toBe('Glass Bottles');
    expect(hasil.peringatan_kontaminasi).toHaveLength(0);
  });

  it('mendeteksi peringatan kontaminasi bila food waste atau Glass Shards masuk kandidat kuat', () => {
    const dummyLogits = new Array(12).fill(0.1);
    dummyLogits[11] = 4.5; // Index 11: food waste

    const hasil = terjemahkanLogitsKlasifikasi(dummyLogits);
    expect(hasil.index).toBe(11);
    expect(hasil.peringatan_kontaminasi).toHaveLength(1);
    expect(hasil.peringatan_kontaminasi[0]).toContain('food waste');
  });
});
