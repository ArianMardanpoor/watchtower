#!/usr/bin/env python3
import os
import re
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from functools import wraps
import signal
import sys
from database.db import (
    Programs, Subdomains, LiveSubdomains, Http,
    current_time
)

app = Flask(__name__)

# خواندن توکن احراز هویت از متغیرهای محیطی سیستم با یک مقدار پیش‌فرض امن
API_TOKEN = os.getenv("WATCHTOWER_API_TOKEN", "a21uc0lzeTcK")


def require_auth(f):
    """
    دکوراتور پیشرفته برای بررسی وجود و صحت API Token در هدر درخواست‌ها.
    استفاده از @wraps الزامی است تا فلسک نام توابع اصلی را گم نکند.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('X-API-Token')
        if not token or token != API_TOKEN:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated


def validate_domain(domain: str) -> bool:
    """اعتبارسنجی فرمت نام دامنه ریشه برای جلوگیری از ورودی‌های مخرب"""
    if not domain or len(domain) > 253:
        return False
    pattern = r'^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}[a-zA-Z0-9]$'
    return bool(re.match(pattern, domain))


def get_pagination_args():
    """استخراج پارامترهای صفحه‌بندی از URL"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    return page, per_page


# ----------------------------------------------------------------------
# 🎯 روت‌های API سیستم واچ‌تاور
# ----------------------------------------------------------------------

@app.route('/api/health')
def health():
    """بررسی وضعیت زنده بودن سرور API (مورد استفاده در دستور health ابزار Go)"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    })


@app.route('/api/programs/all')
@require_auth
def all_programs():
    """لیست کردن تمام برنامه‌های ثبت شده به همراه جزئیات اسکوپ"""
    programs = Programs.objects()
    res = {}
    for p in programs:
        res[p.program_name] = {
            "scopes": getattr(p, 'scopes', []),
            "outofscopes": getattr(p, 'outofscopes', []),
            "config": getattr(p, 'config_data', {}),
            "created_date": p.created_date.strftime("%Y-%m-%d %H:%M:%S") if hasattr(p, 'created_date') and p.created_date else str(datetime.now())
        }
    return jsonify(res)


@app.route('/api/subdomains/all')
@require_auth
def all_subdomains():
    """دریافت کل ساب‌دامین‌های کشف شده در دیتابیس به صورت صفحه‌بندی شده"""
    page, per_page = get_pagination_args()
    total = Subdomains.objects().count()
    subdomains = Subdomains.objects().skip((page - 1) * per_page).limit(per_page)
    
    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'data': [sd.subdomain for sd in subdomains]
    })


@app.route('/api/subdomains/<domain>')
@require_auth
def subdomains_of_domain(domain):
    """
    نمایش ساب‌دامین‌های یک دامین خاص.
    🤖 هوشمند: تشخیص خودکار مرورگر برای نمایش خط‌به‌خط و بدون جیسون!
    """
    if not validate_domain(domain):
        return jsonify({'error': 'Invalid domain format'}), 400
    
    page, per_page = get_pagination_args()
    
    subdomains_query = Subdomains.objects(scope=domain)
    total = subdomains_query.count()
    sub_objs = subdomains_query.skip((page - 1) * per_page).limit(per_page)
    sub_list = [sd.subdomain for sd in sub_objs]
    
    # 🕵️‍♂️ تشخیص هوشمند نوع درخواست دهنده (مرورگر یا ابزار کلاینت)
    user_agent = request.headers.get('User-Agent', '').lower()
    is_browser = any(b in user_agent for b in ['mozilla', 'chrome', 'safari', 'edge', 'gecko'])
    
    # اگر کاربر عمداً پارامتر جیسون نخواسته باشه و با مرورگر اومده باشه
    if is_browser and request.args.get('format', '').lower() != 'json':
        # خروجی کاملاً متنی، تمیز و خط‌به‌خط برای راحتی شما در مرورگر
        text_output = "\n".join(sub_list)
        return app.response_class(text_output, mimetype='text/plain')
    
    # خروجی پیش‌فرض JSON فقط برای ابزار Go یا درخواست‌های خاص
    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'data': sub_list
    })

@app.route('/api/lives/all')
@require_auth
def all_lives():
    """لیست کل دارایی‌های دارای پاسخ زنده (Alive)"""
    page, per_page = get_pagination_args()
    total = LiveSubdomains.objects().count()
    lives = LiveSubdomains.objects().skip((page - 1) * per_page).limit(per_page)
    
    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'data': [l.subdomain for l in lives]
    })


@app.route('/api/live/fresh')
@require_auth
def live_fresh():
    """ساب‌دامین‌های جدیدی که در ۱۲ ساعت گذشته زنده شده‌اند"""
    twelve_hours_ago = datetime.now() - timedelta(hours=12)
    fresh_live = LiveSubdomains.objects(created_date__gte=twelve_hours_ago)
    
    return jsonify({
        'total': fresh_live.count(),
        'data': [l.subdomain for l in fresh_live]
    })


@app.route('/api/http/all')
@require_auth
def all_http():
    """دریافت وب‌سرویس‌های معتبر کشف شده (HTTP/HTTPS) در ۱۲ ساعت گذشته"""
    page, per_page = get_pagination_args()
    twelve_hours_ago = datetime.now() - timedelta(hours=12)
    
    total = Http.objects(last_update__gte=twelve_hours_ago).count()
    http_objs = Http.objects(last_update__gte=twelve_hours_ago).skip((page - 1) * per_page).limit(per_page)
    
    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'data': [h.url for h in http_objs]
    })


@app.route('/api/http/fresh')
@require_auth
def all_http_fresh():
    """وب‌سرویس‌های کاملاً جدید اسکن شده در بازه ۱۲ ساعته اخیر"""
    twelve_hours_ago = datetime.now() - timedelta(hours=12)
    fresh_http = Http.objects(created_date__gte=twelve_hours_ago)
    
    return jsonify({
        'total': fresh_http.count(),
        'data': [h.url for h in fresh_http]
    })


if __name__ == '__main__':
    def handler(signal_received, frame):
        # این تابع هنگام فشردن Ctrl+C اجرا می‌شود
        print('\n[!] Shutting down Watchtower API cleanly...')
        sys.exit(0)

    # ثبت سیگنال Ctrl+C در سیستم‌عامل
    signal.signal(signal.SIGINT, handler)

    # اجرای وب‌سرور
    app.run(host='127.0.0.1', port=3131, debug=False)