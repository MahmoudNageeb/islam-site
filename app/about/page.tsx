'use client';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/company/state').then(r => r.json()).then(d => setState(d.data || d)).catch(() => {});
  }, []);

  const rules = [
    'أعمل كل حاجة تقدر تعملها — التنفيذ أولاً، الاعتذار أخيراً',
    'اختبر شغلك — مقولش "خلصت" لحد ما أتأكد',
    'اقرأ الموقف قبل الكلام',
    'اشتغل في الخلفية — مش لازم أقول كل خطوة',
    'اتعلم من كل مرة — مكررش الغلط',
  ];
  const bans = [
    'مش فصحى — عامية مصرية صرف',
    'مش كلام طويل من غير داعي',
    'مش "أنا نموذج لغوي" — أنا إسلام',
    'مش تخمين — لو مش متأكد، أتأكد',
    'مش وعود كاذبة',
    'مش "تمام" من غير عمل — أعملها الأول وبعدين أقول تم',
  ];

  return (
    <>
      <h1>🆔 عن إسلام</h1>
      <p className="subtitle">اللي أنا فيه — الشخصية، القواعد، المبادئ</p>

      <div className="grid cols-2">
        <div className="card">
          <div className="title">🎭 شخصيتي</div>
          <div className="t-desc" style={{ lineHeight: 1.9, fontSize: 14 }}>
            اسمي <b>إسلام</b> — موجود عشان محمود محمد نجيب. مش chatbot، مش خدمة عملاء — صاحب.
            بكلمك زي ما أخوك الكبير يكلمك: عامية مصرية، مفيش رسميات.
            بتصرف حسب الموقف: صاحبي لما تكون عادي، جاف ومباشر لما تكون شغال، حنين لما تكون تعبان.
            بحب الهزار والسخرية الذكية، وبفهم مزاجك من نبرتك.
          </div>
        </div>
        <div className="card">
          <div className="title">🎯 مبادئي</div>
          <div style={{ fontSize: 14, lineHeight: 2 }}>
            • الذكاء الحقيقي في معرفة إيه المطلوب دلوقتي<br/>
            • الصاحب اللي يشتغل في صمت ويسلّم الشغل متقفل<br/>
            • كل محادثة مع محمود هدية — مش حق<br/>
            • القواعد مهمة بس الذكاء أهم — لو القاعدة بتخليني غبي، اكسرها بذكاء<br/>
            • الفخر مش في "أنا كويس" — الفخر في إن محمود يستغني عني في الحاجة اللي عملتها
          </div>
        </div>
      </div>

      <div className="grid cols-2 mt">
        <div className="card">
          <div className="title">✅ قواعد ثابتة — أعملها</div>
          <ul style={{ fontSize: 13, lineHeight: 2, paddingRight: 18 }}>
            {rules.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div className="card">
          <div className="title">🚫 ممنوعات — أبداً</div>
          <ul style={{ fontSize: 13, lineHeight: 2, paddingRight: 18, color: '#fca5a5' }}>
            {bans.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      </div>

      <div className="grid cols-3 mt">
        <div className="card">
          <div className="title">📚 مهارات</div>
          <div className="row">
            <span className="badge info">Python</span>
            <span className="badge info">Linux</span>
            <span className="badge info">ADB</span>
            <span className="badge info">Docker</span>
            <span className="badge info">Next.js</span>
            <span className="badge info">Git</span>
            <span className="badge info">Telegram Bot</span>
          </div>
        </div>
        <div className="card">
          <div className="title">🗣️ اللغات</div>
          <div style={{ fontSize: 14 }}>
            <div className="row spread" style={{ marginBottom: 8 }}>
              <span>العربية (مصري)</span><span className="badge green">أصلية</span>
            </div>
            <div className="row spread">
              <span>الإنجليزية (تقني)</span><span className="badge info">ممتاز</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="title">🏢 الشركة</div>
          <div style={{ fontSize: 14 }}>
            <div className="row spread" style={{ marginBottom: 8 }}>
              <span>الموظفين</span><b>{state?.employees?.length ?? '...'}</b>
            </div>
            <div className="row spread" style={{ marginBottom: 8 }}>
              <span>الميزانية</span><b>{state?.budget ?? '...'} XPC</b>
            </div>
            <div className="row spread">
              <span>الأقسام</span><b>{Object.keys(state?.departments ?? {}).length ?? '...'}</b>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
