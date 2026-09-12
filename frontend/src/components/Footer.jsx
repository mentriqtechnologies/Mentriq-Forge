import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-slate-950 text-slate-300">
    <div className="app-container py-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr]">
        <div>
          <div className="mb-2.5 flex items-center gap-2.5">
            <img src="/logo.png" alt="MentriQ Forge" className="h-9 w-auto" />
            <div>
              <p className="font-heading font-bold text-white">MentriQ Forge</p>
              <p className="text-sm text-slate-400">By MentriQ Technologies</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">We help companies hire faster with real proof-of-work and help candidates showcase their true capability through practical, industry-relevant delivery.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Skill-first hiring</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Verified project work</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">Faster shortlisting</span>
          </div>
        </div>

        <div>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Platform</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/projects" className="hover:text-white transition-colors">Browse Opportunities</Link></li>
            <li><Link to="/evaluators" className="hover:text-white transition-colors">Our Evaluators</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Join as Company</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Join as Candidate</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Company</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="mailto:support@mentriqtechnologies.in" className="hover:text-white transition-colors">support@mentriqtechnologies.in</a></li>
            <li><span>Jaipur, Rajasthan, India</span></li>
            <li><span>Building better hiring outcomes</span></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white">Resources</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="https://www.mentriqtechnologies.in/about" className="hover:text-white transition-colors">About MentriQ</a></li>
            <li><a href="https://www.mentriqtechnologies.in/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="https://www.mentriqtechnologies.in/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 md:flex-row">
        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MentriQ Technologies. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <a href="https://www.mentriqtechnologies.in/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
          <a href="https://www.mentriqtechnologies.in/terms-of-service" className="hover:text-white transition-colors">Terms</a>
          <a href="https://www.mentriqtechnologies.in/contact" className="hover:text-white transition-colors">Contact</a>
          <a href="tel:+917665531312" className="hover:text-white transition-colors">Call Us</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;