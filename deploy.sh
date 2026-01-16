#!/bin/bash

# دليل نشر المشروع على السيرفر
# Usage: ./deploy.sh

set -e  # إيقاف عند حدوث خطأ

echo "🚀 بدء عملية النشر..."

# 1. تثبيت المكتبات
echo "📦 تثبيت المكتبات..."
npm install

# 2. بناء المشروع
echo "🔨 بناء المشروع..."
npm run build

# 3. التحقق من وجود الملفات
echo "✅ التحقق من الملفات..."
if [ ! -f "dist/spa/index.html" ]; then
    echo "❌ خطأ: dist/spa/index.html غير موجود"
    exit 1
fi

if [ ! -f "dist/server/node-build.mjs" ]; then
    echo "❌ خطأ: dist/server/node-build.mjs غير موجود"
    exit 1
fi

# 4. التحقق من .htaccess
if [ -f "dist/spa/.htaccess" ]; then
    echo "✅ .htaccess موجود في dist/spa"
else
    echo "⚠️  .htaccess غير موجود، جاري النسخ..."
    if [ -f "client/public/.htaccess" ]; then
        cp client/public/.htaccess dist/spa/.htaccess
        echo "✅ تم نسخ .htaccess من client/public"
    elif [ -f ".htaccess" ]; then
        cp .htaccess dist/spa/.htaccess
        echo "✅ تم نسخ .htaccess من الجذر"
    else
        echo "⚠️  تحذير: .htaccess غير موجود في أي مكان"
    fi
fi

echo ""
echo "✅ اكتمل البناء بنجاح!"
echo ""
echo "📝 الخطوات التالية:"
echo "1. تأكد من أن Node.js Server يعمل:"
echo "   pm2 start dist/server/node-build.mjs --name tarhal-api"
echo "   أو"
echo "   npm start"
echo ""
echo "2. تأكد من أن Reverse Proxy مُعد في Apache/nginx"
echo "   (راجع DEPLOYMENT_GUIDE.md)"
echo ""
echo "3. اختبر API:"
echo "   curl http://localhost:3000/api/health"
echo "   أو"
echo "   curl https://www.ciarciar.com/api/health"
echo ""

