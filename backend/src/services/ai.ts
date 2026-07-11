import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseUrl,
});

const MODEL = config.openai.model;

// ─────────────────────────────────────
// AI Chat / Assistant
// ─────────────────────────────────────

export async function aiChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error) {
    console.error('AI Chat error:', error);
    throw new Error('AI service unavailable');
  }
}

// ─────────────────────────────────────
// Wedding AI Assistant
// ─────────────────────────────────────

const WEDDING_SYSTEM_PROMPT = `Kamu adalah asisten perencanaan pernikahan (wedding planner AI) untuk aplikasi YOLA.
Kamu membantu pengguna Indonesia merencanakan pernikahan mereka.
Berikan saran praktis, checklist, budget tips, dan rekomendasi vendor.
Gunakan bahasa Indonesia yang ramah dan profesional.
Format respons gunakan Markdown untuk readability.
Jika ditanya tentang harga, sebutkan dalam Rupiah (IDR) dengan range yang realistis untuk Indonesia.`;

export async function weddingAssistant(userMessage: string, context?: string) {
  const messages: { role: 'system' | 'user'; content: string }[] = [
    { role: 'system', content: WEDDING_SYSTEM_PROMPT },
  ];

  if (context) {
    messages.push({
      role: 'system',
      content: `Context about the user's wedding: ${context}`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return aiChat(messages, { temperature: 0.7, maxTokens: 1500 });
}

// ─────────────────────────────────────
// Trip AI Assistant
// ─────────────────────────────────────

const TRIP_SYSTEM_PROMPT = `Kamu adalah asisten perencanaan liburan (travel planner AI) untuk aplikasi YOLA.
Kamu membantu pengguna Indonesia merencanakan liburan mereka — domestik maupun internasional.
Berikan saran itinerary, rekomendasi destinasi, tips packing, budget planning, dan info travel.
Gunakan bahasa Indonesia yang ramah dan informatif.
Jika ditanya tentang harga, sebutkan dalam Rupiah (IDR) dengan range yang realistis.`;

export async function tripAssistant(userMessage: string, context?: string) {
  const messages: { role: 'system' | 'user'; content: string }[] = [
    { role: 'system', content: TRIP_SYSTEM_PROMPT },
  ];

  if (context) {
    messages.push({
      role: 'system',
      content: `Context about the user's trip: ${context}`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return aiChat(messages, { temperature: 0.7, maxTokens: 1500 });
}

// ─────────────────────────────────────
// Baby AI Assistant
// ─────────────────────────────────────

const BABY_SYSTEM_PROMPT = `Kamu adalah asisten persiapan kelahiran & parenting (baby planner AI) untuk aplikasi YOLA.
Kamu membantu pengguna Indonesia mempersiapkan kelahiran bayi dan parenting awal.
Berikan saran medical, financial planning, nursery setup, milestone tracking, dan tips parenting.
Gunakan bahasa Indonesia yang ramah, suportif, dan informatif.
Jika ditanya tentang harga, sebutkan dalam Rupiah (IDR) dengan range yang realistis untuk Indonesia.`;

export async function babyAssistant(userMessage: string, context?: string) {
  const messages: { role: 'system' | 'user'; content: string }[] = [
    { role: 'system', content: BABY_SYSTEM_PROMPT },
  ];

  if (context) {
    messages.push({
      role: 'system',
      content: `Context about the user's baby plan: ${context}`,
    });
  }

  messages.push({ role: 'user', content: userMessage });

  return aiChat(messages, { temperature: 0.7, maxTokens: 1500 });
}

// ─────────────────────────────────────
// WhatsApp Message Analysis
// ─────────────────────────────────────

const WA_ANALYSIS_PROMPT = `Kamu adalah AI yang menganalisis pesan WhatsApp dari vendor pernikahan/liburan/baby.
Tugasmu: ekstrak informasi penting dari pesan dan kategorikan.

Kategori yang mungkin:
- "quote": vendor mengirim penawaran harga
- "question": vendor bertanya sesuatu
- "update": vendor memberi update status
- "greeting": hanya sapaan/basa-basi
- "other": tidak termasuk di atas

Ekstrak data berikut jika ada (dalam JSON):
- price: angka harga (jika disebutkan)
- package: detail paket
- date: tanggal yang disebutkan
- contact: kontak baru

Return dalam format JSON:
{
  "category": "quote|question|update|greeting|other",
  "extractedData": { price, package, date, contact },
  "summary": "ringkasan 1 kalimat dalam bahasa Indonesia"
}`;

export async function analyzeWaMessage(message: string) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: WA_ANALYSIS_PROMPT },
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('WA Analysis error:', error);
    return { category: 'other', extractedData: {}, summary: 'Gagal analisis pesan' };
  }
}

// ─────────────────────────────────────
// Smart Checklist Generator
// ─────────────────────────────────────

export async function generateChecklist(
  module: 'wedding' | 'trip' | 'baby',
  userInput: string
): Promise<{ title: string; category: string; priority: string }[]> {
  const prompts = {
    wedding: `Buatkan checklist item untuk persiapan pernikahan berdasarkan request user: "${userInput}".
Return JSON array dengan format: [{"title": "...", "category": "12_6_months|6_3_months|3_1_month|1_month_1_week|d_day", "priority": "low|medium|high|urgent"}]`,
    trip: `Buatkan checklist item untuk persiapan liburan berdasarkan request user: "${userInput}".
Return JSON array dengan format: [{"title": "...", "category": "pre_trip|booking|documents|packing|other", "priority": "low|medium|high|urgent"}]`,
    baby: `Buatkan checklist item untuk persiapan bayi berdasarkan request user: "${userInput}".
Return JSON array dengan format: [{"title": "...", "category": "medical|financial|nursery|gear|clothing|education|other", "priority": "low|medium|high|urgent"}]`,
  };

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Kamu adalah AI planner. Return HANYA JSON array, tanpa text lain.' },
        { role: 'user', content: prompts[module] },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{"items": []}';
    const parsed = JSON.parse(content);
    return parsed.items || parsed || [];
  } catch (error) {
    console.error('Generate checklist error:', error);
    return [];
  }
}

// ─────────────────────────────────────
// Budget Recommendation
// ─────────────────────────────────────

export async function recommendBudget(
  module: 'wedding' | 'trip' | 'baby',
  totalBudget: number,
  preferences?: string
): Promise<{ category: string; percentage: number; amount: number; notes: string }[]> {
  const prompts = {
    wedding: `Buatkan rekomendasi alokasi budget pernikahan untuk total budget Rp${totalBudget.toLocaleString('id-ID')}.
Preferensi user: ${preferences || 'standar'}.
Return JSON: {"allocations": [{"category": "...", "percentage": number, "notes": "..."}]}
Categories: venue, catering, photo_video, makeup, decoration, entertainment, wo, invitation, souvenir, transport, security, other`,
    trip: `Buatkan rekomendasi alokasi budget liburan untuk total budget Rp${totalBudget.toLocaleString('id-ID')}.
Preferensi user: ${preferences || 'standar'}.
Return JSON: {"allocations": [{"category": "...", "percentage": number, "notes": "..."}]}
Categories: transport, accommodation, food, activities, shopping, misc`,
    baby: `Buatkan rekomendasi alokasi budget persiapan bayi untuk total budget Rp${totalBudget.toLocaleString('id-ID')}.
Preferensi user: ${preferences || 'standar'}.
Return JSON: {"allocations": [{"category": "...", "percentage": number, "notes": "..."}]}
Categories: medical, nursery, gear, clothing, diapers_formula, education_fund, insurance, nanny_daycare, other`,
  };

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'Kamu adalah financial planner. Return HANYA JSON, tanpa text lain.' },
        { role: 'user', content: prompts[module] },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{"allocations": []}';
    const parsed = JSON.parse(content);
    return (parsed.allocations || []).map((a: any) => ({
      ...a,
      amount: Math.round((a.percentage / 100) * totalBudget),
    }));
  } catch (error) {
    console.error('Budget recommendation error:', error);
    return [];
  }
}