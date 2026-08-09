#!/data/data/com.termux/files/usr/bin/bash
# =============================================
# 🇪🇬 Islam Guardian Boot Script — Termux:Boot
# بيشتغل تلقائياً بعد كل reboot
# =============================================

# 1) سجّل في اللوج
echo "$(date) — Guardian boot script start" >> ~/guardian.log

# 2) افتح Hermes Android تلقائياً
am start -n com.hermesagent.hermes_android/.MainActivity >> ~/guardian.log 2>&1

# 3) ابدأ الـ Wake Word Listener (في الخلفية)
if [ -f ~/wakeword/start_listener.sh ]; then
  nohup bash ~/wakeword/start_listener.sh >> ~/guardian.log 2>&1 &
  echo "$(date) — wake word listener started" >> ~/guardian.log
fi

# 4) Wake lock — يمنع الـ sleep
termux-wake-lock >> ~/guardian.log 2>&1

echo "$(date) — Guardian boot script done" >> ~/guardian.log
