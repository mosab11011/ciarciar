# أوامر Git لرفع المشروع إلى GitHub

## 📋 الأوامر الكاملة (انسخ والصق)

### 1. تثبيت Git (إذا لم يكن مثبتاً)

**Windows:**
```powershell
winget install Git.Git
```

بعد التثبيت، أعد تشغيل Terminal/PowerShell.

### 2. إعداد Git (للمرة الأولى فقط)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. تهيئة المشروع

```bash
# الانتقال إلى مجلد المشروع
cd C:\Users\DATA\Desktop\Tarhal1

# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit: Tarhal Travel Agency"
```

### 4. ربط المشروع بـ GitHub

**أولاً**: أنشئ مستودع جديد على GitHub من [github.com/new](https://github.com/new)

**ثانياً**: استبدل `YOUR_USERNAME` و `REPO_NAME` في الأمر التالي:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

**مثال:**
```bash
git remote add origin https://github.com/username/tarhal-travel-agency.git
```

### 5. رفع المشروع

```bash
git branch -M main
git push -u origin main
```

**ملاحظة**: إذا طُلب منك تسجيل الدخول:
- **Username**: اسم المستخدم على GitHub
- **Password**: استخدم **Personal Access Token** (ليس كلمة المرور)

## 🔑 إنشاء Personal Access Token

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط **"Generate new token (classic)"**
3. أدخل اسم (مثلاً: "Tarhal Project")
4. اختر الصلاحية: ✅ `repo`
5. اضغط **"Generate token"**
6. **انسخ الـ token** واستخدمه ككلمة مرور

## 🔄 تحديث المشروع لاحقاً

بعد إجراء أي تعديلات:

```bash
git add .
git commit -m "وصف التغييرات"
git push
```

## ✅ التحقق من النجاح

بعد `git push`، اذهب إلى مستودعك على GitHub:
```
https://github.com/YOUR_USERNAME/REPO_NAME
```

يجب أن ترى جميع الملفات.

## 🆘 حل المشاكل

### "git is not recognized"
**الحل**: ثبّت Git من https://git-scm.com/download/win

### "Authentication failed"
**الحل**: استخدم Personal Access Token بدلاً من كلمة المرور

### "Repository not found"
**الحل**: 
- تأكد من اسم المستودع
- تأكد من رابط `origin`
- تحقق من الصلاحيات

---

**راجع `GITHUB_SETUP.md` للتفاصيل الكاملة.**

