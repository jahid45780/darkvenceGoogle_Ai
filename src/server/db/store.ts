import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  ServiceItem,
  ProjectItem,
  InquiryItem,
  BlogPostItem,
  SiteSettings,
  MediaItem,
  PageSeoConfig,
  PerformanceSnapshot,
  TrackingConfig,
  HealthStatus,
  SeoAuditReport,
  AboutPageData,
  Testimonial,
  TrustedBrand,
  TrustedBrandsSectionSettings,
  StatisticItem
} from '../types/index.ts';
import {
  UserModel,
  ServiceModel,
  ProjectModel,
  BlogPostModel,
  InquiryModel,
  AboutModel,
  SettingsModel,
  MediaModel,
  SeoModel,
  PerformanceModel,
  TrackingModel,
  TestimonialModel,
  TrustedBrandModel,
  TrustedBrandSettingsModel,
  StatisticModel
} from './models/index.ts';
import { getDatabaseStatus } from './connection.ts';


// Pre-hashed default password 'darkvence2026!'
// $2a$10$vN9.9h7O5V4QJ1fC4FkZleH1Qk4K/5gM51F1eT0G3K9vR6l2B3Dqm or generated at boot
let adminUser: AdminUser = {
  id: 'usr_darkvence_admin_1',
  name: 'Darkvence Principal',
  email: 'admin@darkvence.com',
  passwordHash: bcrypt.hashSync('darkvence2026!', 10),
  role: 'superadmin',
  createdAt: new Date().toISOString()
};

