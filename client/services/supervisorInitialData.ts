import { supervisorManager, type Supervisor } from './supervisorManager';
import { dataManager } from './dataManager';

// بيانات تجريبية للمشرفين
export const initializeSupervisorData = () => {
  // التحقق من وجود بيانات مشرفين
  const existingSupervisors = supervisorManager.getSupervisors();
  if (existingSupervisors.length > 0) {
    return; // البيانات موجودة بالفعل
  }

  // الحصول على الدول المتاحة
  const countries = dataManager.getCountries();
  if (countries.length === 0) {
    return; // لا توجد دول لربطها بالمشرفين
  }

  // إنشاء مشرفين تجريبيين
  const testSupervisors = [
    {
      name: {
        ar: 'أحمد محمد علي',
        en: 'Ahmed Mohamed Ali',
        fr: 'Ahmed Mohamed Ali'
      },
      email: 'supervisor@sudan.com',
      password: '123456',
      phone: '+249123456789',
      countryId: 'sudan',
      permissions: {
        canEditCountryInfo: true,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: true,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: true,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    },
    {
      name: {
        ar: 'فاطمة الزهراء',
        en: 'Fatima Al-Zahra',
        fr: 'Fatima Al-Zahra'
      },
      email: 'supervisor@saudi.com',
      password: '123456',
      phone: '+966501234567',
      countryId: 'saudi',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    },
    {
      name: {
        ar: 'خالد العبدالله',
        en: 'Khalid Al-Abdullah',
        fr: 'Khalid Al-Abdullah'
      },
      email: 'supervisor@uae.com',
      password: '123456',
      phone: '+971501234567',
      countryId: 'uae',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: false
      },
      isActive: true
    },
    {
      name: {
        ar: 'نورا السيد',
        en: 'Nora Al-Sayed',
        fr: 'Nora Al-Sayed'
      },
      email: 'supervisor@egypt.com',
      password: '123456',
      phone: '+201012345678',
      countryId: 'egypt',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    },
    {
      name: {
        ar: 'يوسف الحسن',
        en: 'Youssef Al-Hassan',
        fr: 'Youssef Al-Hassan'
      },
      email: 'supervisor@morocco.com',
      password: '123456',
      phone: '+212612345678',
      countryId: 'morocco',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    },
    {
      name: {
        ar: 'ليلى القاسم',
        en: 'Layla Al-Qasem',
        fr: 'Layla Al-Qasem'
      },
      email: 'supervisor@jordan.com',
      password: '123456',
      phone: '+962791234567',
      countryId: 'jordan',
      permissions: {
        canEditCountryInfo: false,
        canAddCities: true,
        canEditCities: true,
        canDeleteCities: false,
        canAddOffices: true,
        canEditOffices: true,
        canDeleteOffices: false,
        canViewReports: true,
        canManageReviews: true
      },
      isActive: true
    }
  ];

  // إضافة المشرفين التجريبيين
  testSupervisors.forEach(supervisorData => {
    // التحقق من وجود الدولة قبل إضافة المشرف
    const countryExists = countries.find(c => c.id === supervisorData.countryId);
    if (countryExists) {
      supervisorManager.addSupervisor(supervisorData as any);
    }
  });

  console.log('تم إنشاء بيانات المشرفين التجريبية بنجاح');
};

// تشغيل التهيئة عند تحميل الملف
if (typeof window !== 'undefined') {
  // التأكد من تحميل البيانات بعد تحميل الصفحة
  setTimeout(() => {
    initializeSupervisorData();
  }, 1000);
}

export default initializeSupervisorData;
