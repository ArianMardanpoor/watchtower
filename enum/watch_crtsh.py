#!/usr/bin/env python3
import sys, os, psycopg2, re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database.db import Programs, bulk_upsert_subdomains, current_time

class colors:
    Gray = "\033[90m"
    Reset = "\033[0m"

def crtsh(domain):
    db_params = {
        'dbname': 'certwatch',
        'user': 'guest',
        'password': '',
        'host': 'crt.sh',
        'port': 5432,
        'connect_timeout': 10  # جلوگیری از معلق ماندن اتصال
    }
    query = "SELECT ci.NAME_VALUE FROM certificate_and_identities ci WHERE plainto_tsquery('certwatch', %s) @@ identities(ci.CERTIFICATE)"
    
    print(f"{colors.Gray}[{current_time()}] Querying crt.sh PostgreSQL for {domain}...{colors.Reset}")
    
    processed_results = set()
    connection = None
    cursor = None
    
    try:
        connection = psycopg2.connect(**db_params)
        connection.autocommit = True
        cursor = connection.cursor()
        
        # محدود کردن زمان اجرای کوئری به ۲۰ ثانیه روی سرور crt.sh
        cursor.execute("SET statement_timeout = 20000;")
        
        cursor.execute(query, (domain,))
        results = cursor.fetchall()
        
        for row in results:
            name_value = row[0].strip().lower()
            if domain in name_value and '*' not in name_value:
                for sub in name_value.split('\n'):
                    processed_results.add(sub)

    except psycopg2.Error as e:
        print(f"[{current_time()}] Database error on crt.sh: {e}")
        # اینجا می‌تونی در آینده کد ریکوئست به https://crt.sh/?q=domain&output=json رو به عنوان Fallback بذاری

    finally:
        if cursor: cursor.close()
        if connection: connection.close()
        
    return list(processed_results)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"[{current_time()}] Usage: python3 watch_crtsh.py <domain>")
        sys.exit(1)
        
    domain = sys.argv[1]
    program = Programs.objects(scopes__in=[domain]).first()

    if program:
        print(f"[{current_time()}] Running Crtsh module for {domain}")
        subs = crtsh(domain)
        print(f"{colors.Gray}[{current_time()}] Crtsh found {len(subs)} subdomains for {domain}{colors.Reset}")
        
        if subs:
            # استفاده از متد قدرتمند و جدیدی که ساختیم
            bulk_upsert_subdomains(program.program_name, subs, "crtsh")
    else:
        print(f"[{current_time()}] Scope for {domain} does not exist in watchtower")