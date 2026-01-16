import express from 'express';
import { getDatabase } from '../database/database';
import { CountryModel } from '../models/Country';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Sample offer templates
const offerTemplates = [
  {
    title_ar: 'رحلة سياحية شاملة',
    title_en: 'Comprehensive Tourist Trip',
    title_fr: 'Voyage Touristique Complet',
    description_ar: 'استمتع برحلة سياحية شاملة تشمل جميع المعالم السياحية الرئيسية',
    description_en: 'Enjoy a comprehensive tourist trip including all major tourist attractions',
    description_fr: 'Profitez d\'un voyage touristique complet incluant toutes les attractions principales',
    duration_days: 7,
    duration_text_ar: '7 أيام / 6 ليال',
    duration_text_en: '7 Days / 6 Nights',
    duration_text_fr: '7 Jours / 6 Nuits',
    includes_ar: ['الإقامة في فندق 4 نجوم', 'وجبات الإفطار', 'جولات سياحية', 'نقل من وإلى المطار'],
    includes_en: ['4-star hotel accommodation', 'Breakfast', 'Tourist tours', 'Airport transfers'],
    includes_fr: ['Hébergement hôtel 4 étoiles', 'Petit-déjeuner', 'Visites touristiques', 'Transferts aéroport'],
    highlights_ar: ['زيارة المعالم التاريخية', 'تجربة الثقافة المحلية', 'جولات إرشادية'],
    highlights_en: ['Visit historical sites', 'Experience local culture', 'Guided tours'],
    highlights_fr: ['Visiter les sites historiques', 'Découvrir la culture locale', 'Visites guidées']
  },
  {
    title_ar: 'عطلة رومانسية',
    title_en: 'Romantic Getaway',
    title_fr: 'Évasion Romantique',
    description_ar: 'عطلة رومانسية مثالية للأزواج في أجواء ساحرة',
    description_en: 'Perfect romantic getaway for couples in charming atmosphere',
    description_fr: 'Évasion romantique parfaite pour les couples dans une atmosphère charmante',
    duration_days: 5,
    duration_text_ar: '5 أيام / 4 ليال',
    duration_text_en: '5 Days / 4 Nights',
    duration_text_fr: '5 Jours / 4 Nuits',
    includes_ar: ['إقامة في فندق فاخر', 'وجبات رومانسية', 'جولات خاصة', 'خدمات VIP'],
    includes_en: ['Luxury hotel accommodation', 'Romantic meals', 'Private tours', 'VIP services'],
    includes_fr: ['Hébergement hôtel de luxe', 'Repas romantiques', 'Visites privées', 'Services VIP'],
    highlights_ar: ['إطلالات خلابة', 'تجارب رومانسية', 'خدمة متميزة'],
    highlights_en: ['Scenic views', 'Romantic experiences', 'Premium service'],
    highlights_fr: ['Vues panoramiques', 'Expériences romantiques', 'Service premium']
  },
  {
    title_ar: 'مغامرة ثقافية',
    title_en: 'Cultural Adventure',
    title_fr: 'Aventure Culturelle',
    description_ar: 'اكتشف الثقافة والتقاليد المحلية من خلال رحلة ثقافية مميزة',
    description_en: 'Discover local culture and traditions through an exceptional cultural journey',
    description_fr: 'Découvrez la culture et les traditions locales à travers un voyage culturel exceptionnel',
    duration_days: 10,
    duration_text_ar: '10 أيام / 9 ليال',
    duration_text_en: '10 Days / 9 Nights',
    duration_text_fr: '10 Jours / 9 Nuits',
    includes_ar: ['إقامة في فنادق محلية', 'وجبات تقليدية', 'ورش عمل ثقافية', 'مرشد محلي'],
    includes_en: ['Local hotel accommodation', 'Traditional meals', 'Cultural workshops', 'Local guide'],
    includes_fr: ['Hébergement hôtel local', 'Repas traditionnels', 'Ateliers culturels', 'Guide local'],
    highlights_ar: ['تعلم التقاليد', 'زيارة الأسواق المحلية', 'تفاعل مع السكان'],
    highlights_en: ['Learn traditions', 'Visit local markets', 'Interact with locals'],
    highlights_fr: ['Apprendre les traditions', 'Visiter les marchés locaux', 'Interagir avec les locaux']
  },
  {
    title_ar: 'رحلة عائلية',
    title_en: 'Family Trip',
    title_fr: 'Voyage en Famille',
    description_ar: 'رحلة عائلية ممتعة تناسب جميع الأعمار',
    description_en: 'Fun family trip suitable for all ages',
    description_fr: 'Voyage familial amusant adapté à tous les âges',
    duration_days: 8,
    duration_text_ar: '8 أيام / 7 ليال',
    duration_text_en: '8 Days / 7 Nights',
    duration_text_fr: '8 Jours / 7 Nuits',
    includes_ar: ['إقامة عائلية', 'أنشطة للأطفال', 'وجبات عائلية', 'ترفيه متنوع'],
    includes_en: ['Family accommodation', 'Children activities', 'Family meals', 'Varied entertainment'],
    includes_fr: ['Hébergement familial', 'Activités pour enfants', 'Repas familiaux', 'Divertissement varié'],
    highlights_ar: ['أنشطة للأطفال', 'أماكن ترفيهية', 'تجربة عائلية'],
    highlights_en: ['Children activities', 'Entertainment venues', 'Family experience'],
    highlights_fr: ['Activités pour enfants', 'Lieux de divertissement', 'Expérience familiale']
  },
  {
    title_ar: 'جولة سريعة',
    title_en: 'Quick Tour',
    title_fr: 'Visite Rapide',
    description_ar: 'جولة سريعة لاستكشاف المعالم الرئيسية',
    description_en: 'Quick tour to explore main attractions',
    description_fr: 'Visite rapide pour explorer les attractions principales',
    duration_days: 3,
    duration_text_ar: '3 أيام / 2 ليال',
    duration_text_en: '3 Days / 2 Nights',
    duration_text_fr: '3 Jours / 2 Nuits',
    includes_ar: ['إقامة فندقية', 'وجبة إفطار', 'جولات سياحية', 'نقل'],
    includes_en: ['Hotel accommodation', 'Breakfast', 'Tourist tours', 'Transportation'],
    includes_fr: ['Hébergement hôtel', 'Petit-déjeuner', 'Visites touristiques', 'Transport'],
    highlights_ar: ['معالم رئيسية', 'جولة مكثفة', 'سعر مناسب'],
    highlights_en: ['Main attractions', 'Intensive tour', 'Affordable price'],
    highlights_fr: ['Attractions principales', 'Visite intensive', 'Prix abordable']
  },
  {
    title_ar: 'رحلة فاخرة',
    title_en: 'Luxury Trip',
    title_fr: 'Voyage de Luxe',
    description_ar: 'تجربة فاخرة مع أفضل الخدمات والمرافق',
    description_en: 'Luxury experience with best services and facilities',
    description_fr: 'Expérience de luxe avec les meilleurs services et installations',
    duration_days: 12,
    duration_text_ar: '12 يوم / 11 ليلة',
    duration_text_en: '12 Days / 11 Nights',
    duration_text_fr: '12 Jours / 11 Nuits',
    includes_ar: ['إقامة فاخرة', 'وجبات غرنقة', 'خدمات VIP', 'نقل خاص'],
    includes_en: ['Luxury accommodation', 'Gourmet meals', 'VIP services', 'Private transportation'],
    includes_fr: ['Hébergement de luxe', 'Repas gastronomiques', 'Services VIP', 'Transport privé'],
    highlights_ar: ['خدمات فاخرة', 'تجربة مميزة', 'راحة تامة'],
    highlights_en: ['Luxury services', 'Exceptional experience', 'Complete comfort'],
    highlights_fr: ['Services de luxe', 'Expérience exceptionnelle', 'Confort total']
  },
  {
    title_ar: 'مغامرة برية',
    title_en: 'Wild Adventure',
    title_fr: 'Aventure Sauvage',
    description_ar: 'مغامرة برية مثيرة في الطبيعة الخلابة',
    description_en: 'Exciting wild adventure in scenic nature',
    description_fr: 'Aventure sauvage passionnante dans une nature pittoresque',
    duration_days: 6,
    duration_text_ar: '6 أيام / 5 ليال',
    duration_text_en: '6 Days / 5 Nights',
    duration_text_fr: '6 Jours / 5 Nuits',
    includes_ar: ['إقامة في الطبيعة', 'أنشطة مغامرة', 'معدات متخصصة', 'مرشد محترف'],
    includes_en: ['Nature accommodation', 'Adventure activities', 'Specialized equipment', 'Professional guide'],
    includes_fr: ['Hébergement nature', 'Activités d\'aventure', 'Équipement spécialisé', 'Guide professionnel'],
    highlights_ar: ['أنشطة مغامرة', 'طبيعة خلابة', 'تجربة فريدة'],
    highlights_en: ['Adventure activities', 'Scenic nature', 'Unique experience'],
    highlights_fr: ['Activités d\'aventure', 'Nature pittoresque', 'Expérience unique']
  },
  {
    title_ar: 'رحلة تاريخية',
    title_en: 'Historical Journey',
    title_fr: 'Voyage Historique',
    description_ar: 'اكتشف التاريخ العريق من خلال زيارة المواقع التاريخية',
    description_en: 'Discover ancient history by visiting historical sites',
    description_fr: 'Découvrez l\'histoire ancienne en visitant les sites historiques',
    duration_days: 9,
    duration_text_ar: '9 أيام / 8 ليال',
    duration_text_en: '9 Days / 8 Nights',
    duration_text_fr: '9 Jours / 8 Nuits',
    includes_ar: ['إقامة قريبة من المواقع', 'جولات تاريخية', 'مرشد تاريخي', 'زيارات متحف'],
    includes_en: ['Accommodation near sites', 'Historical tours', 'Historical guide', 'Museum visits'],
    includes_fr: ['Hébergement près des sites', 'Visites historiques', 'Guide historique', 'Visites de musées'],
    highlights_ar: ['مواقع تاريخية', 'معرفة تاريخية', 'تجربة تعليمية'],
    highlights_en: ['Historical sites', 'Historical knowledge', 'Educational experience'],
    highlights_fr: ['Sites historiques', 'Connaissances historiques', 'Expérience éducative']
  },
  {
    title_ar: 'رحلة شاطئية',
    title_en: 'Beach Vacation',
    title_fr: 'Vacances à la Plage',
    description_ar: 'استرخِ على الشواطئ الجميلة واستمتع بالشمس والبحر',
    description_en: 'Relax on beautiful beaches and enjoy sun and sea',
    description_fr: 'Détendez-vous sur de belles plages et profitez du soleil et de la mer',
    duration_days: 7,
    duration_text_ar: '7 أيام / 6 ليال',
    duration_text_en: '7 Days / 6 Nights',
    duration_text_fr: '7 Jours / 6 Nuits',
    includes_ar: ['إقامة شاطئية', 'أنشطة مائية', 'شمس ورمال', 'استرخاء تام'],
    includes_en: ['Beach accommodation', 'Water activities', 'Sun and sand', 'Complete relaxation'],
    includes_fr: ['Hébergement plage', 'Activités nautiques', 'Soleil et sable', 'Détente complète'],
    highlights_ar: ['شواطئ جميلة', 'أنشطة مائية', 'استرخاء'],
    highlights_en: ['Beautiful beaches', 'Water activities', 'Relaxation'],
    highlights_fr: ['Belles plages', 'Activités nautiques', 'Détente']
  },
  {
    title_ar: 'جولة شهر العسل',
    title_en: 'Honeymoon Tour',
    title_fr: 'Voyage de Noces',
    description_ar: 'رحلة رومانسية مثالية لشهر العسل',
    description_en: 'Perfect romantic trip for honeymoon',
    description_fr: 'Voyage romantique parfait pour la lune de miel',
    duration_days: 14,
    duration_text_ar: '14 يوم / 13 ليلة',
    duration_text_en: '14 Days / 13 Nights',
    duration_text_fr: '14 Jours / 13 Nuits',
    includes_ar: ['إقامة رومانسية', 'وجبات خاصة', 'أنشطة رومانسية', 'هدايا تذكارية'],
    includes_en: ['Romantic accommodation', 'Special meals', 'Romantic activities', 'Souvenirs'],
    includes_fr: ['Hébergement romantique', 'Repas spéciaux', 'Activités romantiques', 'Souvenirs'],
    highlights_ar: ['رومانسية', 'خصوصية', 'ذكريات جميلة'],
    highlights_en: ['Romantic', 'Privacy', 'Beautiful memories'],
    highlights_fr: ['Romantique', 'Intimité', 'Beaux souvenirs']
  }
];

