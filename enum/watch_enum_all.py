#!/usr/bin/env python3
import sys, os, subprocess
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.db import Programs, current_time
import config # فرض بر اینه که مسیرها اینجاست

# مسیر دایرکتوری جاری رو داینامیک می‌گیریم
ENUM_DIR = os.path.dirname(os.path.abspath(__file__))

def run_module(command):
    try:
        print(f"[{current_time()}] Starting: {' '.join(command)}")
        # افزودن تایم‌اوت ۵ دقیقه‌ای (۳۰۰ ثانیه) برای هر ابزار
        result = subprocess.run(command, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            print(f"[{current_time()}] Error in {' '.join(command)}:\n{result.stderr}")
            
    except subprocess.TimeoutExpired:
        print(f"[{current_time()}] [!] Execution timed out for: {' '.join(command)}. Skipping...")
    except Exception as e:
        print(f"[{current_time()}] Exception running module: {e}")

if __name__ == "__main__":
    programs = Programs.objects.all()

    # ایجاد یک استخر از Threadها برای اجرای همزمان اسکریپت‌ها
    commands_to_run = []

    for p in programs:
        print(f"[{current_time()}] Preparing tasks for program: {p.program_name}")
        
        for scope in p.scopes:
            # لیست دستوراتی که باید اجرا بشن (اسم فایل‌ها رو تصحیح کردم)
            commands_to_run.extend([
                ["python3", os.path.join(ENUM_DIR, "watch_crtsh.py"), scope],
                ["python3", os.path.join(ENUM_DIR, "watch_subfinder.py"), scope],
                ["python3", os.path.join(ENUM_DIR, "watch_abuseipdb.py"), scope],
                # در آینده waybackurls هم اضافه میشه
            ])

    # اجرای همزمان (مثلاً ۳ ابزار/دامنه به طور همزمان اجرا میشن)
    # می‌تونی max_workers رو بر اساس قدرت سرورت تنظیم کنی
    print(f"[{current_time()}] Starting {len(commands_to_run)} background tasks...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(run_module, commands_to_run)
        
    print(f"[{current_time()}] All enum operations completed!")