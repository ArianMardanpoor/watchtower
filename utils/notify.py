#!/usr/bin/env python3
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

# پیدا کردن مسیر پایه پروژه و لود کردن فایل .env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, '.env'))

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def current_time():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def send_telegram_message(message):
    """
    ارسال پیام به تلگرام. پشتیبانی از فرمت HTML.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print(f"[{current_time()}] ⚠️ Telegram credentials are not set in .env file!")
        return False

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"[{current_time()}] 🟢 Telegram notification sent successfully.")
            return True
        else:
            print(f"[{current_time()}] 🔴 Failed to send notification: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"[{current_time()}] 🔴 Exception during Telegram request: {e}")
        return False

if __name__ == "__main__":
    test_msg = "🚨 <b>تست سیستم نوتیفیکیشن Watchtower</b>\n\nمتغیرها با موفقیت از فایل .env خوانده شدند!"
    send_telegram_message(test_msg)