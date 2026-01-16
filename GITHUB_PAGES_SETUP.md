# إعداد GitHub Pages

## المشكلة
عند رفع المشروع إلى GitHub Pages، تظهر صفحة بيضاء لأن:
1. المسارات في `index.html` مطلقة (`/assets/...`) ولا تعمل في subdirectory
2. GitHub Pages يحتاج إلى ملف `404.html` للـ SPA routing
3. GitHub Pages يستخدم Jekyll افتراضياً ويحتاج `.nojekyll`

## الحل

### الطريقة 1: رفع مجلد `dist/spa` فقط (موصى به)

1. **بناء المشروع للـ GitHub Pages:**
```bash
npm run build:gh-pages
```

2. **إنشاء فرع `gh-pages`:**
```bash
git checkout --orphan gh-pages
git rm -rf .
git add dist/spa/
git mv dist/spa/* .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

3. **في إعدادات GitHub:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `/` (root)

### الطريقة 2: استخدام GitHub Actions (تلقائي)

1. **إنشاء ملف `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:gh-pages
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/spa
```

2. **الملفات المطلوبة موجودة:**
   - ✅ `404.html` - للـ SPA routing
   - ✅ `.nojekyll` - لمنع Jekyll

### الطريقة 3: رفع يدوي (بسيط)

1. **بناء المشروع:**
```bash
npm run build:gh-pages
```

2. **رفع محتويات `dist/spa` إلى GitHub:**
   - اذهب إلى إعدادات المستودع
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/dist/spa`

## ملاحظات مهمة

### إذا كان المستودع في subdirectory:
إذا كان الرابط: `username.github.io/repo-name`

1. **عدّل `vite.config.ts`:**
```typescript
base: '/repo-name/',
```

2. **أعد البناء:**
```bash
GITHUB_PAGES_BASE=/repo-name/ npm run build:client
```

### إذا كان المستودع في الجذر:
إذا كان الرابط: `username.github.io`

1. **استخدم:**
```typescript
base: '/',
```

2. **أعد البناء:**
```bash
npm run build:gh-pages
```

## التحقق من العمل

بعد الرفع:
1. انتظر 1-2 دقيقة
2. افتح: `https://username.github.io/repo-name` (أو الجذر)
3. يجب أن تظهر الصفحة الرئيسية

## استكشاف الأخطاء

### صفحة بيضاء:
- ✅ تحقق من Console (F12) للأخطاء
- ✅ تحقق من Network tab لمعرفة الملفات المفقودة
- ✅ تأكد من وجود `404.html` و `.nojekyll`

### المسارات لا تعمل:
- ✅ تحقق من `base` في `vite.config.ts`
- ✅ أعد البناء بعد تغيير `base`

### API لا يعمل:
⚠️ **GitHub Pages لا يدعم Node.js/Express**
- API routes لن تعمل على GitHub Pages
- استخدم Netlify أو Vercel للـ API
- أو استخدم GitHub Pages للـ Frontend فقط

## بدائل GitHub Pages

إذا كنت تحتاج API:
1. **Netlify** - يدعم Functions
2. **Vercel** - يدعم Serverless Functions
3. **Render** - يدعم Node.js كامل

راجع `DEPLOYMENT_GUIDE.md` للتفاصيل.

