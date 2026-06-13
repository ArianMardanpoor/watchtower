// آبجکت‌ها رو بیرون از توابع تعریف می‌کنیم تا در هر بار رندر کامپوننت، دوباره ساخته نشن (بهینه‌سازی مموری)
const PROVIDER_COLORS = {
  subfinder: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  amass: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  dnsx: 'bg-teal-500/10 text-teal-500 border border-teal-500/20',
  httpx: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
};

// استفاده از آرایه و Regex برای کدهای تمیزتر و اضافه کردن راحت‌تر در آینده
const CDN_COLORS = [
  { match: /cloudflare/i, color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20' },
  { match: /akamai/i, color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  { match: /fastly/i, color: 'bg-red-500/10 text-red-500 border border-red-500/20' },
  { match: /amazon|aws/i, color: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
  { match: /incapsula|imperva/i, color: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' }
];

// استایل پیش‌فرض برای مقادیر ناشناخته یا خالی
const DEFAULT_COLOR = 'bg-background text-primary-muted border border-border';

export const getStatusCodeColor = (code) => {
  // تبدیل به عدد برای اطمینان (مثلاً اگر '200' به صورت استرینگ پاس داده شد)
  const numCode = Number(code);
  
  if (!numCode || isNaN(numCode)) return DEFAULT_COLOR;
  
  if (numCode >= 200 && numCode < 300) return 'bg-success/10 text-success border border-success/20';
  if (numCode >= 300 && numCode < 400) return 'bg-accent/10 text-accent border border-accent/20';
  if (numCode >= 400 && numCode < 500) return 'bg-warning/10 text-warning border border-warning/20';
  if (numCode >= 500) return 'bg-danger/10 text-danger border border-danger/20';
  
  return DEFAULT_COLOR;
};

export const getProviderColor = (provider) => {
  // چک کردن اینکه متغیر حتماً استرینگ باشه
  if (!provider || typeof provider !== 'string') return DEFAULT_COLOR;
  
  return PROVIDER_COLORS[provider.toLowerCase()] || DEFAULT_COLOR;
};

export const getCdnColor = (cdnName) => {
  if (!cdnName || typeof cdnName !== 'string') return DEFAULT_COLOR;
  
  // پیدا کردن اولین آیتمی که با Regex مطابقت داره
  const matchedItem = CDN_COLORS.find(item => item.match.test(cdnName));
  
  return matchedItem ? matchedItem.color : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'; // رنگ پیش‌فرض برای CDNهای ناشناس
};