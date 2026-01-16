import { Lock, ShieldCheck } from 'lucide-react';

type PaymentMethodsProps = {
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
  className?: string;
};

const paymentMethods = [
  { name: 'Visa', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/visa.svg' },
  { name: 'Mastercard', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/mastercard.svg' },
  { name: 'Apple Pay', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/apple.svg' },
  { name: 'Google Pay', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/google.svg' },
  { name: 'PayPal', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/paypal.svg' },
  { name: 'مدى', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Mada_Logo.svg/512px-Mada_Logo.svg.png' },
  { name: 'STC Pay', logo: 'https://seeklogo.com/images/S/stc-pay-logo-7B42A41E3B-seeklogo.com.png' },
  { name: 'American Express', logo: 'https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/amex.svg' }
];

export function PaymentMethods({
  title = 'طرق الدفع المعتمدة',
  subtitle = 'خيارات دفع آمنة وسريعة مع شركائنا الرسميين',
  variant = 'light',
  className = ''
}: PaymentMethodsProps) {
  const isDark = variant === 'dark';

  const sectionClasses = [
    'relative py-16 overflow-hidden',
    isDark
      ? 'bg-gradient-to-br from-tarhal-navy via-tarhal-blue-dark to-tarhal-navy text-white'
      : 'bg-gradient-to-br from-white via-blue-50/40 to-white',
    className
  ].join(' ');

  const cardClasses = isDark
    ? 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
    : 'bg-white border border-gray-100 text-tarhal-blue-dark hover:border-tarhal-orange/60';

  const chipClasses = isDark
    ? 'bg-white/10 text-white'
    : 'bg-tarhal-blue/5 text-tarhal-blue';

  const descriptionClasses = isDark ? 'text-white/80' : 'text-tarhal-gray-dark';

  return (
    <section className={sectionClasses}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.3),transparent_45%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.25),transparent_45%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${
              isDark ? 'bg-white/10 border border-white/15 text-white' : 'bg-tarhal-blue/10 text-tarhal-blue border border-tarhal-blue/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مدفوعات آمنة</span>
          </div>

          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-tarhal-blue-dark'}`}>
            {title}
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${descriptionClasses}`}>
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paymentMethods.map((method, idx) => (
            <div
              key={method.name}
              className={`group rounded-2xl p-4 md:p-5 flex items-center gap-3 shadow-sm hover:shadow-xl transition-all duration-300 animate-scale-in`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`w-full flex items-center gap-3 ${cardClasses} rounded-2xl p-3 md:p-4`}>
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner overflow-hidden">
                  <img src={method.logo} alt={method.name} className="max-h-8 max-w-10 object-contain" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold text-sm md:text-base ${isDark ? 'text-white' : 'text-tarhal-blue-dark'}`}>
                    {method.name}
                  </div>
                  <div className={`text-xs ${descriptionClasses}`}>مدعوم رسمياً</div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${chipClasses}`}>
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PaymentMethods;

