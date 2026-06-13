export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // بررسی نامعتبر بودن تاریخ (جلوگیری از کرش کردن Intl)
  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // زمان‌ها در داشبوردهای امنیتی/تخصصی معمولاً ۲۴ ساعته خواناتر هستند
  }).format(date);
};

// تابع جدید: نمایش زمان به صورت نسبی (مثلاً: "2 hours ago" یا "Just now")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  // اگر بیشتر از یک هفته بود، همون تاریخ اصلی رو نشون بده
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
  }).format(date);
};