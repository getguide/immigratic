export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  gradient: string;
  features: string[];
  requirements: string[];
  timeline: string;
  cost: string;
  successRate: string;
  slug: string;
}

export const services: Service[] = [
  {
    id: 'express-entry',
    title: 'Express Entry',
    shortDescription: 'Fast-track your permanent residency through Canada\'s Express Entry system.',
    description: 'Express Entry is Canada\'s flagship immigration program for skilled workers. Our comprehensive service includes CRS optimization, document preparation, and application submission to maximize your chances of receiving an Invitation to Apply (ITA).',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    gradient: 'from-blue-600 to-green-600',
    features: [
      'CRS Score Optimization',
      'Document Preparation & Review',
      'Application Submission',
      'Follow-up & Updates',
      'Interview Preparation',
      'Post-ITA Support'
    ],
    requirements: [
      'Minimum 1 year skilled work experience',
      'Language proficiency (CLB 7+)',
      'Education assessment (if required)',
      'Proof of funds',
      'Medical examination',
      'Police certificates'
    ],
    timeline: '6-12 months',
    cost: 'Starting from $2,500 CAD',
    successRate: '95%',
    slug: 'express-entry'
  },
  {
    id: 'family-sponsorship',
    title: 'Family Sponsorship',
    shortDescription: 'Reunite with your loved ones through family sponsorship programs.',
    description: 'Sponsor your spouse, partner, children, parents, or grandparents to come to Canada. We provide end-to-end support from eligibility assessment to application submission and follow-up.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    gradient: 'from-purple-600 to-pink-600',
    features: [
      'Eligibility Assessment',
      'Document Preparation',
      'Application Submission',
      'Sponsor Support',
      'Processing Updates',
      'Landing Support'
    ],
    requirements: [
      'Sponsor must be Canadian citizen or PR',
      'Minimum income requirements',
      'Relationship proof',
      'Medical examination',
      'Police certificates',
      'Financial support agreement'
    ],
    timeline: '12-24 months',
    cost: 'Starting from $1,800 CAD',
    successRate: '92%',
    slug: 'family-sponsorship'
  },
  {
    id: 'work-permits',
    title: 'Work Permits',
    shortDescription: 'Navigate work permit applications with confidence and expert guidance.',
    description: 'From LMIA-based work permits to Global Talent Stream and intra-company transfers, we help you secure the right work permit for your situation. Our services include LMIA applications, work permit applications, and extensions.',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6',
    gradient: 'from-green-500 to-blue-500',
    features: [
      'LMIA Applications',
      'Work Permit Applications',
      'Extensions & Renewals',
      'Employer Support',
      'Compliance Monitoring',
      'Transition to PR'
    ],
    requirements: [
      'Valid job offer from Canadian employer',
      'LMIA (if required)',
      'Proof of qualifications',
      'Language proficiency',
      'Medical examination',
      'Police certificates'
    ],
    timeline: '3-6 months',
    cost: 'Starting from $1,500 CAD',
    successRate: '88%',
    slug: 'work-permits'
  },
  {
    id: 'study-permits',
    title: 'Study Permits',
    shortDescription: 'Pursue your education in Canada with comprehensive study permit support.',
    description: 'Get expert guidance for your study permit application. We help you choose the right program, prepare your application, and support you throughout your studies in Canada.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Program Selection Guidance',
      'Application Preparation',
      'Document Review',
      'Interview Preparation',
      'Post-Approval Support',
      'Work Permit Applications'
    ],
    requirements: [
      'Letter of acceptance from DLI',
      'Proof of financial support',
      'Language proficiency',
      'Medical examination',
      'Police certificates',
      'Study plan'
    ],
    timeline: '2-4 months',
    cost: 'Starting from $1,200 CAD',
    successRate: '90%',
    slug: 'study-permits'
  },
  {
    id: 'business-immigration',
    title: 'Business Immigration',
    shortDescription: 'Start your business in Canada with expert guidance on startup visas and business programs.',
    description: 'From Startup Visa to Provincial Nominee Business programs, we help entrepreneurs and business owners establish themselves in Canada. Our services include business plan development, investment guidance, and application support.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    gradient: 'from-orange-500 to-red-500',
    features: [
      'Business Plan Development',
      'Investment Guidance',
      'Startup Visa Support',
      'Provincial Programs',
      'Compliance Monitoring',
      'Business Setup Support'
    ],
    requirements: [
      'Business experience',
      'Minimum net worth',
      'Investment commitment',
      'Business plan',
      'Language proficiency',
      'Medical examination'
    ],
    timeline: '12-18 months',
    cost: 'Starting from $3,500 CAD',
    successRate: '85%',
    slug: 'business-immigration'
  }
];

export const getServiceBySlug = (slug: string): Service | undefined => {
  return services.find(service => service.slug === slug);
};

export const getServicesByCategory = (category: string): Service[] => {
  // This can be expanded based on categories
  return services;
}; 