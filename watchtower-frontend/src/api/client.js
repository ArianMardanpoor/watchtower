import axios from 'axios';

// تنظیم متغیرهای محیطی با ساختار تمیزتر
const isDev = import.meta.env.DEV;
const API_URL = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3131/api');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'a21uc0lzeTcK';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'X-API-Token': API_TOKEN,
    'Content-Type': 'application/json',
  },
});

// اینترسپتور هوشمندتر برای مدیریت خطاها و فایل‌ها
apiClient.interceptors.response.use(
  (response) => {
    // اگه درخواست از نوع دانلود فایل (blob) بود، کل ریسپانس رو برگردون تا هدرها رو از دست ندیم
    if (response.config.responseType === 'blob') {
      return response;
    }
    // برای بقیه درخواست‌ها، مستقیم دیتا رو بده
    return response.data;
  },
  (error) => {
    // استخراج اطلاعات خطا برای لاگ تمیزتر
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // اینجا می‌تونی ارورها رو گلوبال هندل کنی (مثلا ارور ۴۰۱ رو بفرستی صفحه لاگین)
    if (status === 401) {
      console.error('⚠️ خطای احراز هویت: توکن نامعتبر است!');
    } else {
      console.error(`❌ API Error [${status || 'Network'}]:`, message);
    }
    
    return Promise.reject(error);
  }
);

// متد دانلود فایل (بدون نیاز به async/await اضافه)
export const downloadExport = (path, params = {}) => {
  // فیلتر پارامترهای خالی
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== '' && value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return apiClient.get(path, {
    params: cleanParams,
    responseType: 'blob',
  }).then(response => response.data);
};