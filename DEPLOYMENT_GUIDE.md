# دليل نشر المشروع على السيرفر

## ✅ خطوات النشر الكاملة

### 1. البناء (Build)

```bash
# تثبيت المكتبات (إذا لم تكن مثبتة)
npm install

# بناء المشروع (Frontend + Backend)
npm run build

# التحقق من وجود الملفات
ls -la dist/spa          # Frontend
ls -la dist/server       # Backend
```

### 2. التحقق من `.htaccess`

تأكد من وجود `.htaccess` في `dist/spa` بعد البناء:

```bash
# التحقق
ls -la dist/spa/.htaccess

# إذا لم يكن موجوداً، انسخه يدوياً
cp client/public/.htaccess dist/spa/.htaccess
# أو
cp .htaccess dist/spa/.htaccess
```

### 3. إعداد Node.js Server

#### تشغيل Node.js في الخلفية (Production):

```bash
# استخدام PM2 (مُوصى به)
npm install -g pm2

# تشغيل الخادم
cd /path/to/your/project
PORT=3000 NODE_ENV=production pm2 start dist/server/node-build.mjs --name tarhal-api

# حفظ قائمة العمليات
pm2 save

# إعداد PM2 للبدء التلقائي عند إعادة تشغيل النظام
pm2 startup
```

#### أو استخدام systemd (Linux):

إنشاء ملف `/etc/systemd/system/tarhal-api.service`:

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
sudo systemctl status tarhal-api
```

### 4. إعداد Reverse Proxy

#### أ) إذا كان Apache في المقدمة

##### الطريقة 1: استخدام ProxyPass (مُوصى به)

أضف في ملف تكوين Apache (مثل `/etc/apache2/sites-available/000-default.conf` أو `httpd.conf`):

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

    # Error logs
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

تفعيل الوحدات:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl restart apache2
```

##### الطريقة 2: استخدام `.htaccess` (إذا كان `AllowOverride All` مفعّل)

أضف في `.htaccess` في الجذر:

```apache
RewriteEngine On

# Proxy API requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Exclude API routes from SPA routing
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^ - [L]

# If the requested path is a file or directory, serve it directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Fallback to index.html for SPA routing
RewriteRule ^ index.html [L]
```

#### ب) إذا كان nginx في المقدمة

أضف في ملف تكوين nginx (مثل `/etc/nginx/sites-available/default`):

```nginx
server {
    listen 80;
    server_name www.ciarciar.com;
    root /path/to/your/project/dist/spa;
    index index.html;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

إعادة تحميل nginx:

```bash
sudo nginx -t              # اختبار التكوين
sudo systemctl reload nginx
```

### 5. إعداد SSL (HTTPS) - مُوصى به

#### استخدام Let's Encrypt (Certbot):

```bash
# تثبيت Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-apache
# أو لـ nginx:
sudo apt-get install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --apache -d www.ciarciar.com
# أو لـ nginx:
sudo certbot --nginx -d www.ciarciar.com

# التجديد التلقائي (يتم إضافته تلقائياً)
sudo certbot renew --dry-run
```

### 6. التحقق من أن كل شيء يعمل

#### أ) التحقق من Node.js Server:

```bash
# تحقق من أن الخادم يعمل
curl http://localhost:3000/api/health

# يجب أن ترى:
# {"success":true,"message":"API is working correctly",...}
```

#### ب) التحقق من API من خلال الويب:

```bash
# من السيرفر نفسه
curl https://www.ciarciar.com/api/health

# يجب أن ترى JSON وليس HTML
```

#### ج) التحقق من Frontend:

افتح في المتصفح:
- `https://www.ciarciar.com` - يجب أن تفتح الصفحة الرئيسية
- `https://www.ciarciar.com/admin` - يجب أن تفتح صفحة تسجيل الدخول
- `https://www.ciarciar.com/api/health` - يجب أن ترى JSON

### 7. المراقبة والصيانة

#### مراقبة Node.js Server:

```bash
# إذا كنت تستخدم PM2
pm2 status
pm2 logs tarhal-api
pm2 monit

# إذا كنت تستخدم systemd
sudo systemctl status tarhal-api
sudo journalctl -u tarhal-api -f
```

#### مراقبة Apache/nginx:

```bash
# Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 8. تحديث المشروع

عند إجراء تحديثات:

```bash
# 1. بناء المشروع
npm run build

# 2. إعادة تشغيل Node.js Server
pm2 restart tarhal-api
# أو
sudo systemctl restart tarhal-api

# 3. التحقق من أن كل شيء يعمل
curl https://www.ciarciar.com/api/health
```

## 🔧 استكشاف الأخطاء

### المشكلة: API لا يعمل (ترجع HTML بدلاً من JSON)

**الحل:**
1. تأكد من أن Reverse Proxy مُعد بشكل صحيح (راجع القسم 4)
2. تأكد من أن Node.js Server يعمل (راجع القسم 3)
3. تحقق من أن `.htaccess` موجود في `dist/spa`
4. تحقق من logs:
   ```bash
   # Node.js logs
   pm2 logs tarhal-api
   
   # Apache/nginx logs
   sudo tail -f /var/log/apache2/error.log
   ```

### المشكلة: الصفحة لا تفتح (404)

**الحل:**
1. تأكد من أن `dist/spa/index.html` موجود
2. تحقق من أن DocumentRoot في Apache/nginx صحيح
3. تأكد من أن `.htaccess` موجود وصحيح

### المشكلة: لوحة التحكم لا تعمل

**الحل:**
1. افتح Console في المتصفح (F12) وتحقق من الأخطاء
2. تحقق من أن API يعمل: `curl https://www.ciarciar.com/api/health`
3. تحقق من أن تسجيل الدخول يعمل
4. راجع logs Node.js Server

## 📝 ملاحظات مهمة

1. **المنفذ**: تأكد من أن Node.js يعمل على المنفذ 3000 (أو المنفذ المحدد في `PORT`)
2. **الصلاحيات**: تأكد من أن المستخدم (www-data أو nginx) لديه صلاحيات القراءة على `dist/spa`
3. **Firewall**: تأكد من أن Firewall يسمح بالاتصال على المنفذ 3000 (محلي) والمنفذ 80/443 (عام)
4. **البيئة**: تأكد من تعيين `NODE_ENV=production`
5. **البيانات**: إذا كنت تستخدم قاعدة بيانات، تأكد من إعدادها بشكل صحيح

## ✅ قائمة التحقق قبل النشر

- [ ] تم بناء المشروع (`npm run build`)
- [ ] `.htaccess` موجود في `dist/spa`
- [ ] Node.js Server يعمل ويستمع على المنفذ 3000
- [ ] Reverse Proxy مُعد بشكل صحيح
- [ ] SSL مفعّل (HTTPS)
- [ ] API يعمل (`/api/health` ترجع JSON)
- [ ] Frontend يعمل (الصفحة الرئيسية تفتح)
- [ ] تسجيل الدخول في لوحة التحكم يعمل
- [ ] جميع الوظائف في لوحة التحكم تعمل

## 🆘 الدعم

إذا استمرت المشاكل:
1. تحقق من جميع logs (Node.js, Apache/nginx)
2. تأكد من أن جميع الخطوات تم تنفيذها بشكل صحيح
3. راجع ملفات التكوين للتأكد من عدم وجود أخطاء

