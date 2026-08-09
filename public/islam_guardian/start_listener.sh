#!/data/data/com.termux/files/usr/bin/bash
# =============================================
# 🇪🇬 Islam Wake Word Listener (Termux)
# بيسمع "hey hermes" → يبعت للسيرفر → يبدأ جلسة
# =============================================
export PATH=$PREFIX/bin:$PATH

SERVER="http://100.82.80.44:8642"
API_KEY="sk-islam-phone-2026"
LOG=~/wakeword/listener.log

echo "$(date) — listener starting" >> $LOG

# منع الـ sleep
termux-wake-lock

# الـ Python listener
cd ~/wakeword
nohup python3 listener.py >> $LOG 2>&1 &
echo "$(date) — python listener pid $!" >> $LOG
