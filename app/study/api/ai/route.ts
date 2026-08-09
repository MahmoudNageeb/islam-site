import { NextRequest, NextResponse } from 'next/server';
import { getTasks, getGoals, getProjects, getHabits, getAnalytics } from '@/lib/study-db';

export const dynamic = 'force-dynamic';

// ===== قراءة المفاتيح من env (Next.js بيقرا .env.local تلقائياً) =====
function getEnv(key: string): string {
  if (process.env[key]) return process.env[key];
  // من ملفات Hermes كـ fallback
  const candidates = [
    '/teamspace/studios/this_studio/.hermes/.env',
    '/teamspace/studios/this_studio/.env',
  ];
  const fs = require('fs');
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, 'utf-8');
      for (const line of content.split('\n')) {
        const t = line.trim();
        if (t.startsWith(key + '=')) {
          const v = t.split('=')[1].trim();
          if (v) return v;
        }
      }
    } catch { /* تجاهل */ }
  }
  return '';
}

// ===== Providers (مرتبة بالأولوية) =====
// 1. OpenCode Zen — من الفيديو (opencode.ai/zen/v1) — مفتاح sk- مجاني
// 2. Cline API — api.cline.bot — OpenAI-compatible
// 3. OpenRouter free — fallback أخير
const PROVIDERS = [
  {
    name: 'OpenCode Zen',
    base: 'https://opencode.ai/zen/v1',
    keyEnv: 'OPENCODE_ZEN_API_KEY',
    // deepseek-v4-flash-free = DeepSeek V4 Flash مجاناً (من الفيديو) — مؤكد شغال
    // big-pickle = الأفضل بالعربي — مؤكد شغال
    // GLM-5.2 الكامل محتاج payment method على OpenCode Zen — مش مجاني
    models: ['big-pickle', 'deepseek-v4-flash-free', 'nemotron-3-ultra-free', 'mimo-v2.5-free', 'laguna-s-2.1-free'],
    enabled: true,
  },
  {
    name: 'MorphLLM',
    base: 'https://api.morphllm.com/v1',
    keyEnv: 'MORPHLLM_API_KEY',
    // من الفيديو: morph-glm52-744b = GLM 5.2 (مؤكد شغال — بياخد وقت أطول)
    // morph-dsv4flash = DeepSeek V4 Flash — مؤكد شغال سريع
    // morph-qwen36-27b = Qwen 3.6 — مؤكد شغال
    models: ['morph-dsv4flash', 'morph-qwen36-27b', 'morph-glm52-744b'],
    enabled: true,
  },
  {
    name: 'Cline API',
    base: 'https://api.cline.bot/api/v1',
    keyEnv: 'CLINE_API_KEY',
    models: ['minimax/minimax-m2.5', 'anthropic/claude-sonnet-4-6'],
    enabled: true,
  },
  {
    name: 'OpenRouter',
    base: 'https://openrouter.ai/api/v1',
    keyEnv: 'OPENROUTER_API_KEY',
    models: ['openrouter/free', 'nvidia/nemotron-3-ultra-550b-a55b:free'],
    enabled: true,
  },
];

// بناء سياق مذاكرة محمود
async function buildContext() {
  const tasks = await await getTasks();
  const goals = await await getGoals();
  const projects = await await getProjects();
  const habits = await await getHabits();
  const analytics = await await getAnalytics();

  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });

  let ctx = `أنت مساعد مذاكرة شخصي لمحمود، طالب ثانوية عامة علمي رياضة (نظام 234) في مصر.\n`;
  ctx += `اليوم: ${today}\n\n`;

  // المهام
  ctx += '📋 **المهام الحالية:**\n';
  const todayTasks = tasks.filter((t) => t.day === today);
  if (todayTasks.length === 0) ctx += '  - مفيش مهام لنهاردة\n';
  for (const t of todayTasks.slice(0, 10)) {
    const pri = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
    ctx += `  - ${pri} ${t.text} (${t.done ? '✅' : '⬜'})${t.start_time ? ` [${t.start_time}-${t.end_time || ''}]` : ''}\n`;
  }
  // مهام الأسبوع
  const weekTasks = tasks.filter((t) => !t.done && t.day !== today).slice(0, 10);
  if (weekTasks.length > 0) {
    ctx += '\n⏭️ **مهام جاية:**\n';
    for (const t of weekTasks) ctx += `  - ${t.day}: ${t.text}\n`;
  }

  // الأهداف
  if (goals.length > 0) {
    ctx += '\n🎯 **الأهداف:**\n';
    for (const g of goals) ctx += `  - ${g.title} (${g.progress || 0}%)\n`;
  }

  // العادات
  if (habits.length > 0) {
    ctx += '\n✅ **العادات:**\n';
    for (const h of habits) ctx += `  - ${h.icon} ${h.name} (streak: ${h.streak})\n`;
  }

  // النقاط
  if (analytics.points !== undefined) {
    ctx += `\n⭐ النقاط: ${analytics.points} (مستوى ${analytics.level})\n`;
  }

  ctx += `\nأجب بالعامية المصرية، مختصر ومفيد. لو سأل عن مذاكرة — اعمل خطة عملية. لو سأل عن فهم مفهوم — اشرح بالتفصيل الممل مع مثال.`;
  return ctx;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'message مطلوب' }, { status: 400 });
    }

    const system = buildContext();
    let reply = '';
    let lastErr = '';
    let usedProvider = '';

    // جرب كل provider بالترتيب (كلهم مجانيين)
    for (const provider of PROVIDERS) {
      const apiKey = getEnv(provider.keyEnv);
      if (!apiKey) {
        lastErr = `${provider.name}: مفتاح ${provider.keyEnv} مش متظبط`;
        continue;
      }

      for (const model of provider.models) {
        try {
          const res = await fetch(`${provider.base}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: message },
              ],
              max_tokens: 1200,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            lastErr = `${provider.name}/${model}: ${data.error?.message || `HTTP ${res.status}`}`;
            // لو rate limit/مش متاح → جرب النموذج أو الـ provider التاني
            if (res.status === 429 || res.status === 402 || res.status === 404) continue;
            break;
          }

          reply = data.choices?.[0]?.message?.content || '';
          if (reply.trim()) {
            usedProvider = `${provider.name} (${model})`;
            break;
          }
          lastErr = `${provider.name}/${model}: رد فاضي`;
        } catch (e: any) {
          lastErr = `${provider.name}/${model}: ${e.message}`;
        }
      }
      if (reply.trim()) break;
    }

    if (!reply.trim()) {
      return NextResponse.json({ error: lastErr || 'مفيش رد من كل النماذج' }, { status: 500 });
    }
    return NextResponse.json({ reply, provider: usedProvider });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
