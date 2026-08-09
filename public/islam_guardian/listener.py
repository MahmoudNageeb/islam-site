#!/data/data/com.termux/files/usr/bin/python3
"""
🇪🇬 Islam Wake Word Listener — Termux (sherpa-onnx)
بيسمع "يا إسلام" أو "hey hermes" → يبعت للسيرفر
"""
import json, os, sys, time, subprocess, urllib.request

SERVER = "http://100.82.80.44:8642"
API_KEY = "sk-islam-phone-2026"
LOG = os.path.expanduser("~/wakeword/listener.log")
WAKE_PHRASES = ["يا اسلام", "يا إسلام", "hey hermes", "hey hermis", "hi hermes"]

def log(msg):
    try:
        with open(LOG, "a") as f:
            f.write(f"{time.strftime('%H:%M:%S')} {msg}\n")
    except Exception:
        pass

def wake_server():
    try:
        req = urllib.request.Request(
            f"{SERVER}/v1/chat/completions",
            data=json.dumps({
                "model": "hermes-agent",
                "messages": [{"role": "user", "content": "🎤 wake"}],
                "stream": False,
            }).encode(),
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status
    except Exception as e:
        log(f"wake_server error: {e}")
        return None

def try_openwakeword():
    """المحاولة الأولى: openwakeword (متوافق مع اللي على السيرفر)"""
    try:
        import numpy as np
        from openwakeword import Model
        import sounddevice as sd
        log("using openwakeword")
        model = Model()
        sr = 16000

        def cb(indata, frames, time_info, status):
            audio = np.squeeze(indata)
            pred = model.predict(audio)
            for k, v in pred.items():
                if v > 0.5:
                    on_wake(k, v)

        def on_wake(k, v):
            log(f"🔥 WAKE: {k} ({v:.2f})")
            st = wake_server()
            log(f"server: {st}")
            subprocess.Popen(["termux-tts-speak", "نعم يا محمود؟"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.Popen(["am", "start", "-n", "com.hermesagent.hermes_android/.MainActivity"],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(3)

        with sd.InputStream(samplerate=sr, channels=1, dtype="int16", callback=cb):
            log("🎧 listening (openwakeword)...")
            while True:
                time.sleep(1)
    except ImportError as e:
        log(f"openwakeword missing: {e}")
        try_sherpa()
    except Exception as e:
        log(f"openwakeword error: {e}")
        try_sherpa()

def try_sherpa():
    """المحاولة الثانية: sherpa-onnx (أخف على Android)"""
    try:
        import sherpa_onnx
        import numpy as np
        import sounddevice as sd
        log("using sherpa-onnx")
        # نموذج keyword spotting
        # هنستخدم نموذج hey_jarvis أو ننزّل نموذج بسيط
        recognizer = sherpa_onnx.KeywordSpotter(
            keyword=["يا اسلام", "يا إسلام", "hey hermes"],
            model="sherpa-onnx-kws-zipformer-gigaspeech-3.3M-2024-01-01",
            provider="cpu",
        )
        sr = 16000

        def cb(indata, frames, time_info, status):
            audio = np.squeeze(indata).astype(np.float32)
            result = recognizer.accept_waveform(sr, audio)
            if result:
                log(f"🔥 WAKE: {result}")
                st = wake_server()
                log(f"server: {st}")
                subprocess.Popen(["termux-tts-speak", "نعم يا محمود؟"],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.Popen(["am", "start", "-n", "com.hermesagent.hermes_android/.MainActivity"],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                time.sleep(3)

        with sd.InputStream(samplerate=sr, channels=1, dtype="float32", callback=cb):
            log("🎧 listening (sherpa)...")
            while True:
                time.sleep(1)
    except Exception as e:
        log(f"sherpa failed: {e}")
        log("NO WAKE WORD ENGINE AVAILABLE")

def main():
    log("listener started")
    try_openwakeword()

if __name__ == "__main__":
    main()
