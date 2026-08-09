'use client';

export default function SettingsPage() {
  return (
    <div className="anim-fade">
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>⚙️ الإعدادات</h1>
      <p style={{ color: 'var(--dim)', marginBottom: 18 }}>قسم الإعدادات — بيتنفذ في مرحلة لاحقة</p>
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🚧</div>
        <div className="loading">قريباً: تفضيلاتك + الروابط + حول</div>
      </div>
    </div>
  );
}
