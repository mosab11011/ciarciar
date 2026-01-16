# حل مشكلة API Routes في الإنتاج

## المشكلة
طلبات API ترجع HTML بدلاً من JSON مع خطأ 404.

## السبب
Apache أو nginx يعيد توجيه طلبات `/api/` إلى `index.html` قبل أن تصل إلى Node.js server.

## الحلول

### الحل 1: استخدام Reverse Proxy في Apache

إذا كان Apache في المقدمة، أضف هذا في `httpd.conf` أو ملف التكوين:

```apache
# Proxy API requests to Node.js
<Location /api>
    ProxyPass http://localhost:3000/api
    ProxyPassReverse http://localhost:3000/api
    ProxyPreserveHost On
</Location>

# Serve static files directly
Alias /dist/spa /path/to/your/site/dist/spa
<Directory "/path/to/your/site/dist/spa">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

### الحل 2: استخدام Reverse Proxy في nginx

أضف هذا في `nginx.conf`:

```nginx
server {
    listen 80;
    server_name www.ciarciar.com;

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve static files
    location / {
        root /path/to/your/site/dist/spa;
        try_files $uri $uri/ /index.html;
    }
}
```

### الحل 3: تشغيل Node.js على منفذ مختلف وتوجيه API إليه

1. شغل Node.js على منفذ 3000:
```bash
PORT=3000 npm start
```

2. في Apache/nginx، أضف reverse proxy كما هو موضح أعلاه.

### الحل 4: التأكد من `.htaccess`

تأكد من أن `.htaccess` موجود في:
- الجذر: `.htaccess`
- `dist/spa/.htaccess` (بعد البناء)

وتأكد من أن Apache يقرأ `.htaccess`:
```apache
<Directory "/path/to/your/site">
    AllowOverride All
    Require all granted
</Directory>
```

## التحقق من الحل

1. اختبر API مباشرة:
```bash
curl https://www.ciarciar.com/api/health
```

يجب أن ترى JSON وليس HTML.

2. اختبر تسجيل الدخول:
افتح `https://www.ciarciar.com/admin` وحاول تسجيل الدخول.

يجب أن يتم توجيهك إلى `/admin/dashboard` بعد نجاح تسجيل الدخول.

## ملاحظات

- تأكد من أن Node.js server يعمل: `ps aux | grep node`
- تأكد من أن Node.js يستمع على المنفذ الصحيح: `netstat -tulpn | grep :3000`
- تحقق من logs الخادم لمعرفة ما إذا كانت الطلبات تصل

