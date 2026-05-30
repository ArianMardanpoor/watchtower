from mongoengine import Document, StringField, DateTimeField, ListField, DictField, IntField, connect
from pymongo import UpdateOne  # اضافه شده برای عملیات گروهی و پرسرعت
from datetime import datetime
import tldextract

def current_time():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# اتصال به MongoDB
connect(
    db="watchtower",
    host="mongodb://localhost:27017/watchtower",
    alias="default"
)

def get_domain_name(url):
    """استخراج دامنه اصلی از URL یا ساب‌دامین"""
    ext = tldextract.extract(url)
    return f"{ext.domain}.{ext.suffix}"

def is_in_scope(subdomain, scopes, outofscopes):
    """بررسی اینکه ساب‌دامین در scope است یا خیر"""
    domain = get_domain_name(subdomain)
    
    # چک کردن out of scope
    for oos in outofscopes:
        if oos in subdomain or subdomain == oos:
            return False
    
    # چک کردن scope
    for scope in scopes:
        if subdomain.endswith(scope) or subdomain == scope:
            return True
    
    return False

# ==========================================
# Database Models
# ==========================================

class Programs(Document):
    program_name = StringField(required=True, unique=True)
    created_date = DateTimeField(default=datetime.now)
    config = DictField(default={})
    scopes = ListField(StringField(), default=[])
    outofscopes = ListField(StringField(), default=[])
    
    meta = {
        'collection': 'programs',
        'indexes': [
            {'fields': ['program_name'], 'unique': True}
        ]
    }


class Subdomains(Document):
    program_name = StringField(required=True)
    subdomain = StringField(required=True)
    scope = StringField(required=True)
    providers = ListField(StringField(), default=[])
    last_update = DateTimeField(default=datetime.now)
    created_date = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'subdomains',
        'indexes': [
            {'fields': ['program_name', 'subdomain'], 'unique': True}
        ]
    }


class LiveSubdomains(Document):
    program_name = StringField(required=True)
    subdomain = StringField(required=True, unique=True)
    scope = StringField(required=True)
    ips = ListField(StringField(), default=[])
    cdn = StringField(default="")
    created_date = DateTimeField(default=datetime.now)
    last_update = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'live_subdomains',
        'indexes': [
            {'fields': ['program_name', 'subdomain'], 'unique': True}
        ]
    }


class Http(Document):
    program_name = StringField(required=True)
    subdomain = StringField(required=True, unique=True)
    scope = StringField(required=True)
    ips = ListField(StringField(), default=[])
    tech = ListField(StringField(), default=[])
    title = StringField(default="")
    status_code = IntField(default=0)
    headers = DictField(default={})
    url = StringField()
    final_url = StringField()
    favicon = StringField()
    last_update = DateTimeField(default=datetime.now)
    created_date = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'http_services',
        'indexes': [
            {'fields': ['program_name', 'subdomain'], 'unique': True}
        ]
    }

# ==========================================
# Database Operations
# ==========================================

def upsert_program(program_name, scopes, outofscopes, config=None):
    """درج یا بروزرسانی برنامه"""
    if config is None:
        config = {}
    
    program = Programs.objects(program_name=program_name).first()
    
    if program:
        program.config = config
        program.scopes = scopes
        program.outofscopes = outofscopes
        program.save()
        print(f"[{current_time()}] Updated program: {program_name}")
    else:
        new_program = Programs(
            program_name=program_name,
            created_date=datetime.now(),
            config=config,
            scopes=scopes,
            outofscopes=outofscopes
        )
        new_program.save()
        print(f"[{current_time()}] Inserted new program: {program_name}")


def upsert_subdomain(program_name, subdomain_name, provider):
    """درج یا بروزرسانی یک ساب‌دامین تکی با بررسی scope"""
    program = Programs.objects(program_name=program_name).first()
    
    if not program:
        print(f"[{current_time()}] Program not found: {program_name}")
        return False
    
    if not is_in_scope(subdomain_name, program.scopes, program.outofscopes):
        print(f"[{current_time()}] Subdomain out of scope: {subdomain_name}")
        return False
    
    scope_domain = get_domain_name(subdomain_name)
    existing = Subdomains.objects(program_name=program_name, subdomain=subdomain_name).first()
    
    if existing:
        if provider not in existing.providers:
            existing.providers.append(provider)
            print(f"[{current_time()}] Added provider to subdomain: {subdomain_name}")
        existing.last_update = datetime.now()
        existing.save()
    else:
        new_subdomain = Subdomains(
            program_name=program_name,
            subdomain=subdomain_name,
            scope=scope_domain,
            providers=[provider],
            created_date=datetime.now(),
            last_update=datetime.now()
        )
        new_subdomain.save()
        print(f"[{current_time()}] Inserted new subdomain: {subdomain_name}")
    
    return True


