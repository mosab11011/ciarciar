# إصلاح مشكلة API في الإنتاج

## المشكلة
طلبات API ترجع HTML بدلاً من JSON مع خطأ 404.

## الحلول

### 1. التحقق من `.htaccess`

تأكد من أن `.htaccess` موجود في:
- الجذر: `.htaccess`
- `client/public/.htaccess` (سيتم نسخه تلقائياً إلى `dist/spa`)

### 2. إذا كان الخادم يستخدم Apache

تأكد من أن Apache يقرأ `.htaccess`:

في ملف تكوين Apache (عادة `httpd.conf` أو `.htaccess` في الجذر):
```apache
<Directory "/path/to/your/site">
    AllowOverride All
    Require all granted
</Directory>
```

### 3. إذا كان هناك Reverse Proxy (Apache/nginx)

#### Apache Reverse Proxy:
أضف في `httpd.conf` أو `.htaccess`:
```apache
# Proxy API requests to Node.js
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api

# Don't proxy static files
ProxyPass / !
```

#### Nginx Reverse Proxy:
أضف في `nginx.conf`:
```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### 4. التحقق من Node.js Server

تأكد من أن Node.js يعمل:
```bash
# تحقق من أن الخادم يعمل
ps aux | grep node

# أو
netstat -tulpn | grep :3000
```

### 5. إعادة البناء والنشر

```bash
# أعد بناء المشروع
npm run build

# تأكد من نسخ .htaccess
cp .htaccess dist/spa/.htaccess
cp client/public/.htaccess dist/spa/.htaccess

# أعد تشغيل الخادم
npm start
```

### 6. اختبار API

اختبر API مباشرة:
```bash
# Health check
curl https://www.ciarciar.com/api/health

# Auth test
curl https://www.ciarciar.com/api/auth/test
```

يجب أن ترى JSON وليس HTML.

### 7. تحقق من Logs

تحقق من logs الخادم:
```bash
# يجب أن ترى:
# 🔍 [Production] Early API detection: GET /api/health
# 📡 [Production] - GET /api/health
```

إذا لم تر هذه الرسائل، فالمشكلة في Apache/nginx وليس Node.js.

## ملاحظات مهمة

1. **`.htaccess` يجب أن يكون أول شيء** - يجب أن تستثني `/api/` قبل أي قواعد أخرى
2. **Node.js يجب أن يعمل على المنفذ الصحيح** - تحقق من `PORT` environment variable
3. **Reverse Proxy يجب أن يمرر `/api/` إلى Node.js** - لا يعيد توجيهه إلى static files

