import { Request, Response } from 'express';
import { db } from '../../db/store.ts';

export const analyticsController = {
  getOverview: async (req: Request, res: Response): Promise<void> => {
    const inquiries = db.getInquiries();
    const services = db.getServices(true);
    const projects = db.getProjects(true);
    const blogPosts = db.getBlogPosts(true);
    const testimonials = db.getTestimonials(true);
    const trustedBrands = db.getTrustedBrands(true);

    const totalInquiries = inquiries.length;
    const newInquiries = inquiries.filter(i => i.status === 'NEW').length;
    const inProgressInquiries = inquiries.filter(i => i.status === 'IN_PROGRESS').length;
    const completedInquiries = inquiries.filter(i => i.status === 'COMPLETED').length;

    // Service distribution
    const serviceDistribution: Record<string, number> = {};
    inquiries.forEach(i => {
      const s = i.serviceInterested || 'General';
      serviceDistribution[s] = (serviceDistribution[s] || 0) + 1;
    });

    // Inquiries over recent 7 days
    const dailyInquiries: { date: string; count: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const dateObj = new Date(Date.now() - d * 86400000);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const count = inquiries.filter(i => i.createdAt.slice(0, 10) === dateStr).length;
      dailyInquiries.push({
        date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        count
      });
    }

    res.json({
      success: true,
      data: {
        isDemoSeedData: true,
        stats: {
          totalInquiries,
          newInquiries,
          inProgressInquiries,
          completedInquiries,
          publishedServices: services.filter(s => s.status === 'published').length,
          publishedProjects: projects.filter(p => p.status === 'published').length,
          publishedBlogPosts: blogPosts.filter(b => b.status === 'published').length,
          publishedTestimonials: testimonials.filter(t => t.isActive && t.isPublished).length,
          publishedTrustedBrands: trustedBrands.filter(b => b.isActive && b.isPublished).length
        },
        serviceDistribution: Object.entries(serviceDistribution).map(([name, count]) => ({
          service: name,
          count,
          percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0
        })),
        timeline: dailyInquiries,
        recentActivity: inquiries.slice(0, 5).map(i => ({
          id: i.id,
          type: 'INQUIRY_RECEIVED',
          title: `Inquiry from ${i.name} (${i.company || 'Direct'})`,
          subtitle: `${i.serviceInterested} · ${i.status}`,
          timestamp: i.createdAt
        }))
      }
    });
  }
};
