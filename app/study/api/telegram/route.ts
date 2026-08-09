import { NextRequest, NextResponse } from 'next/server';
import { getTasks, getStats, getAnalytics, getWeekPoints, createTask, createReminder } from '@/lib/study-db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// قراءة توكن تيليجرام من ملف .env بتاع Hermes
function getTelegramConfig() {
  const envPath = path.join(process.cwd(), '..', '.hermes', '.env');
  const altPath = path.join('/teamspace/studios/this_studio', '.hermes', '.env');
  const candidates = [envPath, altPath];
  let token = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_HOME_CHANNEL || '';

  for (const p of candidates) {
    if (token && chatId) break;
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('TELEGRAM_BOT_TOKEN=')) token = trimmed.split('=')[1].trim();
          if (trimmed.startsWith('TELEGRAM_HOME_CHANNEL=')) chatId = trimmed.split('=')[1].trim();
        }
      }
    } catch {}
  }
  return { token, chatId };
}

// إرسال رسالة تيليجرام
async function sendTelegram(token: string, chatId: string, text: string, parseMode = 'HTML') {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// بناء ملخص المهام
async function buildSummary() {
  const tasks = await getTasks();
  const stats = await getStats();
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
  const todayTasks = tasks.filter((t) => t.day === today);
  const doneToday = todayTasks.filter((t) => t.done).length;
  const upcoming = tasks.filter((t) => !t.done && t.day !== today).slice(0, 5);

  let text = '📚 <b>ملخص المذاكرة</b>\n';
  text += `📅 اليوم: <b>${today}</b>\n\n`;

  text += '🎯 <b>مهام اليوم:</b>\n';
  if (todayTasks.length === 0) {
    text += '   مفيش مهام لنهاردة 🎉\n';
  } else {
    for (const t of todayTasks) {
      const status = t.done ? '✅' : '⬜';
      const pri = t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢';
      text += `   ${status} ${pri} ${t.text}\n`;
    }
  }
  text += `   (${doneToday}/${todayTasks.length} مكتملة)\n\n`;

  text += '📈 <b>الإحصائيات:</b>\n';
  text += `   • نسبة الإنجاز: ${stats.completionRate}%\n`;
  text += `   • مهام مكتملة: ${stats.doneTasks}/${stats.totalTasks}\n`;
  text += `   • جلسات بومودورو: ${stats.totalSessions}\n`;
  text += `   • نقاطك: ${stats.points} ⭐\n`;

  if (upcoming.length > 0) {
    text += '\n⏭️ <b>مهام جاية:</b>\n';
    for (const t of upcoming) {
      text += `   • ${t.day}: ${t.text}\n`;
    }
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const { token, chatId } = getTelegramConfig();
    if (!token || !chatId) {
      return NextResponse.json({ error: 'توكن تيليجرام مش متظبط' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const type = body.type || 'summary';

    if (type === 'summary') {
      const text = await buildSummary();
      const result = await sendTelegram(token, chatId, text);
      if (!result.ok) {
        return NextResponse.json({ error: result.data?.description || 'فشل الإرسال' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, message: 'تم إرسال الملخص لتليجرام' });
    }

    if (type === 'task_done') {
      const { taskText } = body;
      const text = `✅ <b>مهمة مكتملة!</b>\n${taskText}\n\nاستمر يا بطل 💪`;
      const result = await sendTelegram(token, chatId, text);
      if (!result.ok) return NextResponse.json({ error: 'فشل الإرسال' }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (type === 'add_task') {
      // إضافة مهمة من تيليجرام: { text, day?, priority? }
      const { text, day, priority } = body;
      if (!text) return NextResponse.json({ error: 'text مطلوب' }, { status: 400 });
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const taskDay = days.includes(day) ? day : new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
      const taskPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
      const task = await createTask({ day: taskDay, text, priority: taskPriority });
      const okMsg = `✅ <b>المهمة اتضافت!</b>\n${taskDay}: ${text}\n\nشوف صفحة المذاكرة: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://' + (process.env.HOSTNAME || 'localhost')}/study`;
      await sendTelegram(token, chatId, okMsg);
      return NextResponse.json({ ok: true, task });
    }

    if (type === 'add_reminder') {
      // إضافة تذكير من تيليجرام: { text, datetime?, recurring? }
      const { text, datetime, recurring } = body;
      if (!text) return NextResponse.json({ error: 'text مطلوب' }, { status: 400 });
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      // لو مفيش وقت محدد → بكرة نفس الوقت ده (9 ص)
      const defaultDt = new Date(Date.now() + 86400000);
      defaultDt.setHours(9, 0, 0, 0);
      const dt = datetime || defaultDt.toISOString().slice(0, 16);
      const [date, time] = dt.split('T');
      const rec = ['daily', 'weekly', 'none'].includes(recurring) ? recurring : 'none';
      const reminder = await createReminder({ title: text, date, time, repeat: rec });
      const okMsg = `⏰ <b>التذكير اتضاف!</b>\n${text}\nالوقت: ${dt}\n\nهوصلك تلقائياً على تيليجرام وقتها 🔔`;
      await sendTelegram(token, chatId, okMsg);
      return NextResponse.json({ ok: true, reminder });
    }

    if (type === 'quick_add') {
      // إضافة سريعة بنص خام: "مهمة: كذا" أو "تذكير: كذا" أو "كذا" (افتراضي مهمة)
      const { raw } = body;
      if (!raw || !raw.trim()) return NextResponse.json({ error: 'raw مطلوب' }, { status: 400 });
      const trimmed = raw.trim();
      const lower = trimmed.toLowerCase();

      if (lower.startsWith('تذكير:') || lower.startsWith('reminder:')) {
        const text = trimmed.replace(/^(تذكير:|reminder:)/i, '').trim();
        const dt = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
        const [date, time] = dt.split('T');
        const reminder = await createReminder({ title: text, date, time, repeat: 'none' });
        return NextResponse.json({ ok: true, type: 'reminder', reminder });
      }

      // افتراضي → مهمة
      const text = trimmed.replace(/^(مهمة:|task:)/i, '').trim();
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const taskDay = new Date().toLocaleDateString('ar-EG', { weekday: 'long' });
      const task = await createTask({ day: taskDay, text, priority: 'medium' });
      return NextResponse.json({ ok: true, type: 'task', task });
    }

    if (type === 'weekly') {
      const analytics = await getAnalytics();
      const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const weekAgo = new Date(Date.now() - 7 * 86400000);

      // مهام الأسبوع
      const tasks = await getTasks();
      const weekTasks = tasks.filter((t) => {
        if (t.date) return t.date >= weekAgo.toISOString().slice(0, 10);
        return true; // مهام بدون تاريخ — نعتبرها للأسبوع
      });
      const completedWeek = weekTasks.filter((t) => t.done).length;
      const totalWeek = weekTasks.length;

      // جلسات البومودورو
      const totalPomoSeconds = analytics.thisWeek?.minutes * 60 || 0;
      const pomoHours = Math.floor(totalPomoSeconds / 3600);
      const pomoMins = Math.floor((totalPomoSeconds % 3600) / 60);

      // نقاط الأسبوع
      const weekPoints = await getWeekPoints();

      let text = '📊 <b>التقرير الأسبوعي</b> 📊\n';
      text += `🗓️ الأسبوع المنتهي: <b>${weekAgo.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</b>\n\n`;

      text += '✅ <b>المهام:</b>\n';
      text += `   • مكتملة: <b>${completedWeek}/${totalWeek}</b>\n`;
      text += `   • نسبة الإنجاز: <b>${totalWeek ? Math.round((completedWeek / totalWeek) * 100) : 0}%</b>\n\n`;

      text += '🍅 <b>البومودورو:</b>\n';
      text += `   • وقت التركيز: <b>${pomoHours}س ${pomoMins}د</b>\n\n`;

      text += `⭐ <b>نقاط الأسبوع:</b> +${weekPoints}\n\n`;
      text += 'كمل بنفس الطاقة يا بطل! 💪🔥';

      const result = await sendTelegram(token, chatId, text);
      if (!result.ok) {
        return NextResponse.json({ error: result.data?.description || 'فشل الإرسال' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, message: 'تم إرسال التقرير الأسبوعي' });
    }

    return NextResponse.json({ error: 'نوع غير معروف' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}