import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { api } from './services/api.ts';
import {
  ServiceItem,
  ProjectItem,
  BlogPostItem,
  SiteSettings,
  InquiryItem,
  AnalyticsOverview,
  MediaItem,
  HealthStatus,
  PageSeoConfig,
  SeoAuditReport,
  PerformanceSnapshot,
  TrackingConfig,
  AdminUser,
  AboutPageData,
  Testimonial,
  TrustedBrandsPayload
} from './types/index.ts';

import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { MobileBottomNav } from './components/layout/MobileBottomNav.tsx';
import { CookieConsentBanner } from './components/ui/CookieConsentBanner.tsx';
import { LoadingScreen } from './components/ui/LoadingScreen.tsx';
import { WhatsAppFloatingButton } from './components/ui/WhatsAppFloatingButton.tsx';
import { ScrollProgressBar } from './components/ui/ScrollProgressBar.tsx';

import { HomePage } from './pages/public/HomePage.tsx';
import { ServicesPage } from './pages/public/ServicesPage.tsx';
import { AboutPage } from './pages/public/AboutPage.tsx';
import { PortfolioPage } from './pages/public/PortfolioPage.tsx';
import { BlogPage } from './pages/public/BlogPage.tsx';
import { ContactPage } from './pages/public/ContactPage.tsx';

import { AdminLayout, AdminTab } from './pages/admin/AdminLayout.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminAboutPage } from './pages/admin/AdminAboutPage.tsx';
import { AdminServicesPage } from './pages/admin/AdminServicesPage.tsx';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage.tsx';
import { AdminBlogPage } from './pages/admin/AdminBlogPage.tsx';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';
import { AdminMediaPage } from './pages/admin/AdminMediaPage.tsx';
import { AdminHealthPage } from './pages/admin/AdminHealthPage.tsx';
import { AdminPerformancePage } from './pages/admin/AdminPerformancePage.tsx';
import { AdminSeoPage } from './pages/admin/AdminSeoPage.tsx';
import { AdminTrackingPage } from './pages/admin/AdminTrackingPage.tsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.tsx';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage.tsx';
import { AdminTrustedBrandsPage } from './pages/admin/AdminTrustedBrandsPage.tsx';

