import type { HasilKlasifikasiAi } from './kategoriSampah.js';

export type ModeInferensiAi = 'cloud-siglip' | 'edge-efficientnet';

export const KONFIGURASI_HYBRID_AI = {
  cloudSpaceId: 'afiqmc777/trashury-siglip-api',
  cloudBaseUrl: 'https://afiqmc777-trashury-siglip-api.hf.space',
  cloudApiEndpoint: '/predict',
  cloudTimeoutMs: 5000,
  edgeModelPath: '/models/klasifikasi-sampah-v3.onnx',
} as const;

export interface HasilKlasifikasiHybrid extends HasilKlasifikasiAi {
  /** Mode AI yang menghasilkan prediksi: Cloud SigLIP-SO400M atau Edge EfficientNet-B2 */
  mode: ModeInferensiAi;
  /** Total waktu eksekusi inferensi dalam milidetik */
  latency_ms: number;
  /** Penjelasan singkat bila otomatis dialihkan (fallback) ke Edge AI */
  alasan_fallback?: string;
}

export interface OpsiKlasifikasiHybrid {
  /** Status konektivitas perangkat (misal `navigator.onLine`). Default: `true`. */
  isOnline?: boolean;
  /** Batas waktu tunggu Cloud AI sebelum fallback otomatis ke Edge AI (ms). Default: `5000`. */
  timeoutMs?: number;
  /** Fungsi pemanggil Cloud AI (Hugging Face Spaces SigLIP-SO400M via `@gradio/client`). */
  panggilCloud: (signal: AbortSignal) => Promise<HasilKlasifikasiAi>;
  /** Fungsi pemanggil Edge AI lokal (`EfficientNet-B2` ONNX via `onnxruntime-web`). */
  panggilEdge: () => Promise<HasilKlasifikasiAi>;
}

/**
 * Memvalidasi payload JSON (indeks ke-1 dari output Gradio `/predict`) menjadi `HasilKlasifikasiAi`.
 */
export function validasiResponCloudAi(payload: unknown): HasilKlasifikasiAi {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Respons Cloud AI tidak valid (bukan objek JSON).');
  }

  const obj = payload as Record<string, unknown>;
  if (
    typeof obj.index !== 'number' ||
    typeof obj.label_model !== 'string' ||
    typeof obj.confidence !== 'number' ||
    !Array.isArray(obj.kandidat_teratas) ||
    obj.kandidat_teratas.length === 0 ||
    !Array.isArray(obj.peringatan_kontaminasi)
  ) {
    throw new Error('Struktur respons Cloud AI tidak sesuai kontrak HasilKlasifikasiAi.');
  }

  return {
    index: obj.index,
    label_model: obj.label_model as HasilKlasifikasiAi['label_model'],
    kategori: obj.kategori as HasilKlasifikasiAi['kategori'],
    confidence: obj.confidence,
    kandidat_teratas: obj.kandidat_teratas as HasilKlasifikasiAi['kandidat_teratas'],
    peringatan_kontaminasi: obj.peringatan_kontaminasi as string[],
  };
}

/**
 * Router Inferensi Hybrid Cloud-Edge AI TRASHURY:
 * 1. Jika online: memanggil Cloud AI (`SigLIP-SO400M`, akurasi 96.03%) dengan batas waktu `timeoutMs`.
 * 2. Jika offline, timeout, atau Cloud sedang sleep/error: otomatis fallback ke Edge AI (`EfficientNet-B2` ONNX)
 *    tanpa mengganggu alur kerja kasir.
 */
export async function klasifikasiHybridAi(
  opsi: OpsiKlasifikasiHybrid
): Promise<HasilKlasifikasiHybrid> {
  const isOnline = opsi.isOnline ?? true;
  const timeoutMs = opsi.timeoutMs ?? KONFIGURASI_HYBRID_AI.cloudTimeoutMs;

  if (!isOnline) {
    const t0 = Date.now();
    const hasilEdge = await opsi.panggilEdge();
    return {
      ...hasilEdge,
      mode: 'edge-efficientnet',
      latency_ms: Math.max(0, Date.now() - t0),
      alasan_fallback: 'Perangkat sedang offline',
    };
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tCloud = Date.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`Cloud AI melebihi batas waktu ${timeoutMs} ms`));
      }, timeoutMs);
    });

    const hasilCloud = await Promise.race([
      opsi.panggilCloud(controller.signal),
      timeoutPromise,
    ]);

    return {
      ...hasilCloud,
      mode: 'cloud-siglip',
      latency_ms: Math.max(0, Date.now() - tCloud),
    };
  } catch (err) {
    const alasan = err instanceof Error ? err.message : 'Cloud AI tidak dapat dijangkau';
    const tEdge = Date.now();
    const hasilEdge = await opsi.panggilEdge();
    return {
      ...hasilEdge,
      mode: 'edge-efficientnet',
      latency_ms: Math.max(0, Date.now() - tEdge),
      alasan_fallback: alasan,
    };
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
