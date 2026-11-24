import {
  ServiceItem,
  ProjectItem,
  InquiryItem,
  BlogPostItem,
  SiteSettings,
  AdminUser,
  AnalyticsOverview,
  MediaItem,
  HealthStatus,
  PageSeoConfig,
  SeoAuditReport,
  PerformanceSnapshot,
  TrackingConfig,
  AboutPageData,
  Testimonial,
  TrustedBrand,
  TrustedBrandsSectionSettings,
  TrustedBrandsPayload
} from '../types/index.ts';


const API_BASE = '/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('darkvence_admin_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const json = await res.json();

    if (!res.ok || json.success === false) {
      const errorMessage = json.error?.message || json.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMessage);
      (error as any).status = res.status;
      (error as any).code = json.error?.code;
      (error as any).details = json.error?.details;
      throw error;
    }

    return json.data !== undefined ? json.data : json;
  }

  // --- Public APIs ---
  async getServices(): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>('/services');
  }

  async getServiceBySlug(slug: string): Promise<ServiceItem> {
    return this.request<ServiceItem>(`/services/${slug}`);
  }

  async getProjects(category?: string): Promise<ProjectItem[]> {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<ProjectItem[]>(`/projects${query}`);
  }

  async getProjectBySlug(slug: string): Promise<ProjectItem> {
    return this.request<ProjectItem>(`/projects/${slug}`);
  }

  async getBlogPosts(params?: { category?: string; search?: string; tag?: string }): Promise<BlogPostItem[]> {
    const queryParts: string[] = [];
    if (params?.category && params.category !== 'All') queryParts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    if (params?.tag) queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.request<BlogPostItem[]>(`/blog${qs}`);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPostItem> {
    return this.request<BlogPostItem>(`/blog/${slug}`);
  }

  async getSettings(): Promise<SiteSettings> {
    return this.request<SiteSettings>('/settings');
  }

  async getAbout(): Promise<AboutPageData> {
    return this.request<AboutPageData>('/about');
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return this.request<Testimonial[]>('/testimonials');
  }

  async getTrustedBrands(): Promise<TrustedBrandsPayload> {
    return this.request<TrustedBrandsPayload>('/trusted-brands');
  }

  async getAdminAbout(): Promise<AboutPageData> {
    return this.request<AboutPageData>('/admin/about');
  }

  async updateAdminAbout(data: Partial<AboutPageData>): Promise<AboutPageData> {
    return this.request<AboutPageData>('/admin/about', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }


  async submitInquiry(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    serviceInterested: string;
    budgetRange?: string;
    message: string;
    website_source_hp?: string;
  }): Promise<{ id: string; createdAt: string }> {
    return this.request<{ id: string; createdAt: string }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- Auth APIs ---
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: AdminUser }> {
    const res = await this.request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (res.token) {
      localStorage.setItem('darkvence_admin_token', res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('darkvence_admin_token');
    }
  }

  async getMe(): Promise<{ user: AdminUser }> {
    return this.request<{ user: AdminUser }>('/auth/me');
  }

  // --- Admin APIs ---
  async getAdminAnalytics(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/admin/analytics/overview');
  }

  // Services Admin
  async getAdminServices(): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>('/admin/services');
  }

  async getAdminServiceById(id: string): Promise<ServiceItem> {
    return this.request<ServiceItem>(`/admin/services/${id}`);
  }

  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    return this.request<ServiceItem>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    return this.request<ServiceItem>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateServiceStatus(id: string, status: 'published' | 'draft' | 'archived'): Promise<ServiceItem> {
    return this.request<ServiceItem>(`/admin/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async deleteService(id: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(`/admin/services/${id}`, {
      method: 'DELETE'
    });
  }

  // Projects Admin
  async getAdminProjects(): Promise<ProjectItem[]> {
    return this.request<ProjectItem[]>('/admin/projects');
  }

  async createProject(data: Partial<ProjectItem>): Promise<ProjectItem> {
    return this.request<ProjectItem>('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: string, data: Partial<ProjectItem>): Promise<ProjectItem> {
    return this.request<ProjectItem>(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/projects/${id}`, {
      method: 'DELETE'
    });
  }

  // Blog Admin
  async getAdminBlogPosts(): Promise<BlogPostItem[]> {
    return this.request<BlogPostItem[]>('/admin/blog');
  }

  async createBlogPost(data: Partial<BlogPostItem>): Promise<BlogPostItem> {
    return this.request<BlogPostItem>('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBlogPost(id: string, data: Partial<BlogPostItem>): Promise<BlogPostItem> {
    return this.request<BlogPostItem>(`/admin/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteBlogPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/blog/${id}`, {
      method: 'DELETE'
    });
  }

  // Testimonials Admin
  async getAdminTestimonials(): Promise<Testimonial[]> {
    return this.request<Testimonial[]>('/admin/testimonials');
  }

  async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    return this.request<Testimonial>('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>): Promise<Testimonial> {
    return this.request<Testimonial>(`/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateTestimonialStatus(
    id: string,
    data: { isActive?: boolean; isPublished?: boolean }
  ): Promise<Testimonial> {
    return this.request<Testimonial>(`/admin/testimonials/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteTestimonial(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/testimonials/${id}`, {
      method: 'DELETE'
    });
  }

  // Trusted Brands Admin
  async getAdminTrustedBrands(): Promise<TrustedBrandsPayload> {
    return this.request<TrustedBrandsPayload>('/admin/trusted-brands');
  }

  async updateTrustedBrandsSettings(
    data: Partial<TrustedBrandsSectionSettings>
  ): Promise<TrustedBrandsSectionSettings> {
    return this.request<TrustedBrandsSectionSettings>('/admin/trusted-brands/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async createTrustedBrand(data: Partial<TrustedBrand>): Promise<TrustedBrand> {
    return this.request<TrustedBrand>('/admin/trusted-brands', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTrustedBrand(id: string, data: Partial<TrustedBrand>): Promise<TrustedBrand> {
    return this.request<TrustedBrand>(`/admin/trusted-brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateTrustedBrandStatus(
    id: string,
    data: { isActive?: boolean; isPublished?: boolean }
  ): Promise<TrustedBrand> {
    return this.request<TrustedBrand>(`/admin/trusted-brands/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteTrustedBrand(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/trusted-brands/${id}`, {
      method: 'DELETE'
    });
  }

  // Inquiries Admin
  async getAdminInquiries(params?: { status?: string; search?: string }): Promise<InquiryItem[]> {
    const queryParts: string[] = [];
    if (params?.status) queryParts.push(`status=${encodeURIComponent(params.status)}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.request<InquiryItem[]>(`/admin/inquiries${qs}`);
  }

  async updateInquiry(id: string, data: { status?: string; internalNotes?: string }): Promise<InquiryItem> {
    return this.request<InquiryItem>(`/admin/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteInquiry(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/inquiries/${id}`, {
      method: 'DELETE'
    });
  }

  // Settings Admin
  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    return this.request<SiteSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Uploads & Media
  async uploadImage(image: string, name?: string): Promise<{ assetId: string; url: string }> {
    return this.request<{ assetId: string; url: string }>('/admin/uploads', {
      method: 'POST',
      body: JSON.stringify({ image, name })
    });
  }

  async getMedia(): Promise<MediaItem[]> {
    return this.request<MediaItem[]>('/admin/media');
  }

  async createMedia(data: Partial<MediaItem>): Promise<MediaItem> {
    return this.request<MediaItem>('/admin/media', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteMedia(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/media/${id}`, {
      method: 'DELETE'
    });
  }

  // Website Health
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/admin/health');
  }

  // SEO Center
  async getSeo(): Promise<{ pages: PageSeoConfig[]; audit: SeoAuditReport }> {
    return this.request<{ pages: PageSeoConfig[]; audit: SeoAuditReport }>('/admin/seo');
  }

  async updateSeo(path: string, updates: Partial<PageSeoConfig>): Promise<{ success: boolean; data: PageSeoConfig }> {
    return this.request<{ success: boolean; data: PageSeoConfig }>('/admin/seo', {
      method: 'PUT',
      body: JSON.stringify({ path, ...updates })
    });
  }

  async runSeoAudit(): Promise<SeoAuditReport> {
    return this.request<SeoAuditReport>('/admin/seo/audit', {
      method: 'POST'
    });
  }

  // Performance Center
  async getPerformance(): Promise<PerformanceSnapshot[]> {
    return this.request<PerformanceSnapshot[]>('/admin/performance');
  }

  async measurePerformance(pageUrl: string, device: 'desktop' | 'mobile'): Promise<PerformanceSnapshot> {
    return this.request<PerformanceSnapshot>('/admin/performance/measure', {
      method: 'POST',
      body: JSON.stringify({ pageUrl, device })
    });
  }

  // Tracking Configuration
  async getTracking(): Promise<TrackingConfig> {
    return this.request<TrackingConfig>('/admin/tracking');
  }

  async updateTracking(data: Partial<TrackingConfig>): Promise<TrackingConfig> {
    return this.request<TrackingConfig>('/admin/tracking', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Admin Users Management
  async getAdminUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/admin/users');
  }

  async createAdminUser(data: { name: string; email: string; password: string; role: 'admin' | 'editor' }): Promise<AdminUser> {
    return this.request<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }
}

export const api = new ApiService();