def bulk_upsert_subdomains(program_name, subdomains_list, provider):
    """درج یا بروزرسانی گروهی ساب‌دامین‌ها برای سرعت فوق‌العاده بالا"""
    program = Programs.objects(program_name=program_name).first()
    
    if not program:
        print(f"[{current_time()}] Program not found: {program_name}")
        return False
        
    operations = []
    valid_subs = 0
    
    for sub in subdomains_list:
        sub = sub.strip().lower()
        if not sub: continue
        
        # بررسی scope
        if not is_in_scope(sub, program.scopes, program.outofscopes):
            continue
            
        scope_domain = get_domain_name(sub)
        valid_subs += 1
        
        # ساخت کوئری آپدیت برای Bulk
        operations.append(
            UpdateOne(
                {'program_name': program_name, 'subdomain': sub},
                {
                    '$setOnInsert': {
                        'scope': scope_domain,
                        'created_date': datetime.now()
                    },
                    '$addToSet': {'providers': provider},
                    '$set': {'last_update': datetime.now()}
                },
                upsert=True
            )
        )
    
    if operations:
        collection = Subdomains._get_collection()
        result = collection.bulk_write(operations, ordered=False)
        print(f"[{current_time()}] Bulk Upsert: {valid_subs} domains processed for {program_name} by {provider}")
    
    return True


def upsert_live(obj):
    """درج یا بروزرسانی ساب‌دامین زنده"""
    program = Programs.objects(scopes__in=[obj.get('scope')]).first()
    
    if not program:
        print(f"[{current_time()}] Program not found for scope: {obj.get('scope')}")
        return False
    
    existing = LiveSubdomains.objects(subdomain=obj.get('subdomain')).first()
    
    if existing:
        ips_changed = False
        if obj.get('ips'):
            new_ips = sorted(obj.get('ips', []))
            old_ips = sorted(existing.ips)
            if new_ips != old_ips:
                existing.ips = new_ips
                ips_changed = True
        
        if ips_changed or obj.get('cdn') != existing.cdn:
            existing.last_update = datetime.now()
            if obj.get('cdn'):
                existing.cdn = obj.get('cdn')
            existing.save()
            print(f"[{current_time()}] Updated live subdomain: {obj.get('subdomain')}")
    else:
        new_live = LiveSubdomains(
            program_name=program.program_name,
            subdomain=obj.get('subdomain'),
            scope=obj.get('scope'),
            ips=obj.get('ips', []),
            cdn=obj.get('cdn', ''),
            created_date=datetime.now(),
            last_update=datetime.now()
        )
        new_live.save()
        print(f"[{current_time()}] Inserted new live subdomain: {obj.get('subdomain')}")
    
    return True


def upsert_http(obj):
    """درج یا بروزرسانی اطلاعات HTTP"""
    program = Programs.objects(scopes__in=[obj.get('scope')]).first()
    
    if not program:
        print(f"[{current_time()}] Program not found for scope: {obj.get('scope')}")
        return False
    
    existing = Http.objects(subdomain=obj.get('subdomain')).first()
    
    if existing:
        changes = []
        
        if obj.get('title') and existing.title != obj.get('title'):
            changes.append(f"title: {existing.title} -> {obj.get('title')}")
            existing.title = obj.get('title')
        
        if obj.get('status_code') and existing.status_code != obj.get('status_code'):
            changes.append(f"status_code: {existing.status_code} -> {obj.get('status_code')}")
            existing.status_code = obj.get('status_code')
        
        if obj.get('favicon') and existing.favicon != obj.get('favicon'):
            changes.append("favicon changed")
            existing.favicon = obj.get('favicon')
        
        if changes:
            # TODO: ارسال اعلان به تلگرام
            print(f"[{current_time()}] Changes detected for {obj.get('subdomain')}: {', '.join(changes)}")
        
        existing.ips = obj.get('ips', [])
        existing.tech = obj.get('tech', [])
        existing.headers = obj.get('headers', {})
        existing.url = obj.get('url', '')
        existing.final_url = obj.get('final_url', '')
        existing.last_update = datetime.now()
        existing.save()
    else:
        new_http = Http(
            program_name=program.program_name,
            subdomain=obj.get('subdomain'),
            scope=obj.get('scope'),
            ips=obj.get('ips', []),
            tech=obj.get('tech', []),
            title=obj.get('title', ''),
            status_code=obj.get('status_code', 0),
            headers=obj.get('headers', {}),
            url=obj.get('url', ''),
            final_url=obj.get('final_url', ''),
            favicon=obj.get('favicon', ''),
            created_date=datetime.now(),
            last_update=datetime.now()
        )
        new_http.save()
        print(f"[{current_time()}] Inserted new HTTP service: {obj.get('subdomain')}")
    
    return True
