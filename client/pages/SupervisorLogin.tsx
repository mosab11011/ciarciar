import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supervisorManager } from '@/services/supervisorManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, MapPin, UserCheck } from 'lucide-react';

const SupervisorLogin: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    if (supervisorManager.isLoggedIn()) {
      navigate('/supervisor/dashboard');
    }
  }, [navigate]);

  const content = {
    ar: {
      title: 'تسجيل دخول المشرفين',
      subtitle: 'ادخل إلى لوحة تحكم المشرف الخاصة بك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      backToMain: 'العودة للصفحة الرئيسية',
      loginError: 'خطأ في البريد الإلكتروني أو كلمة المرور',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordRequired: 'كلمة المرور مطلوبة',
      loading: 'جاري تسجيل الدخول...',
      welcome: 'مرحباً بك',
      accessPanel: 'الوصول إلى لوحة التحكم'
    },
    en: {
      title: 'Supervisor Login',
      subtitle: 'Access your supervisor control panel',
      email: 'Email Address',
      password: 'Password',
      login: 'Sign In',
      forgotPassword: 'Forgot Password?',
      backToMain: 'Back to Main Page',
      loginError: 'Invalid email or password',
      invalidEmail: 'Please enter a valid email address',
      passwordRequired: 'Password is required',
      loading: 'Signing in...',
      welcome: 'Welcome',
      accessPanel: 'Access Control Panel'
    },
    fr: {
      title: 'Connexion Superviseur',
      subtitle: 'Accédez à votre panneau de contrôle superviseur',
      email: 'Adresse E-mail',
      password: 'Mot de Passe',
      login: 'Se Connecter',
      forgotPassword: 'Mot de passe oublié?',
      backToMain: 'Retour à la page principale',
      loginError: 'Email ou mot de passe invalide',
      invalidEmail: 'Veuillez entrer une adresse e-mail valide',
      passwordRequired: 'Le mot de passe est requis',
      loading: 'Connexion en cours...',
      welcome: 'Bienvenue',
      accessPanel: 'Accéder au Panneau de Contrôle'
    }
  };

  const text = content[language];

  const validateForm = (): boolean => {
    setError('');
    
    if (!formData.email) {
      setError(text.invalidEmail);
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(text.invalidEmail);
      return false;
    }
    
    if (!formData.password) {
      setError(text.passwordRequired);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const supervisor = supervisorManager.loginSupervisor(formData.email, formData.password);
      
      if (supervisor) {
        navigate('/supervisor/dashboard');
      } else {
        setError(text.loginError);
      }
    } catch (err) {
      setError(text.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-tarhal-orange-dark from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {text.title}
          </h1>
          <p className="text-gray-600">
            {text.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">
              {text.welcome}
            </CardTitle>
            <CardDescription className="text-center">
              {text.accessPanel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{text.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="supervisor@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{text.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {text.loading}
                  </div>
                ) : (
                  text.login
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  onClick={() => {
                    // TODO: Implement forgot password functionality
                    alert('يرجى التواصل مع الإدارة لإعادة تعيين كلمة المرور');
                  }}
                >
                  {text.forgotPassword}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back to Main */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {text.backToMain}
          </Link>
        </div>

        {/* Demo Credentials */}
        {/* <Card className="mt-6 bg-gray-50 border-dashed">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              بيانات تجريبية للاختبار:
            </h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="bg-white p-2 rounded border-l-4 border-blue-400">
                <strong>السودان:</strong> supervisor@sudan.com / 123456
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-green-400">
                <strong>السعودية:</strong> supervisor@saudi.com / 123456
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-red-400">
                <strong>الإمارات:</strong> supervisor@uae.com / 123456
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-yellow-400">
                <strong>مصر:</strong> supervisor@egypt.com / 123456
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-purple-400">
                <strong>المغرب:</strong> supervisor@morocco.com / 123456
              </div>
              <div className="bg-white p-2 rounded border-l-4 border-pink-400">
                <strong>الأردن:</strong> supervisor@jordan.com / 123456
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default SupervisorLogin;
