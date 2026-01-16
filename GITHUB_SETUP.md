# دليل رفع المشروع إلى GitHub

## 📋 المتطلبات

1. **تثبيت Git**:
   - Windows: حمّل من [git-scm.com](https://git-scm.com/download/win)
   - أو استخدم: `winget install Git.Git`

2. **حساب GitHub**:
   - أنشئ حساب على [github.com](https://github.com) إذا لم يكن لديك واحد

## 🚀 خطوات رفع المشروع

### 1. تثبيت Git (إذا لم يكن مثبتاً)

**Windows:**
```powershell
# باستخدام winget
winget install Git.Git

# أو حمّل من الموقع الرسمي
# https://git-scm.com/download/win
```

بعد التثبيت، أعد تشغيل Terminal/PowerShell.

### 2. إعداد Git (للمرة الأولى فقط)

```bash
# تعيين اسمك
git config --global user.name "Your Name"

# تعيين بريدك الإلكتروني
git config --global user.email "your.email@example.com"
```

### 3. إنشاء مستودع جديد على GitHub

1. اذهب إلى [github.com](https://github.com)
2. اضغط على زر **"New"** أو **"+"** في الأعلى
3. أدخل اسم المستودع (مثلاً: `tarhal-travel-agency`)
4. اختر **Public** أو **Private**
5. **لا** تضع علامة على "Initialize with README"
6. اضغط **"Create repository"**

### 4. تهيئة Git في المشروع

افتح Terminal/PowerShell في مجلد المشروع:

```bash
# الانتقال إلى مجلد المشروع
cd C:\Users\DATA\Desktop\Tarhal1

# تهيئة Git repository
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit: Tarhal Travel Agency project"
```

### 5. ربط المشروع بـ GitHub

```bash
# إضافة remote repository (استبدل YOUR_USERNAME و REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# مثال:
# git remote add origin https://github.com/username/tarhal-travel-agency.git
```

### 6. رفع المشروع

```bash
# رفع المشروع إلى GitHub
git branch -M main
git push -u origin main
```

إذا طُلب منك تسجيل الدخول:
- استخدم **Personal Access Token** بدلاً من كلمة المرور
- أنشئ token من: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- الصلاحيات المطلوبة: `repo` (كامل)

## 📝 أوامر Git الأساسية

### إضافة تغييرات جديدة:

```bash
# إضافة جميع الملفات المعدلة
git add .

# أو إضافة ملفات محددة
git add file1.ts file2.ts

# عمل commit
git commit -m "وصف التغييرات"

# رفع التغييرات
git push
```

### سحب التحديثات من GitHub:

```bash
git pull
```

### عرض حالة المشروع:

```bash
git status
```

### عرض التاريخ:

```bash
git log
```

## ⚠️ ملاحظات مهمة

### ملفات لن يتم رفعها (محددة في `.gitignore`):

- ✅ `node_modules/` - المكتبات
- ✅ `dist/` - ملفات البناء
- ✅ `.env` - متغيرات البيئة (حساسة)
- ✅ `*.db` - ملفات قاعدة البيانات
- ✅ `.vscode/` - إعدادات المحرر

### ملفات سيتم رفعها:

- ✅ جميع ملفات الكود المصدر
- ✅ `package.json`
- ✅ `README.md`
- ✅ ملفات التكوين
- ✅ `.gitignore`

## 🔐 الأمان

### ملفات حساسة يجب ألا تُرفع:

1. **`.env`** - يحتوي على:
   - `JWT_SECRET`
   - `DATABASE_PATH`
   - معلومات حساسة أخرى

2. **قاعدة البيانات** (`*.db`) - تحتوي على بيانات المستخدمين

3. **مفاتيح API** - إذا كانت موجودة في الكود

**ملاحظة**: `.gitignore` محسّن لاستثناء هذه الملفات تلقائياً.

## 📚 إنشاء Personal Access Token

إذا طُلب منك token عند `git push`:

1. اذهب إلى: [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. اضغط **"Generate new token (classic)"**
3. أدخل اسم للـ token (مثلاً: "Tarhal Project")
4. اختر الصلاحيات:
   - ✅ `repo` (كامل)
5. اضغط **"Generate token"**
6. **انسخ الـ token فوراً** (لن يظهر مرة أخرى)
7. استخدمه ككلمة مرور عند `git push`

## 🎯 بعد الرفع

بعد رفع المشروع بنجاح:

1. **تحقق من GitHub**: اذهب إلى مستودعك على GitHub وتأكد من ظهور الملفات
2. **README.md**: يمكنك إضافة `README.md` لشرح المشروع
3. **التحديثات**: استخدم `git push` عند إجراء أي تغييرات

## 🔄 سيناريوهات شائعة

### تحديث المشروع بعد التعديلات:

```bash
git add .
git commit -m "وصف التغييرات"
git push
```

### سحب آخر التحديثات:

```bash
git pull
```

### إنشاء فرع جديد:

```bash
git checkout -b feature/new-feature
# عمل التعديلات
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
```

### العودة إلى commit سابق:

```bash
git log  # لرؤية التاريخ
git checkout COMMIT_HASH  # للعودة
git checkout main  # للعودة إلى الفرع الرئيسي
```

## ✅ قائمة التحقق

قبل الرفع، تأكد من:

- [ ] Git مثبت ويعمل
- [ ] تم إعداد `user.name` و `user.email`
- [ ] تم إنشاء مستودع على GitHub
- [ ] `.gitignore` موجود ويستثني الملفات الحساسة
- [ ] لا توجد ملفات `.env` في المشروع
- [ ] لا توجد ملفات قاعدة بيانات `.db`
- [ ] تم عمل `git init`
- [ ] تم إضافة `origin` remote
- [ ] تم عمل commit أولي
- [ ] تم رفع المشروع بنجاح

## 🆘 حل المشاكل

### خطأ: "git is not recognized"

**الحل**: قم بتثبيت Git من [git-scm.com](https://git-scm.com/download/win)

### خطأ: "Authentication failed"

**الحل**: استخدم Personal Access Token بدلاً من كلمة المرور

### خطأ: "Repository not found"

**الحل**: 
- تأكد من اسم المستودع
- تأكد من أنك تملك صلاحيات الوصول
- تحقق من رابط `origin`

### خطأ: "Large files"

**الحل**: 
- تأكد من أن `dist/` و `node_modules/` في `.gitignore`
- استخدم `git rm --cached` لإزالة ملفات كبيرة تم إضافتها بالخطأ

## 📖 موارد إضافية

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**ملاحظة**: إذا واجهت أي مشاكل، يمكنك البحث عن الحل في [GitHub Help](https://docs.github.com/) أو [Stack Overflow](https://stackoverflow.com/questions/tagged/git).

