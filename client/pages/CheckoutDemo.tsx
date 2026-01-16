import Layout from '@/components/Layout';
import PaymentButton from '@/components/PaymentButton';
import { useEffect, useState } from 'react';
import { Lock, ShieldCheck, CreditCard, Sparkles, Globe, User, Mail, Phone, Calendar as CalendarIcon, MapPin, Users, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CheckoutDemo() {
  const { t, language } = useLanguage();

  // Payment State
  const [amount, setAmount] = useState(49.99);
  const [currency, setCurrency] = useState('USD');
  const [methods, setMethods] = useState<string[]>(['card']);
  const [desc, setDesc] = useState<string>('Booking Service');
  const [message, setMessage] = useState<string | null>(null);

  // Booking Form State
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const presetAmount = params.get('amount');
    const presetCurrency = params.get('currency');
    const presetDesc = params.get('desc');

    if (presetAmount) {
      const n = Number(presetAmount);
      if (!isNaN(n) && n > 0) setAmount(n);
    }
    if (presetCurrency) setCurrency(presetCurrency);
    if (presetDesc) setDesc(decodeURIComponent(presetDesc));

    // Handle Payment Return
    const status = params.get('status');
    const sessionId = params.get('session_id');
    if (status === 'success' && sessionId) {
      setBookingStep(3); // Success Step
      fetch(`/api/payments/confirm?session_id=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setMessage(d.payment_status === 'paid' ? 'تم الدفع وتأكيد الحجز بنجاح ✅' : 'تمت العودة من بوابة الدفع');
          } else {
            setMessage('تعذر تأكيد عملية الدفع');
          }
        })
        .catch(() => setMessage('تعذر تأكيد عملية الدفع'));
    } else if (status === 'cancel') {
      setMessage('تم إلغاء عملية الدفع');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName) newErrors.firstName = t('common.required');
    if (!formData.lastName) newErrors.lastName = t('common.required');
    if (!formData.email) newErrors.email = t('common.required');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t('common.invalidEmail');
    if (!formData.phone) newErrors.phone = t('common.required');
    if (!formData.departureDate) newErrors.departureDate = t('common.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setBookingStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen pb-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tarhal-blue-dark via-tarhal-navy to-black" />

        <div className="max-w-6xl mx-auto py-12 px-4">

          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm backdrop-blur-md mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('common.secureBooking') || 'حجز آمن ومضمون 100%'}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {bookingStep === 1 ? 'تفاصيل الحجز' : bookingStep === 2 ? 'تأكيد ودفع' : 'تم الحجز بنجاح'}
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {bookingStep === 1
                ? 'يرجى ملء البيانات التالية لإتمام حجز رحلتك، سيتم إرسال التذاكر إلى بريدك الإلكتروني.'
                : bookingStep === 2
                  ? 'راجع تفاصيل حجزك ثم اختر وسيلة الدفع المناسبة لك.'
                  : 'شكراً لك! نتمنى لك رحلة ممتعة وآمنة.'}
            </p>
          </div>

          {/* Steps Indicator */}
          {bookingStep < 3 && (
            <div className="flex justify-center mb-10">
              <div className="flex items-center gap-4 text-sm font-medium text-white/80">
                <div className={`flex items-center gap-2 ${bookingStep >= 1 ? 'text-tarhal-orange' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${bookingStep >= 1 ? 'border-tarhal-orange bg-tarhal-orange text-white' : 'border-white/30'}`}>1</div>
                  <span>البيانات</span>
                </div>
                <div className="w-12 h-0.5 bg-white/20" />
                <div className={`flex items-center gap-2 ${bookingStep >= 2 ? 'text-tarhal-orange' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${bookingStep >= 2 ? 'border-tarhal-orange bg-tarhal-orange text-white' : 'border-white/30'}`}>2</div>
                  <span>الدفع</span>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mb-8 p-4 rounded-xl text-center backdrop-blur-md border ${message.includes('نجاح') ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-red-500/20 border-red-500/50 text-red-100'}`}>
              <span className="text-lg font-medium">{message}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column: Form / Payment */}
            <div className="lg:col-span-2 space-y-6">

              {/* Step 1: Booking Form */}
              {bookingStep === 1 && (
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur overflow-hidden animate-slide-up">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b px-6 py-4">
                    <div className="flex items-center gap-2 text-tarhal-blue-dark">
                      <User className="w-5 h-5 text-tarhal-orange" />
                      <CardTitle>بيانات المسافر الرئيسي</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>الاسم الأول <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                            placeholder="مثال: محمد"
                          />
                          <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {errors.firstName && <span className="text-xs text-red-500">{errors.firstName}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label>الاسم الأخير <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                            placeholder="مثال: أحمد"
                          />
                          <User className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {errors.lastName && <span className="text-xs text-red-500">{errors.lastName}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label>البريد الإلكتروني <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="name@example.com"
                          />
                          <Mail className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label>رقم الهاتف <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="05xxxxxxxx"
                          />
                          <Phone className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex items-center gap-2 mb-4 text-tarhal-blue-dark">
                      <CalendarIcon className="w-5 h-5 text-tarhal-orange" />
                      <h3 className="font-semibold text-lg">تفاصيل الرحلة</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>تاريخ السفر <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Input
                            name="departureDate"
                            type="date"
                            value={formData.departureDate}
                            onChange={handleInputChange}
                            className={`pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.departureDate ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.departureDate && <span className="text-xs text-red-500">{errors.departureDate}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label>تاريخ العودة (اختياري)</Label>
                        <div className="relative">
                          <Input
                            name="returnDate"
                            type="date"
                            value={formData.returnDate}
                            onChange={handleInputChange}
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>عدد المسافرين</Label>
                        <div className="relative">
                          <Input
                            name="travelers"
                            type="number"
                            min="1"
                            value={formData.travelers}
                            onChange={handleInputChange}
                            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                          />
                          <Users className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleNextStep}
                        className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white px-8 h-12 text-lg rounded-xl shadow-lg shadow-tarhal-orange/20"
                      >
                        متابعة للدفع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment */}
              {bookingStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white/95 backdrop-blur rounded-2xl p-6 md:p-8 shadow-2xl border-0">
                    <div className="flex items-center gap-2 mb-6 text-tarhal-blue-dark">
                      <CreditCard className="w-6 h-6 text-tarhal-orange" />
                      <h2 className="text-xl font-bold">إتمام عملية الدفع</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Payment Method Selection - Professional Logos */}
                      <div>
                        <label className="block mb-3 font-medium text-gray-700">اختر طريقة الدفع</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { key: 'card', name: 'بطاقة ائتمان', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/visa.svg' },
                            { key: 'card', name: 'Mastercard', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/mastercard.svg' },
                            { key: 'apple', name: 'Apple Pay', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/apple.svg' },
                            { key: 'google', name: 'Google Pay', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/google.svg' },
                            { key: 'paypal', name: 'PayPal', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/paypal.svg' },
                            { key: 'mada', name: 'مدى', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Mada_Logo.svg/512px-Mada_Logo.svg.png' },
                            { key: 'stc', name: 'STC Pay', logo: 'https://seeklogo.com/images/S/stc-pay-logo-7B42A41E3B-seeklogo.com.png' },
                            { key: 'amex', name: 'American Express', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/amex.svg' }
                          ].map((method, idx) => {
                            const active = method.key === 'card' ? methods.includes('card') : false;
                            return (
                              <div
                                key={idx}
                                className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${active ? 'border-tarhal-orange bg-orange-50 text-tarhal-orange' : 'border-gray-200 hover:border-gray-300'}`}
                              >
                                <img src={method.logo} alt={method.name} className="h-7 object-contain" />
                                <span className="text-xs font-semibold text-center">{method.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <Separator />

                      <PaymentButton
                        amount={amount * formData.travelers}
                        currency={currency}
                        description={`${desc} - ${formData.firstName} ${formData.lastName}`}
                        metadata={{
                          source: 'checkout-page',
                          customerName: `${formData.firstName} ${formData.lastName}`,
                          customerEmail: formData.email
                        }}
                        className="w-full h-14 text-lg bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark hover:from-tarhal-orange-dark hover:to-tarhal-orange-dark shadow-xl shadow-orange-500/20 rounded-xl"
                        paymentMethodTypes={methods}
                      >
                        {`دفع ${currency} ${(amount * formData.travelers).toFixed(2)}`}
                      </PaymentButton>

                      <div className="text-center">
                        <button
                          onClick={() => setBookingStep(1)}
                          className="text-gray-500 hover:text-tarhal-blue-dark text-sm border-b border-dashed border-gray-300 hover:border-tarhal-blue-dark pb-0.5 transition-all"
                        >
                          تعديل بيانات الحجز
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-4">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> تشفير SSL 256-bit</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> مدفوعات آمنة</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {bookingStep === 3 && (
                <div className="bg-white/95 backdrop-blur rounded-2xl p-8 shadow-2xl text-center animate-fade-in py-16">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-4">تم الحجز بنجاح!</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    شكراً لك {formData.firstName}. تم تأكيد حجزك بنجاح. لقد قمنا بإرسال تفاصيل الحجز والتذاكر إلى بريدك الإلكتروني <b>{formData.email}</b>.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button className="bg-tarhal-blue-dark text-white hover:bg-tarhal-navy" onClick={() => window.location.href = '/'}>
                      العودة للرئيسية
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      طباعة التذكرة
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl text-white">
                  <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                    <Sparkles className="w-5 h-5 text-tarhal-orange" />
                    <h3 className="font-bold text-lg">ملخص الرحلة</h3>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-white/70">الوجهة/الخدمة</span>
                      <span className="font-medium text-right max-w-[60%]">{desc}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-white/70">التاريخ للتذكرة</span>
                      <span className="font-medium">{formData.departureDate || '--/--/----'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">عدد المسافرين</span>
                      <span className="font-medium">{formData.travelers}</span>
                    </div>
                  </div>

                  <div className="my-6 border-t border-white/10" />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">سعر الفرد</span>
                      <span>{amount.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">الضرائب والرسوم</span>
                      <span>0.00 {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-white/10">
                      <span>الإجمالي</span>
                      <span className="text-tarhal-orange">{(amount * formData.travelers).toFixed(2)} {currency}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-tarhal-blue-dark/50 backdrop-blur-md rounded-xl p-4 border border-white/10 text-white/80 text-xs leading-relaxed">
                  <span className="font-bold block mb-1 text-white">سياسة الإلغاء:</span>
                  يمكنك إلغاء الحجز مجاناً حتى 24 ساعة قبل موعد الرحلة. تطبق الشروط والأحكام.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
