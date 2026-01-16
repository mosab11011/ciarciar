import { Shield, Users, Cookie, Mail, Phone, MapPin, Eye, Lock, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrivacyPolicy() {
  const { language } = useLanguage();

  const getLocalizedText = (ar: string, en: string, fr: string) => {
    if (language === 'ar') return ar;
    if (language === 'fr') return fr;
    return en;
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative py-20 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-tarhal-orange/20 rounded-full">
              <Shield className="h-16 w-16 text-tarhal-orange" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
            {getLocalizedText('سياسة الخصوصية', 'Privacy Policy', 'Politique de confidentialité')}
            <span className="block text-tarhal-orange text-2xl md:text-3xl font-normal mt-2">
              {getLocalizedText('حماية بياناتكم أولويتنا', 'Your Data Protection is Our Priority', 'La protection de vos données est notre priorité')}
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in leading-relaxed">
            {getLocalizedText(
              'نحن ملتزمون بحماية خصوصيتكم وبياناتكم الشخصية. تعرفوا على كيفية جمع واستخدام وحماية معلوماتكم.',
              'We are committed to protecting your privacy and personal data. Learn how we collect, use, and protect your information.',
              'Nous nous engageons à protéger votre vie privée et vos données personnelles. Découvrez comment nous collectons, utilisons et protégeons vos informations.'
            )}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-6">
                {getLocalizedText('مقدمة', 'Introduction', 'Introduction')}
              </h2>
              <p className="text-lg text-tarhal-gray-dark leading-relaxed">
                {getLocalizedText(
                  'في شركة CIAR للسياحة والسفر، نحن نقدر ثقتكم بنا ونلتزم بحماية خصوصيتكم. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية التي تقدمونها لنا.',
                  'At CIAR Travel and Tourism, we value your trust and are committed to protecting your privacy. This privacy policy explains how we collect, use, and protect the personal information you provide to us.',
                  'Chez CIAR Voyages et Tourisme, nous apprécions votre confiance et nous nous engageons à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons les informations personnelles que vous nous fournissez.'
                )}
              </p>
            </div>

            <div className="bg-tarhal-blue/5 rounded-xl p-8 border border-tarhal-blue/10">
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-tarhal-blue flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-3">
                    {getLocalizedText('آخر تحديث', 'Last Updated', 'Dernière mise à jour')}
                  </h3>
                  <p className="text-tarhal-gray-dark">
                    {getLocalizedText(
                      'تم تحديث سياسة الخصوصية هذه في يناير 2024. سنقوم بإشعاركم بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار في موقعنا.',
                      'This privacy policy was last updated in January 2024. We will notify you of any material changes via email or a notice on our website.',
                      'Cette politique de confidentialité a été mise à jour pour la dernière fois en janvier 2024. Nous vous informerons de tout changement important par e-mail ou via un avis sur notre site Web.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-tarhal-orange/10 rounded-full">
                  <Users className="h-8 w-8 text-tarhal-orange" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-6">
                {getLocalizedText('جمع المعلومات', 'Information Collection', 'Collecte d\'informations')}
              </h2>
              <p className="text-lg text-tarhal-gray-dark leading-relaxed">
                {getLocalizedText(
                  'نجمع المعلومات التالية لتقديم خدماتنا بشكل أفضل:',
                  'We collect the following information to provide our services better:',
                  'Nous collectons les informations suivantes pour mieux fournir nos services:'
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-tarhal-gray-light">
                <h3 className="text-xl font-bold text-tarhal-blue-dark mb-4">
                  {getLocalizedText('المعلومات التي تقدمونها', 'Information You Provide', 'Informations que vous fournissez')}
                </h3>
                <ul className="space-y-3 text-tarhal-gray-dark">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('الاسم الكامل ومعلومات الاتصال', 'Full name and contact information', 'Nom complet et coordonnées')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('تفاصيل جواز السفر وتأشيرات السفر', 'Passport and visa details', 'Détails du passeport et du visa')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('تفضيلات السفر والرحلات', 'Travel and trip preferences', 'Préférences de voyage et d\'excursion')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('معلومات الدفع والحجوزات', 'Payment and booking information', 'Informations de paiement et de réservation')}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-tarhal-gray-light">
                <h3 className="text-xl font-bold text-tarhal-blue-dark mb-4">
                  {getLocalizedText('المعلومات التلقائية', 'Automatic Information', 'Informations automatiques')}
                </h3>
                <ul className="space-y-3 text-tarhal-gray-dark">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('عنوان IP وموقعكم الجغرافي', 'IP address and geographic location', 'Adresse IP et localisation géographique')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('نوع المتصفح ونظام التشغيل', 'Browser type and operating system', 'Type de navigateur et système d\'exploitation')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('صفحات الموقع التي تزورونها', 'Pages you visit on the site', 'Pages que vous visitez sur le site')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-tarhal-orange rounded-full mt-2 flex-shrink-0"></div>
                    <span>{getLocalizedText('وقت وتاريخ الزيارة', 'Time and date of visit', 'Heure et date de la visite')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-tarhal-blue/10 rounded-full">
                  <Cookie className="h-8 w-8 text-tarhal-blue" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-6">
                {getLocalizedText('ملفات تعريف الارتباط (الكوكيز)', 'Cookies', 'Cookies')}
              </h2>
              <p className="text-lg text-tarhal-gray-dark leading-relaxed">
                {getLocalizedText(
                  'نستخدم ملفات تعريف الارتباط لتحسين تجربتكم على موقعنا:',
                  'We use cookies to improve your experience on our website:',
                  'Nous utilisons des cookies pour améliorer votre expérience sur notre site Web:'
                )}
              </p>
            </div>

            <div className="bg-gradient-to-r from-tarhal-blue/5 to-tarhal-orange/5 rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-tarhal-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-6 w-6 text-tarhal-orange" />
                  </div>
                  <h3 className="font-bold text-tarhal-blue-dark mb-2">
                    {getLocalizedText('كوكيز أساسية', 'Essential Cookies', 'Cookies essentiels')}
                  </h3>
                  <p className="text-sm text-tarhal-gray-dark">
                    {getLocalizedText('ضرورية لعمل الموقع وأمانه', 'Necessary for website operation and security', 'Nécessaires au fonctionnement et à la sécurité du site')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-tarhal-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-tarhal-blue" />
                  </div>
                  <h3 className="font-bold text-tarhal-blue-dark mb-2">
                    {getLocalizedText('كوكيز تحليلية', 'Analytics Cookies', 'Cookies analytiques')}
                  </h3>
                  <p className="text-sm text-tarhal-gray-dark">
                    {getLocalizedText('تساعدنا في فهم استخدام الموقع', 'Help us understand site usage', 'Nous aident à comprendre l\'utilisation du site')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-tarhal-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-tarhal-navy" />
                  </div>
                  <h3 className="font-bold text-tarhal-blue-dark mb-2">
                    {getLocalizedText('كوكيز تسويقية', 'Marketing Cookies', 'Cookies marketing')}
                  </h3>
                  <p className="text-sm text-tarhal-gray-dark">
                    {getLocalizedText('لعرض إعلانات مخصصة', 'To display personalized ads', 'Pour afficher des publicités personnalisées')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Usage */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-6">
                {getLocalizedText('استخدام المعلومات', 'Information Use', 'Utilisation des informations')}
              </h2>
              <p className="text-lg text-tarhal-gray-dark leading-relaxed">
                {getLocalizedText(
                  'نستخدم معلوماتكم للأغراض التالية:',
                  'We use your information for the following purposes:',
                  'Nous utilisons vos informations aux fins suivantes:'
                )}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-tarhal-gray-light">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-tarhal-orange/10 rounded-lg">
                    <Shield className="h-6 w-6 text-tarhal-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">
                      {getLocalizedText('تقديم الخدمات', 'Providing Services', 'Fournir des services')}
                    </h3>
                    <p className="text-tarhal-gray-dark">
                      {getLocalizedText(
                        'حجز الرحلات، إصدار التأشيرات، وتنظيم برامج السفر',
                        'Booking trips, issuing visas, and organizing travel programs',
                        'Réserver des voyages, délivrer des visas et organiser des programmes de voyage'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-tarhal-gray-light">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-tarhal-blue/10 rounded-lg">
                    <Users className="h-6 w-6 text-tarhal-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">
                      {getLocalizedText('تحسين الخدمات', 'Improving Services', 'Améliorer les services')}
                    </h3>
                    <p className="text-tarhal-gray-dark">
                      {getLocalizedText(
                        'تطوير وتحسين موقعنا وخدماتنا بناءً على ملاحظاتكم',
                        'Developing and improving our website and services based on your feedback',
                        'Développer et améliorer notre site Web et nos services en fonction de vos commentaires'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-tarhal-gray-light">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-tarhal-navy/10 rounded-lg">
                    <Mail className="h-6 w-6 text-tarhal-navy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">
                      {getLocalizedText('التواصل', 'Communication', 'Communication')}
                    </h3>
                    <p className="text-tarhal-gray-dark">
                      {getLocalizedText(
                        'إرسال تحديثات الحجوزات، عروض خاصة، ومعلومات مهمة',
                        'Sending booking updates, special offers, and important information',
                        'Envoi de mises à jour de réservation, d\'offres spéciales et d\'informations importantes'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-tarhal-blue-dark mb-6">
                {getLocalizedText('حقوقكم', 'Your Rights', 'Vos droits')}
              </h2>
              <p className="text-lg text-tarhal-gray-dark leading-relaxed">
                {getLocalizedText('لديكم الحق في:', 'You have the right to:', 'Vous avez le droit de:')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-tarhal-orange/5 rounded-xl p-6 border border-tarhal-orange/10">
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-3">
                  {getLocalizedText('الوصول والتصحيح', 'Access and Correction', 'Accès et correction')}
                </h3>
                <p className="text-tarhal-gray-dark">
                  {getLocalizedText(
                    'طلب الوصول إلى بياناتكم الشخصية وتصحيحها',
                    'Request access to and correction of your personal data',
                    'Demander l\'accès et la correction de vos données personnelles'
                  )}
                </p>
              </div>
              <div className="bg-tarhal-blue/5 rounded-xl p-6 border border-tarhal-blue/10">
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-3">
                  {getLocalizedText('الحذف', 'Deletion', 'Suppression')}
                </h3>
                <p className="text-tarhal-gray-dark">
                  {getLocalizedText(
                    'طلب حذف بياناتكم الشخصية في ظروف معينة',
                    'Request deletion of your personal data under certain circumstances',
                    'Demander la suppression de vos données personnelles dans certaines circonstances'
                  )}
                </p>
              </div>
              <div className="bg-tarhal-navy/5 rounded-xl p-6 border border-tarhal-navy/10">
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-3">
                  {getLocalizedText('الاعتراض', 'Objection', 'Objection')}
                </h3>
                <p className="text-tarhal-gray-dark">
                  {getLocalizedText(
                    'الاعتراض على معالجة بياناتكم لأغراض معينة',
                    'Object to processing your data for certain purposes',
                    'S\'opposer au traitement de vos données à certaines fins'
                  )}
                </p>
              </div>
              <div className="bg-tarhal-orange-dark/5 rounded-xl p-6 border border-tarhal-orange-dark/10">
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-3">
                  {getLocalizedText('النقل', 'Portability', 'Portabilité')}
                </h3>
                <p className="text-tarhal-gray-dark">
                  {getLocalizedText(
                    'الحصول على بياناتكم بتنسيق قابل للنقل',
                    'Obtain your data in a portable format',
                    'Obtenir vos données dans un format portable'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {getLocalizedText('تواصل معنا', 'Contact Us', 'Contactez-nous')}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {getLocalizedText(
                'إذا كان لديكم أي أسئلة حول سياسة الخصوصية أو كيفية التعامل مع بياناتكم، يرجى التواصل معنا:',
                'If you have any questions about our privacy policy or how we handle your data, please contact us:',
                'Si vous avez des questions sur notre politique de confidentialité ou sur la manière dont nous traitons vos données, veuillez nous contacter:'
              )}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Mail className="h-8 w-8 text-tarhal-orange mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {getLocalizedText('البريد الإلكتروني', 'Email', 'E-mail')}
                </h3>
                <p className="text-white/80">privacy@tarhal.com</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Phone className="h-8 w-8 text-tarhal-orange mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {getLocalizedText('الهاتف', 'Phone', 'Téléphone')}
                </h3>
                <p className="text-white/80">+249 123 456 789</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <MapPin className="h-8 w-8 text-tarhal-orange mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {getLocalizedText('العنوان', 'Address', 'Adresse')}
                </h3>
                <p className="text-white/80">
                  {getLocalizedText('الخرطوم، السودان', 'Khartoum, Sudan', 'Khartoum, Soudan')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
