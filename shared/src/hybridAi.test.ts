import { describe, expect, it } from 'vitest';
import {
  KONFIGURASI_HYBRID_AI,
  klasifikasiHybridAi,
  validasiResponCloudAi,
} from './hybridAi.js';
import { terjemahkanLogitsKlasifikasi } from './kategoriSampah.js';

const mockCloudResult = terjemahkanLogitsKlasifikasi([
  0.1, 0.2, 0.0, 0.1, 0.2, 0.1, 0.1, 0.1, 6.5, 0.3, 0.2, 0.0,
]); // Plastic Bottle (index 8)

const mockEdgeResult = terjemahkanLogitsKlasifikasi([
  5.2, 0.1, 0.0, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.0,
]); // Cardboard Boxes (index 0)

describe('Hybrid Cloud-Edge AI Router', () => {
  it('mengarah ke Hugging Face Space SigLIP resmi dan model Edge v3', () => {
    expect(KONFIGURASI_HYBRID_AI.cloudSpaceId).toBe('afiqmc777/trashury-siglip-api');
    expect(KONFIGURASI_HYBRID_AI.cloudBaseUrl).toBe(
      'https://afiqmc777-trashury-siglip-api.hf.space'
    );
    expect(KONFIGURASI_HYBRID_AI.edgeModelPath).toBe('/models/klasifikasi-sampah-v3.onnx');
  });

  it('memilih Cloud SigLIP saat online dan respons cepat', async () => {
    let edgeDipanggil = false;
    const hasil = await klasifikasiHybridAi({
      isOnline: true,
      timeoutMs: 1000,
      panggilCloud: async () => mockCloudResult,
      panggilEdge: async () => {
        edgeDipanggil = true;
        return mockEdgeResult;
      },
    });

    expect(hasil.mode).toBe('cloud-siglip');
    expect(hasil.label_model).toBe('Plastic Bottle');
    expect(hasil.alasan_fallback).toBeUndefined();
    expect(edgeDipanggil).toBe(false);
  });

  it('langsung fallback ke Edge saat perangkat offline', async () => {
    let cloudDipanggil = false;
    const hasil = await klasifikasiHybridAi({
      isOnline: false,
      panggilCloud: async () => {
        cloudDipanggil = true;
        return mockCloudResult;
      },
      panggilEdge: async () => mockEdgeResult,
    });

    expect(hasil.mode).toBe('edge-efficientnet');
    expect(hasil.label_model).toBe('Cardboard Boxes');
    expect(cloudDipanggil).toBe(false);
    expect(hasil.alasan_fallback).toMatch(/offline/i);
  });

  it('otomatis fallback ke Edge saat Cloud error atau timeout', async () => {
    const hasilError = await klasifikasiHybridAi({
      isOnline: true,
      timeoutMs: 500,
      panggilCloud: async () => {
        throw new Error('503 Space sleeping');
      },
      panggilEdge: async () => mockEdgeResult,
    });

    expect(hasilError.mode).toBe('edge-efficientnet');
    expect(hasilError.alasan_fallback).toMatch(/503 Space sleeping/);

    const hasilTimeout = await klasifikasiHybridAi({
      isOnline: true,
      timeoutMs: 30,
      panggilCloud: async () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockCloudResult), 200);
        }),
      panggilEdge: async () => mockEdgeResult,
    });

    expect(hasilTimeout.mode).toBe('edge-efficientnet');
    expect(hasilTimeout.alasan_fallback).toMatch(/melebihi batas waktu/i);
  });

  it('memvalidasi payload Cloud AI valid dan menolak payload rusak', () => {
    const valid = validasiResponCloudAi(mockCloudResult);
    expect(valid.label_model).toBe('Plastic Bottle');
    expect(valid.kandidat_teratas).toHaveLength(3);

    expect(() => validasiResponCloudAi(null)).toThrow(/tidak valid/i);
    expect(() => validasiResponCloudAi({ index: 'salah' })).toThrow(/tidak sesuai kontrak/i);
  });
});
