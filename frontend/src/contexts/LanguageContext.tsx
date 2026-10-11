import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    heroBadge: 'IRDAI Sandbox • VORTEXA 3.0 Hackathon Problem B-02',
    heroTitle: "India’s Most Trusted Multi-Insurer Claims & Policy Marketplace",
    heroSubtitle: 'Compare & buy health, motor, and commercial insurance plans with instant deterministic eligibility, cashless hospital network assistance, and cryptographic SHA-256 audit trails.',
    ctaExplore: 'Explore & Compare Policies',
    ctaRegister: 'Create Free Account',
    ctaTalkExpert: 'Talk to Expert',
    ctaVerifyLedger: 'Verify IRDAI Audit Ledger',
    statHospitals: 'Cashless Hospitals',
    statSettled: 'Settled Liability',
    statRatio: 'IRDAI Settlement Ratio',
    statLedger: 'Chained Hash Ledger',
    categoryHeader: 'Compare and Buy Insurance Plans in India',
    categorySub: 'Instant quote comparison across Star Health, Apex Mutual, HDFC ERGO & Vortex Shield.',
    viewAllPlans: 'View All 15+ Plans',
    healthTitle: 'Health Insurance',
    healthSub: '₹5L - ₹1Cr Cover • 10,000+ Hospitals',
    carTitle: 'Car Insurance',
    carSub: 'Instant Zero-Dep • Cashless Garages',
    bikeTitle: '2-Wheeler (Bike)',
    bikeSub: 'Third-party & Own Damage Protection',
    travelTitle: 'Travel Insurance',
    travelSub: 'Medical Emergencies & Flight Delays',
    propertyTitle: 'Commercial Property',
    propertySub: 'Shop, Warehouse & Fire Insurance',
    aiTitle: 'Smart AI Recommender',
    aiSub: 'Find the best matched policy for you',
    personaHeader: 'Test Any Stakeholder Role with Indian Demo Profiles',
    familyAltText: 'Happy protected Indian family smiling together in their home',
    stickyCompare: 'Compare Plans',
    stickyExpert: 'Talk to Expert',
  },
  hi: {
    heroBadge: 'IRDAI सैंडबॉक्स • वोर्टेक्सा 3.0 समस्या B-02',
    heroTitle: 'भारत का सबसे भरोसेमंद बहु-बीमाकर्ता दावा व पॉलिसी बाज़ार',
    heroSubtitle: 'स्वास्थ्य, कार और व्यावसायिक बीमा योजनाओं की तुलना करें और खरीदें। तुरंत गणितीय पात्रता, कैशलेस अस्पताल नेटवर्क और सुरक्षित SHA-256 ऑडिट ट्रेल।',
    ctaExplore: 'पॉलिसी देखें और तुलना करें',
    ctaRegister: 'निशुल्क खाता बनाएं',
    ctaTalkExpert: 'विशेषज्ञ से बात करें',
    ctaVerifyLedger: 'IRDAI ऑडिट लेज़र सत्यापित करें',
    statHospitals: 'कैशलेस अस्पताल',
    statSettled: 'निपटाई गई राशि',
    statRatio: 'दावा निपटान अनुपात',
    statLedger: 'सुरक्षित हैश लेज़र',
    categoryHeader: 'भारत में बीमा योजनाओं की तुलना करें और खरीदें',
    categorySub: 'स्टार हेल्थ, एपेक्स म्यूचुअल, एचडीएफसी एर्गो और वोर्टेक्स शील्ड के बीच त्वरित तुलना।',
    viewAllPlans: 'सभी 15+ प्लान देखें',
    healthTitle: 'स्वास्थ्य बीमा (मेडिक्लेम)',
    healthSub: '₹5 लाख - ₹1 करोड़ कवर • 10,000+ अस्पताल',
    carTitle: 'कार बीमा',
    carSub: 'तुरंत ज़ीरो-डेप • कैशलेस गैरेज',
    bikeTitle: '2-व्हीलर (बाइक बीमा)',
    bikeSub: 'थर्ड-पार्टी व खुद का नुकसान सुरक्षा',
    travelTitle: 'यात्रा बीमा',
    travelSub: 'चिकित्सा आपातकाल व उड़ान में देरी',
    propertyTitle: 'दुकान व संपत्ति बीमा',
    propertySub: 'दुकान, गोदाम और आग से सुरक्षा',
    aiTitle: 'स्मार्ट AI पॉलिसी खोजक',
    aiSub: 'अपनी ज़रूरत के अनुसार सर्वश्रेष्ठ प्लान खोजें',
    personaHeader: 'भारतीय डेमो प्रोफाइल के साथ विभिन्न भूमिकाओं का परीक्षण करें',
    familyAltText: 'सुरक्षित और खुशहाल भारतीय परिवार अपने घर में मुस्कुराते हुए',
    stickyCompare: 'प्लान तुलना करें',
    stickyExpert: 'विशेषज्ञ से बात करें',
  },
  mr: {
    heroBadge: 'IRDAI सँडबॉक्स • वोर्टेक्सा 3.0 समस्या B-02',
    heroTitle: 'भारतातील सर्वात विश्वसनीय बहु-विमाकर्ता दावा आणि पॉलिसी मार्केट',
    heroSubtitle: 'आरोग्य, वाहन आणि व्यावसायिक विमा योजनांची तुलना करा आणि खरेदी करा. त्वरित पारदर्शक पात्रता, कॅशलेस हॉस्पिटल नेटवर्क आणि सुरक्षित SHA-256 ऑडिट लेजर.',
    ctaExplore: 'पॉलिसी पाहा आणि तुलना करा',
    ctaRegister: 'मोफत खाते तयार करा',
    ctaTalkExpert: 'तज्ज्ञांशी बोला',
    ctaVerifyLedger: 'IRDAI ऑडिट लेजर तपासा',
    statHospitals: 'कॅशलेस हॉस्पिटल्स',
    statSettled: 'निकाली काढलेली रक्कम',
    statRatio: 'दावा पूर्तता गुणोत्तर',
    statLedger: 'हॅश लेजर सुरक्षा',
    categoryHeader: 'भारतातील सर्वोत्तम विमा योजनांची तुलना करा आणि खरेदी करा',
    categorySub: 'स्टार हेल्थ, एपेक्स म्युच्युअल, एचडीएफसी एर्गो आणि व्होर्टेक्स शील्डमधील त्वरित तुलना.',
    viewAllPlans: 'सर्व 15+ प्लॅन्स पाहा',
    healthTitle: 'आरोग्य विमा (मेडिक्लेम)',
    healthSub: '₹5 लाख - ₹1 कोटी कव्हर • 10,000+ हॉस्पिटल्स',
    carTitle: 'कार विमा',
    carSub: 'इन्स्टंट झिरो-डेप • कॅशलेस गॅरेज',
    bikeTitle: 'दुचाकी (बाईक विमा)',
    bikeSub: 'थर्ड-पार्टी आणि स्वतःचे नुकसान संरक्षण',
    travelTitle: 'प्रवास विमा',
    travelSub: 'वैद्यकीय आणीबाणी आणि विमानाची दिरंगाई',
    propertyTitle: 'व्यावसायिक व दुकान विमा',
    propertySub: 'दुकान, गोदाम आणि आगीपासून संरक्षण',
    aiTitle: 'स्मार्ट AI पॉलिसी शोधक',
    aiSub: 'तुमच्यासाठी सर्वात योग्य पॉलिसी निवडा',
    personaHeader: 'भारतीय डेमो प्रोफाईलसह विविध भूमिकांची चाचणी घ्या',
    familyAltText: 'सुरक्षित आणि आनंदी भारतीय कुटुंब घरात एकत्र हसतमुख',
    stickyCompare: 'प्लॅन्स तपासा',
    stickyExpert: 'तज्ज्ञांशी बोला',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('insurechain_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('insurechain_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
