import { useState, useEffect, useRef } from 'react';
import { Users, Award, Globe, Heart, Target, Eye, Gem, Zap, Shield, Clock, CheckCircle, Star, ArrowRight, Quote, Calendar, TrendingUp, UserCheck, Play, Mail, MapPin, Phone, ChevronDown, ChevronUp, MessageCircle, ExternalLink, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import GoogleMap from '@/components/GoogleMap';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [counters, setCounters] = useState({ years: 0, clients: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered animations
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const headerImages = [
    'https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg',
    'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg',
    'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg',
    'https://images.pexels.com/photos/33351942/pexels-photo-33351942.jpeg',
    'https://images.pexels.com/photos/53537/caravan-desert-safari-dune-53537.jpeg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation logic
  useEffect(() => {
    const animateCounters = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          const duration = 2000; // 2 seconds
          const steps = 60;
          const stepDuration = duration / steps;

          const animateCounter = (target: number, setter: (value: number) => void) => {
            let current = 0;
            const increment = target / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                setter(target);
                clearInterval(timer);
              } else {
                setter(Math.floor(current));
              }
            }, stepDuration);
          };

          animateCounter(15, (value) => setCounters(prev => ({ ...prev, years: value })));
          animateCounter(100000, (value) => setCounters(prev => ({ ...prev, clients: value })));
        }
      });
    };

    const observer = new IntersectionObserver(animateCounters, {
      threshold: 0.5,
    });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const flipCards = [
    {
      front: {
        title: t('about.vision.title'),
        icon: <Eye className="h-8 w-8" />,
        description: t('about.vision.description'),
        color: 'from-tarhal-blue to-tarhal-blue-dark'
      },
      back: {
        content: t('about.vision.content'),
        details: [t('about.vision.details1'), t('about.vision.details2'), t('about.vision.details3'), t('about.vision.details4')]
      }
    },
    {
      front: {
        title: t('about.mission.title'),
        icon: <Target className="h-8 w-8" />,
        description: t('about.mission.description'),
        color: 'from-tarhal-orange to-tarhal-orange-dark'
      },
      back: {
        content: t('about.mission.content'),
        details: [t('about.mission.details1'), t('about.mission.details2'), t('about.mission.details3'), t('about.mission.details4')]
      }
    },
    {
      front: {
        title: t('about.values.title2'),
        icon: <Gem className="h-8 w-8" />,
        description: t('about.values.description'),
        color: 'from-tarhal-navy to-tarhal-blue'
      },
      back: {
        content: t('about.values.content'),
        details: [t('about.values.details1'), t('about.values.details2'), t('about.values.details3'), t('about.values.details4')]
      }
    },
    {
      front: {
        title: t('about.commitment.title'),
        icon: <Heart className="h-8 w-8" />,
        description: t('about.commitment.description'),
        color: 'from-red-500 to-pink-600'
      },
      back: {
        content: t('about.commitment.content'),
        details: [t('about.commitment.details1'), t('about.commitment.details2'), t('about.commitment.details3'), t('about.commitment.details4')]
      }
    },
    {
      front: {
        title: t('about.experience.title'),
        icon: <Award className="h-8 w-8" />,
        description: t('about.experience.description'),
        color: 'from-yellow-500 to-orange-500'
      },
      back: {
        content: t('about.experience.content'),
        details: [t('about.experience.details1'), t('about.experience.details2'), t('about.experience.details3'), t('about.experience.details4')]
      }
    },
    {
      front: {
        title: t('about.innovation.title'),
        icon: <Zap className="h-8 w-8" />,
        description: t('about.innovation.description'),
        color: 'from-purple-500 to-indigo-600'
      },
      back: {
        content: t('about.innovation.content'),
        details: [t('about.innovation.details1'), t('about.innovation.details2'), t('about.innovation.details3'), t('about.innovation.details4')]
      }
    }
  ];

  const features = [
    {
      icon: <Globe className="h-12 w-12 text-tarhal-orange" />,
      title: t('about.features.global.title'),
      description: t('about.features.global.description'),
      stats: t('about.features.global.stats')
    },
    {
      icon: <Users className="h-12 w-12 text-tarhal-blue" />,
      title: t('about.features.team.title'),
      description: t('about.features.team.description'),
      stats: t('about.features.team.stats')
    },
    {
      icon: <Shield className="h-12 w-12 text-tarhal-navy" />,
      title: t('about.features.security.title'),
      description: t('about.features.security.description'),
      stats: t('about.features.security.stats')
    },
    {
      icon: <Clock className="h-12 w-12 text-tarhal-orange-dark" />,
      title: t('about.features.support.title'),
      description: t('about.features.support.description'),
      stats: t('about.features.support.stats')
    }
  ];

  const achievements = [
    {
      icon: <Award className="h-8 w-8" />,
      title: t('about.achievements.bestCompany.title'),
      year: '2023',
      description: t('about.achievements.bestCompany.description')
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: t('about.achievements.fiveStars.title'),
      year: '2022',
      description: t('about.achievements.fiveStars.description')
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('about.achievements.growth.title'),
      year: '2021',
      description: t('about.achievements.growth.description')
    },
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: t('about.achievements.quality.title'),
      year: '2020',
      description: t('about.achievements.quality.description')
    }
  ];

  const timeline = [
    {
      year: '2008',
      title: t('about.timeline.2008.title'),
      description: t('about.timeline.2008.description'),
      icon: <Calendar className="h-6 w-6" />
    },
    {
      year: '2010',
      title: t('about.timeline.2010.title'),
      description: t('about.timeline.2010.description'),
      icon: <Globe className="h-6 w-6" />
    },
    {
      year: '2015',
      title: t('about.timeline.2015.title'),
      description: t('about.timeline.2015.description'),
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      year: '2018',
      title: t('about.timeline.2018.title'),
      description: t('about.timeline.2018.description'),
      icon: <Zap className="h-6 w-6" />
    },
    {
      year: '2020',
      title: t('about.timeline.2020.title'),
      description: t('about.timeline.2020.description'),
      icon: <Award className="h-6 w-6" />
    },
    {
      year: '2024',
      title: t('about.timeline.2024.title'),
      description: t('about.timeline.2024.description'),
      icon: <Star className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      name: t('about.testimonials.ahmed.name'),
      location: t('about.testimonials.ahmed.location'),
      text: t('about.testimonials.ahmed.text'),
      rating: 5,
      image: 'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg'
    },
    {
      name: t('about.testimonials.fatma.name'),
      location: t('about.testimonials.fatma.location'),
      text: t('about.testimonials.fatma.text'),
      rating: 5,
      image: 'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg'
    },
    {
      name: t('about.testimonials.mohammed.name'),
      location: t('about.testimonials.mohammed.location'),
      text: t('about.testimonials.mohammed.text'),
      rating: 5,
      image: 'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg'
    }
  ];

  const teamMembers = [
    {
      name: t('about.team.ceo.name'),
      position: t('about.team.ceo.position'),
      image: 'https://images.pexels.com/photos/2868245/pexels-photo-2868245.jpeg',
      bio: t('about.team.ceo.bio'),
      experience: t('about.team.ceo.experience'),
      achievements: [t('about.team.ceo.achievement1'), t('about.team.ceo.achievement2')],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: t('about.team.operations.name'),
      position: t('about.team.operations.position'),
      image: 'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg',
      bio: t('about.team.operations.bio'),
      experience: t('about.team.operations.experience'),
      achievements: [t('about.team.operations.achievement1'), t('about.team.operations.achievement2')],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: t('about.team.marketing.name'),
      position: t('about.team.marketing.position'),
      image: 'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg',
      bio: t('about.team.marketing.bio'),
      experience: t('about.team.marketing.experience'),
      achievements: [t('about.team.marketing.achievement1'), t('about.team.marketing.achievement2')],
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: t('about.team.hr.name'),
      position: t('about.team.hr.position'),
      image: 'https://images.pexels.com/photos/33351942/pexels-photo-33351942.jpeg',
      bio: t('about.team.hr.bio'),
      experience: t('about.team.hr.experience'),
      achievements: [t('about.team.hr.achievement1'), t('about.team.hr.achievement2')],
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const services = [
    {
      icon: <Globe className="h-12 w-12" />,
      title: t('about.services.international.title'),
      description: t('about.services.international.description'),
      features: [t('about.services.international.feature1'), t('about.services.international.feature2'), t('about.services.international.feature3'), t('about.services.international.feature4')]
    },
    {
      icon: <Heart className="h-12 w-12" />,
      title: t('about.services.umrah.title'),
      description: t('about.services.umrah.description'),
      features: [t('about.services.umrah.feature1'), t('about.services.umrah.feature2'), t('about.services.umrah.feature3'), t('about.services.umrah.feature4')]
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: t('about.services.group.title'),
      description: t('about.services.group.description'),
      features: [t('about.services.group.feature1'), t('about.services.group.feature2'), t('about.services.group.feature3'), t('about.services.group.feature4')]
    },
    {
      icon: <Zap className="h-12 w-12" />,
      title: t('about.services.online.title'),
      description: t('about.services.online.description'),
      features: [t('about.services.online.feature1'), t('about.services.online.feature2'), t('about.services.online.feature3'), t('about.services.online.feature4')]
    }
  ];

  const faqs = [
    {
      question: t('about.faqs.experience.question'),
      answer: t('about.faqs.experience.answer')
    },
    {
      question: t('about.faqs.visa.question'),
      answer: t('about.faqs.visa.answer')
    },
    {
      question: t('about.faqs.cancellation.question'),
      answer: t('about.faqs.cancellation.answer')
    },
    {
      question: t('about.faqs.offices.question'),
      answer: t('about.faqs.offices.answer')
    },
    {
      question: t('about.faqs.quote.question'),
      answer: t('about.faqs.quote.answer')
    },
    {
      question: t('about.faqs.business.question'),
      answer: t('about.faqs.business.answer')
    }
  ];

  const socialLinks = [
    { name: 'Facebook', url: '#', icon: '📘' },
    { name: 'Instagram', url: '#', icon: '📷' },
    { name: 'Twitter', url: '#', icon: '🐦' },
    { name: 'LinkedIn', url: '#', icon: '💼' },
    { name: 'YouTube', url: '#', icon: '📺' },
    { name: 'TikTok', url: '#', icon: '🎵' }
  ];

  return (
    <Layout>
        {/* Hero Header */}
        <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          {headerImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-tarhal-navy/90 via-tarhal-blue-dark/70 to-tarhal-orange/40"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
              {t('about.hero.title')}
              <span className="block text-tarhal-orange text-3xl md:text-4xl font-normal mt-2">
                {t('about.hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: '300ms' }}>
              {t('about.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '600ms' }}>
              <Button className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-8 py-3 text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                {t('about.hero.cta1')}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-tarhal-blue-dark px-8 py-3 text-lg font-semibold transition-all duration-300">
                {t('about.hero.cta2')}
              </Button>
              <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-tarhal-blue-dark px-8 py-3 text-lg font-semibold transition-all duration-300">
                {t('about.hero.cta3')}
                <Phone className="mr-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6">
                {t('about.story.title')}
                <span className="block text-tarhal-orange text-2xl font-normal mt-2">
                  {t('about.story.subtitle')}
                </span>
              </h2>
              <div className="space-y-6 text-lg text-tarhal-gray-dark leading-relaxed">
                <p>
                  {t('about.story.content1')}
                </p>
                <p>
                  {t('about.story.content2')}
                </p>
                <p>
                  {t('about.story.content3')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  className="bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark text-white px-6 py-3 font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  aria-label={t('about.story.contact')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t('about.story.contact')}
                </Button>
                <Button
                  variant="outline"
                  className="border-tarhal-orange text-tarhal-orange hover:bg-tarhal-orange hover:text-white px-6 py-3 font-semibold transition-all duration-300"
                  aria-label={t('about.story.download')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  {t('about.story.download')}
                </Button>
              </div>

              <div ref={statsRef} className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-tarhal-orange/10 rounded-xl hover:bg-tarhal-orange/20 transition-colors duration-300">
                  <div className="text-3xl font-bold text-tarhal-orange">
                    {counters.years}+
                  </div>
                  <div className="text-tarhal-blue-dark font-medium">{t('about.story.years')}</div>
                </div>
                <div className="text-center p-4 bg-tarhal-blue/10 rounded-xl hover:bg-tarhal-blue/20 transition-colors duration-300">
                  <div className="text-3xl font-bold text-tarhal-blue">
                    {counters.clients.toLocaleString()}+
                  </div>
                  <div className="text-tarhal-blue-dark font-medium">{t('about.story.clients')}</div>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-in-right">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg"
                  alt="قصة CIAR"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <Quote className="h-8 w-8 text-tarhal-orange mb-4" />
                  <p className="text-lg font-medium italic">
                    "رحلتنا بدأت بحلم... واليوم نحن نحقق أحلام الآخرين"
                  </p>
                  <p className="text-sm mt-2 text-white/80">- مؤسس ش��كة CIAR</p>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center shadow-xl animate-float">
                <span className="text-white text-4xl">🏆</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Flip Cards */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              {t('about.values.title')}
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {flipCards.map((card, index) => (
              <div
                key={index}
                className="group perspective-1000 h-80 animate-rotate-in"
                style={{
                  animationDelay: `${index * 200}ms`,
                  transform: `translateY(${Math.min(scrollY * 0.1, 50)}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                role="button"
                tabIndex={0}
                aria-label={`قراءة المزيد عن ${card.front.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setHoveredCard(index);
                  }
                }}
              >
                <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                  hoveredCard === index ? 'rotate-y-180' : ''
                }`}>
                  {/* Front */}
                  <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${card.front.color} rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-xl cursor-pointer`}>
                    <div className="mb-6 p-4 bg-white/20 rounded-full">
                      {card.front.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-center">{card.front.title}</h3>
                    <p className="text-center text-white/90 leading-relaxed">{card.front.description}</p>
                    <div className="mt-6 text-sm text-white/70">
                      مرر للمزيد من التفاصيل
                    </div>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl p-8 flex flex-col justify-center shadow-xl border border-tarhal-gray-light">
                    <p className="text-tarhal-gray-dark leading-relaxed mb-6">
                      {card.back.content}
                    </p>
                    <ul className="space-y-2">
                      {card.back.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-tarhal-orange flex-shrink-0" />
                          <span className="text-tarhal-blue-dark">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              {t('about.features.title')}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              {t('about.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-scale-in group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80 mb-4 leading-relaxed">{feature.description}</p>
                <div className="inline-block px-4 py-2 bg-tarhal-orange/20 text-tarhal-orange rounded-full text-sm font-semibold">
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              رحلة النجاح
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              معالم مهمة في تاريخ شركة CIAR
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-tarhal-orange to-tarhal-blue hidden lg:block"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-tarhal-gray-light">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-tarhal-orange/10 rounded-lg text-tarhal-orange">
                          {item.icon}
                        </div>
                        <span className="text-2xl font-bold text-tarhal-orange">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">{item.title}</h3>
                      <p className="text-tarhal-gray-dark">{item.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden lg:flex w-4 h-4 bg-tarhal-orange rounded-full border-4 border-white shadow-lg relative z-10"></div>

                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-gradient-to-br from-tarhal-orange/5 to-tarhal-blue/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              إنجازاتنا
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              جوائز وتقديرات حصلنا عليها تقديراً لجهودنا
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-tarhal-orange/10 rounded-lg text-tarhal-orange">
                    {achievement.icon}
                  </div>
                  <span className="text-lg font-bold text-tarhal-blue-dark">{achievement.year}</span>
                </div>
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">{achievement.title}</h3>
                <p className="text-tarhal-gray-dark text-sm">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              شهادات عملائنا
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              كلمات من القلب من عملائنا الكرام
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 animate-scale-in touch-manipulation"
                style={{
                  animationDelay: `${index * 200}ms`,
                  transform: `translateY(${Math.min(scrollY * 0.05, 30)}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
                role="article"
                aria-labelledby={`testimonial-${index}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-tarhal-orange mb-4" />
                <p className="text-white/90 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/70">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 bg-gradient-to-br from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              فريق القيادة
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              تعرف على قادة CIAR الذين يقودون رؤيتنا نحو المستقبل
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tarhal-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-2">
                      <a href={member.social.linkedin} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        💼
                      </a>
                      <a href={member.social.twitter} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        🐦
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">{member.name}</h3>
                  <p className="text-tarhal-orange font-semibold mb-3">{member.position}</p>
                  <p className="text-tarhal-gray-dark text-sm mb-4 leading-relaxed">{member.bio}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tarhal-gray-dark">الخبرة:</span>
                      <span className="font-semibold text-tarhal-blue-dark">{member.experience}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-tarhal-blue-dark">الإنجازات:</div>
                      {member.achievements.map((achievement, idx) => (
                        <div key={idx} className="text-xs text-tarhal-gray-dark flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-tarhal-orange flex-shrink-0" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-20 bg-gradient-to-br from-tarhal-blue-dark to-tarhal-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              خدماتنا المتميزة
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto animate-slide-up">
              مجموعة شاملة من الخدمات السياحية المصممة لتلبية احتياجاتكم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 animate-scale-in group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">{service.title}</h3>
                <p className="text-white/80 mb-6 leading-relaxed text-center">{service.description}</p>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-tarhal-orange mb-2">المميزات:</div>
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-white/90">
                      <CheckCircle className="h-4 w-4 text-tarhal-orange flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center space-y-3">
                  <Button
                    className="bg-tarhal-orange hover:bg-tarhal-orange-dark text-white px-6 py-2 text-sm font-semibold transition-all duration-300"
                    aria-label={`اعرف المزيد عن ${service.title}`}
                  >
                    اعرف المزيد
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white hover:text-tarhal-blue-dark px-6 py-2 text-sm font-semibold transition-all duration-300"
                    aria-label={`احصل على عرض أسعار لـ ${service.title}`}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    احصل على عرض أسعار
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Awards Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              الشهادات والجوائز
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              الاعترافات والشهادات التي حصلنا عليها على مدار رحلتنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: 'ISO 9001', image: '🏆', year: '2023' },
              { name: 'أفضل شركة سياحة', image: '⭐', year: '2023' },
              { name: 'شهادة الجودة', image: '📜', year: '2022' },
              { name: 'جائزة التميز', image: '🏅', year: '2021' },
              { name: 'تقييم 5 نجوم', image: '🌟', year: '2020' },
              { name: 'شهادة الأمان', image: '🛡️', year: '2019' }
            ].map((cert, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-tarhal-orange/5 to-tarhal-blue/5 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{cert.image}</div>
                <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">{cert.name}</h3>
                <p className="text-tarhal-orange font-semibold">{cert.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              فيديوهات شهادات العملاء
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              شاهد قصص نجاح عملائنا من خلال فيديوهاتهم الشخصية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'رحلة عمرة مع CIAR',
                thumbnail: 'https://images.pexels.com/photos/33337243/pexels-photo-33337243.jpeg',
                duration: '2:30',
                client: 'أحمد محمد'
              },
              {
                title: 'تجربة السفر إلى تركيا',
                thumbnail: 'https://images.pexels.com/photos/33338662/pexels-photo-33338662.jpeg',
                duration: '3:15',
                client: 'فاطمة أحمد'
              },
              {
                title: 'رحلة العائلة إلى ماليزيا',
                thumbnail: 'https://images.pexels.com/photos/31565687/pexels-photo-31565687.jpeg',
                duration: '4:20',
                client: 'محمد علي'
              }
            ].map((video, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in group cursor-pointer"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-tarhal-orange rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-tarhal-blue-dark mb-2">{video.title}</h3>
                  <p className="text-tarhal-gray-dark text-sm">{video.client}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              إجابات على أكثر الأسئلة تكراراً حول خدماتنا
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-bold text-tarhal-blue-dark pr-4">{faq.question}</h3>
                    <ChevronDown className="h-5 w-5 text-tarhal-orange group-open:rotate-180 transition-transform duration-300 flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-tarhal-gray-dark leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tarhal-blue-dark mb-6 animate-fade-in">
              تواجدنا العالمي
            </h2>
            <p className="text-xl text-tarhal-gray-dark max-w-3xl mx-auto animate-slide-up">
              مكاتبنا حول العالم جاهزة لخدمتكم
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-tarhal-orange/10 rounded-lg text-tarhal-orange">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">أكثر من 50 مكتب</h3>
                  <p className="text-tarhal-gray-dark">موزعة في 6 قارات حول العالم</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-tarhal-blue/10 rounded-lg text-tarhal-blue">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">تغطية عالمية</h3>
                  <p className="text-tarhal-gray-dark">خدمات في جميع الدول والقارات</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-tarhal-navy/10 rounded-lg text-tarhal-navy">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tarhal-blue-dark mb-2">دعم 24/7</h3>
                  <p className="text-tarhal-gray-dark">فرق دعم متواجدة دائماً لمساعدتكم</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 animate-slide-in-right">
              <div className="h-96 rounded-2xl overflow-hidden shadow-2xl">
                <GoogleMap className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-tarhal-orange to-tarhal-orange-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in">
            اشترك في نشرتنا الإخبارية
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-slide-up max-w-2xl mx-auto">
            احصل على أحدث العروض والوجهات السياحية والنصائح المفيدة
          </p>

          <div className="max-w-md mx-auto animate-scale-in">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none text-tarhal-blue-dark"
              />
              <Button className="bg-white text-tarhal-orange hover:bg-tarhal-blue-dark hover:text-white px-6 py-3 font-semibold transition-all duration-300">
                <Mail className="h-5 w-5 mr-2" />
                اشتراك
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-3">
              لن نرسل spam أبداً. يمكنك إلغاء الاشتراك في أي وقت.
            </p>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-tarhal-blue-dark mb-4 animate-fade-in">
            تابعونا على وسائل التواصل
          </h2>
          <p className="text-tarhal-gray-dark mb-8 animate-slide-up">
            ابقوا على اطلاع بأحدث العروض والوجهات
          </p>
          
          <div className="flex justify-center gap-6 animate-scale-in">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                className="w-16 h-16 bg-gradient-to-br from-tarhal-orange to-tarhal-orange-dark rounded-full flex items-center justify-center text-white text-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
