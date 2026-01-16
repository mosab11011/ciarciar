import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export type Language = 'ar' | 'en' | 'fr' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  translatePage: (lang: string) => void;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.offices': 'المكاتب السياحية',
    'nav.about': 'من نحن',
    'nav.contact': 'التواصل',
    'nav.admin': 'لوحة الإدارة',
    
    // Common
    'common.search': 'بحث',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.readMore': 'اقرأ المزيد',
    'common.bookNow': 'احجز الآن',
    'common.viewDetails': 'عرض التفاصيل',
    'common.getStarted': 'ابدأ الآن',
    'common.learnMore': 'تعلم المزيد',
    'common.discover': 'اكتشف',
    'common.explore': 'استكشف',
    'common.days': 'أيام',
    'common.hotels': 'فنادق',
    'common.tours': 'جولا��',
    'common.reviews': 'مراجعة',
    'common.rating': 'التقييم',
    'common.description': 'الوصف',
    'common.highlights': 'المعالم البارزة',
    'common.gallery': 'معرض الصور',
    'common.overview': 'نظرة عامة',
    'common.cities': 'المدن',
    'common.culture': 'الثقافة',
    'common.cuisine': 'المأكولات',
    'common.transportation': 'المواصلات',
    'common.safety': 'الأمان',
    'common.visaRequired': 'تأشيرة مطلوبة',
    'common.noVisaRequired': 'بدون تأشيرة',
    'common.bestTime': 'أفضل وقت للزيارة',
    'common.climate': 'المناخ',
    'common.language': 'اللغة',
    'common.currency': 'العملة',
    'common.timezone': 'المنطقة الزمنية',
    'common.capital': 'العاصمة',
    
    // Homepage
    'hero.title': 'اكتشف العالم مع',
    'hero.subtitle': 'رحلات استثنائية إلى أجمل الوجهات العالمية مع خدمة متميزة وأسعار تنافسية',
    'hero.cta': 'اكتشف وجهتك القادمة',
    
    // Features
    'features.title': 'لماذا تختار ت��حال؟',
    'features.expert.title': 'خبرة عالمية',
    'features.expert.desc': 'أكثر من 15 عاماً ��ي صناعة السياحة ��لعالمية',
    'features.support.title': 'دعم 24/7',
    'features.support.desc': 'فريق دعم متخصص متاح طوال الي��م',
    'features.price.title': 'أسعار تنافسية',
    'features.price.desc': 'أفضل الأسعار والعروض الحصرية',
    'features.booking.title': 'حجز آمن',
    'features.booking.desc': 'نظام حجز إلكتروني آمن ومضمون',
    
    // Countries section
    'countries.title': 'الوجهات الأكثر شعبية',
    'countries.subtitle': 'استكشف أجمل البلدان والوجهات السياحية حول العالم',
    
    // Testimonials
    'testimonials.title': 'ماذا يقول عملاؤنا',
    'testimonials.subtitle': 'تجارب حقيقية من عملائنا الكرام',
    
    // Footer
    'footer.company': 'شركة CIAR للسياحة والسفر',
    'footer.description': 'وجهتك المثالية في عالم العقارات مع خدمات عقارية متميزة وتجربة لا تُنسى',
    'footer.quickLinks': 'روابط سريعة',
    'footer.services': 'خدماتنا',
    'footer.contact': 'تواصل معنا',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة © 2024 شركة تر��ال للسياحة والسفر',
    
    // Search
    'search.placeholder': 'ابحث عن وجهة أو مدينة...',
    'search.noResults': 'لا ت��جد نتائج',
    'search.results': 'نتائج البحث',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.login': 'تسجيل الدخول',
    'admin.logout': 'تسجيل الخروج',
    'admin.addOffice': 'إضافة مكتب',
    'admin.editOffice': 'تعديل مكتب',
    'admin.deleteOffice': 'حذف مكتب',
    
    // Contact
    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'نحن هنا لمساعدتك في ��خطيط رحلتك المثالية',
    'contact.name': 'الاسم',
    'contact.email': 'البريد الإلكتروني',
    'contact.message': 'الرسالة',
    'contact.send': 'إرسال الرسالة',
    
    // About
    'about.title': 'من نحن',
    'about.subtitle': 'شركة رائدة في مجال السياحة والسفر',
    'about.hero.title': 'من نحن',
    'about.hero.subtitle': 'قصة نجاح CIAR',
    'about.hero.description': 'منذ عام 2008، نحن نصنع ذكريات لا تُنسى ونحول أحلام السفر إلى واقع جميل. رحلتنا بدأت بحلم بسيط: جعل العالم أقرب إليكم',
    'about.hero.cta1': 'رحلتنا الشركة',
    'about.hero.cta2': 'قصص النجاح',
    'about.hero.cta3': 'تواصل معنا',
    'about.story.title': 'قصة CIAR',
    'about.story.subtitle': 'من حلم إلى حقيقة',
    'about.story.content1': 'بدأت رحلة CIAR عام 2008 كحلم بسيط في قلب الخرطوم. كان لدينا رؤية واضحة: أن نجعل السفر تجربة سهلة وممتعة لكل شخص يحلم باستكشاف العالم.',
    'about.story.content2': 'من مكتب صغير في السودان، نمونا لنصبح شبكة عالمية تضم أكثر من 50 مكتب في 6 قارات. كل خطوة في رحلتنا كانت مدفوعة بشغفنا لخدمة عملائنا وتحقيق أحلامهم.',
    'about.story.content3': 'اليوم، نحن فخورون بأن نكون جزءاً من ذكريات أكثر من 100,000 مسافر حول العالم. وما زلنا نحلم ونعمل لنكون الخيار الأول لكل من يريد استكشاف جمال هذا العالم.',
    'about.story.contact': 'تواصل معنا',
    'about.story.download': 'تحميل الكتيب',
    'about.story.years': 'سنة خبرة',
    'about.story.clients': 'عميل سعيد',
    'about.values.title': 'قيمنا ومبادئنا',
    'about.values.subtitle': 'المبادئ التي نؤمن بها وتوجه عملنا في كل يوم',
    'about.vision.title': 'رؤيتنا',
    'about.vision.description': 'أن نكون الشركة الرائدة عالمياً في مجال السياحة والسفر',
    'about.vision.content': 'نسعى لأن نكون الخيار الأول للمسافرين حول العالم من خلال تقديم خدمات استثنائية وتجارب لا تُنسى. نحلم بعالم بلا حدود حيث يمكن للجميع استكشاف جمال الأرض وثقافاتها المتنوعة.',
    'about.vision.details1': 'الريادة في الخدمات السياحية',
    'about.vision.details2': 'تجارب سفر استثنائية',
    'about.vision.details3': 'تواجد عالمي متميز',
    'about.vision.details4': 'رضا عملاء 100%',
    'about.mission.title': 'مهمتنا',
    'about.mission.description': 'تقديم أفضل الخدمات السياحية بمعايير عالمية',
    'about.mission.content': 'نقدم حلول سياحية متكاملة تشمل الحجوزات والإرشاد والدعم لضمان حصول عملائنا على تجربة سفر مثالية. نلتزم بتحويل أحلام السفر إلى ذكريات خالدة.',
    'about.mission.details1': 'خدمات سياحية شاملة',
    'about.mission.details2': 'دعم 24/7',
    'about.mission.details3': 'أسعار تنافسية',
    'about.mission.details4': 'ضمان الجودة',
    'about.values.title2': 'قيمنا',
    'about.values.description': 'الجودة والمصداقية والاحترافية في كل تفصيل',
    'about.values.content': 'نؤمن بالشفافية والصدق في التعامل مع عملائنا. نلتزم بأعلى معايير الجودة والأخلاق المهنية في جميع خدماتنا ونضع رضا العملاء فوق كل اعتبار.',
    'about.values.details1': 'المصداقية والشفافية',
    'about.values.details2': 'الاحترافية العالية',
    'about.values.details3': 'الالتزام بالوقت',
    'about.values.details4': 'التطوير المستمر',
    'about.commitment.title': 'التزامنا',
    'about.commitment.description': 'نلتزم بتقديم تجارب سفر آمنة ومريحة',
    'about.commitment.content': 'نضع سلامة وراحة عملائنا في المقدمة. نقدم خدمات التأمين والدعم اللوجستي المتكامل لضمان رحلة آمنة ومريحة من البداية حتى النهاية.',
    'about.commitment.details1': 'ضمان السلامة',
    'about.commitment.details2': 'تأمين شامل',
    'about.commitment.details3': 'دعم طوارئ',
    'about.commitment.details4': 'متابعة مستمرة',
    'about.experience.title': 'خبرتنا',
    'about.experience.description': 'أكثر من 15 عاماً من الخبرة في السياحة',
    'about.experience.content': 'بدأنا رحلتنا عام 2008 ونمونا لنصبح واحدة من أكبر شركات السياحة في المنطقة. خبرتنا الطويلة مكنتنا من فهم احتياجات المسافرين وتقديم أفضل الحلول.',
    'about.experience.details1': '15+ سنة خبرة',
    'about.experience.details2': '100,000+ عميل سعيد',
    'about.experience.details3': '50+ وجهة سياحية',
    'about.experience.details4': 'فريق خبراء محترف',
    'about.innovation.title': 'الابتكار',
    'about.innovation.description': 'نواكب أحدث التقنيات في صناعة السياحة',
    'about.innovation.content': 'نستخدم أحدث التقنيات والمنصات الرقمية لتسهيل عمليات الحجز والدفع. نطور باستمرار خدماتنا لتواكب توقعات العصر الرقمي.',
    'about.innovation.details1': 'حجز إلكتروني متطور',
    'about.innovation.details2': 'تطبيق جوال',
    'about.innovation.details3': 'دفع آمن',
    'about.innovation.details4': 'خدمات ذكية',
    'about.features.title': 'ما يميزنا',
    'about.features.subtitle': 'المميزات التي تجعل CIAR خيارك الأول في السفر والسياحة',
    'about.features.global.title': 'تغطية عالمية',
    'about.features.global.description': 'مكاتب في أكثر من 50 دولة حول العالم',
    'about.features.global.stats': '50+ دولة',
    'about.features.team.title': 'فريق محترف',
    'about.features.team.description': 'خبراء سياحة معتمدون ومدربون على أعلى مستوى',
    'about.features.team.stats': '500+ خبير',
    'about.features.security.title': 'أمان وثقة',
    'about.features.security.description': 'حماية كاملة وتأمين شامل لجميع رحلاتكم',
    'about.features.security.stats': '100% آمن',
    'about.features.support.title': 'خدمة 24/7',
    'about.features.support.description': 'دعم ومساعدة على مدار الساعة طوال أيام الأسبوع',
    'about.features.support.stats': '24/7 دعم',
    'about.timeline.title': 'رحلة النجاح',
    'about.timeline.subtitle': 'معالم مهمة في تاريخ شركة CIAR',
    'about.timeline.2008.title': 'التأسيس',
    'about.timeline.2008.description': 'تأسيس شركة CIAR للخدمات العقارية في الخرطوم، السودان',
    'about.timeline.2010.title': 'التوسع الأول',
    'about.timeline.2010.description': 'افتتاح أول فرع خارج السودان في القاهرة',
    'about.timeline.2015.title': 'النمو السريع',
    'about.timeline.2015.description': 'الوصول إلى 25 مكتب في 15 دولة',
    'about.timeline.2018.title': 'التحول الرقمي',
    'about.timeline.2018.description': 'إطلاق منصة الحجز الإلكترونية',
    'about.timeline.2020.title': 'جائزة التميز',
    'about.timeline.2020.description': 'حصولنا على جائزة التميز في السياحة',
    'about.timeline.2024.title': 'القيادة العالمية',
    'about.timeline.2024.description': 'أكثر من 50 مكتب في 6 قارات',
    'about.achievements.title': 'إنجازاتنا',
    'about.achievements.subtitle': 'جوائز وتقديرات حصلنا عليها تقديراً لجهودنا',
    'about.achievements.bestCompany.title': 'أفضل شركة سياحة',
    'about.achievements.bestCompany.year': '2023',
    'about.achievements.bestCompany.description': 'جائزة أفضل شركة سياحة في الشرق الأوسط',
    'about.achievements.fiveStars.title': 'تقييم 5 نجوم',
    'about.achievements.fiveStars.year': '2022',
    'about.achievements.fiveStars.description': 'حصلنا على تقييم 5 نجوم من 95% من عملائنا',
    'about.achievements.growth.title': 'نمو مستمر',
    'about.achievements.growth.year': '2021',
    'about.achievements.growth.description': 'نمو بنسبة 150% في عدد العملاء',
    'about.achievements.quality.title': 'شهادة الجودة',
    'about.achievements.quality.year': '2020',
    'about.achievements.quality.description': 'شهادة ISO للجودة في خدمات السياحة',
    'about.testimonials.title': 'شهادات عملائنا',
    'about.testimonials.subtitle': 'كلمات من القلب من عملائنا الكرام',
    'about.testimonials.ahmed.name': 'أحمد محمد',
    'about.testimonials.ahmed.location': 'الرياض، السعودية',
    'about.testimonials.ahmed.text': 'تجربة رائعة مع CIAR! نظموا لنا رحلة إلى تركيا كانت أكثر من رائعة. الخدمة احترافية والأسعار ممتازة.',
    'about.testimonials.fatma.name': 'فاطمة أحمد',
    'about.testimonials.fatma.location': 'دبي، الإمارات',
    'about.testimonials.fatma.text': 'شكراً لفريق CIAR على تنظيم رحلة العمرة المباركة. كل شيء كان منظم ومرتب بأعلى مستوى من الاحترافية.',
    'about.testimonials.mohammed.name': 'محمد علي',
    'about.testimonials.mohammed.location': 'الخرطوم، السودان',
    'about.testimonials.mohammed.text': 'أنصح الجميع بالتعامل مع CIAR. فريق محترف وخدمة ممتازة. رحلتي إلى ماليزيا كانت حلم تحقق.',
    'about.team.title': 'فريق القيادة',
    'about.team.subtitle': 'تعرف على قادة CIAR الذين يقودون رؤيتنا نحو المستقبل',
    'about.team.ahmed.name': 'أحمد محمد علي',
    'about.team.ahmed.position': 'الرئيس التنفيذي',
    'about.team.ahmed.bio': 'مؤسس شركة CIAR وخبير في صناعة السياحة لأكثر من 20 عاماً',
    'about.team.ahmed.experience': '20+ سنة',
    'about.team.ahmed.achievement1': 'جائزة أفضل رائد أعمال',
    'about.team.ahmed.achievement2': 'مؤسس جمعية السياحة السودانية',
    'about.team.fatma.name': 'فاطمة أحمد حسن',
    'about.team.fatma.position': 'مديرة العمليات',
    'about.team.fatma.bio': 'متخصصة في إدارة العمليات السياحية وتطوير الخدمات',
    'about.team.fatma.experience': '15+ سنة',
    'about.team.fatma.achievement1': 'شهادة إدارة الجودة ISO',
    'about.team.fatma.achievement2': 'مدربة معتمدة في السياحة',
    'about.team.mohammed.name': 'محمد عبدالله سالم',
    'about.team.mohammed.position': 'مدير التسويق',
    'about.team.mohammed.bio': 'خبير في التسويق الرقمي والعلامات التجارية في قطاع السياحة',
    'about.team.mohammed.experience': '12+ سنة',
    'about.team.mohammed.achievement1': 'جائزة أفضل حملة تسويقية',
    'about.team.mohammed.achievement2': 'متحدث في مؤتمرات السياحة',
    'about.team.sara.name': 'سارة يوسف إبراهيم',
    'about.team.sara.position': 'مديرة الموارد البشرية',
    'about.team.sara.bio': 'متخصصة في تطوير الموارد البشرية وإدارة الفرق',
    'about.team.sara.experience': '10+ سنة',
    'about.team.sara.achievement1': 'شهادة في إدارة الموارد البشرية',
    'about.team.sara.achievement2': 'مدربة في التنمية المهنية',
    'about.services.title': 'خدماتنا المتميزة',
    'about.services.subtitle': 'مجموعة شاملة من الخدمات السياحية المصممة لتلبية احتياجاتكم',
    'about.services.international.title': 'السياحة الدولية',
    'about.services.international.description': 'تنظيم رحلات إلى جميع دول العالم مع خدمات متكاملة',
    'about.services.international.features1': 'حجوزات فنادق',
    'about.services.international.features2': 'تذاكر طيران',
    'about.services.international.features3': 'برامج سياحية',
    'about.services.international.features4': 'خدمات تأشيرات',
    'about.services.umrah.title': 'العمرة والحج',
    'about.services.umrah.description': 'خدمات شاملة لرحلات العمرة والحج بأعلى معايير الجودة',
    'about.services.umrah.features1': 'تصاريح رسمية',
    'about.services.umrah.features2': 'إقامة فاخرة',
    'about.services.umrah.features3': 'مرشدين متخصصين',
    'about.services.umrah.features4': 'خدمات طبية',
    'about.services.group.title': 'الرحلات الجماعية',
    'about.services.group.description': 'تنظيم رحلات جماعية للعائلات والشركات والمجموعات',
    'about.services.group.features1': 'أسعار خاصة',
    'about.services.group.features2': 'برامج متنوعة',
    'about.services.group.features3': 'تنسيق كامل',
    'about.services.group.features4': 'دعم 24/7',
    'about.services.digital.title': 'الخدمات الإلكترونية',
    'about.services.digital.description': 'منصة إلكترونية متطورة للحجز والإدارة',
    'about.services.digital.features1': 'حجز فوري',
    'about.services.digital.features2': 'دفع آمن',
    'about.services.digital.features3': 'تتبع الرحلة',
    'about.services.digital.features4': 'دعم فني',
    'about.services.more': 'اعرف المزيد',
    'about.services.quote': 'احصل على عرض أسعار',
    'about.certifications.title': 'الشهادات والجوائز',
    'about.certifications.subtitle': 'الاعترافات والشهادات التي حصلنا عليها على مدار رحلتنا',
    'about.certifications.iso': 'ISO 9001',
    'about.certifications.bestCompany': 'أفضل شركة سياحة',
    'about.certifications.quality': 'شهادة الجودة',
    'about.certifications.excellence': 'جائزة التميز',
    'about.certifications.fiveStars': 'تقييم 5 نجوم',
    'about.certifications.security': 'شهادة الأمان',
    'about.videos.title': 'فيديوهات شهادات العملاء',
    'about.videos.subtitle': 'شاهد قصص نجاح عملائنا من خلال فيديوهاتهم الشخصية',
    'about.videos.umrah.title': 'رحلة عمرة مع CIAR',
    'about.videos.turkey.title': 'تجربة السفر إلى تركيا',
    'about.videos.malaysia.title': 'رحلة العائلة إلى ماليزيا',
    'about.faq.title': 'الأسئلة الشائعة',
    'about.faq.subtitle': 'إجابات على أكثر الأسئلة تكراراً حول خدماتنا',
    'about.faq.experience.question': 'ما هي خبرة شركة CIAR في مجال السياحة؟',
    'about.faq.experience.answer': 'تأسست شركة CIAR عام 2008 ولديها أكثر من 15 عاماً من الخبرة في تنظيم الرحلات السياحية، وقد خدمت أكثر من 100,000 عميل سعيد.',
    'about.faq.visas.question': 'هل تقدمون خدمات التأشيرة؟',
    'about.faq.visas.answer': 'نعم، نقدم خدمات استخراج التأشيرات لجميع الوجهات السياحية التي نغطيها، بالتعاون مع أفضل الشركاء والسفارات.',
    'about.faq.cancellation.question': 'ما هي سياسة الإلغاء والاسترداد؟',
    'about.faq.cancellation.answer': 'سياسة الإلغاء تختلف حسب نوع الخدمة والوجهة، وعادة ما نقدم استرداد كامل أو جزئي حسب الفترة المتبقية قبل موعد الرحلة.',
    'about.faq.offices.question': 'هل لديكم مكاتب في دول أخرى؟',
    'about.faq.offices.answer': 'نعم، لدينا أكثر من 50 مكتب في 6 قارات حول العالم، مما يضمن لعملائنا خدمة متميزة أينما كانوا.',
    'about.faq.quote.question': 'كيف يمكنني الحصول على عرض أسعار؟',
    'about.faq.quote.answer': 'يمكنكم التواصل معنا عبر الموقع الإلكتروني أو زيارة أحد مكاتبنا، وسنقدم لكم عرض أسعار مفصل ومناسب لاحتياجاتكم.',
    'about.faq.companies.question': 'هل تقدمون خدمات للشركات؟',
    'about.faq.companies.answer': 'نعم، لدينا خدمات خاصة للشركات تشمل رحلات الموظفين، المؤتمرات، والفعاليات الجماعية مع عروض وأسعار تنافسية.',
    'about.map.title': 'تواجدنا العالمي',
    'about.map.subtitle': 'مكاتبنا حول العالم جاهزة لخدمتكم',
    'about.map.offices': 'أكثر من 50 مكتب',
    'about.map.continents': 'موزعة في 6 قارات',
    'about.map.global': 'تغطية عالمية',
    'about.map.worldwide': 'خدمات في جميع الدول والقارات',
    'about.map.support': 'دعم 24/7',
    'about.map.available': 'فرق دعم متواجدة دائماً لمساعدتكم',
    'about.newsletter.title': 'اشترك في نشرتنا الإخبارية',
    'about.newsletter.subtitle': 'احصل على أحدث العروض والوجهات السياحية والنصائح المفيدة',
    'about.newsletter.placeholder': 'أدخل بريدك الإلكتروني',
    'about.newsletter.subscribe': 'اشتراك',
    'about.newsletter.note': 'لن نرسل spam أبداً. يمكنك إلغاء الاشتراك في أي وقت.',
    'about.social.title': 'تابعونا على وسائل التواصل',
    'about.social.subtitle': 'ابقوا على اطلاع بأحدث العروض والوجهات',

    // Statistics
    'home.statistics.title': 'أرقامنا تتحدث عن نجاحنا',
    'home.statistics.subtitle': 'نفخر بثقة عملائنا وخبرتنا العريقة في مجال السياحة',

    // Travel Offices Page
    'travelOffices.heroTitle': 'مكاتبنا السياحية',
    'travelOffices.heroSubtitle': 'اكتشف العالم معنا',
    'travelOffices.heroDescription': 'أكثر من 50 مكتب سياحي في أجمل دول العالم، نقدم لكم أفضل الخدمات السياحية والتجارب الاستثنائية',
    'travelOffices.searchPlaceholder': 'ابحث عن وجهتك المفضلة...',
    'travelOffices.allContinents': 'جميع القارات',
    'travelOffices.africa': 'أفريقيا',
    'travelOffices.asia': 'آسيا',
    'travelOffices.europe': 'أوروبا',
    'travelOffices.america': 'أمريكا',
    'travelOffices.sortBy': 'ترتيب حسب:',
    'travelOffices.name': 'الاسم',
    'travelOffices.rating': 'التقييم',
    'travelOffices.toursCount': 'عدد الجولات',
    'travelOffices.mostPopular': 'الأكثر شعبية',
    'travelOffices.destinationsAvailable': 'وجهة متاحة',
    'travelOffices.featuredDestinations': 'الوجهات المميزة',
    'travelOffices.featuredSubtitle': 'اكتشف أشهر وجهاتنا السياحية الأكثر طلباً',
    'travelOffices.allDestinations': 'جميع الوجهات',
    'travelOffices.searchResults': 'نتائج البحث',
    'travelOffices.destinationsWaiting': 'وجهة سياحية تنتظر اكتشافك',
    'travelOffices.noResults': 'لا توجد نتائج',
    'travelOffices.noResultsMessage': 'لم نجد أي وجهات تطابق معايير البحث الخاصة بك',
    'travelOffices.resetSearch': 'إعادة تعيين البحث',
    'travelOffices.exploreDestination': 'استكشف الوجهة',
    'travelOffices.details': 'تفاصيل',
    'travelOffices.tour': 'جولة',
    'travelOffices.hotel': 'فندق',
    'travelOffices.attraction': 'معلم',
    'travelOffices.reviews': 'مراجعة',
    'travelOffices.popular': 'شائع',
    'travelOffices.featured': 'مميز',
    'travelOffices.countries': 'دولة',
    'travelOffices.tours': 'جولة سياحية',
    'travelOffices.hotels': 'فندق وشقة',
    'travelOffices.happyClients': 'عميل سعيد',
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.offices': 'Travel Offices',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin Dashboard',
    
    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.readMore': 'Read More',
    'common.bookNow': 'Book Now',
    'common.viewDetails': 'View Details',
    'common.getStarted': 'Get Started',
    'common.learnMore': 'Learn More',
    'common.discover': 'Discover',
    'common.explore': 'Explore',
    'common.days': 'Days',
    'common.hotels': 'Hotels',
    'common.tours': 'Tours',
    'common.reviews': 'Reviews',
    'common.rating': 'Rating',
    'common.description': 'Description',
    'common.highlights': 'Highlights',
    'common.gallery': 'Gallery',
    'common.overview': 'Overview',
    'common.cities': 'Cities',
    'common.culture': 'Culture',
    'common.cuisine': 'Cuisine',
    'common.transportation': 'Transportation',
    'common.safety': 'Safety',
    'common.visaRequired': 'Visa Required',
    'common.noVisaRequired': 'No Visa Required',
    'common.bestTime': 'Best Time to Visit',
    'common.climate': 'Climate',
    'common.language': 'Language',
    'common.currency': 'Currency',
    'common.timezone': 'Timezone',
    'common.capital': 'Capital',
    
    // Homepage
    'hero.title': 'Discover the World with',
    'hero.subtitle': 'Exceptional journeys to the world\'s most beautiful destinations with premium service and competitive prices',
    'hero.cta': 'Discover Your Next Destination',
    
    // Features
    'features.title': 'Why Choose CIAR?',
    'features.expert.title': 'Global Expertise',
    'features.expert.desc': 'Over 15 years in the global tourism industry',
    'features.support.title': '24/7 Support',
    'features.support.desc': 'Specialized support team available around the clock',
    'features.price.title': 'Competitive Prices',
    'features.price.desc': 'Best prices and exclusive offers',
    'features.booking.title': 'Secure Booking',
    'features.booking.desc': 'Safe and guaranteed electronic booking system',
    
    // Countries section
    'countries.title': 'Most Popular Destinations',
    'countries.subtitle': 'Explore the most beautiful countries and tourist destinations around the world',
    
    // Testimonials
    'testimonials.title': 'What Our Clients Say',
    'testimonials.subtitle': 'Real experiences from our valued customers',
    
    // Footer
    'footer.company': 'CIAR Tourism & Travel Company',
    'footer.description': 'Your ideal destination for exploring the world with premium tourism services and unforgettable experiences',
    'footer.quickLinks': 'Quick Links',
    'footer.services': 'Our Services',
    'footer.contact': 'Contact Us',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All Rights Reserved © 2024 CIAR Tourism & Travel Company',
    
    // Search
    'search.placeholder': 'Search for destination or city...',
    'search.noResults': 'No results found',
    'search.results': 'Search Results',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.login': 'Login',
    'admin.logout': 'Logout',
    'admin.addOffice': 'Add Office',
    'admin.editOffice': 'Edit Office',
    'admin.deleteOffice': 'Delete Office',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help you plan your perfect trip',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'Leading company in tourism and travel',

    // Statistics
    'home.statistics.title': 'Our Numbers Speak for Our Success',
    'home.statistics.subtitle': 'We take pride in our customers\' trust and our extensive experience in tourism',

    // Travel Offices Page
    'travelOffices.heroTitle': 'Our Travel Offices',
    'travelOffices.heroSubtitle': 'Discover the World with Us',
    'travelOffices.heroDescription': 'More than 50 travel offices in the world\'s most beautiful countries, offering you the best tourism services and exceptional experiences',
    'travelOffices.searchPlaceholder': 'Search for your favorite destination...',
    'travelOffices.allContinents': 'All Continents',
    'travelOffices.africa': 'Africa',
    'travelOffices.asia': 'Asia',
    'travelOffices.europe': 'Europe',
    'travelOffices.america': 'America',
    'travelOffices.sortBy': 'Sort by:',
    'travelOffices.name': 'Name',
    'travelOffices.rating': 'Rating',
    'travelOffices.toursCount': 'Tours Count',
    'travelOffices.mostPopular': 'Most Popular',
    'travelOffices.destinationsAvailable': 'destination available',
    'travelOffices.featuredDestinations': 'Featured Destinations',
    'travelOffices.featuredSubtitle': 'Discover our most popular and sought-after tourist destinations',
    'travelOffices.allDestinations': 'All Destinations',
    'travelOffices.searchResults': 'Search Results',
    'travelOffices.destinationsWaiting': 'tourist destination waiting to be discovered',
    'travelOffices.noResults': 'No results',
    'travelOffices.noResultsMessage': 'We couldn\'t find any destinations that match your search criteria',
    'travelOffices.resetSearch': 'Reset Search',
    'travelOffices.exploreDestination': 'Explore Destination',
    'travelOffices.details': 'Details',
    'travelOffices.tour': 'tour',
    'travelOffices.hotel': 'hotel',
    'travelOffices.attraction': 'attraction',
    'travelOffices.reviews': 'review',
    'travelOffices.popular': 'Popular',
    'travelOffices.featured': 'Featured',
    'travelOffices.countries': 'Country',
    'travelOffices.tours': 'Tourist Tour',
    'travelOffices.hotels': 'Hotel and Apartment',
    'travelOffices.happyClients': 'Happy Client',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.offices': 'Oficinas de Viaje',
    'nav.about': 'Sobre Nosotros',
    'nav.contact': 'Contacto',
    'nav.admin': 'Panel de Administración',

    // Common
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.readMore': 'Leer Más',
    'common.bookNow': 'Reservar Ahora',
    'common.viewDetails': 'Ver Detalles',
    'common.getStarted': 'Comenzar',
    'common.learnMore': 'Aprender Más',
    'common.discover': 'Descubrir',
    'common.explore': 'Explorar',
    'common.days': 'Días',
    'common.hotels': 'Hoteles',
    'common.tours': 'Tours',
    'common.reviews': 'Reseñas',
    'common.rating': 'Calificación',
    'common.description': 'Descripción',
    'common.highlights': 'Destacados',
    'common.gallery': 'Galería',
    'common.overview': 'Resumen',
    'common.cities': 'Ciudades',
    'common.culture': 'Cultura',
    'common.cuisine': 'Cocina',
    'common.transportation': 'Transporte',
    'common.safety': 'Seguridad',
    'common.visaRequired': 'Visa Requerida',
    'common.noVisaRequired': 'Sin Visa Requerida',
    'common.bestTime': 'Mejor Momento para Visitar',
    'common.climate': 'Clima',
    'common.language': 'Idioma',
    'common.currency': 'Moneda',
    'common.timezone': 'Zona Horaria',
    'common.capital': 'Capital',

    // Homepage
    'hero.title': 'Descubre el Mundo con',
    'hero.subtitle': 'Viajes excepcionales a los destinos más hermosos del mundo con servicio premium y precios competitivos',
    'hero.cta': 'Descubre Tu Próximo Destino',

    // Features
    'features.title': '¿Por Qué Elegir CIAR?',
    'features.expert.title': 'Experiencia Global',
    'features.expert.desc': 'Más de 15 años en la industria del turismo global',
    'features.support.title': 'Soporte 24/7',
    'features.support.desc': 'Equipo de soporte especializado disponible las 24 horas',
    'features.price.title': 'Precios Competitivos',
    'features.price.desc': 'Mejores precios y ofertas exclusivas',
    'features.booking.title': 'Reserva Segura',
    'features.booking.desc': 'Sistema de reserva electrónica seguro y garantizado',

    // Countries section
    'countries.title': 'Destinos Más Populares',
    'countries.subtitle': 'Explora los países y destinos turísticos más hermosos del mundo',

    // Testimonials
    'testimonials.title': 'Qué Dicen Nuestros Clientes',
    'testimonials.subtitle': 'Experiencias reales de nuestros valiosos clientes',

    // Footer
    'footer.company': 'Compañía de Turismo y Viaje CIAR',
    'footer.description': 'Tu destino ideal para explorar el mundo con servicios turísticos premium y experiencias inolvidables',
    'footer.quickLinks': 'Enlaces Rápidos',
    'footer.services': 'Nuestros Servicios',
    'footer.contact': 'Contáctanos',
    'footer.followUs': 'Síguenos',
    'footer.rights': 'Todos los Derechos Reservados © 2024 Compañía de Turismo y Viaje CIAR',

    // Search
    'search.placeholder': 'Buscar destino o ciudad...',
    'search.noResults': 'No se encontraron resultados',
    'search.results': 'Resultados de Búsqueda',

    // Admin
    'admin.dashboard': 'Panel de Control',
    'admin.login': 'Iniciar Sesión',
    'admin.logout': 'Cerrar Sesión',
    'admin.addOffice': 'Agregar Oficina',
    'admin.editOffice': 'Editar Oficina',
    'admin.deleteOffice': 'Eliminar Oficina',

    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Estamos aquí para ayudarte a planificar tu viaje perfecto',
    'contact.name': 'Nombre',
    'contact.email': 'Correo Electrónico',
    'contact.message': 'Mensaje',
    'contact.send': 'Enviar Mensaje',

    // About
    'about.title': 'Sobre Nosotros',
    'about.subtitle': 'Compañía líder en turismo y viajes',
    'about.hero.title': 'Sobre Nosotros',
    'about.hero.subtitle': 'La historia de CIAR',
    'about.hero.description': 'Desde 2008, creamos recuerdos inolvidables y convertimos los sueños de viaje en realidad hermosa. Nuestro viaje comenzó con un sueño simple: hacer que el mundo sea más accesible para ustedes',
    'about.hero.cta1': 'Nuestra Historia',
    'about.hero.cta2': 'Historias de Éxito',
    'about.hero.cta3': 'Contáctanos',
    'about.story.title': 'La Historia de CIAR',
    'about.story.subtitle': 'De un sueño a la realidad',
    'about.story.content1': 'El viaje de CIAR comenzó en 2008 como un sueño simple en el corazón de Jartum. Teníamos una visión clara: hacer que viajar fuera una experiencia fácil y placentera para todos los que sueñan con explorar el mundo.',
    'about.story.content2': 'Desde una pequeña oficina en Sudán, crecimos hasta convertirnos en una red global con más de 50 oficinas en 6 continentes. Cada paso en nuestro viaje fue impulsado por nuestra pasión por servir a nuestros clientes y hacer realidad sus sueños.',
    'about.story.content3': 'Hoy, nos sentimos orgullosos de ser parte de los recuerdos de más de 100,000 viajeros de todo el mundo. Y seguimos soñando y trabajando para ser la primera opción para todos los que quieren explorar la belleza de este mundo.',
    'about.story.contact': 'Contáctanos',
    'about.story.download': 'Descargar Folleto',
    'about.story.years': 'Años de Experiencia',
    'about.story.clients': 'Clientes Satisfechos',
    'about.values.title': 'Nuestros Valores y Principios',
    'about.values.subtitle': 'Los principios en los que creemos y que guían nuestro trabajo cada día',
    'about.vision.title': 'Nuestra Visión',
    'about.vision.description': 'Ser la compañía líder mundial en turismo y viajes',
    'about.vision.content': 'Nos esforzamos por ser la primera opción para los viajeros de todo el mundo al proporcionar servicios excepcionales y experiencias inolvidables. Soñamos con un mundo sin fronteras donde todos puedan explorar la belleza de la Tierra y sus culturas diversas.',
    'about.vision.details1': 'Liderazgo en servicios turísticos',
    'about.vision.details2': 'Experiencias de viaje excepcionales',
    'about.vision.details3': 'Presencia global destacada',
    'about.vision.details4': 'Satisfacción del cliente 100%',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.description': 'Proporcionar los mejores servicios turísticos con estándares globales',
    'about.mission.content': 'Ofrecemos soluciones turísticas integrales que incluyen reservas y orientación para garantizar que nuestros clientes obtengan una experiencia de viaje perfecta. Nos comprometemos a convertir los sueños de viaje en recuerdos eternos.',
    'about.mission.details1': 'Servicios turísticos integrales',
    'about.mission.details2': 'Soporte 24/7',
    'about.mission.details3': 'Precios competitivos',
    'about.mission.details4': 'Garantía de calidad',
    'about.values.title2': 'Nuestros Valores',
    'about.values.description': 'Calidad, integridad y profesionalismo en cada detalle',
    'about.values.content': 'Creemos en la transparencia y honestidad en el trato con nuestros clientes. Nos comprometemos con los más altos estándares de calidad y ética profesional en todos nuestros servicios y ponemos la satisfacción del cliente por encima de todo.',
    'about.values.details1': 'Integridad y transparencia',
    'about.values.details2': 'Profesionalismo excepcional',
    'about.values.details3': 'Compromiso con el tiempo',
    'about.values.details4': 'Mejora continua',
    'about.commitment.title': 'Nuestro Compromiso',
    'about.commitment.description': 'Nos comprometemos a proporcionar experiencias de viaje seguras y cómodas',
    'about.commitment.content': 'Ponemos la seguridad y comodidad de nuestros clientes en primer lugar. Proporcionamos servicios de seguro y apoyo logístico integral para garantizar un viaje seguro y cómodo desde el principio hasta el final.',
    'about.commitment.details1': 'Garantía de seguridad',
    'about.commitment.details2': 'Seguro integral',
    'about.commitment.details3': 'Soporte de emergencia',
    'about.commitment.details4': 'Seguimiento continuo',
    'about.experience.title': 'Nuestra Experiencia',
    'about.experience.description': 'Más de 15 años de experiencia en turismo',
    'about.experience.content': 'Comenzamos nuestro viaje en 2008 y crecimos hasta convertirnos en una de las compañías de turismo más grandes de la región. Nuestra experiencia a largo plazo nos permitió entender las necesidades de los viajeros y proporcionar las mejores soluciones.',
    'about.experience.details1': '15+ años de experiencia',
    'about.experience.details2': '100,000+ clientes satisfechos',
    'about.experience.details3': '50+ destinos turísticos',
    'about.experience.details4': 'Equipo de expertos profesionales',
    'about.innovation.title': 'Innovación',
    'about.innovation.description': 'Nos mantenemos al día con las últimas tecnologías en la industria turística',
    'about.innovation.content': 'Utilizamos las últimas tecnologías y plataformas digitales para facilitar los procesos de reserva y gestión. Desarrollamos continuamente nuestros servicios para adaptarnos a las expectativas de la era digital.',
    'about.innovation.details1': 'Reserva electrónica avanzada',
    'about.innovation.details2': 'Aplicación móvil',
    'about.innovation.details3': 'Pago seguro',
    'about.innovation.details4': 'Servicios inteligentes',
    'about.features.title': 'Lo que nos distingue',
    'about.features.subtitle': 'Las características que hacen de CIAR tu primera opción en viajes y turismo',
    'about.features.global.title': 'Cobertura Global',
    'about.features.global.description': 'Oficinas en más de 50 países de todo el mundo',
    'about.features.global.stats': '50+ países',
    'about.features.team.title': 'Equipo Profesional',
    'about.features.team.description': 'Expertos en turismo certificados y capacitados al más alto nivel',
    'about.features.team.stats': '500+ expertos',
    'about.features.security.title': 'Seguridad y Confianza',
    'about.features.security.description': 'Protección completa y seguro integral para todos tus viajes',
    'about.features.security.stats': '100% seguro',
    'about.features.support.title': 'Servicio 24/7',
    'about.features.support.description': 'Apoyo y asistencia las 24 horas del día, 7 días a la semana',
    'about.features.support.stats': '24/7 soporte',
    'about.timeline.title': 'Línea de Tiempo del Éxito',
    'about.timeline.subtitle': 'Hitos importantes en la historia de la compañía CIAR',
    'about.timeline.2008.title': 'Fundación',
    'about.timeline.2008.description': 'Fundación de la compañía CIAR para servicios inmobiliarios en Jartum, Sudán',
    'about.timeline.2010.title': 'Primera Expansión',
    'about.timeline.2010.description': 'Apertura de la primera sucursal fuera de Sudán en El Cairo',
    'about.timeline.2015.title': 'Crecimiento Rápido',
    'about.timeline.2015.description': 'Alcance de 25 oficinas en 15 países',
    'about.timeline.2018.title': 'Transformación Digital',
    'about.timeline.2018.description': 'Lanzamiento de la plataforma de reserva electrónica',
    'about.timeline.2020.title': 'Premio de Excelencia',
    'about.timeline.2020.description': 'Recepción del premio de excelencia en turismo',
    'about.timeline.2024.title': 'Liderazgo Global',
    'about.timeline.2024.description': 'Más de 50 oficinas en 6 continentes',
    'about.achievements.title': 'Nuestros Logros',
    'about.achievements.subtitle': 'Premios y reconocimientos que hemos recibido por nuestros esfuerzos',
    'about.achievements.bestCompany.title': 'Mejor Compañía de Turismo',
    'about.achievements.bestCompany.year': '2023',
    'about.achievements.bestCompany.description': 'Premio a la mejor compañía de turismo en Oriente Medio',
    'about.achievements.fiveStars.title': 'Calificación 5 Estrellas',
    'about.achievements.fiveStars.year': '2022',
    'about.achievements.fiveStars.description': 'Hemos recibido calificación de 5 estrellas del 95% de nuestros clientes',
    'about.achievements.growth.title': 'Crecimiento Continuo',
    'about.achievements.growth.year': '2021',
    'about.achievements.growth.description': 'Crecimiento del 150% en el número de clientes',
    'about.achievements.quality.title': 'Certificado de Calidad',
    'about.achievements.quality.year': '2020',
    'about.achievements.quality.description': 'Certificado ISO de calidad en servicios turísticos',
    'about.testimonials.title': 'Testimonios de Nuestros Clientes',
    'about.testimonials.subtitle': 'Palabras del corazón de nuestros queridos clientes',
    'about.testimonials.ahmed.name': 'Ahmed Mohamed',
    'about.testimonials.ahmed.location': 'Riad, Arabia Saudita',
    'about.testimonials.ahmed.text': '¡Experiencia increíble con CIAR! Organizaron un viaje a Turquía que fue más que increíble. El servicio es profesional y los precios excelentes.',
    'about.testimonials.fatma.name': 'Fatma Ahmed Hassan',
    'about.testimonials.fatma.location': 'Dubái, Emiratos Árabes',
    'about.testimonials.fatma.text': 'Gracias al equipo de CIAR por organizar el viaje de Umrah bendito. Todo estuvo organizado y arreglado al más alto nivel de profesionalismo.',
    'about.testimonials.mohammed.name': 'Mohammed Ali Salem',
    'about.testimonials.mohammed.location': 'Jartum, Sudán',
    'about.testimonials.mohammed.text': 'Recomiendo a todos que traten con CIAR. Equipo profesional y servicio excelente. Mi viaje a Malasia fue un sueño hecho realidad.',
    'about.team.title': 'Equipo de Liderazgo',
    'about.team.subtitle': 'Conoce a los líderes de CIAR que guían nuestra visión hacia el futuro',
    'about.team.ahmed.name': 'Ahmed Mohamed Ali',
    'about.team.ahmed.position': 'Director Ejecutivo',
    'about.team.ahmed.bio': 'Fundador de la compañía CIAR y experto en la industria turística por más de 20 años',
    'about.team.ahmed.experience': '20+ años',
    'about.team.ahmed.achievement1': 'Premio al mejor emprendedor',
    'about.team.ahmed.achievement2': 'Fundador de la Asociación de Turismo de Sudán',
    'about.team.fatma.name': 'Fatma Ahmed Hassan',
    'about.team.fatma.position': 'Directora de Operaciones',
    'about.team.fatma.bio': 'Especialista en gestión de operaciones turísticas y desarrollo de servicios',
    'about.team.fatma.experience': '15+ años',
    'about.team.fatma.achievement1': 'Certificado de gestión de calidad ISO',
    'about.team.fatma.achievement2': 'Entrenadora certificada en turismo',
    'about.team.mohammed.name': 'Mohammed Abdullah Salem',
    'about.team.mohammed.position': 'Director de Marketing',
    'about.team.mohammed.bio': 'Experto en marketing digital y branding en el sector turístico',
    'about.team.mohammed.experience': '12+ años',
    'about.team.mohammed.achievement1': 'Premio a la mejor campaña de marketing',
    'about.team.mohammed.achievement2': 'Orador en conferencias de turismo',
    'about.team.sara.name': 'Sara Yusuf Ibrahim',
    'about.team.sara.position': 'Directora de Recursos Humanos',
    'about.team.sara.bio': 'Especialista en desarrollo de recursos humanos y gestión de equipos',
    'about.team.sara.experience': '10+ años',
    'about.team.sara.achievement1': 'Certificado en gestión de recursos humanos',
    'about.team.sara.achievement2': 'Entrenadora en desarrollo profesional',
    'about.services.title': 'Nuestros Servicios Exclusivos',
    'about.services.subtitle': 'Una gama completa de servicios turísticos diseñados para satisfacer tus necesidades',
    'about.services.international.title': 'Turismo Internacional',
    'about.services.international.description': 'Organización de viajes a todos los países del mundo con servicios integrales',
    'about.services.international.features1': 'Reservas de hoteles',
    'about.services.international.features2': 'Boletos de avión',
    'about.services.international.features3': 'Programas turísticos',
    'about.services.international.features4': 'Servicios de visas',
    'about.services.umrah.title': 'Umrah y Hajj',
    'about.services.umrah.description': 'Servicios integrales para viajes de Umrah y Hajj con los más altos estándares de calidad',
    'about.services.umrah.features1': 'Permisos oficiales',
    'about.services.umrah.features2': 'Alojamiento lujoso',
    'about.services.umrah.features3': 'Guías especializados',
    'about.services.umrah.features4': 'Servicios médicos',
    'about.services.group.title': 'Viajes Grupales',
    'about.services.group.description': 'Organización de viajes grupales para familias, empresas y grupos',
    'about.services.group.features1': 'Precios especiales',
    'about.services.group.features2': 'Programas diversos',
    'about.services.group.features3': 'Coordinación completa',
    'about.services.group.features4': 'Soporte 24/7',
    'about.services.digital.title': 'Servicios Electrónicos',
    'about.services.digital.description': 'Plataforma electrónica avanzada para reserva y gestión',
    'about.services.digital.features1': 'Reserva instantánea',
    'about.services.digital.features2': 'Pago seguro',
    'about.services.digital.features3': 'Seguimiento del viaje',
    'about.services.digital.features4': 'Soporte técnico',
    'about.services.more': 'Saber Más',
    'about.services.quote': 'Obtener Presupuesto',
    'about.certifications.title': 'Certificaciones y Premios',
    'about.certifications.subtitle': 'Los reconocimientos y certificados que hemos recibido a lo largo de nuestro viaje',
    'about.certifications.iso': 'ISO 9001',
    'about.certifications.bestCompany': 'Mejor Compañía de Turismo',
    'about.certifications.quality': 'Certificado de Calidad',
    'about.certifications.excellence': 'Premio de Excelencia',
    'about.certifications.fiveStars': 'Calificación 5 Estrellas',
    'about.certifications.security': 'Certificado de Seguridad',
    'about.videos.title': 'Videos de Testimonios de Clientes',
    'about.videos.subtitle': 'Mira las historias de éxito de nuestros clientes a través de sus videos personales',
    'about.videos.umrah.title': 'Viaje de Umrah con CIAR',
    'about.videos.turkey.title': 'Experiencia de Viaje a Turquía',
    'about.videos.malaysia.title': 'Viaje Familiar a Malasia',
    'about.faq.title': 'Preguntas Frecuentes',
    'about.faq.subtitle': 'Respuestas a las preguntas más comunes sobre nuestros servicios',
    'about.faq.experience.question': '¿Cuál es la experiencia de la compañía CIAR en el campo del turismo?',
    'about.faq.experience.answer': 'La compañía CIAR fue fundada en 2008 y tiene más de 15 años de experiencia en la organización de viajes turísticos, y ha servido a más de 100,000 clientes satisfechos.',
    'about.faq.visas.question': '¿Proporcionan servicios de visas?',
    'about.faq.visas.answer': 'Sí, proporcionamos servicios de obtención de visas para todos los destinos turísticos que cubrimos, en cooperación con los mejores socios y embajadas.',
    'about.faq.cancellation.question': '¿Cuál es la política de cancelación y reembolso?',
    'about.faq.cancellation.answer': 'La política de cancelación varía según el tipo de servicio y destino, generalmente ofrecemos reembolso completo o parcial según el tiempo restante antes de la fecha del viaje.',
    'about.faq.offices.question': '¿Tienen oficinas en otros países?',
    'about.faq.offices.answer': 'Sí, tenemos más de 50 oficinas en 6 continentes de todo el mundo, lo que garantiza servicio excepcional para nuestros clientes dondequiera que estén.',
    'about.faq.quote.question': '¿Cómo puedo obtener un presupuesto?',
    'about.faq.quote.answer': 'Puedes contactarnos a través del sitio web o visitar una de nuestras oficinas, y te proporcionaremos un presupuesto detallado y adecuado para tus necesidades.',
    'about.faq.companies.question': '¿Proporcionan servicios para empresas?',
    'about.faq.companies.answer': 'Sí, tenemos servicios especiales para empresas que incluyen viajes de empleados, conferencias y eventos grupales con precios y ofertas competitivas.',
    'about.map.title': 'Nuestra Presencia Global',
    'about.map.subtitle': 'Nuestras oficinas de todo el mundo listas para servirte',
    'about.map.offices': 'Más de 50 oficinas',
    'about.map.continents': 'Distribuidas en 6 continentes',
    'about.map.global': 'Cobertura global',
    'about.map.worldwide': 'Servicios en todos los países y continentes',
    'about.map.support': 'Soporte 24/7',
    'about.map.available': 'Equipos de soporte disponibles siempre para ayudarte',
    'about.newsletter.title': 'Suscríbete a Nuestro Boletín Informativo',
    'about.newsletter.subtitle': 'Obtén las últimas ofertas y destinos turísticos y consejos útiles',
    'about.newsletter.placeholder': 'Ingresa tu correo electrónico',
    'about.newsletter.subscribe': 'Suscribirse',
    'about.newsletter.note': 'Nunca enviaremos spam. Puedes darte de baja en cualquier momento.',
    'about.social.title': 'Síguenos en Redes Sociales',
    'about.social.subtitle': 'Mantente informado con las últimas ofertas y destinos',

    // Statistics
    'home.statistics.title': 'Nuestros Números Hablan de Nuestro Éxito',
    'home.statistics.subtitle': 'Nos enorgullecemos de la confianza de nuestros clientes y nuestra experiencia incomparable en turismo',

    // Travel Offices Page
    'travelOffices.heroTitle': 'Nuestras Oficinas de Viaje',
    'travelOffices.heroSubtitle': 'Descubre el Mundo con Nosotros',
    'travelOffices.heroDescription': 'Más de 50 oficinas de viaje en los países más hermosos del mundo, ofreciéndote los mejores servicios turísticos y experiencias excepcionales',
    'travelOffices.searchPlaceholder': 'Busca tu destino favorito...',
    'travelOffices.allContinents': 'Todos los Continentes',
    'travelOffices.africa': 'África',
    'travelOffices.asia': 'Asia',
    'travelOffices.europe': 'Europa',
    'travelOffices.america': 'América',
    'travelOffices.sortBy': 'Ordenar por:',
    'travelOffices.name': 'Nombre',
    'travelOffices.rating': 'Calificación',
    'travelOffices.toursCount': 'Número de Tours',
    'travelOffices.mostPopular': 'Más Popular',
    'travelOffices.destinationsAvailable': 'destino disponible',
    'travelOffices.featuredDestinations': 'Destinos Destacados',
    'travelOffices.featuredSubtitle': 'Descubre nuestros destinos turísticos más populares y solicitados',
    'travelOffices.allDestinations': 'Todos los Destinos',
    'travelOffices.searchResults': 'Resultados de Búsqueda',
    'travelOffices.destinationsWaiting': 'destino turístico esperando que lo descubras',
    'travelOffices.noResults': 'Sin resultados',
    'travelOffices.noResultsMessage': 'No pudimos encontrar destinos que coincidan con tus criterios de búsqueda',
    'travelOffices.resetSearch': 'Restablecer Búsqueda',
    'travelOffices.exploreDestination': 'Explorar Destino',
    'travelOffices.details': 'Detalles',
    'travelOffices.tour': 'tour',
    'travelOffices.hotel': 'hotel',
    'travelOffices.attraction': 'atracción',
    'travelOffices.reviews': 'reseña',
    'travelOffices.popular': 'Popular',
    'travelOffices.featured': 'Destacado',
    'travelOffices.countries': 'País',
    'travelOffices.tours': 'Tour Turístico',
    'travelOffices.hotels': 'Hotel y Apartamento',
    'travelOffices.happyClients': 'Cliente Feliz',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.offices': 'Bureaux de Voyage',
    'nav.about': 'À Propos',
    'nav.contact': 'Contact',
    'nav.admin': 'Tableau de Bord',
    
    // Common
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.readMore': 'Lire Plus',
    'common.bookNow': 'Réserver Maintenant',
    'common.viewDetails': 'Voir Détails',
    'common.getStarted': 'Commencer',
    'common.learnMore': 'En Savoir Plus',
    'common.discover': 'Découvrir',
    'common.explore': 'Explorer',
    'common.days': 'Jours',
    'common.hotels': 'Hôtels',
    'common.tours': 'Tours',
    'common.reviews': 'Avis',
    'common.rating': 'Évaluation',
    'common.description': 'Description',
    'common.highlights': 'Points Forts',
    'common.gallery': 'Galerie',
    'common.overview': 'Aperçu',
    'common.cities': 'Villes',
    'common.culture': 'Culture',
    'common.cuisine': 'Cuisine',
    'common.transportation': 'Transport',
    'common.safety': 'Sécurité',
    'common.visaRequired': 'Visa Requis',
    'common.noVisaRequired': 'Pas de Visa Requis',
    'common.bestTime': 'Meilleur Moment pour Visiter',
    'common.climate': 'Climat',
    'common.language': 'Langue',
    'common.currency': 'Devise',
    'common.timezone': 'Fuseau Horaire',
    'common.capital': 'Capitale',
    
    // Homepage
    'hero.title': 'Découvrez le Monde avec',
    'hero.subtitle': 'Voyages exceptionnels vers les plus belles destinations du monde avec un service premium et des prix compétitifs',
    'hero.cta': 'Découvrez Votre Prochaine Destination',
    
    // Features
    'features.title': 'Pourquoi Choisir CIAR?',
    'features.expert.title': 'Expertise Mondiale',
    'features.expert.desc': 'Plus de 15 ans dans l\'industrie du tourisme mondial',
    'features.support.title': 'Support 24/7',
    'features.support.desc': 'Équipe de support spécialisée disponible 24h/24',
    'features.price.title': 'Prix Compétitifs',
    'features.price.desc': 'Meilleurs prix et offres exclusives',
    'features.booking.title': 'Réservation Sécurisée',
    'features.booking.desc': 'Système de réservation électronique sûr et garanti',
    
    // Countries section
    'countries.title': 'Destinations les Plus Populaires',
    'countries.subtitle': 'Explorez les plus beaux pays et destinations touristiques du monde',
    
    // Testimonials
    'testimonials.title': 'Ce Que Disent Nos Clients',
    'testimonials.subtitle': 'Expériences réelles de nos précieux clients',
    
    // Footer
    'footer.company': 'Compagnie de Tourisme et Voyage CIAR',
    'footer.description': 'Votre destination idéale pour explorer le monde avec des services touristiques premium et des expériences inoubliables',
    'footer.quickLinks': 'Liens Rapides',
    'footer.services': 'Nos Services',
    'footer.contact': 'Nous Contacter',
    'footer.followUs': 'Suivez-Nous',
    'footer.rights': 'Tous Droits Réservés © 2024 Compagnie de Tourisme et Voyage CIAR',
    
    // Search
    'search.placeholder': 'Rechercher une destination ou ville...',
    'search.noResults': 'Aucun résultat trouvé',
    'search.results': 'Résultats de Recherche',
    
    // Admin
    'admin.dashboard': 'Tableau de Bord',
    'admin.login': 'Connexion',
    'admin.logout': 'Déconnexion',
    'admin.addOffice': 'Ajouter Bureau',
    'admin.editOffice': 'Modifier Bureau',
    'admin.deleteOffice': 'Supprimer Bureau',
    
    // Contact
    'contact.title': 'Contactez-Nous',
    'contact.subtitle': 'Nous sommes là pour vous aider à planifier votre voyage parfait',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Envoyer Message',
    
    // About
    'about.title': 'À Propos de Nous',
    'about.subtitle': 'Entreprise leader dans le tourisme et le voyage',

    // Statistics
    'home.statistics.title': 'Nos Chiffres Parlent de Notre Succès',
    'home.statistics.subtitle': 'Nous sommes fiers de la confiance de nos clients et de notre vaste expérience en tourisme',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Set RTL/LTR direction and language on document
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // Store language preference
    localStorage.setItem('tarhal-language', language);

    // Trigger Google Translate to translate entire page
    const triggerGoogleTranslate = () => {
      // Wait for Google Translate to be ready
      const checkAndTranslate = () => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
          if (select.value !== language) {
            select.value = language;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        
        // Try alternative selector
        const altSelect = document.querySelector('#\\:0\\.target\\.lang') as HTMLSelectElement;
        if (altSelect && altSelect.value !== language) {
          altSelect.value = language;
          altSelect.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        
        return false;
      };

      // Try multiple times with delays to ensure Google Translate is loaded
      let attempts = 0;
      const maxAttempts = 15;
      const interval = setInterval(() => {
        attempts++;
        if (checkAndTranslate() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 200);

      // Also try using helper function if available
      setTimeout(() => {
        if ((window as any).changeGoogleTranslateLanguage) {
          (window as any).changeGoogleTranslateLanguage(language);
        }
        if ((window as any).doGTranslate) {
          (window as any).doGTranslate(language);
        }
        // Use force translate to ensure all elements are translated
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(language);
        }
      }, 100);
      
      // Retry translation after a longer delay to catch dynamic elements
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(language);
        }
      }, 1000);
      
      // Final retry for very late-loading elements
      setTimeout(() => {
        if ((window as any).forceTranslatePage) {
          (window as any).forceTranslatePage(language);
        }
      }, 2000);
    };

    // Small delay to ensure DOM is ready
    setTimeout(triggerGoogleTranslate, 100);
  }, [language]);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('tarhal-language') as Language;
    if (savedLanguage && ['ar', 'en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const translatePage = (lang: string) => {
    // Trigger Google Translate to translate entire page
    const triggerTranslation = () => {
      // Method 1: Use global function if available
      if ((window as any).doGTranslate) {
        (window as any).doGTranslate(lang);
      }
      
      // Method 2: Direct DOM manipulation
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Method 3: Alternative selector
      const altSelect = document.querySelector('#\\:0\\.target\\.lang') as HTMLSelectElement;
      if (altSelect) {
        altSelect.value = lang;
        altSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Method 4: Use helper function if available
      if ((window as any).changeGoogleTranslateLanguage) {
        (window as any).changeGoogleTranslateLanguage(lang);
      }
    };
    
    // Wait for Google Translate to be ready
    if ((window as any).google && (window as any).google.translate) {
      triggerTranslation();
    } else {
      // Retry after a short delay
      setTimeout(triggerTranslation, 200);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Change i18next language
    i18n.changeLanguage(newLanguage).catch((err) => {
      console.error('Error changing language:', err);
    });
    
    // Trigger Google Translate to translate entire page
    const googleLangMap: { [key in Language]: string } = {
      ar: 'ar',
      en: 'en',
      fr: 'fr',
      es: 'es'
    };
    
    // Small delay to ensure state update happens first
    setTimeout(() => {
      translatePage(googleLangMap[newLanguage]);
    }, 100);
  };

  const t = (key: string, options?: any): string => {
    // Use i18next for translation
    try {
      const translated = i18n.t(key, { ...options, returnObjects: false });
      if (translated && typeof translated === 'string' && translated !== key) {
        return translated;
      }
    } catch (error) {
      // Fallback to local translations
    }
    
    // Fallback to local translations
    const translation = translations[language]?.[key];
    if (translation) return translation;
    
    // Fallback to English if available
    if (language !== 'en') {
      const enTranslation = translations['en']?.[key];
      if (enTranslation) return enTranslation;
    }
    
    return options?.defaultValue || key;
  };

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US';
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US';
    const formatOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    };
    
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  };

  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleLanguageChange,
        t,
        isRTL,
        translatePage,
        formatDate,
        formatNumber,
        formatCurrency
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
