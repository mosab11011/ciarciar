# إعداد المشروع للإنتاج على السيرفر

## ✅ التحسينات المنفذة

تم تحسين المشروع ليعمل بشكل صحيح على السيرفر وليس فقط محلياً:

### 1. **مسارات API نسبية**
- جميع طلبات API تستخدم مسارات نسبية `/api/...` 
- لا توجد روابط مطلقة `http://localhost` في الكود

### 2. **إعدادات CORS**
- CORS مفتوح بشكل آمن في الإنتاج (خلف reverse proxy)
- في التطوير، يسمح بـ localhost فقط

### 3. **تقليل Logging**
- Logging مختصر في الإنتاج (فقط عند `DEBUG=true`)
- يحسّن الأداء ويقلل حجم الـ logs

### 4. **متغيرات البيئة**
- استخدام `NODE_ENV=production` للإنتاج
- استخدام `PORT` متغير للمنفذ

## 📋 خطوات النشر على السيرفر

### 1. إعداد متغيرات البيئة

أنشئ ملف `.env` في الجذر:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_PATH=./data/database.db

# Optional - للـ debugging
# DEBUG=true
```

### 2. بناء المشروع

```bash
npm install
npm run build
```

هذا سينشئ:
- `dist/spa/` - Frontend build
- `dist/server/` - Backend build
- `.htaccess` سيتم نسخه تلقائياً

### 3. إعداد قاعدة البيانات

قاعدة البيانات SQLite سيتم إنشاؤها تلقائياً في المسار المحدد في `DATABASE_PATH`.

**ملاحظة**: في الإنتاج، استخدم مساراً مطلقاً:
```env
DATABASE_PATH=/path/to/your/project/data/database.db
```

### 4. تشغيل Node.js Server

#### أ) باستخدام PM2 (مُوصى به):

```bash
# تثبيت PM2
npm install -g pm2

# تشغيل الخادم
cd /path/to/your/project
pm2 start dist/server/node-build.mjs --name tarhal-api

# حفظ القائمة
pm2 save

# إعداد البداية التلقائية
pm2 startup
```

#### ب) باستخدام systemd:

أنشئ `/etc/systemd/system/tarhal-api.service`:

```ini
[Unit]
Description=Tarhal API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/path/to/your/project/.env
ExecStart=/usr/bin/node /path/to/your/project/dist/server/node-build.mjs
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

تفعيل الخدمة:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tarhal-api
sudo systemctl start tarhal-api
```

### 5. إعداد Reverse Proxy

#### Apache:

في ملف التكوين (مثل `/etc/apache2/sites-available/000-default.conf`):

```apache
<VirtualHost *:80>
    ServerName www.ciarciar.com
    DocumentRoot /path/to/your/project/dist/spa

    # Enable proxy modules
    LoadModule proxy_module modules/mod_proxy.so
    LoadModule proxy_http_module modules/mod_proxy_http.so

    # Proxy API requests to Node.js
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api

    # Serve static files
    <Directory "/path/to/your/project/dist/spa">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx:

في `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name www.ciarciar.com;
    root /path/to/your/project/dist/spa;

    # Proxy API requests to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6. إعداد SSL (HTTPS)

```bash
# تثبيت Certbot
sudo apt-get install certbot python3-certbot-apache
# أو
sudo apt-get install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --apache -d www.ciarciar.com
# أو
sudo certbot --nginx -d www.ciarciar.com
```

## ✅ التحقق من النشر

### 1. اختبار Node.js Server مباشرة:

```bash
curl http://localhost:3000/api/health
```

يجب أن ترى:
```json
{"success":true,"message":"API is working correctly",...}
```

### 2. اختبار API من خلال الويب:

```bash
curl https://www.ciarciar.com/api/health
```

يجب أن ترى JSON وليس HTML.

### 3. اختبار Frontend:

افتح `https://www.ciarciar.com` في المتصفح.

## 🔧 استكشاف الأخطاء

### المشكلة: API ترجع HTML بدلاً من JSON

**الحل**: تأكد من إعداد Reverse Proxy بشكل صحيح (راجع الخطوة 5).

### المشكلة: قاعدة البيانات لا تعمل

**الحل**: 
- تأكد من أن المسار في `DATABASE_PATH` صحيح
- تأكد من أن المستخدم لديه صلاحيات الكتابة على المجلد
- أنشئ المجلد يدوياً إذا لزم الأمر: `mkdir -p /path/to/data`

### المشكلة: الخادم لا يعمل

**الحل**:
```bash
# تحقق من حالة PM2
pm2 status

# تحقق من الـ logs
pm2 logs tarhal-api

# أو لـ systemd
sudo systemctl status tarhal-api
sudo journalctl -u tarhal-api -f
```

## 📝 ملاحظات مهمة

1. **المنفذ**: تأكد من أن Node.js يعمل على المنفذ 3000 (أو المنفذ المحدد في `PORT`)
2. **Firewall**: تأكد من أن Firewall يسمح بالاتصال على المنفذ 3000 (محلي) والمنفذ 80/443 (عام)
3. **الصلاحيات**: تأكد من أن المستخدم (www-data/nginx) لديه صلاحيات القراءة على `dist/spa`
4. **Logging**: في الإنتاج، لا يتم تسجيل كل طلب إلا إذا كان `DEBUG=true`

## 🎯 الخلاصة

المشروع الآن:
- ✅ جاهز للإنتاج
- ✅ يستخدم مسارات نسبية
- ✅ CORS آمن
- ✅ Logging محسّن
- ✅ يعمل خلف Reverse Proxy
- ✅ يدعم HTTPS
- ✅ جاهز للنشر على أي سيرفر

راجع `DEPLOYMENT_GUIDE.md` للتفاصيل الكاملة حول النشر.

