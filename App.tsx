import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutPage from './pages/About';
import EducationPage from './pages/Education';
import BlogPage from './pages/Blog';
import ContactPage from './pages/Contact';
import BlogPostDetail from './pages/BlogPostDetail';
import PodcastPage from './pages/Podcast';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BlogManager from './pages/admin/BlogManager';
import EducationManager from './pages/admin/EducationManager';
import PodcastManager from './pages/admin/PodcastManager';
import PodcastDashboard from './pages/admin/PodcastDashboard';
import AboutManager from './pages/admin/AboutManager';
import ContactManager from './pages/admin/ContactManager';
import FaqManager from './pages/admin/FaqManager';
import SeoSmtpManager from './pages/admin/SeoSmtpManager';
import AdminUsersManager from './pages/admin/AdminUsersManager';
import ContentManager from './pages/admin/ContentManager';
import CourseRequestsManager from './pages/admin/CourseRequestsManager';
import { SiteDataProvider } from './site/SiteDataContext';
import { ToastProvider } from './components/ToastProvider';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isPlayer = pathname.includes('/player');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isPlayer && !isAdmin && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isPlayer && !isAdmin && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SiteDataProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/haqqimizda" element={<Layout><AboutPage /></Layout>} />
            <Route path="/podcast" element={<Layout><PodcastPage /></Layout>} />
            <Route path="/tedris" element={<Layout><EducationPage /></Layout>} />
            <Route path="/tedris/:id" element={<Layout><CourseDetail /></Layout>} />
            <Route path="/tedris/:id/player" element={<Layout><CoursePlayer /></Layout>} />
            <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
            <Route path="/blog/:id" element={<Layout><BlogPostDetail /></Layout>} />
            <Route path="/elaqe" element={<Layout><ContactPage /></Layout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="podcast-stats" element={<PodcastDashboard />} />
              <Route path="about" element={<AboutManager />} />
              <Route path="podcasts" element={<PodcastManager />} />
              <Route path="blogs" element={<BlogManager />} />
              <Route path="education" element={<EducationManager />} />
              <Route path="faq" element={<FaqManager />} />
              <Route path="contact" element={<ContactManager />} />
              <Route path="settings" element={<SeoSmtpManager />} />
              <Route path="requests" element={<CourseRequestsManager />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="users" element={<AdminUsersManager />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </SiteDataProvider>
  );
};

export default App;