// POST /api/travel-offers/seed - Seed 10 offers for each country
router.post('/seed', async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get all countries
    const countries = await CountryModel.findAll(false); // Get all countries including inactive
    
    if (countries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No countries found. Please add countries first.'
      });
    }

    let totalCreated = 0;
    const errors: string[] = [];

    // For each country, create 10 offers
    for (const country of countries) {
      for (let i = 0; i < 10; i++) {
        try {
          const template = offerTemplates[i % offerTemplates.length];
          
          // Generate prices based on duration
          const basePrice = 500 + (template.duration_days * 100) + (Math.random() * 500);
          const originalPrice = Math.round(basePrice);
          const discountPercentage = 10 + Math.floor(Math.random() * 30); // 10-40% discount
          const discountPrice = Math.round(originalPrice * (1 - discountPercentage / 100));

          // Generate dates
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days from now
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + template.duration_days);
          const validUntil = new Date(startDate);
          validUntil.setDate(startDate.getDate() - 1);

          const id = uuidv4();
          
          await db.run(
            `INSERT INTO travel_offers (
              id, country_id, title_ar, title_en, title_fr,
              description_ar, description_en, description_fr,
              original_price, discount_price, discount_percentage,
              duration_days, duration_text_ar, duration_text_en, duration_text_fr,
              start_date, end_date, valid_until,
              max_participants,
              includes_ar, includes_en, includes_fr,
              highlights_ar, highlights_en, highlights_fr,
              images, main_image,
              currency, is_featured, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              country.id,
              `${template.title_ar} - ${country.name_ar}`,
              `${template.title_en} - ${country.name_en}`,
              `${template.title_fr} - ${country.name_fr}`,
              `${template.description_ar} في ${country.name_ar}`,
              `${template.description_en} in ${country.name_en}`,
              `${template.description_fr} en ${country.name_fr}`,
              originalPrice,
              discountPrice,
              discountPercentage,
              template.duration_days,
              template.duration_text_ar,
              template.duration_text_en,
              template.duration_text_fr,
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0],
              validUntil.toISOString().split('T')[0],
              15 + Math.floor(Math.random() * 10), // 15-25 participants
              JSON.stringify(template.includes_ar),
              JSON.stringify(template.includes_en),
              JSON.stringify(template.includes_fr),
              JSON.stringify(template.highlights_ar),
              JSON.stringify(template.highlights_en),
              JSON.stringify(template.highlights_fr),
              JSON.stringify([country.main_image]), // Use country main image
              country.main_image,
              'USD',
              i < 2 ? 1 : 0, // First 2 offers are featured
              1 // Active
            ]
          );
          
          totalCreated++;
        } catch (error: any) {
          errors.push(`Failed to create offer ${i + 1} for ${country.name_ar}: ${error.message}`);
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully created ${totalCreated} travel offers for ${countries.length} countries`,
      totalCreated,
      totalCountries: countries.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('Error seeding travel offers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to seed travel offers'
    });
  }
});

export default router;