function MainApp() {

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Navigation state
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Public data state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);
  const [aboutData, setAboutData] = useState<AboutPageData | undefined>(undefined);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState<boolean>(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);
  const [trustedBrandsData, setTrustedBrandsData] = useState<TrustedBrandsPayload | null>(null);
  const [trustedBrandsLoading, setTrustedBrandsLoading] = useState<boolean>(true);
  const [trustedBrandsError, setTrustedBrandsError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [showInitialLoader, setShowInitialLoader] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('darkvence_visited');
    } catch {
      return true;
    }
  });

  // Admin data state
  const [adminServices, setAdminServices] = useState<ServiceItem[]>([]);
  const [adminProjects, setAdminProjects] = useState<ProjectItem[]>([]);
  const [adminBlog, setAdminBlog] = useState<BlogPostItem[]>([]);
  const [adminInquiries, setAdminInquiries] = useState<InquiryItem[]>([]);
  const [adminTestimonials, setAdminTestimonials] = useState<Testimonial[]>([]);
  const [adminTrustedBrandsData, setAdminTrustedBrandsData] = useState<TrustedBrandsPayload | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [seoData, setSeoData] = useState<{ pages: PageSeoConfig[]; audit: SeoAuditReport } | null>(null);
  const [performanceSnapshots, setPerformanceSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [trackingConfig, setTrackingConfig] = useState<TrackingConfig | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const fetchTestimonials = async () => {
    try {
      setTestimonialsLoading(true);
      setTestimonialsError(null);
      const list = await api.getTestimonials();
      setTestimonials(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('[Failed to fetch testimonials]:', err);
      setTestimonialsError(err?.message || 'Unable to load client testimonials.');
      setTestimonials([]);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const fetchTrustedBrands = async () => {
    try {
      setTrustedBrandsLoading(true);
      setTrustedBrandsError(null);
      const payload = await api.getTrustedBrands();
      setTrustedBrandsData(payload);
    } catch (err: any) {
      console.error('[Failed to fetch trusted brands]:', err);
      setTrustedBrandsError(err?.message || 'Unable to load trusted brands.');
      setTrustedBrandsData(null);
    } finally {
      setTrustedBrandsLoading(false);
    }
  };

  // Initial public data fetch
  const fetchPublicData = async () => {
    try {
      setDataLoading(true);
      const [s, p, b, set, ab] = await Promise.all([
        api.getServices().catch(() => []),
        api.getProjects().catch(() => []),
        api.getBlogPosts().catch(() => []),
        api.getSettings().catch(() => undefined),
        api.getAbout().catch(() => undefined),
        fetchTestimonials(),
        fetchTrustedBrands()
      ]);
      setServices(s || []);
      setProjects(p || []);
      setBlogPosts(b || []);
      if (set) setSettings(set);
      if (ab) setAboutData(ab);
    } catch (err) {
      console.error('[Failed to fetch public data]:', err);
    } finally {
      setDataLoading(false);
    }
  };


  // Admin data fetch
  const fetchAdminData = async () => {
    if (!isAuthenticated) return;
    try {
      const [an, s, p, b, inq, tst, tb, med, hlt, seo, perf, trk, usr] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminServices(),
        api.getAdminProjects(),
        api.getAdminBlogPosts(),
        api.getAdminInquiries(),
        api.getAdminTestimonials(),
        api.getAdminTrustedBrands(),
        api.getMedia(),
        api.getHealth(),
        api.getSeo(),
        api.getPerformance(),
        api.getTracking(),
        api.getAdminUsers()
      ]);
      setAnalytics(an);
      setAdminServices(s || []);
      setAdminProjects(p || []);
      setAdminBlog(b || []);
      setAdminInquiries(inq || []);
      setAdminTestimonials(tst || []);
      setAdminTrustedBrandsData(tb || null);
      setMediaList(med || []);
      setHealthStatus(hlt);
      setSeoData(seo);
      setPerformanceSnapshots(perf || []);
      setTrackingConfig(trk);
      setAdminUsers(usr || []);
    } catch (err) {
      console.error('[Failed to fetch admin data]:', err);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentPage === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, currentPage]);

  const handleNavigate = (page: string, slug?: string) => {
    setCurrentPage(page);
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing admin section
  if (currentPage === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center text-zinc-400 text-sm">
          <span>Verifying administrator credentials...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLoginPage onBackToSite={() => handleNavigate('home')} />;
    }

    const unreadInquiriesCount = adminInquiries.filter(i => i.status === 'NEW').length;

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onExitAdmin={() => handleNavigate('home')}
        unreadCount={unreadInquiriesCount}
      >
        {adminTab === 'overview' && (
          <AdminDashboardPage
            analytics={analytics}
            onNavigateTab={setAdminTab}
          />
        )}
        {adminTab === 'about' && (
          <AdminAboutPage
            onRefresh={() => {
              fetchPublicData();
              fetchAdminData();
            }}
          />
        )}
        {adminTab === 'services' && (

          <AdminServicesPage
            services={adminServices}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'projects' && (
          <AdminProjectsPage
            projects={adminProjects}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'blog' && (
          <AdminBlogPage
            posts={adminBlog}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'inquiries' && (
          <AdminInquiriesPage
            inquiries={adminInquiries}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'trusted-brands' && (
          <AdminTrustedBrandsPage
            brands={adminTrustedBrandsData?.brands || []}
            sectionSettings={adminTrustedBrandsData?.settings || null}
            onRefresh={() => {
              fetchAdminData();
              fetchTrustedBrands();
            }}
          />
        )}
        {adminTab === 'testimonials' && (
          <AdminTestimonialsPage
            testimonials={adminTestimonials}
            onRefresh={() => {
              fetchAdminData();
              fetchTestimonials();
            }}
          />
        )}
        {adminTab === 'media' && (
          <AdminMediaPage
            media={mediaList}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'seo' && (
          <AdminSeoPage
            pages={seoData?.pages || []}
            audit={seoData?.audit || null}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'performance' && (
          <AdminPerformancePage
            snapshots={performanceSnapshots}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'health' && (
          <AdminHealthPage
            health={healthStatus}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'tracking' && (
          <AdminTrackingPage
            tracking={trackingConfig}
            onRefresh={fetchAdminData}
          />
        )}
        {adminTab === 'settings' && settings && (
          <AdminSettingsPage
            settings={settings}
            onRefresh={() => {
              fetchPublicData();
              fetchAdminData();
            }}
          />
        )}
        {adminTab === 'users' && (
          <AdminUsersPage
            users={adminUsers}
            onRefresh={fetchAdminData}
          />
        )}
      </AdminLayout>
    );
  }

  // Public Agency Views
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] dark:bg-[#000000] dark:text-[#FFFFFF] flex flex-col justify-between selection:bg-[#B6FF2B] selection:text-black transition-colors duration-200">
      {showInitialLoader && (
        <LoadingScreen
          isLoading={dataLoading}
          onFinish={() => {
            setShowInitialLoader(false);
            try {
              sessionStorage.setItem('darkvence_visited', 'true');
            } catch {}
          }}
        />
      )}
 
      <ScrollProgressBar triggerKey={currentPage} />
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (selectedSlug || '')}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: 'easeOut' as const }}
          >
            {currentPage === 'home' && (
              <HomePage
                settings={settings}
                services={services}
                projects={projects}
                testimonials={testimonials}
                testimonialsLoading={testimonialsLoading}
                testimonialsError={testimonialsError}
                onRetryTestimonials={fetchTestimonials}
                trustedBrandsData={trustedBrandsData}
                trustedBrandsLoading={trustedBrandsLoading}
                trustedBrandsError={trustedBrandsError}
                onRetryTrustedBrands={fetchTrustedBrands}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'services' && (
              <ServicesPage
                services={services}
                selectedSlug={selectedSlug}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage
                settings={settings}
                aboutData={aboutData}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'portfolio' && (
              <PortfolioPage
                projects={projects}
                selectedSlug={selectedSlug}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'blog' && (
              <BlogPage
                posts={blogPosts}
                selectedSlug={selectedSlug}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'contact' && (
              <ContactPage
                settings={settings}
                preselectedService={selectedSlug}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer settings={settings} onNavigate={handleNavigate} />
      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      <WhatsAppFloatingButton />
      <CookieConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
