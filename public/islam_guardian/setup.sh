#!/data/data/com.termux/files/usr/bin/bash
# 🇪🇬 Islam Guardian — إعداد مرة واحدة (شغّله في Termux)
# =============================================
# 1) يثبت الحزم
# 2) يحط الملفات في مكانها
# 3) يفعّل الـ boot script
# 4) يبدأ الـ listener
export PATH=$PREFIX/bin:$PATH

echo "=== 🇪🇬 Islam Guardian Setup ==="

echo "[1/4] تثبيت الحزم..."
pkg update -y 2>&1 | tail -1
pkg install -y python numpy portaudio termux-api 2>&1 | tail -1
echo "✓"

echo "[2/4] تثبيت openwakeword + sounddevice..."
pip install --upgrade pip 2>&1 | tail -1
pip install openwakeword sounddevice 2>&1 | tail -1
echo "✓"

echo "[3/4] تجهيز الملفات..."
mkdir -p ~/wakeword ~/.termux/boot
# الملفات هتكون في ~/storage/downloads/islam_guardian/
cp ~/storage/downloads/islam_guardian/listener.py ~/wakeword/
cp ~/storage/downloads/islam_guardian/start_listener.sh ~/wakeword/
cp ~/storage/downloads/islam_guardian/boot_start.sh ~/.termux/boot/
chmod +x ~/wakeword/start_listener.sh ~/.termux/boot/boot_start.sh
echo "✓"

echo "[4/4] اختبار..."
python3 -c "import openwakeword; print('✓ openwakeword')" 2>&1
python3 -c "import sounddevice; print('✓ sounddevice')" 2>&1
echo ""
echo "=== ✅ تم! شغّل: bash ~/wakeword/start_listener.sh ==="
echo "=== أو اعمل reboot والتاني هيشتغل لوحده ==="
