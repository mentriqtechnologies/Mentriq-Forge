import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Briefcase, Users, CheckCircle, BarChart3,
  FileCode, Award, TrendingUp, Star, Building2,
  UserCheck, Sparkles, ShieldCheck, Search,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const stats = [
  { value: "500+", label: "Projects Completed", icon: FileCode },
  { value: "10K+", label: "Active Candidates", icon: Users },
  { value: "200+", label: "Hiring Partners", icon: Building2 },
  { value: "92%", label: "Hiring Success Rate", icon: TrendingUp },
];

const steps = [
  { n: "01", title: "Project Brief", text: "Companies publish real delivery goals, required skills, and outcome expectations.", color: "from-forge-primary to-blue-600" },
  { n: "02", title: "Candidate Proof", text: "Candidates build and submit work that demonstrates real execution quality.", color: "from-forge-secondary to-orange-600" },
  { n: "03", title: "Expert Review", text: "MentriQ evaluators score coding, clarity, delivery standards, and thinking.", color: "from-emerald-500 to-emerald-600" },
  { n: "04", title: "Shortlisting", text: "Companies receive ranked candidates with measurable scorecards and evidence.", color: "from-purple-500 to-purple-600" },
  { n: "05", title: "Interview", text: "Human evaluation becomes faster because the technical signal is already clear.", color: "from-pink-500 to-pink-600" },
  { n: "06", title: "Hiring", text: "Top performers get noticed, selected, and onboarded with confidence.", color: "from-forge-primary to-forge-secondary" },
];

const featureCards = [
  { icon: Briefcase, title: "High-intent talent", text: "Candidate flow is quality-led, not volume-led, helping recruiters see the right people fast." },
  { icon: ShieldCheck, title: "Verified proof", text: "Every submission is measured against clear standards so recruiters can trust the signal." },
  { icon: BarChart3, title: "Decision-ready analytics", text: "Recruiting teams get visibility into performance metrics and candidate readiness." },
];

const Landing = () => {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[68vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-24 left-10 h-72 w-72 rounded-full bg-forge-primary/10 blur-3xl" />
          <div className="absolute right-8 top-20 h-80 w-80 rounded-full bg-forge-secondary/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.07),transparent_42%)]" />
        </div>

        <div className="relative app-container py-6 lg:py-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="soft-badge mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Premium Hiring Portal Experience
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-[-0.03em] mb-3">
                Hire talent on
                <span className="text-gradient"> proof of work</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="max-w-xl text-lg text-slate-600 leading-7 mb-5">
                MentriQ Forge turns hiring into a polished, outcome-based journey where companies assess skills through real projects and candidates show what they can actually deliver.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-5">
                <Link to="/register">
                  <Button size="xl" icon={ArrowRight} iconPosition="right">
                    Start Hiring
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="xl">
                    Browse Opportunities
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                {[
                  "Skill-first recruitment",
                  "Trusted shortlisting",
                  "Real project evidence",
                ].map((item) => (
                  <span key={item} className="dashboard-chip">{item}</span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="portal-card overflow-hidden p-4 sm:p-6"
            >
              <div className="rounded-[24px] bg-slate-950 p-3.5 text-white">
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="MentriQ Forge" className="h-9 w-auto" />
                    <div>
                      <p className="font-heading font-bold text-lg">MentriQ Portal</p>
                      <p className="text-xs text-slate-300">Candidate evaluation workspace</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live
                  </div>
                </div>

                <div className="grid gap-2.5 py-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Shortlisted</p>
                    <p className="mt-1 text-3xl font-extrabold text-white">121</p>
                    <p className="mt-0.5 text-sm text-slate-300">Top candidates ready for interviews</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg. Score</p>
                    <p className="mt-1 text-3xl font-extrabold text-white">8.4</p>
                    <p className="mt-0.5 text-sm text-slate-300">Across technical and project quality</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Hiring pipeline</p>
                      <p className="text-xs text-slate-300">View score trends and candidate status</p>
                    </div>
                    <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">Updated now</button>
                  </div>

                  {[
                    { name: "Frontend Developer", score: "92%", tag: "Strong fit" },
                    { name: "Full Stack Engineer", score: "88%", tag: "Verified" },
                    { name: "AI Product Analyst", score: "84%", tag: "Reviewing" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-300">{item.tag}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-300">{item.score}</p>
                        <p className="text-[11px] text-slate-400">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12 bg-white/60">
        <div className="app-container">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="soft-badge">Trusted outcomes</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Designed like a premium hiring platform</h2>
            </div>
            <div className="dashboard-chip">Recruitment-grade workflow</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full">
                    <div className="mb-3 inline-flex rounded-2xl bg-forge-primary/10 p-3 text-forge-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 text-xl font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{feature.text}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="app-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="mb-6 text-center">
            <motion.p variants={fadeUp} className="soft-badge mx-auto">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">From project brief to shortlist in six steps</motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mt-2 max-w-2xl text-lg text-slate-600">A hiring system built to feel polished, reliable, and conversion focused from the first click to the final selection.</motion.p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-sm font-extrabold text-white`}>
                      {step.n}
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold text-slate-900">{step.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{step.text}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12 bg-slate-950 text-white">
        <div className="app-container">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="soft-badge bg-white/10 text-white border-white/10">Why companies switch</p>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Better hiring decisions with less noise</h2>
              <p className="mt-2 max-w-xl text-lg leading-7 text-slate-300">Instead of filtering through generic profiles, teams compare candidate outcomes, technical depth, and delivery quality in one premium workspace.</p>
              <div className="mt-4 space-y-2">
                {[
                  "Shortlist faster with evidence-backed scorecards",
                  "Reduce interview waste through project-driven validation",
                  "Give candidates a clearer path to show meaningful capability",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="portal-card border-white/10 bg-white/5 p-4 text-white">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-300"><Search className="h-4 w-4" /> Team insights</div>
                  <div className="space-y-2">
                    {[
                      { title: "Interview-ready candidates", value: "78%" },
                      { title: "Automation coverage", value: "63%" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl bg-white/5 px-3 py-2">
                        <p className="text-xs text-slate-400">{item.title}</p>
                        <p className="mt-0.5 text-xl font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-300"><Award className="h-4 w-4" /> Quality score</div>
                  <div className="rounded-xl bg-emerald-500/10 px-3 py-3">
                    <p className="text-4xl font-extrabold text-emerald-300">8.8</p>
                    <p className="mt-1 text-sm text-slate-300">Strong rubric consistency and better signal confidence</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-10 lg:py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-primary via-forge-primary-dark to-slate-950" />
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-12 top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-forge-secondary/20 blur-3xl" />
        </div>

        <div className="relative app-container text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="soft-badge mx-auto border-white/20 bg-white/10 text-white">Get started today</div>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">Ready to bring a premium hiring experience to your audience?</h2>
            <p className="mx-auto mt-2 max-w-2xl text-lg text-slate-200">Join a platform that feels polished, credible, and conversion-ready from the very first interaction.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <UserCheck className="h-5 w-5" />
                  I&apos;m a Candidate
                </Button>
              </Link>
              <Link to="/register">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Building2 className="h-5 w-5" />
                  I&apos;m a Company
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
    </div>
  );
};

export default Landing;
