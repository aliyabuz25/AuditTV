import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Linkedin, Facebook, Twitter, Mail } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const isInternalPath = (value: string) => value.startsWith('/') && !value.startsWith('//');

const FooterLegalLink: React.FC<{ href: string; label: string }> = ({ href, label }) => {
  if (isInternalPath(href)) {
    return <Link to={href} className="hover:text-white transition-colors">{label}</Link>;
  }
  return (
    <a href={href || '#'} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">
      {label}
    </a>
  );
};

const Footer: React.FC = () => {
  const { sitemap } = useSiteData();
  const siteName = sitemap.settings?.branding?.siteName || 'audit.tv';
  const logoUrl = sitemap.settings?.branding?.logoUrl || '';
  const footer = sitemap.settings?.footer;
  const privacyUrl = footer.privacyUrl && footer.privacyUrl !== '#' ? footer.privacyUrl : '/mexfilik-siyaseti';
  const termsUrl = footer.termsUrl && footer.termsUrl !== '#' ? footer.termsUrl : '/istifade-sertleri';

  return (
    <footer className="bg-neutral-950 border-t border-white/10 pt-20 pb-10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center text-white font-bold text-lg">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-14 w-auto max-w-[280px] object-contain" />
              ) : null}
            </Link>
            <p className="text-neutral-500 leading-relaxed">{footer.aboutText}</p>
          </div>

          <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">{footer.platformTitle}</h4>
             <ul className="space-y-3">
               {footer.platformLinks.map((link) => (
                 <li key={link.path + link.label}>
                   <NavLink to={link.path} className="text-neutral-400 hover:text-white transition-colors">{link.label}</NavLink>
                 </li>
               ))}
             </ul>
          </div>

          <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">{footer.resourcesTitle}</h4>
             <ul className="space-y-3">
               {footer.resourceLinks.map((link) => (
                 <li key={link.path + link.label}>
                   <NavLink to={link.path} className="text-neutral-400 hover:text-white transition-colors">{link.label}</NavLink>
                 </li>
               ))}
             </ul>
          </div>

          <div>
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">{footer.contactTitle}</h4>
             <p className="text-neutral-400 mb-2">{footer.address}</p>
             <p className="text-neutral-400 mb-2">{footer.phone}</p>
             <p className="text-neutral-400">{footer.email}</p>

             <div className="flex gap-4 mt-6">
                <a href={footer.socialLinks.linkedin || '#'} className="text-neutral-500 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <Linkedin size={18} />
                </a>
                <a href={footer.socialLinks.facebook || '#'} className="text-neutral-500 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <Facebook size={18} />
                </a>
                <a href={footer.socialLinks.twitter || '#'} className="text-neutral-500 hover:text-white transition-colors" target="_blank" rel="noreferrer">
                  <Twitter size={18} />
                </a>
                <a href={footer.socialLinks.email || `mailto:${footer.email}`} className="text-neutral-500 hover:text-white transition-colors">
                  <Mail size={18} />
                </a>
             </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-neutral-600">
          <p>&copy; {new Date().getFullYear()} {footer.copyrightText}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <FooterLegalLink href={privacyUrl} label={footer.privacyLabel} />
             <FooterLegalLink href={termsUrl} label={footer.termsLabel} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
