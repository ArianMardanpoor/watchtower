# command: waybackurls target.com | unfurl domains | sort -u#!/usr/bin/env python3
import sys, os, requests

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.db import Programs, bulk_upsert_subdomains, current_time, get_domain_name

class colors:
    Gray = "\033[90m"
    Reset = "\033[0m"

def fetch_wayback(domain):
    url = f"http://web.archive.org/cdx/search/cdx?url=*.{domain}/*&output=json&fl=original&collapse=urlkey"
    print(f"{colors.Gray}[{current_time()}] Querying Wayback Machine API for {domain}...{colors.Reset}")
    
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            results = response.json()
            # خط اول هدر ستون‌هاست، از خط دوم می‌خونیم
            if len(results) > 1:
                urls = [item[0] for item in results[1:]]
                
                # استخراج ساب‌دامین از URLها
                subs = set()
                for u in urls:
                    try:
                        # حذف http/https و مسیرها برای استخراج دامین
                        clean_sub = u.split('//')[-1].split('/')[0].split(':')[0]
                        if domain in clean_sub:
                            subs.add(clean_sub)
                    except:
                        pass
                return list(subs)
    except Exception as e:
        print(f"[{current_time()}] Wayback Machine Error: {e}")
        
    return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"[{current_time()}] Usage: python3 watch_waybackurls.py <domain>")
        sys.exit(1)
        
    domain = sys.argv[1]
    program = Programs.objects(scopes__in=[domain]).first()

    if program:
        subs = fetch_wayback(domain)
        print(f"{colors.Gray}[{current_time()}] Wayback found {len(subs)} subdomains for {domain}{colors.Reset}")
        if subs:
            bulk_upsert_subdomains(program.program_name, subs, "wayback")