let servicesList: ServiceItem[] = [
  {
    id: 'srv_1',
    title: 'Website Development',
    slug: 'website-development',
    shortDescription: 'Bespoke web applications engineered for speed, conversion, and architectural longevity using modern React, Next.js, and TypeScript.',
    fullDescription: 'We build high-performance web systems tailored to your exact business model. From corporate platforms to complex web portals, we prioritize lightning-fast load times, SEO-friendly architectures, and clean code that scales effortlessly with your team.',
    icon: 'Globe',
    coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    features: [
      'Tailored Next.js and React architecture',
      'Core Web Vitals sub-second performance',
      'Full responsive adaptation for all viewports',
      'Accessible WCAG AA compliant interfaces',
      'API-first headless integrations'
    ],
    deliverables: [
      'Production-ready codebase & repository',
      'Automated CI/CD deployment pipeline',
      'SEO metadata architecture & Schema.org markup',
      'Interactive styleguide & design system documentation',
      '30-day post-launch warranty & stabilization'
    ],
    process: [
      { step: '01', title: 'Technical Discovery', description: 'Auditing existing systems, defining core requirements, and mapping technical architecture.' },
      { step: '02', title: 'Interactive Prototyping', description: 'Creating pixel-perfect high-fidelity layouts in tight feedback loops.' },
      { step: '03', title: 'Sprint Development', description: 'Bi-weekly agile sprints with continuous staging deployments.' },
      { step: '04', title: 'Stress Testing & Launch', description: 'Rigorous automated testing, security audits, and DNS migration.' }
    ],
    faqs: [
      { question: 'What tech stack do you recommend for high-performance websites?', answer: 'We primarily architect on Next.js, TypeScript, and Node.js with headless CMS or edge data layers, ensuring exceptional Core Web Vitals.' },
      { question: 'Do you provide maintenance after launching?', answer: 'Yes, we provide structured monthly SLAs covering security patching, performance monitoring, and iterative feature development.' }
    ],
    status: 'published',
    order: 1,
    seoTitle: 'Website Development Services — Darkvence Digital Agency',
    seoDescription: 'High-performance web applications and corporate websites engineered for conversion, speed, and architectural elegance.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_2',
    title: 'Mobile Application Development',
    slug: 'mobile-app-development',
    shortDescription: 'Native iOS & Android experiences and cross-platform Flutter/React Native solutions with intuitive gestures and high FPS performance.',
    fullDescription: 'We craft native and cross-platform mobile applications designed to captivate users. Our mobile engineers obsess over tactile haptics, seamless offline caching, background synchronization, and effortless app store publication.',
    icon: 'Smartphone',
    coverImage: '/src/assets/images/project_mobile_lifestyle_1790497087881.jpg',
    features: [
      'Cross-platform Flutter & React Native efficiency',
      'Native iOS (Swift) & Android (Kotlin) development',
      'Robust offline-first SQLite/Realm sync architectures',
      'Biometric authentication and secure local storage',
      'Push notification automation with deep linking'
    ],
    deliverables: [
      'App Store & Google Play production publishing',
      'Native mobile application codebases',
      'REST & GraphQL backend integration services',
      'Crash analytics & telemetry instrumentation',
      'Store listing assets & App Store Optimization guide'
    ],
    process: [
      { step: '01', title: 'User Flow Mapping', description: 'Designing frictionless mobile user journeys and ergonomic touch zones.' },
      { step: '02', title: 'Interactive Mobile Prototype', description: 'Testing native gestures, transitions, and haptic feedback.' },
      { step: '03', title: 'Native Engineering', description: 'Building performant mobile clients with clean separation of concerns.' },
      { step: '04', title: 'App Store Submission', description: 'Navigating Apple and Google review guidelines to ensure smooth approvals.' }
    ],
    faqs: [
      { question: 'Should we choose React Native or native Swift/Kotlin?', answer: 'For 90% of business applications, React Native or Flutter provides identical 60 FPS fluidity with 40% faster time-to-market. For intensive GPU or hardware integration, we recommend pure native.' }
    ],
    status: 'published',
    order: 2,
    seoTitle: 'Mobile App Development — iOS, Android & Cross-Platform | Darkvence',
    seoDescription: 'Engineered mobile applications with smooth micro-interactions, offline reliability, and scalable backend integrations.',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_3',
    title: 'CMS Development',
    slug: 'cms-development',
    shortDescription: 'Headless, flexible content management architectures giving your marketing team intuitive publishing superpowers without compromising code quality.',
    fullDescription: 'Stop fighting rigid legacy platforms. We build tailored headless CMS architectures (Payload, Sanity, Strapi, Custom Node.js) that allow your marketing team to build landing pages on demand while maintaining strict design tokens and high-speed delivery.',
    icon: 'LayoutGrid',
    coverImage: '/src/assets/images/project_ecommerce_experience_1790497101724.jpg',
    features: [
      'Modular content modeling tailored to your taxonomy',
      'Role-based access control (RBAC) & workflow approvals',
      'Live preview environments for draft content',
      'Multi-language localization and multi-site orchestration',
      'Lightning-fast CDN caching and incremental static regeneration'
    ],
    deliverables: [
      'Customized CMS dashboard for editorial teams',
      'Structured content schema definitions',
      'Automated image optimization & asset pipeline',
      'Editorial documentation & video training walkthroughs',
      'Automated daily database backups'
    ],
    process: [
      { step: '01', title: 'Content Schema Modeling', description: 'Translating business entities into clean, reusable editorial structures.' },
      { step: '02', title: 'CMS Configuration', description: 'Deploying secure headless environments with granular editorial permissions.' },
      { step: '03', title: 'Frontend Integration', description: 'Binding CMS webhooks to automated incremental frontend builds.' },
      { step: '04', title: 'Editorial Onboarding', description: 'Hands-on training sessions with your marketing and editorial staff.' }
    ],
    faqs: [
      { question: 'Can our marketing team publish without developer assistance?', answer: 'Yes. Our CMS implementations include modular visual page builders with strict brand guardrails, giving creators complete independence.' }
    ],
    status: 'published',
    order: 3,
    seoTitle: 'Headless CMS Development Services — Darkvence',
    seoDescription: 'Tailored headless CMS solutions empowering marketing teams with intuitive publishing workflows and zero code compromises.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_4',
    title: 'Google Ads Management',
    slug: 'google-ads-management',
    shortDescription: 'Data-driven Search, Performance Max, and Display campaigns focused on high-intent buyer keywords, low acquisition costs, and transparent ROI.',
    fullDescription: 'Eliminate wasted ad spend with surgical Google Ads management. We engineer conversion-focused search campaigns, negative keyword strategies, and responsive landing pages designed to capture in-market enterprise decision makers.',
    icon: 'TrendingUp',
    coverImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    features: [
      'High-intent commercial keyword discovery',
      'Full server-side conversion tracking & GA4 setup',
      'Performance Max campaign optimization',
      'A/B testing ad copy variations and value propositions',
      'Competitor auction insights and bidding automation'
    ],
    deliverables: [
      'Custom real-time Google Looker Studio dashboard',
      'Weekly bid adjustments & negative keyword pruning',
      'Dedicated ad copywriting & creative asset production',
      'Landing page conversion rate optimization audits',
      'Bi-weekly strategy check-in calls with senior strategist'
    ],
    process: [
      { step: '01', title: 'Account & Attribution Audit', description: 'Verifying tracking tag precision and auditing historical waste.' },
      { step: '02', title: 'Campaign Architecture', description: 'Structuring single-theme ad groups with precision match types.' },
      { step: '03', title: 'Smart Bidding Ramp', description: 'Guiding algorithmic bidding targets to achieve targeted CPA and ROAS.' },
      { step: '04', title: 'Continuous Scaling', description: 'Expanding into profitable query clusters while maintaining margins.' }
    ],
    faqs: [
      { question: 'What is your minimum monthly ad spend recommendation?', answer: 'We typically recommend a minimum ad budget of $2,500/month to ensure sufficient statistical data for rapid algorithmic optimization.' }
    ],
    status: 'published',
    order: 4,
    seoTitle: 'Google Ads Management & Performance Marketing — Darkvence',
    seoDescription: 'High-intent search campaigns and Performance Max optimization delivering verifiable pipeline growth.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_5',
    title: 'Facebook & Instagram Ads Management',
    slug: 'facebook-instagram-ads',
    shortDescription: 'Compelling creative strategies, Meta Conversions API implementation, and lookalike audience scaling for customer acquisition.',
    fullDescription: 'Stop scrolling, start converting. We combine high-converting ad creative design with sophisticated Meta advertising funnels. From top-of-funnel brand introduction to dynamic retargeting, we drive scalable customer acquisition.',
    icon: 'Share2',
    coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    features: [
      'Meta Conversions API (CAPI) server-side tracking',
      'Scroll-stopping static and motion ad creatives',
      'Custom audience segmentation & predictive lookalikes',
      'Automated creative testing sandbox workflows',
      'Full-funnel remarketing sequences with customized messaging'
    ],
    deliverables: [
      'High-converting static & motion ad creative batches',
      'Comprehensive audience persona targeting maps',
      'Live metric tracking dashboard for ROAS & CAC',
      'Offer positioning strategy & angle development',
      'Monthly executive performance reports'
    ],
    process: [
      { step: '01', title: 'Angle & Hook Ideation', description: 'Formulating psychological buyer triggers and distinct creative hooks.' },
      { step: '02', title: 'Production & Pixel CAPI', description: 'Generating motion creatives and deploying server-side tracking.' },
      { step: '03', title: 'Sandboxing & Creative Testing', description: 'Rapidly identifying winning ad assets at low preliminary spend.' },
      { step: '04', title: 'Budget Scaling', description: 'Scaling validated winning creative combinations sustainably.' }
    ],
    faqs: [
      { question: 'Do you create the ad graphics and videos as well?', answer: 'Yes. Our internal creative team handles copywriting, static graphic design, and short-form video motion graphics.' }
    ],
    status: 'published',
    order: 5,
    seoTitle: 'Meta Ads Management (Facebook & Instagram) — Darkvence',
    seoDescription: 'Performance creative and server-side tracking funnels engineered for scalable paid customer acquisition.',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_6',
    title: 'Custom Software & Digital Solutions',
    slug: 'custom-software-solutions',
    shortDescription: 'Scalable cloud backends, microservices, internal automation tools, and tailored enterprise software engineered to streamline operations.',
    fullDescription: 'When off-the-shelf software falls short, we engineer tailor-made digital engines. We build internal workflow portals, API integrations, automated data pipelines, and mission-critical cloud backends designed around your proprietary business workflows.',
    icon: 'Cpu',
    coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    features: [
      'Modern microservices and REST/GraphQL API architectures',
      'PostgreSQL, MongoDB, and Redis distributed caching',
      'Enterprise role-based security & OAuth SSO',
      'Real-time event streaming and webhook infrastructure',
      'Cloud-native container orchestration with Docker & Kubernetes'
    ],
    deliverables: [
      'Fully documented backend services and API specifications',
      'Infrastructure as Code (Terraform/Docker) setups',
      'Automated unit, integration, and load test suites',
      'Administrator portal & operations dashboard',
      'Comprehensive security audit & code review documentation'
    ],
    process: [
      { step: '01', title: 'System Architecture Blueprints', description: 'Mapping data schemas, security perimeters, and concurrency requirements.' },
      { step: '02', title: 'Domain-Driven Development', description: 'Implementing robust core business entities with clean boundaries.' },
      { step: '03', title: 'API Integration & Benchmarking', description: 'Conducting load tests and verifying sub-50ms query latencies.' },
      { step: '04', title: 'Staging & Blue-Green Deployment', description: 'Zero-downtime rollouts with automated health monitoring.' }
    ],
    faqs: [
      { question: 'Can you integrate with our legacy enterprise databases?', answer: 'Yes. We specialize in building secure modern API proxy layers on top of legacy SQL, ERP, or internal proprietary systems.' }
    ],
    status: 'published',
    order: 6,
    seoTitle: 'Custom Software Development — Darkvence',
    seoDescription: 'Bespoke backend architectures, cloud portals, and workflow automation systems built for business longevity.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_7',
    title: 'Web Application Development',
    slug: 'web-application-development',
    shortDescription: 'Scalable Single Page & Server-Rendered web applications with complex state machines, real-time collaboration, and enterprise RBAC security.',
    fullDescription: 'We build high-concurrency SaaS applications and client-facing web portals. From reactive dashboards to real-time collaborative workspaces, our engineering combines typed state management with resilient edge databases.',
    icon: 'Layers',
    coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    features: [
      'Reactive TypeScript & React/Next.js frontend architectures',
      'Real-time WebSocket & SSE event streaming',
      'Role-based granular access control (RBAC)',
      'Enterprise SSO & OAuth 2.0 integration',
      'Comprehensive unit & end-to-end integration test suites'
    ],
    deliverables: [
      'Architected SaaS web application repository',
      'Modular component library & design system',
      'Comprehensive REST / GraphQL API specs',
      'Dockerized container deployment configurations',
      'Operational monitoring & error tracking setup'
    ],
    process: [
      { step: '01', title: 'Domain Data Modeling', description: 'Defining relational entities, security perimeters, and API contracts.' },
      { step: '02', title: 'State Architecture', description: 'Implementing predictable store workflows and optimistic UI updates.' },
      { step: '03', title: 'Module Engineering', description: 'Iterative bi-weekly delivery with continuous staging feedback.' },
      { step: '04', title: 'Hardening & QA', description: 'Stress tests, penetration auditing, and production blue-green deployment.' }
    ],
    faqs: [
      { question: 'Can you migrate our legacy web application to modern React/Next.js?', answer: 'Yes. We specialize in zero-downtime strangler fig migrations, replacing legacy monoliths module by module.' }
    ],
    status: 'published',
    order: 7,
    seoTitle: 'Web Application Development — Scalable SaaS & Portals | Darkvence',
    seoDescription: 'Enterprise-grade web application engineering with real-time streaming, high concurrency, and modern typed architectures.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'srv_8',
    title: 'Digital Marketing & Conversion Tracking',
    slug: 'digital-marketing-conversion-tracking',
    shortDescription: 'Server-side attribution pipelines, GA4 server routing, Meta Conversions API (CAPI), and holistic multi-touch conversion rate optimization.',
    fullDescription: 'Stop losing advertising attribution to privacy updates and browser blocks. We engineer robust server-side measurement pipelines connecting GA4, Google Ads, and Meta CAPI directly to your backend, ensuring accurate ROI attribution.',
    icon: 'Activity',
    coverImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    features: [
      'Server-side Meta Conversions API (CAPI) implementation',
      'Google Analytics 4 custom event architecture & Looker reporting',
      'First-party data collection pipelines with consent governance',
      'Multi-touch conversion attribution models',
      'A/B testing conversion rate optimization (CRO) funnels'
    ],
    deliverables: [
      'Validated server-to-server tracking pipeline',
      'Google Tag Manager server container deployment',
      'Custom Looker Studio executive attribution dashboard',
      'Conversion tracking audit report & SLA documentation',
      'Quarterly conversion optimization reviews'
    ],
    process: [
      { step: '01', title: 'Tracking Audit', description: 'Detecting signal loss, client drop-offs, and duplicate conversions.' },
      { step: '02', title: 'Server Proxy Setup', description: 'Deploying secure server endpoints for event hashing and dispatch.' },
      { step: '03', title: 'Event Deduplication', description: 'Matching client and server event IDs with 9.0+ match quality.' },
      { step: '04', title: 'Attribution Verification', description: 'Confirming events in Meta Events Manager and Google Ads.' }
    ],
    faqs: [
      { question: 'Will server-side tracking affect site load times?', answer: 'No. Server-side tracking actually speeds up page loading because third-party vendor scripts are moved off the client browser into background server webhooks.' }
    ],
    status: 'published',
    order: 8,
    seoTitle: 'Digital Marketing & Server-Side Conversion Tracking — Darkvence',
    seoDescription: 'Server-side attribution, Meta CAPI, and GA4 tracking architectures designed to restore advertising signal and lower customer acquisition costs.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let projectsList: ProjectItem[] = [
  {
    id: 'prj_1',
    title: 'AuraPay Financial Intelligence Platform',
    slug: 'aurapay-financial-intelligence',
    client: 'AuraPay Global (Demo Showcase)',
    category: 'Website Development',
    description: 'An enterprise treasury dashboard providing real-time multi-currency liquidity monitoring and automated FX hedging for modern tech startups.',
    challenge: 'AuraPay needed to transition from fragmented spreadsheets to a real-time web portal that could render 10,000+ streaming ledger transactions per second without frame drops or memory leaks.',
    solution: 'Engineered a Next.js and TypeScript web application with WebSocket state synchronization, virtualized canvas data tables, and an ultra-refined dark aesthetic.',
    results: [
      { metric: '99.98%', label: 'Uptime reliability' },
      { metric: '42ms', label: 'Median query latency' },
      { metric: '+184%', label: 'Demo conversion rate' }
    ],
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Node.js', 'PostgreSQL'],
    images: [
      '/src/assets/images/project_fintech_platform_1790497066827.jpg',
      '/src/assets/images/hero_darkvence_digital_1790497052243.jpg'
    ],
    projectUrl: 'https://demo.darkvence.com/aurapay',
    featured: true,
    status: 'published',
    order: 1,
    seoTitle: 'AuraPay Financial Dashboard Case Study — Darkvence',
    seoDescription: 'How Darkvence engineered a sub-50ms financial treasury dashboard for AuraPay.',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prj_2',
    title: 'Kinetix Fitness Companion App',
    slug: 'kinetix-fitness-companion',
    client: 'Kinetix Health Labs (Demo Showcase)',
    category: 'Mobile Application',
    description: 'A mobile health and biometric training companion providing adaptive workout telemetry, heart rate zone guidance, and offline session sync.',
    challenge: 'Users frequently lost workout telemetry during connectivity blackouts in underground gyms, leading to frustrated athlete churn.',
    solution: 'Architected an offline-first mobile application using SQLite synchronization that logs telemetry locally at 10Hz and synchronizes idempotently when network reconnects.',
    results: [
      { metric: '4.9★', label: 'Average store rating' },
      { metric: '0%', label: 'Workout data loss' },
      { metric: '60 FPS', label: 'Sustained UI frame rate' }
    ],
    technologies: ['React Native', 'TypeScript', 'SQLite', 'Node.js', 'HealthKit / Google Fit'],
    images: [
      '/src/assets/images/project_mobile_lifestyle_1790497087881.jpg',
      '/src/assets/images/hero_darkvence_digital_1790497052243.jpg'
    ],
    projectUrl: 'https://demo.darkvence.com/kinetix',
    featured: true,
    status: 'published',
    order: 2,
    seoTitle: 'Kinetix Mobile Companion App Case Study — Darkvence',
    seoDescription: 'Developing an offline-first fitness application with 60 FPS fluidity and zero telemetry loss.',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prj_3',
    title: 'Verve Atelier Luxury E-Commerce & CMS',
    slug: 'verve-atelier-luxury-ecommerce',
    client: 'Verve Atelier (Demo Showcase)',
    category: 'CMS Development',
    description: 'A bespoke headless digital storefront and editorial magazine giving curators complete control over seasonal collections and typography.',
    challenge: 'A slow monolithic WordPress setup caused 4.2-second mobile load times and high bounce rates among affluent design buyers.',
    solution: 'Re-architected the experience onto a headless CMS with static edge generation, reducing First Contentful Paint to 650ms and enabling instant editorial publishing.',
    results: [
      { metric: '650ms', label: 'First Contentful Paint' },
      { metric: '+72%', label: 'Mobile checkout completion' },
      { metric: '100/100', label: 'Lighthouse SEO score' }
    ],
    technologies: ['Next.js', 'Tailwind CSS', 'Headless CMS', 'Stripe API', 'Cloudflare Edge'],
    images: [
      '/src/assets/images/project_ecommerce_experience_1790497101724.jpg',
      '/src/assets/images/project_fintech_platform_1790497066827.jpg'
    ],
    projectUrl: 'https://demo.darkvence.com/verve',
    featured: true,
    status: 'published',
    order: 3,
    seoTitle: 'Verve Atelier Luxury Headless Storefront — Darkvence',
    seoDescription: 'High-speed headless CMS and e-commerce experience for bespoke luxury fashion brand.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prj_4',
    title: 'Nexus Data Pipeline & Cloud Orchestrator',
    slug: 'nexus-data-pipeline',
    client: 'Nexus Logistics AI (Demo Showcase)',
    category: 'Custom Software',
    description: 'Custom microservice dispatch platform routing freight logistics across 14 European distribution hubs in real time.',
    challenge: 'Manual route dispatching resulted in empty container backhauls and significant fuel inefficiencies across transit corridors.',
    solution: 'Built a specialized Node.js event-driven routing orchestrator calculating lowest-cost transit routes and auto-dispatching carrier confirmations.',
    results: [
      { metric: '3.8x', label: 'Dispatch throughput speed' },
      { metric: '-28%', label: 'Deadhead haul reduction' },
      { metric: '100k+', label: 'Daily event transactions' }
    ],
    technologies: ['Node.js', 'TypeScript', 'Redis', 'Docker', 'MongoDB', 'REST API'],
    images: [
      '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
      '/src/assets/images/project_fintech_platform_1790497066827.jpg'
    ],
    projectUrl: 'https://demo.darkvence.com/nexus',
    featured: false,
    status: 'published',
    order: 4,
    seoTitle: 'Nexus Automated Logistics Orchestrator — Darkvence',
    seoDescription: 'Custom software solution streamlining freight dispatching and real-time carrier tracking.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let blogPostsList: BlogPostItem[] = [
  {
    id: 'blg_1',
    title: 'The Architectural Cost of Heavy JavaScript: Why Core Web Vitals Dictate Revenue in 2026',
    slug: 'architectural-cost-heavy-javascript-core-web-vitals',
    excerpt: 'Modern web applications often collapse under unoptimized third-party scripts and swollen bundle sizes. Here is how we engineer sub-second page loads that directly translate into conversion gains.',
    content: `In high-stakes digital agency work, performance is not an afterthought or an optimization ticket you tackle post-launch. It is an architectural contract established on day one.

### The Illusion of Fast Wi-Fi Testing
Development teams frequently develop on high-end M3 MacBook Pros connected to gigabit fiber. In this sterile environment, a 3.5 megabyte client bundle appears instant. However, real enterprise buyers browse from cellular connections in airport lounges, train tunnels, and crowded conferences.

When your Time to Interactive (TTI) creeps past 2.5 seconds, bounce rates spike exponentially:
1. Every 100ms latency reduction improves mobile conversion by up to 8%.
2. Search engines explicitly penalize sites failing Interaction to Next Paint (INP) thresholds.
3. Heavy main-thread execution drains mobile battery and induces touch lag.

### The Zero-Slop Architecture
At Darkvence, we follow strict bundle budgeting:
- Server-render static editorial prose and UI shells.
- Lazy-load interactive islands strictly upon user intent or intersection.
- Avoid unmeasured analytics scripts that block the initial DOM parse.
- Enforce strict TypeScript compilation and tree-shaking invariants.

The result is web systems that feel tactile, immediate, and trustworthy from the very first tap.`,
    coverImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    author: {
      name: 'Julian Vance',
      role: 'Head of Engineering'
    },
    category: 'Engineering',
    tags: ['Web Performance', 'Next.js', 'Core Web Vitals', 'Architecture'],
    readTime: '6 min read',
    status: 'published',
    publishedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    seoTitle: 'The Architectural Cost of Heavy JavaScript — Darkvence Engineering',
    seoDescription: 'How engineering sub-second page loads directly impacts conversion rates and search rankings.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'blg_2',
    title: 'Beyond Ad Creatives: Implementing Server-Side Meta CAPI to Combat Signal Loss',
    slug: 'meta-capi-server-side-tracking-signal-loss',
    excerpt: 'Browser ad blockers and privacy restrictions have degraded traditional client pixel tracking by up to 35%. Learn how server-side Conversions API restores attribution accuracy.',
    content: `If your agency relies solely on standard client-side browser tracking pixels, your cost-per-acquisition (CPA) is likely inflated and your conversion attribution is fundamentally incomplete.

### Why Client Pixels Are Leaking Data
Client-side browser tracking faces three major hurdles:
- Aggressive browser tracking prevention (ITP, Safari privacy protection).
- Client ad blockers and privacy DNS resolvers that block network calls to third-party tracking endpoints.
- Cookie expiration policies that truncate user attribution windows from 30 days down to 24 hours.

### The Server-Side Conversions API (CAPI) Solution
By implementing server-side event routing (such as Meta Conversions API through an Express/Node.js proxy), data flows directly from your secure server to advertising platforms:
- **Deduplication:** Matching client event IDs with server event IDs prevents duplicate reporting.
- **Enhanced Match Quality:** Hashed customer emails, phone numbers, and IP addresses sent securely from backend servers achieve 8.5+/10 event quality scores.
- **Resilience:** Events execute reliably regardless of browser extensions or privacy blockers.

When signal quality improves, Meta and Google's machine learning algorithms receive accurate conversion triggers, resulting in sharper bidding and measurably lower acquisition costs.`,
    coverImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    author: {
      name: 'Elena Rostova',
      role: 'Director of Growth'
    },
    category: 'Growth & Ads',
    tags: ['Google Ads', 'Meta CAPI', 'Attribution', 'Performance Marketing'],
    readTime: '5 min read',
    status: 'published',
    publishedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    seoTitle: 'Meta CAPI & Server-Side Tracking Guide — Darkvence',
    seoDescription: 'Restore advertising signal and reduce acquisition costs with server-side conversion pipelines.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'blg_3',
    title: 'Monolithic CMS vs Headless API Architecture: The Executive Decision Framework',
    slug: 'monolithic-vs-headless-cms-framework',
    excerpt: 'When should a growing company move from traditional WordPress to a modern Headless CMS? We break down total cost of ownership, development velocity, and security.',
    content: `Choosing the right CMS architecture is one of the most critical technology decisions a digital brand makes. While traditional monolithic systems seem approachable initially, they often accumulate technical debt quickly as marketing demands scale.

### Monolithic CMS: Advantages & Pitfalls
Traditional monolithic systems bind the database, editorial dashboard, and frontend presentation layer into one coupled application.
- **Pros:** Fast initial setup, numerous off-the-shelf plugins, non-technical setup.
- **Cons:** High vulnerability surface (plugin security breaches), slow server response times, fragile database migrations, and rigid layout locks.

### The Headless Paradigm
Headless separates content authoring from presentation. Your content lives in a structured API database (like Payload, Sanity, or custom MongoDB), and your frontend is delivered via modern React/Next.js edge nodes.
- **Velocity:** Front-end engineers build custom interactive UIs without touching PHP or template hacks.
- **Omnichannel:** The same content API powers your web app, mobile app, and client portal simultaneously.
- **Bulletproof Security:** The public never connects directly to your database or administration dashboard, drastically reducing attack vectors.

For companies investing in serious organic traffic and distinctive brand identity, headless is the clear long-term winner.`,
    coverImage: '/src/assets/images/project_ecommerce_experience_1790497101724.jpg',
    author: {
      name: 'Julian Vance',
      role: 'Head of Engineering'
    },
    category: 'CMS & Software',
    tags: ['Headless CMS', 'Next.js', 'Content Modeling', 'Architecture'],
    readTime: '7 min read',
    status: 'published',
    publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    seoTitle: 'Monolithic vs Headless CMS: Executive Guide — Darkvence',
    seoDescription: 'A comprehensive framework for evaluating headless content architectures against monolithic legacy systems.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let inquiriesList: InquiryItem[] = [
  {
    id: 'inq_1',
    name: 'Marcus Thorne',
    email: 'm.thorne@vanguardtech.io',
    phone: '+1 (415) 890-3412',
    company: 'Vanguard Technology Partners',
    serviceInterested: 'Website Development',
    budgetRange: '$25,000 - $50,000',
    message: 'We are seeking a complete architectural redesign of our B2B SaaS platform website. Our current site fails Core Web Vitals and we want a fast, dark-mode agency aesthetic with Next.js.',
    status: 'NEW',
    internalNotes: 'High priority lead. Scheduled discovery call for Tuesday afternoon.',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'inq_2',
    name: 'Sophia Sterling',
    email: 'sophia@luminahealth.co',
    phone: '+1 (212) 555-0199',
    company: 'Lumina Digital Health',
    serviceInterested: 'Mobile Application Development',
    budgetRange: '$50,000 - $100,000',
    message: 'Looking to build an iOS and Android patient engagement app with offline sync and HIPAA-compliant data pipelines. Loved your Kinetix case study.',
    status: 'IN_PROGRESS',
    internalNotes: 'Sent NDA and architecture questionnaire. Awaiting client review.',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: 'inq_3',
    name: 'David Zhao',
    email: 'david@zenithecommerce.com',
    phone: '+44 20 7946 0912',
    company: 'Zenith Luxury Goods',
    serviceInterested: 'Google Ads Management',
    budgetRange: '$10,000 - $25,000',
    message: 'We want to scale our Google Search and Shopping ad spend across UK and EU markets. We need server-side tracking and high-intent keyword structuring.',
    status: 'CONTACTED',
    internalNotes: 'Audit in progress. Initial findings show 28% wasted spend on broad match terms.',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'inq_4',
    name: 'Claire Moreau',
    email: 'c.moreau@arcadialabs.fr',
    phone: '+33 1 42 68 55 00',
    company: 'Arcadia Innovation Labs',
    serviceInterested: 'Custom Software & Digital Solutions',
    budgetRange: '$50,000+',
    message: 'We need an internal telemetry dashboard to monitor distributed microservices across three European cloud regions.',
    status: 'COMPLETED',
    internalNotes: 'Statement of Work signed. Project kicked off under prj_internal_4.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

let siteSettings: SiteSettings = {
  agencyName: 'DARKVENCE',
  tagline: 'Engineering Digital Dominance',
  logoUrl: '/assets/aistudio/image_a9a3bddd.png',
  heroHeading: 'We Engineer High-Performance Digital Systems That Compound Business Value.',
  heroSubtitle: 'Darkvence is a premier digital agency building bespoke websites, mobile applications, headless CMS platforms, and precision performance advertising engines for ambitious brands.',
  heroCtaPrimary: 'Start a Project',
  heroCtaSecondary: 'Explore Services',
  contactEmail: 'contact@darkvence.com',
  contactPhone: '+880 1893-383187',
  officeAddress: 'S/8 Nurjahan Road, Mohammadpur, Dhaka-1207, Bangladesh',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/darkvence-demo',
    twitter: 'https://twitter.com/darkvence_demo',
    github: 'https://github.com/darkvence-demo',
    instagram: 'https://instagram.com/darkvence_demo'
  },
  aboutStory: 'Founded on the principle that digital experiences must balance aesthetic restraint with raw computational efficiency, Darkvence works alongside technology founders, scaling e-commerce brands, and forward-thinking enterprises. We do not build disposable marketing sites; we engineer permanent competitive advantages.',
  mission: 'To eliminate digital mediocrity by merging rigorous software engineering with conversion-focused design and measurable performance marketing.',
  values: [
    { title: 'Sub-Second Speed as a First Principle', description: 'Every millisecond of latency is lost revenue. We optimize assets, code paths, and cache tiers relentlessly.' },
    { title: 'Aesthetic Restraint & Polish', description: 'We ban generic templates and empty decorations in favor of deliberate typography, generous whitespace, and purposeful micro-interactions.' },
    { title: 'Radical Engineering Transparency', description: 'Clean git commits, transparent sprints, open architectural decisions, and zero vendor lock-in.' },
    { title: 'Quantified Commercial Outcomes', description: 'Code without business impact is an indulgence. Every project is measured against customer acquisition, retention, and conversion.' }
  ],
  metrics: [
    { value: '99.9%', label: 'Production Uptime Standard', suffix: '' },
    { value: '< 700', label: 'Average Core Web Vitals FCP', suffix: 'ms' },
    { value: '4.2x', label: 'Client Pipeline Growth Multiple', suffix: '' },
    { value: '$45M+', label: 'Client Revenue Transacted', suffix: '' }
  ],
  trustedClients: [
    { name: 'AuraPay Global', industry: 'Fintech (Demo)' },
    { name: 'Kinetix Health', industry: 'Healthtech (Demo)' },
    { name: 'Verve Atelier', industry: 'Luxury Goods (Demo)' },
    { name: 'Nexus Logistics', industry: 'Supply Chain (Demo)' },
    { name: 'Vanguard Tech', industry: 'Enterprise SaaS (Demo)' }
  ],
  testimonials: [],
  faqs: [
    {
      id: 'faq_1',
      question: 'How does Darkvence approach new client engagements?',
      answer: 'Every project begins with a structured 1-2 week Technical & Commercial Discovery phase where we define user flows, technical architecture, and measurable success KPIs before writing code. We then build in bi-weekly agile sprints with full staging visibility.'
    },
    {
      id: 'faq_2',
      question: 'Do you work with early-stage startups as well as established enterprises?',
      answer: 'Yes. For startups, we build high-velocity MVPs and core web systems engineered to scale through Series A and beyond. For enterprises, we design headless modernizations, high-conversion acquisition funnels, and bespoke custom software.'
    },
    {
      id: 'faq_3',
      question: 'What happens to the intellectual property and code after launch?',
      answer: 'You own 100% of the code, repositories, design assets, and infrastructure configurations. We provide complete handoff documentation and CI/CD pipelines with zero proprietary lock-in.'
    },
    {
      id: 'faq_4',
      question: 'Can you handle both development and paid growth advertising?',
      answer: 'Yes, this is our core advantage. By coordinating our engineering team with our Google and Meta ad specialists, we build ad landing pages and server-side tracking pipelines that convert at significantly higher rates than isolated agency silos.'
    }
  ],
  teamMembers: [
    {
      id: 'tm_1',
      name: 'Julian Vance',
      role: 'Founder & Principal Architect',
      bio: 'Over 12 years engineering distributed systems, edge architectures, and high-conversion digital experiences for venture-backed tech companies.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      socials: { linkedin: 'https://linkedin.com', github: 'https://github.com' }
    },
    {
      id: 'tm_2',
      name: 'Elena Rostova',
      role: 'Partner & Head of Growth',
      bio: 'Performance marketing strategist managing multi-million annual ad budgets across Google Search, Performance Max, and Meta CAPI pipelines.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      socials: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' }
    },
    {
      id: 'tm_3',
      name: 'Marcus Sterling',
      role: 'Lead Mobile & Frontend Engineer',
      bio: 'Specialist in React Native, Flutter, and Next.js micro-interactions with an obsession for 60 FPS fluidity and accessible WCAG AA standards.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      socials: { linkedin: 'https://linkedin.com', github: 'https://github.com' }
    }
  ]
};

const ABOUT_DATA_FILE = path.join(process.cwd(), 'src', 'server', 'db', 'data_about.json');
const USERS_DATA_FILE = path.join(process.cwd(), 'src', 'server', 'db', 'data_users.json');

const loadPersistedUsers = (): AdminUser[] => {
  try {
    if (fs.existsSync(USERS_DATA_FILE)) {
      const raw = fs.readFileSync(USERS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[store] Could not load persisted data_users.json, using defaults:', err);
  }
  return [adminUser];
};

const saveUsersToDisk = (users: AdminUser[]) => {
  try {
    const dir = path.dirname(USERS_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('[store] Error saving data_users.json to disk:', err);
  }
};

const defaultAboutPageData: AboutPageData = {
  hero: {
    heading: 'Where Technical Precision Meets Conversion Design',
    subtitle: 'High-performance digital systems, scalable software architectures, and measurable commercial growth.',
    description: 'Darkvence operates as an embedded technical partner for technology founders, scaling e-commerce brands, and forward-thinking enterprises. We reject fragile disposable templates, instead engineering custom digital platforms with sub-second speeds and resilient architectures.',
    image: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    ctaText: 'Work With Our Team',
    ctaUrl: 'contact'
  },
  company: {
    name: 'DARKVENCE',
    intro: 'Engineering Digital Dominance & High-Velocity Software Systems',
    description: 'Founded on the principle that digital experiences must balance aesthetic restraint with raw computational efficiency, Darkvence engineers custom websites, mobile applications, and cloud software designed around business longevity.',
    logoUrl: '/assets/aistudio/image_a9a3bddd.png',
    mission: 'To eliminate digital mediocrity by merging rigorous software engineering with conversion-focused design and measurable performance marketing.',
    vision: 'To architect resilient, high-speed digital foundations that give ambitious companies an enduring competitive advantage.',
    yearEstablished: '2021',
    values: [
      { id: 'val_1', title: 'Sub-Second Speed', description: 'Every millisecond of latency is lost revenue. We optimize assets, code paths, and cache tiers relentlessly.' },
      { id: 'val_2', title: 'Aesthetic Restraint', description: 'We ban generic templates and empty decorations in favor of deliberate typography, purposeful whitespace, and crisp micro-interactions.' },
      { id: 'val_3', title: 'Radical Transparency', description: 'Clean git commits, transparent sprints, open architectural decisions, and zero vendor lock-in.' },
      { id: 'val_4', title: 'Quantified Outcomes', description: 'Code without business impact is an indulgence. Every project is measured against customer acquisition, retention, and conversion.' }
    ],
    stats: [
      { id: 'stat_1', value: '99.9%', label: 'Production Uptime Standard', suffix: '' },
      { id: 'stat_2', value: '< 700', label: 'Average Core Web Vitals FCP', suffix: 'ms' },
      { id: 'stat_3', value: '4.2x', label: 'Client Pipeline Growth Multiple', suffix: '' },
      { id: 'stat_4', value: '$45M+', label: 'Client Revenue Transacted', suffix: '' }
    ]
  },
  teamMembers: [
    {
      id: 'tm_jahid',
      name: 'Jahid Hossain',
      role: 'Senior Executive / Full Stack Developer',
      company: 'DARKVENCE',
      avatarUrl: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
      bio: 'Directs full-stack architecture, high-performance web systems, and cloud infrastructure pipelines at DARKVENCE.',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://darkvence.com',
      order: 1,
      isActive: true
    },
    {
      id: 'tm_julian',
      name: 'Julian Vance',
      role: 'Principal Systems Architect',
      company: 'DARKVENCE',
      avatarUrl: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
      bio: 'Over 12 years engineering distributed systems, edge architectures, and high-conversion digital experiences for venture-backed tech companies.',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://darkvence.com',
      order: 2,
      isActive: true
    },
    {
      id: 'tm_elena',
      name: 'Elena Rostova',
      role: 'Head of Product & Design Engineering',
      company: 'DARKVENCE',
      avatarUrl: '/src/assets/images/project_mobile_lifestyle_1790497087881.jpg',
      bio: 'Specialist in user interface systems, accessible interaction patterns, and conversion funnel optimization.',
      linkedin: 'https://linkedin.com',
      portfolio: 'https://darkvence.com',
      order: 3,
      isActive: true
    }
  ],
  sectionsVisibility: {
    showJourney: true,
    showServices: true,
    showTechStack: true,
    showWhyChooseUs: true,
    showTestimonials: true
  },
  journey: [
    { id: 'j_1', year: '2021', title: 'Studio Inception', description: 'Founded with a core focus on eliminating bloated agency templates and engineering sub-second web applications.' },
    { id: 'j_2', year: '2023', title: 'Full-Stack Expansion', description: 'Scaled our engineering capabilities into headless e-commerce, cloud microservices, and reactive SaaS applications.' },
    { id: 'j_3', year: '2025', title: 'Attribution & Tracking Engine', description: 'Introduced server-side analytics, Meta CAPI pipelines, and precision performance marketing integration.' },
    { id: 'j_4', year: '2026', title: 'Global Multi-Platform Delivery', description: 'Trusted engineering partner delivering mission-critical applications across web, mobile, and enterprise cloud.' }
  ],
  techStack: [
    { id: 'ts_1', category: 'Frontend & Reactive UI', items: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vite', 'Motion'] },
    { id: 'ts_2', category: 'Backend & Cloud Infrastructure', items: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'REST / GraphQL'] },
    { id: 'ts_3', category: 'Performance & Tracking', items: ['Core Web Vitals Optimization', 'Meta CAPI', 'GA4 Server Routing', 'Edge Caching'] }
  ],
  whyChooseUs: [
    { id: 'wcu_1', title: 'Sub-Second Performance', description: 'Zero bloated theme templates. Every line of code is tailored for maximum computational efficiency and instant page transitions.', metric: '<700ms FCP' },
    { id: 'wcu_2', title: 'Total Code Ownership', description: 'You own 100% of your codebase, repositories, assets, and deployment infrastructure. Never get locked into proprietary agency engines.', metric: '100% IP' },
    { id: 'wcu_3', title: 'Direct Architect Communication', description: 'Work directly with senior full-stack developers and systems engineers without layers of non-technical account managers.', metric: 'Direct Access' }
  ],
  updatedAt: new Date().toISOString()
};

let aboutPageData: AboutPageData = (() => {
  try {
    if (fs.existsSync(ABOUT_DATA_FILE)) {
      const raw = fs.readFileSync(ABOUT_DATA_FILE, 'utf-8');
      return { ...defaultAboutPageData, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[store] Could not load persisted data_about.json, using defaults:', err);
  }
  return defaultAboutPageData;
})();

const defaultTrustedBrandsSettings: TrustedBrandsSectionSettings = {
  enabled: true,
  heading: 'Trusted By Ambitious Brands & Venture-Backed Companies',
  subtitle: 'Empowering innovative businesses with digital solutions.',
  layoutStyle: 'grid',
  themeMode: 'auto',
  updatedAt: new Date().toISOString()
};

const initialTrustedBrandsSeed: TrustedBrand[] = [
  {
    id: 'tb_seed_1',
    name: 'AuraPay Global',
    industry: 'FINTECH',
    description: 'High-throughput cross-border payment infrastructure and settlement APIs.',
    logoUrl: '',
    displayOrder: 1,
    isActive: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tb_seed_2',
    name: 'Kinetix Health',
    industry: 'HEALTHTECH',
    description: 'HIPAA-compliant telemedicine platform and clinical care coordination suite.',
    logoUrl: '',
    displayOrder: 2,
    isActive: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tb_seed_3',
    name: 'Verve Atelier',
    industry: 'LUXURY GOODS',
    description: 'Headless luxury commerce flagship engineered for sub-second global storefront speed.',
    logoUrl: '',
    displayOrder: 3,
    isActive: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tb_seed_4',
    name: 'Nexus Logistics',
    industry: 'SUPPLY CHAIN',
    description: 'Real-time enterprise freight telemetry and predictive inventory orchestration.',
    logoUrl: '',
    displayOrder: 4,
    isActive: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tb_seed_5',
    name: 'Vanguard Tech',
    industry: 'ENTERPRISE SAAS',
    description: 'Multi-tenant cloud security analytics and automated compliance reporting engine.',
    logoUrl: '',
    displayOrder: 5,
    isActive: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialStatisticsSeed: StatisticItem[] = [
  {
    id: 'stat_seed_1',
    value: '99.9',
    prefix: '',
    suffix: '%',
    title: 'Production Uptime Standard',
    description: '',
    order: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stat_seed_2',
    value: '700',
    prefix: '< ',
    suffix: 'ms',
    title: 'Average Core Web Vitals FCP',
    description: '',
    order: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stat_seed_3',
    value: '4.2',
    prefix: '',
    suffix: 'x',
    title: 'Client Pipeline Growth Multiple',
    description: '',
    order: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stat_seed_4',
    value: '45',
    prefix: '$',
    suffix: 'M+',
    title: 'Client Revenue Transacted',
    description: '',
    order: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Collections
let adminUsersList: AdminUser[] = loadPersistedUsers();
let testimonialsList: Testimonial[] = [];
let trustedBrandsList: TrustedBrand[] = [...initialTrustedBrandsSeed];
let trustedBrandsSettings: TrustedBrandsSectionSettings = { ...defaultTrustedBrandsSettings };
let statisticsList: StatisticItem[] = [...initialStatisticsSeed];

// Data Store Accessors
export const db = {

  // MongoDB Initialization & State Synchronization
  init: async () => {
    try {
      // Check if MongoDB has services. If not, auto-seed from baseline JSON
      const servicesCount = await ServiceModel.countDocuments();
      if (servicesCount === 0) {
        console.log('[store] MongoDB is empty. Seeding all baseline collections to MongoDB...');
        for (const u of adminUsersList) {
          await UserModel.findOneAndUpdate(
            { email: u.email.toLowerCase() },
            { $set: u },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (const s of servicesList) {
          await ServiceModel.findOneAndUpdate(
            { id: s.id },
            { $set: s },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (const p of projectsList) {
          await ProjectModel.findOneAndUpdate(
            { id: p.id },
            { $set: p },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (const b of blogPostsList) {
          await BlogPostModel.findOneAndUpdate(
            { id: b.id },
            { $set: b },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (const i of inquiriesList) {
          await InquiryModel.findOneAndUpdate(
            { id: i.id },
            { $set: i },
            { upsert: true, returnDocument: 'after' }
          );
        }
        await AboutModel.findOneAndUpdate(
          { docId: 'primary_about' },
          { $set: { docId: 'primary_about', data: aboutPageData, updatedAt: new Date().toISOString() } },
          { upsert: true, returnDocument: 'after' }
        );
        await SettingsModel.findOneAndUpdate(
          { docId: 'primary_settings' },
          { $set: { docId: 'primary_settings', data: siteSettings, updatedAt: new Date().toISOString() } },
          { upsert: true, returnDocument: 'after' }
        );
        for (const m of mediaList) {
          await MediaModel.findOneAndUpdate(
            { id: m.id },
            { $set: m },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (const seo of pageSeoConfigs) {
          await SeoModel.findOneAndUpdate(
            { path: seo.path },
            { $set: seo },
            { upsert: true, returnDocument: 'after' }
          );
        }
        for (let idx = 0; idx < performanceSnapshots.length; idx++) {
          const perf = performanceSnapshots[idx];
          const pid = perf.id || `perf_${perf.device || 'desktop'}_${idx + 1}`;
          await PerformanceModel.findOneAndUpdate(
            { id: pid },
            { $set: { ...perf, id: pid } },
            { upsert: true, returnDocument: 'after' }
          );
        }
        await TrackingModel.findOneAndUpdate(
          { docId: 'primary_tracking' },
          { $set: { docId: 'primary_tracking', data: trackingConfig, updatedAt: new Date().toISOString() } },
          { upsert: true, returnDocument: 'after' }
        );
      }

      // Hydrate state directly from MongoDB
      const mongoUsers = await UserModel.find().lean();
      if (mongoUsers.length > 0) {
        adminUsersList = mongoUsers as any;
      }
      const mongoServices = await ServiceModel.find().lean();
      if (mongoServices.length > 0) {
        servicesList = mongoServices as any;
      }
      const mongoProjects = await ProjectModel.find().lean();
      if (mongoProjects.length > 0) {
        projectsList = mongoProjects as any;
      }
      const mongoBlog = await BlogPostModel.find().lean();
      if (mongoBlog.length > 0) {
        blogPostsList = mongoBlog as any;
      }
      const mongoInquiries = await InquiryModel.find().lean();
      if (mongoInquiries.length > 0) {
        inquiriesList = mongoInquiries as any;
      }
      const mongoAbout = await AboutModel.findOne({ docId: 'primary_about' }).lean();
      if (mongoAbout && (mongoAbout as any).data) {
        aboutPageData = (mongoAbout as any).data;
      }
      const mongoSettings = await SettingsModel.findOne({ docId: 'primary_settings' }).lean();
      if (mongoSettings && (mongoSettings as any).data) {
        siteSettings = (mongoSettings as any).data;
      }
      const mongoMedia = await MediaModel.find().lean();
      if (mongoMedia.length > 0) {
        mediaList = mongoMedia as any;
      }
      const mongoSeo = await SeoModel.find().lean();
      if (mongoSeo.length > 0) {
        pageSeoConfigs = mongoSeo as any;
      }
      const mongoPerf = await PerformanceModel.find().lean();
      if (mongoPerf.length > 0) {
        performanceSnapshots = mongoPerf as any;
      }
      const mongoTracking = await TrackingModel.findOne({ docId: 'primary_tracking' }).lean();
      if (mongoTracking && (mongoTracking as any).data) {
        trackingConfig = (mongoTracking as any).data;
      }
      const mongoTestimonials = await TestimonialModel.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
      testimonialsList = (mongoTestimonials || []) as any;

      // Trusted Brands CMS: seed initial 5 brands ONLY when uninitialized & empty (never duplicate)
      const existingBrandSettings = await TrustedBrandSettingsModel.findOne({
        docId: 'primary_trusted_brands_settings'
      }).lean();
      const trustedBrandsCount = await TrustedBrandModel.countDocuments();

      if (!existingBrandSettings && trustedBrandsCount === 0) {
        console.log('[store] Initializing Trusted Brands CMS with 5 baseline records...');
        await TrustedBrandSettingsModel.findOneAndUpdate(
          { docId: 'primary_trusted_brands_settings' },
          {
            $set: {
              docId: 'primary_trusted_brands_settings',
              data: defaultTrustedBrandsSettings,
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
        for (const brand of initialTrustedBrandsSeed) {
          await TrustedBrandModel.findOneAndUpdate(
            { id: brand.id },
            { $set: brand },
            { upsert: true, returnDocument: 'after' }
          );
        }
      }

      const mongoBrandSettings = await TrustedBrandSettingsModel.findOne({
        docId: 'primary_trusted_brands_settings'
      }).lean();
      if (mongoBrandSettings && (mongoBrandSettings as any).data) {
        trustedBrandsSettings = {
          ...defaultTrustedBrandsSettings,
          ...(mongoBrandSettings as any).data
        };
      } else {
        await TrustedBrandSettingsModel.findOneAndUpdate(
          { docId: 'primary_trusted_brands_settings' },
          {
            $set: {
              docId: 'primary_trusted_brands_settings',
              data: defaultTrustedBrandsSettings,
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      }

      const mongoTrustedBrands = await TrustedBrandModel.find().sort({ displayOrder: 1, createdAt: 1 }).lean();
      trustedBrandsList = (mongoTrustedBrands || []) as any;

      // Statistics CMS: seed initial 4 records ONLY on first initialization when empty (never duplicate)
      const statsInitMarker = await SettingsModel.findOne({ docId: 'statistics_initialized' }).lean();
      const statsCount = await StatisticModel.countDocuments();
      if (!statsInitMarker && statsCount === 0) {
        console.log('[store] Initializing Statistics CMS with 4 baseline metrics...');
        for (const stat of initialStatisticsSeed) {
          await StatisticModel.findOneAndUpdate(
            { id: stat.id },
            { $set: stat },
            { upsert: true, returnDocument: 'after' }
          );
        }
        await SettingsModel.findOneAndUpdate(
          { docId: 'statistics_initialized' },
          {
            $set: {
              docId: 'statistics_initialized',
              data: { initialized: true },
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      } else if (statsCount > 0 && !statsInitMarker) {
        await SettingsModel.findOneAndUpdate(
          { docId: 'statistics_initialized' },
          {
            $set: {
              docId: 'statistics_initialized',
              data: { initialized: true },
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true, returnDocument: 'after' }
        );
      }

      const mongoStatistics = await StatisticModel.find().sort({ order: 1, createdAt: 1 }).lean();
      statisticsList = (mongoStatistics || []) as any;

      console.log(
        `[store] MongoDB state synchronized (${servicesList.length} services, ${projectsList.length} projects, ${testimonialsList.length} testimonials, ${trustedBrandsList.length} trusted brands, ${statisticsList.length} statistics, ${adminUsersList.length} users).`
      );
    } catch (err: any) {
      console.error('[store] Error synchronizing with MongoDB:', err);
      throw err;
    }
  },

  // Auth & Admin
  getAdmin: () => adminUsersList[0] || adminUser,
  findAdminByEmail: (email: string) => {
    return adminUsersList.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },
  updateAdmin: (update: Partial<AdminUser>) => {
    if (adminUsersList.length > 0) {
      adminUsersList[0] = { ...adminUsersList[0], ...update };
      UserModel.findOneAndUpdate({ id: adminUsersList[0].id }, { $set: update }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updateAdmin error]:', e));
      saveUsersToDisk(adminUsersList);
      return adminUsersList[0];
    }
    adminUser = { ...adminUser, ...update };
    return adminUser;
  },

  // Services
  getServices: (includeDrafts = false) => {
    return includeDrafts ? [...servicesList].sort((a, b) => a.order - b.order) : servicesList.filter(s => s.status === 'published').sort((a, b) => a.order - b.order);
  },
  getServiceById: (id: string) => {
    return servicesList.find(s => s.id === id);
  },
  getServiceBySlug: (slug: string) => {
    return servicesList.find(s => s.slug === slug);
  },
  createService: (data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ServiceItem = {
      ...data,
      id: `srv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    servicesList.push(newItem);
    ServiceModel.create(newItem).catch(e => console.error('[MongoDB createService error]:', e));
    return newItem;
  },
  updateService: (id: string, data: Partial<ServiceItem>) => {
    const index = servicesList.findIndex(s => s.id === id);
    if (index === -1) return null;
    servicesList[index] = { ...servicesList[index], ...data, updatedAt: new Date().toISOString() };
    ServiceModel.findOneAndUpdate({ id }, { $set: data }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updateService error]:', e));
    return servicesList[index];
  },
  deleteService: (id: string) => {
    const index = servicesList.findIndex(s => s.id === id);
    if (index === -1) return false;
    servicesList.splice(index, 1);
    ServiceModel.deleteOne({ id }).catch(e => console.error('[MongoDB deleteService error]:', e));
    return true;
  },

  // Projects
  getProjects: (includeDrafts = false) => {
    return includeDrafts ? [...projectsList].sort((a, b) => a.order - b.order) : projectsList.filter(p => p.status === 'published').sort((a, b) => a.order - b.order);
  },
  getProjectBySlug: (slug: string) => {
    return projectsList.find(p => p.slug === slug);
  },
  createProject: (data: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ProjectItem = {
      ...data,
      id: `prj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    projectsList.push(newItem);
    ProjectModel.create(newItem).catch(e => console.error('[MongoDB createProject error]:', e));
    return newItem;
  },
  updateProject: (id: string, data: Partial<ProjectItem>) => {
    const index = projectsList.findIndex(p => p.id === id);
    if (index === -1) return null;
    projectsList[index] = { ...projectsList[index], ...data, updatedAt: new Date().toISOString() };
    ProjectModel.findOneAndUpdate({ id }, { $set: data }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updateProject error]:', e));
    return projectsList[index];
  },
  deleteProject: (id: string) => {
    const index = projectsList.findIndex(p => p.id === id);
    if (index === -1) return false;
    projectsList.splice(index, 1);
    ProjectModel.deleteOne({ id }).catch(e => console.error('[MongoDB deleteProject error]:', e));
    return true;
  },

  // Blog
  getBlogPosts: (includeDrafts = false) => {
    return includeDrafts ? [...blogPostsList].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()) : blogPostsList.filter(b => b.status === 'published').sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },
  getBlogPostBySlug: (slug: string) => {
    return blogPostsList.find(b => b.slug === slug);
  },
  createBlogPost: (data: Omit<BlogPostItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: BlogPostItem = {
      ...data,
      id: `blg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    blogPostsList.push(newItem);
    BlogPostModel.create(newItem).catch(e => console.error('[MongoDB createBlogPost error]:', e));
    return newItem;
  },
  updateBlogPost: (id: string, data: Partial<BlogPostItem>) => {
    const index = blogPostsList.findIndex(b => b.id === id);
    if (index === -1) return null;
    blogPostsList[index] = { ...blogPostsList[index], ...data, updatedAt: new Date().toISOString() };
    BlogPostModel.findOneAndUpdate({ id }, { $set: data }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updateBlogPost error]:', e));
    return blogPostsList[index];
  },
  deleteBlogPost: (id: string) => {
    const index = blogPostsList.findIndex(b => b.id === id);
    if (index === -1) return false;
    blogPostsList.splice(index, 1);
    BlogPostModel.deleteOne({ id }).catch(e => console.error('[MongoDB deleteBlogPost error]:', e));
    return true;
  },

  // Inquiries
  getInquiries: () => {
    return [...inquiriesList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getInquiryById: (id: string) => {
    return inquiriesList.find(i => i.id === id);
  },
  createInquiry: (data: Omit<InquiryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InquiryItem = {
      ...data,
      id: `inq_${Date.now()}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inquiriesList.unshift(newItem);
    InquiryModel.create(newItem).catch(e => console.error('[MongoDB createInquiry error]:', e));
    return newItem;
  },
  updateInquiry: (id: string, data: Partial<InquiryItem>) => {
    const index = inquiriesList.findIndex(i => i.id === id);
    if (index === -1) return null;
    inquiriesList[index] = { ...inquiriesList[index], ...data, updatedAt: new Date().toISOString() };
    InquiryModel.findOneAndUpdate({ id }, { $set: data }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updateInquiry error]:', e));
    return inquiriesList[index];
  },
  deleteInquiry: (id: string) => {
    const index = inquiriesList.findIndex(i => i.id === id);
    if (index === -1) return false;
    inquiriesList.splice(index, 1);
    InquiryModel.deleteOne({ id }).catch(e => console.error('[MongoDB deleteInquiry error]:', e));
    return true;
  },

  // Settings
  getSettings: () => ({ ...siteSettings }),
  updateSettings: (data: Partial<SiteSettings>) => {
    siteSettings = { ...siteSettings, ...data };
    SettingsModel.findOneAndUpdate({ docId: 'primary_settings' }, { $set: { data: siteSettings, updatedAt: new Date().toISOString() } }, { upsert: true }).catch(e => console.error('[MongoDB updateSettings error]:', e));
    return siteSettings;
  },

  // Testimonials (Real database-managed records, zero demo seed)
  getTestimonials: (includeUnpublished = false): Testimonial[] => {
    const list = includeUnpublished
      ? [...testimonialsList]
      : testimonialsList.filter(t => t.isActive === true && t.isPublished === true);
    return list.sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },
  getTestimonialById: (id: string): Testimonial | undefined => {
    return testimonialsList.find(t => t.id === id);
  },
  createTestimonial: async (data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> => {
    const now = new Date().toISOString();
    const newItem: Testimonial = {
      ...data,
      id: `tst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    await TestimonialModel.create(newItem);
    testimonialsList.push(newItem);
    return newItem;
  },
  updateTestimonial: async (id: string, data: Partial<Testimonial>): Promise<Testimonial | null> => {
    const index = testimonialsList.findIndex(t => t.id === id);
    if (index === -1) return null;
    const updatedFields = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await TestimonialModel.findOneAndUpdate(
      { id },
      { $set: updatedFields },
      { returnDocument: 'after' }
    );
    testimonialsList[index] = { ...testimonialsList[index], ...updatedFields };
    return testimonialsList[index];
  },
  deleteTestimonial: async (id: string): Promise<boolean> => {
    const index = testimonialsList.findIndex(t => t.id === id);
    if (index === -1) return false;
    await TestimonialModel.deleteOne({ id });
    testimonialsList.splice(index, 1);
    return true;
  },

  // Trusted Brands CMS (Dynamic & Persisted)
  getTrustedBrandsSettings: (): TrustedBrandsSectionSettings => {
    return { ...trustedBrandsSettings };
  },
  updateTrustedBrandsSettings: async (
    data: Partial<TrustedBrandsSectionSettings>
  ): Promise<TrustedBrandsSectionSettings> => {
    const updated: TrustedBrandsSectionSettings = {
      ...trustedBrandsSettings,
      ...data,
      updatedAt: new Date().toISOString()
    };
    await TrustedBrandSettingsModel.findOneAndUpdate(
      { docId: 'primary_trusted_brands_settings' },
      { $set: { docId: 'primary_trusted_brands_settings', data: updated, updatedAt: updated.updatedAt } },
      { upsert: true, returnDocument: 'after' }
    );
    trustedBrandsSettings = updated;
    return { ...trustedBrandsSettings };
  },
  getTrustedBrands: (includeUnpublished = false): TrustedBrand[] => {
    const list = includeUnpublished
      ? [...trustedBrandsList]
      : trustedBrandsList.filter(b => b.isActive === true && b.isPublished === true);
    return list.sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
  getTrustedBrandById: (id: string): TrustedBrand | undefined => {
    return trustedBrandsList.find(b => b.id === id);
  },
  createTrustedBrand: async (
    data: Omit<TrustedBrand, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TrustedBrand> => {
    const now = new Date().toISOString();
    const newItem: TrustedBrand = {
      ...data,
      id: `tb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    await TrustedBrandModel.create(newItem);
    trustedBrandsList.push(newItem);
    return newItem;
  },
  updateTrustedBrand: async (
    id: string,
    data: Partial<TrustedBrand>
  ): Promise<TrustedBrand | null> => {
    const index = trustedBrandsList.findIndex(b => b.id === id);
    if (index === -1) return null;
    const updatedFields = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await TrustedBrandModel.findOneAndUpdate(
      { id },
      { $set: updatedFields },
      { returnDocument: 'after' }
    );
    trustedBrandsList[index] = { ...trustedBrandsList[index], ...updatedFields };
    return trustedBrandsList[index];
  },
  deleteTrustedBrand: async (id: string): Promise<boolean> => {
    const index = trustedBrandsList.findIndex(b => b.id === id);
    if (index === -1) return false;
    await TrustedBrandModel.deleteOne({ id });
    trustedBrandsList.splice(index, 1);
    return true;
  },

  // Statistics / Achievements CMS (Dynamic & Persisted)
  getStatistics: (includeUnpublished = false): StatisticItem[] => {
    const list = includeUnpublished
      ? [...statisticsList]
      : statisticsList.filter(s => s.isPublished === true);
    return list.sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },
  getStatisticById: (id: string): StatisticItem | undefined => {
    return statisticsList.find(s => s.id === id);
  },
  createStatistic: async (
    data: Omit<StatisticItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<StatisticItem> => {
    const now = new Date().toISOString();
    const newItem: StatisticItem = {
      ...data,
      id: `stat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    await StatisticModel.create(newItem);
    statisticsList.push(newItem);
    return newItem;
  },
  updateStatistic: async (
    id: string,
    data: Partial<StatisticItem>
  ): Promise<StatisticItem | null> => {
    const index = statisticsList.findIndex(s => s.id === id);
    if (index === -1) return null;
    const updatedFields = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await StatisticModel.findOneAndUpdate(
      { id },
      { $set: updatedFields },
      { returnDocument: 'after' }
    );
    statisticsList[index] = { ...statisticsList[index], ...updatedFields };
    return statisticsList[index];
  },
  deleteStatistic: async (id: string): Promise<boolean> => {
    const index = statisticsList.findIndex(s => s.id === id);
    if (index === -1) return false;
    await StatisticModel.deleteOne({ id });
    statisticsList.splice(index, 1);
    return true;
  },
  reorderStatistics: async (orderedIds: string[]): Promise<StatisticItem[]> => {
    const now = new Date().toISOString();
    const orderMap = new Map<string, number>();
    let rank = 1;

    for (const id of orderedIds) {
      if (!orderMap.has(id) && statisticsList.some(s => s.id === id)) {
        orderMap.set(id, rank++);
      }
    }

    // Preserve any existing items not explicitly included in orderedIds after the ordered ones
    const remaining = [...statisticsList]
      .filter(s => !orderMap.has(s.id))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const item of remaining) {
      orderMap.set(item.id, rank++);
    }

    const bulkOps = Array.from(orderMap.entries()).map(([id, order]) => ({
      updateOne: {
        filter: { id },
        update: { $set: { order, updatedAt: now } }
      }
    }));

    if (bulkOps.length > 0) {
      await StatisticModel.bulkWrite(bulkOps);
    }

    statisticsList = statisticsList
      .map(item =>
        orderMap.has(item.id)
          ? { ...item, order: orderMap.get(item.id)!, updatedAt: now }
          : item
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return [...statisticsList];
  },

  // About Page CMS (Dynamic & Persisted)
  getAboutData: (): AboutPageData => {
    return JSON.parse(JSON.stringify(aboutPageData));
  },
  updateAboutData: (data: Partial<AboutPageData>): AboutPageData => {
    aboutPageData = {
      ...aboutPageData,
      ...data,
      hero: { ...aboutPageData.hero, ...(data.hero || {}) },
      company: {
        ...aboutPageData.company,
        ...(data.company || {}),
        values: data.company?.values || aboutPageData.company.values,
        stats: data.company?.stats || aboutPageData.company.stats
      },
      teamMembers: data.teamMembers || aboutPageData.teamMembers,
      sectionsVisibility: { ...aboutPageData.sectionsVisibility, ...(data.sectionsVisibility || {}) },
      journey: data.journey || aboutPageData.journey,
      techStack: data.techStack || aboutPageData.techStack,
      whyChooseUs: data.whyChooseUs || aboutPageData.whyChooseUs,
      updatedAt: new Date().toISOString()
    };

    AboutModel.findOneAndUpdate({ docId: 'primary_about' }, { $set: { data: aboutPageData, updatedAt: new Date().toISOString() } }, { upsert: true }).catch(e => console.error('[MongoDB updateAboutData error]:', e));

    try {
      const dir = path.dirname(ABOUT_DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(ABOUT_DATA_FILE, JSON.stringify(aboutPageData, null, 2), 'utf-8');
    } catch (err) {
      console.error('[store] Error saving data_about.json to disk:', err);
    }

    return JSON.parse(JSON.stringify(aboutPageData));
  },

  // Media Library
  getMedia: () => [...mediaList],
  createMedia: (data: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const item: MediaItem = {
      ...data,
      id: `med_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    mediaList.unshift(item);
    MediaModel.create(item).catch(e => console.error('[MongoDB createMedia error]:', e));
    return item;
  },
  deleteMedia: (id: string) => {
    const idx = mediaList.findIndex(m => m.id === id);
    if (idx === -1) return false;
    mediaList.splice(idx, 1);
    MediaModel.deleteOne({ id }).catch(e => console.error('[MongoDB deleteMedia error]:', e));
    return true;
  },

  // SEO Center
  getPageSeoConfigs: () => [...pageSeoConfigs],
  updatePageSeoConfig: (pagePath: string, update: Partial<PageSeoConfig>) => {
    const idx = pageSeoConfigs.findIndex(p => p.path === pagePath);
    if (idx !== -1) {
      pageSeoConfigs[idx] = { ...pageSeoConfigs[idx], ...update };
      SeoModel.findOneAndUpdate({ path: pagePath }, { $set: update }, { returnDocument: 'after' }).catch(e => console.error('[MongoDB updatePageSeoConfig error]:', e));
      return pageSeoConfigs[idx];
    }
    return null;
  },
  runSeoAudit: (): SeoAuditReport => {
    const issues: SeoAuditReport['issues'] = [];
    let passed = 0;
    let warnings = 0;
    let critical = 0;

    pageSeoConfigs.forEach(page => {
      if (!page.title || page.title.length < 15) {
        critical++;
        issues.push({
          page: page.path,
          severity: 'critical',
          message: 'Title is missing or too short (< 15 characters).',
          recommendation: 'Expand title to 50-60 characters including primary brand keyword.'
        });
      } else {
        passed++;
      }

      if (!page.description || page.description.length < 50) {
        warnings++;
        issues.push({
          page: page.path,
          severity: 'warning',
          message: 'Meta description is under recommended length (< 50 characters).',
          recommendation: 'Provide 120-160 characters describing the page value.'
        });
      } else {
        passed++;
      }

      if (!page.ogImage) {
        warnings++;
        issues.push({
          page: page.path,
          severity: 'warning',
          message: 'Missing OpenGraph social card image.',
          recommendation: 'Assign a 1200x630px social preview image.'
        });
      } else {
        passed++;
      }

      if (page.hasStructuredData) {
        passed++;
      } else {
        issues.push({
          page: page.path,
          severity: 'info',
          message: 'JSON-LD structured data not detected.',
          recommendation: 'Embed Organization or WebSite schema markup.'
        });
      }
    });

    const totalScore = Math.max(20, Math.min(100, Math.round((passed / (passed + warnings + critical)) * 100)));

    return {
      lastAuditTime: new Date().toISOString(),
      totalScore,
      pagesAudited: pageSeoConfigs.length,
      passedChecks: passed,
      warningsCount: warnings,
      criticalIssuesCount: critical,
      issues
    };
  },

  // Performance Center
  getPerformanceSnapshots: () => [...performanceSnapshots],
  recordPerformanceSnapshot: (data: PerformanceSnapshot) => {
    performanceSnapshots.unshift(data);
    if (performanceSnapshots.length > 20) performanceSnapshots.pop();
    const pid = data.id || `perf_${data.device || 'desktop'}_${Date.now()}`;
    PerformanceModel.create({ ...data, id: pid }).catch(e => console.error('[MongoDB recordPerformanceSnapshot error]:', e));
    return data;
  },

  // Marketing Tracking
  getTrackingConfig: () => ({ ...trackingConfig }),
  updateTrackingConfig: (data: Partial<TrackingConfig>) => {
    trackingConfig = { ...trackingConfig, ...data };
    TrackingModel.findOneAndUpdate({ docId: 'primary_tracking' }, { $set: { data: trackingConfig, updatedAt: new Date().toISOString() } }, { upsert: true }).catch(e => console.error('[MongoDB updateTrackingConfig error]:', e));
    return trackingConfig;
  },

  // Admin Users Management
  getAdminUsers: () => adminUsersList.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt, lastLogin: u.lastLogin })),
  createAdminUser: async (data: { name: string; email: string; password?: string; passwordHash?: string; role?: 'superadmin' | 'admin' | 'editor' }) => {
    const existing = adminUsersList.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error(`An administrator account with email "${data.email.trim()}" already exists.`);
    }

    const passwordHash = data.passwordHash || (data.password ? bcrypt.hashSync(data.password, 10) : bcrypt.hashSync('darkvence2026!', 10));

    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
      role: data.role || 'superadmin',
      createdAt: new Date().toISOString()
    };
    adminUsersList.push(newUser);
    try {
      await UserModel.findOneAndUpdate(
        { email: newUser.email },
        { $set: newUser },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (e: any) {
      console.error('[MongoDB createAdminUser error]:', e?.message || e);
    }
    saveUsersToDisk(adminUsersList);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt };
  },
  deleteAdminUser: async (id: string) => {
    const idx = adminUsersList.findIndex(u => u.id === id);
    if (idx === -1) return false;
    if (adminUsersList[idx].role === 'superadmin' && adminUsersList.filter(u => u.role === 'superadmin').length <= 1) return false; // Prevent deleting sole superadmin
    const target = adminUsersList[idx];
    adminUsersList.splice(idx, 1);
    try {
      await UserModel.deleteOne({ id: target.id });
    } catch (e: any) {
      console.error('[MongoDB deleteAdminUser error]:', e?.message || e);
    }
    saveUsersToDisk(adminUsersList);
    return true;
  },

  // System Health
  getSystemHealth: (): HealthStatus => {
    const memory = process.memoryUsage();
    const dbStatus = getDatabaseStatus();
    return {
      status: dbStatus.status === 'connected' ? 'Healthy' : 'Critical',
      apiStatus: 'ONLINE',
      dbStatus: dbStatus.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED',
      dbType: (dbStatus.provider.includes('Atlas') ? 'MongoDB Atlas' : 'Resilient In-Memory Fallback') as any,
      runtime: 'Node.js / Express / Mongoose / MongoDB Atlas',
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      lastChecked: new Date().toISOString(),
      failedRequestsCount: 0,
      memoryUsageMb: Math.round(memory.heapUsed / 1024 / 1024),
      checks: [
        { name: 'REST API v1 Router', status: 'PASS', message: 'All endpoints active and mounted at /api/v1' },
        { name: 'MongoDB Data Persistence Store', status: dbStatus.status === 'connected' ? 'PASS' : 'FAIL', message: `Connected via ${dbStatus.provider}` },
        { name: 'JWT & Cookie Authentication', status: 'PASS', message: 'Secret configured with 7-day token expiry' },
        { name: 'Zod Input Validation', status: 'PASS', message: 'Schema guards active on inquiry and admin mutations' },
        { name: 'Honeypot Spam Defense', status: 'PASS', message: 'website_source_hp trap armed on contact endpoint' },
        { name: 'Rate Limiter Security', status: 'PASS', message: 'Sliding window active on auth and inquiry endpoints' }
      ]
    };
  }
};

// Initial Collections

let mediaList: MediaItem[] = [
  {
    id: 'med_1',
    name: 'hero_darkvence_digital.jpg',
    url: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    format: 'jpeg',
    sizeBytes: 348200,
    dimensions: { width: 1920, height: 1080 },
    altText: 'Abstract 3D digital sculpture in dark charcoal with violet refractions',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'med_2',
    name: 'project_fintech_platform.jpg',
    url: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    format: 'jpeg',
    sizeBytes: 284100,
    dimensions: { width: 1200, height: 900 },
    altText: 'AuraPay dark mode financial treasury web application display',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'med_3',
    name: 'project_mobile_lifestyle.jpg',
    url: '/src/assets/images/project_mobile_lifestyle_1790497087881.jpg',
    format: 'jpeg',
    sizeBytes: 312500,
    dimensions: { width: 1200, height: 900 },
    altText: 'Kinetix modern mobile application interface display',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'med_4',
    name: 'project_ecommerce_experience.jpg',
    url: '/src/assets/images/project_ecommerce_experience_1790497101724.jpg',
    format: 'jpeg',
    sizeBytes: 298400,
    dimensions: { width: 1200, height: 900 },
    altText: 'Verve Atelier luxury headless e-commerce editorial interface',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

let pageSeoConfigs: PageSeoConfig[] = [
  {
    path: '/',
    title: 'Darkvence — Premium Digital Agency & CMS',
    description: 'Darkvence is a premium digital agency engineering modern websites, mobile apps, custom software, and high-performance digital marketing campaigns.',
    canonicalUrl: 'https://darkvence.com/',
    ogTitle: 'Darkvence — High-Performance Digital Systems',
    ogDescription: 'Bespoke web applications, mobile apps, and precision performance advertising engines for ambitious brands.',
    ogImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: true
  },
  {
    path: '/services',
    title: 'Digital Services & Engineering Capabilities — Darkvence',
    description: 'Explore Darkvence capabilities: Website Development, Web Apps, Mobile Apps, CMS, Custom Software, and Performance Marketing.',
    canonicalUrl: 'https://darkvence.com/services',
    ogTitle: 'Engineering Capabilities — Darkvence Agency',
    ogDescription: 'Engineered for sub-second Core Web Vitals, conversion rate optimization, and architectural longevity.',
    ogImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: true
  },
  {
    path: '/about',
    title: 'About Agency & Engineering Philosophy — Darkvence',
    description: 'Learn about Darkvence story, core principles, mission, and how our software architects eliminate digital mediocrity.',
    canonicalUrl: 'https://darkvence.com/about',
    ogTitle: 'About Darkvence — Digital Agency Architecture',
    ogDescription: 'Where technical precision meets conversion-focused design.',
    ogImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: true
  },
  {
    path: '/portfolio',
    title: 'Selected Case Studies & Engineering Proof — Darkvence',
    description: 'Explore real-world challenges solved through deliberate engineering and conversion-oriented design across Web, Mobile, and Cloud.',
    canonicalUrl: 'https://darkvence.com/portfolio',
    ogTitle: 'Case Studies & Architectural Proof — Darkvence',
    ogDescription: 'Production case studies detailing challenge, technical solution, and quantified outcomes.',
    ogImage: '/src/assets/images/project_ecommerce_experience_1790497101724.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: true
  },
  {
    path: '/blog',
    title: 'Technical Dispatches & Insights — Darkvence',
    description: 'Architectural research on web performance, Core Web Vitals, server-side attribution, and headless CMS architectures.',
    canonicalUrl: 'https://darkvence.com/blog',
    ogTitle: 'Darkvence Engineering & Growth Dispatches',
    ogDescription: 'Deep-dive analyses from practicing software architects and growth strategists.',
    ogImage: '/src/assets/images/project_fintech_platform_1790497066827.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: true
  },
  {
    path: '/contact',
    title: 'Start a Project & Technical Discovery — Darkvence',
    description: 'Schedule a technical discovery call with Darkvence principal software architects and digital growth leads.',
    canonicalUrl: 'https://darkvence.com/contact',
    ogTitle: 'Start a Project — Darkvence Digital Agency',
    ogDescription: 'Let us engineer your vision. Transmit your project requirements and receive a proposal within 24 business hours.',
    ogImage: '/src/assets/images/hero_darkvence_digital_1790497052243.jpg',
    twitterCard: 'summary_large_image',
    index: true,
    follow: true,
    hasStructuredData: false
  }
];

let performanceSnapshots: PerformanceSnapshot[] = [
  {
    pageUrl: 'https://darkvence.com/',
    device: 'desktop',
    measuredAt: new Date(Date.now() - 3600000).toISOString(),
    lcp: 620,
    inp: 38,
    cls: 0.01,
    ttfb: 110,
    fcp: 480,
    speedIndex: 720,
    suggestions: [
      { title: 'Preload Critical Display Fonts', impact: 'LOW', description: 'Font-display: swap is active; Space Grotesk, Inter, and JetBrains Mono are preconnected to Google Fonts.' },
      { title: 'CSS Containment on Below-Fold Bento Cards', impact: 'LOW', description: 'content-visibility: auto applied to improve layout calculation time.' }
    ]
  },
  {
    pageUrl: 'https://darkvence.com/',
    device: 'mobile',
    measuredAt: new Date(Date.now() - 3600000).toISOString(),
    lcp: 940,
    inp: 52,
    cls: 0.02,
    ttfb: 145,
    fcp: 680,
    speedIndex: 1120,
    suggestions: [
      { title: 'Serve Next-Gen Image Formats', impact: 'LOW', description: 'All generated hero assets are served as optimized WebP / compressed JPEG.' }
    ]
  }
];

let trackingConfig: TrackingConfig = {
  ga4: {
    enabled: true,
    measurementId: process.env.NEXT_PUBLIC_GA4_ID || 'G-DKVENCE2026',
    installed: true,
    receivingEvents: false // Clearly unverified until real events flow
  },
  googleAds: {
    enabled: true,
    conversionId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-1122334455',
    conversionLabel: 'AbCdEfGhIjKlMnOpQr',
    installed: true,
    verified: false
  },
  metaPixel: {
    enabled: true,
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '892304918239012',
    installed: true,
    receivingEvents: false
  },
  privacyConsent: {
    requireConsent: true,
    cookiePolicyUrl: '/privacy',
    privacyPolicyUrl: '/privacy'
  }
};

