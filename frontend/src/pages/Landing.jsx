import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Briefcase, Users, CheckCircle, BarChart3,
  FileCode, Award, TrendingUp, Star, ChevronRight,
  Building2, UserCheck, Sparkles, BookOpen, Target,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
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
  { n: "01", title: "Project Submission", text: "Companies upload real project briefs with skills, timelines & deliverables.", color: "from-forge-primary to-blue-600" },
  { n: "02", title: "Candidate Execution", text: "Professionals complete projects by deadline, showcasing real ability.", color: "from-forge-secondary to-orange-600" },
  { n: "03", title: "Expert Evaluation", text: "MentriQ evaluators score code quality, problem-solving & standards.", color: "from-emerald-500 to-emerald-600" },
  { n: "04", title: "Talent Shortlisting", text: "Top performers are shortlisted with detailed scorecards for companies.", color: "from-purple-500 to-purple-600" },
  { n: "05", title: "Company Interview", text: "HR, technical & culture-fit rounds — completely offline.", color: "from-pink-500 to-pink-600" },
  { n: "06", title: "Hiring", text: "Selected candidates receive offers and contribute from day one.", color: "from-forge-primary to-forge-secondary" },
];

const Landing = () => {
  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-40 left-10 w-72 h-72 bg-forge-primary/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-forge-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-5s" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.04),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.04),transparent_50%)]" />
        </div>

        <div className="relative app-container py-24 lg:py-9">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forge-primary/10 border border-forge-primary/20 text-forge-primary text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Skill-First Hiring Platform
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-slate-900 leading-[1.1] tracking-tight mb-6">
                Where Skills Are{" "}
                <span className="text-gradient">Forged</span>
                <br />
                Careers Are Built.
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-xl mb-8">
                A project-based hiring platform that replaces resumes with real, proven work — connecting industry-ready candidates directly to hiring companies.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="xl" icon={ArrowRight} iconPosition="right">
                    Hire on Proof of Work
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="xl">
                    Browse Live Opportunities
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Trusted by 200+ companies</p>
                  <p className="text-xs text-slate-400">And 10,000+ active candidates</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-forge-primary/10 to-forge-secondary/10 rounded-3xl blur-xl" />
                <div className="relative bg-white rounded-3xl border border-slate-200/80 p-8 shadow-elevated">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    <img src="/logo.png" alt="MentriQ" className="h-10 w-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">MentriQ Forge</p>
                      <p className="text-xs text-slate-400">Evaluation Dashboard</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-slate-400">Live</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "Code Quality", score: 8, color: "bg-forge-primary" },
                      { label: "Problem Solving", score: 7, color: "bg-forge-secondary" },
                      { label: "Standards", score: 9, color: "bg-emerald-500" },
                      { label: "Completeness", score: 8, color: "bg-purple-500" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="text-slate-900 font-semibold">{item.score}/10</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score * 10}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Overall Score</p>
                        <p className="text-2xl font-bold font-heading text-slate-900">8.0 / 10</p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        Shortlisted ✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-slate-50/50">
        <div className="app-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-forge-primary font-bold text-xs uppercase tracking-widest mb-4">
              Platform Metrics
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-4">
              Built for results
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-xl mx-auto">
              Our platform connects talent with opportunity through measurable outcomes.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-forge-primary/10 to-forge-primary/5 mb-4">
                      <Icon className="w-6 h-6 text-forge-primary" />
                    </div>
                    <p className="text-3xl font-bold font-heading text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="app-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-forge-primary font-bold text-xs uppercase tracking-widest mb-4">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 mb-4">
              From project to hire in 6 steps
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-xl mx-auto">
              A streamlined pipeline that replaces resumes with real proof of work.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="relative h-full" hover={true}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold font-heading text-sm">{step.n}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-heading text-slate-900 mb-1.5">{step.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-slate-50/50">
        <div className="app-container">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card padding={false} hover={false} className="overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-forge-primary/10 to-forge-primary/5 mb-5">
                    <Building2 className="w-6 h-6 text-forge-primary" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3">For Companies</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    Stop wasting time on resumes. See exactly what candidates can build before you invest in interviews. Our rubric-based evaluation gives you data-backed hiring decisions.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Post real project briefs in minutes",
                      "Get pre-vetted, scored candidates",
                      "Reduce hiring time by 60%",
                      "Data-backed shortlisting decisions",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button icon={ArrowRight} iconPosition="right">
                      Start Hiring
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <Card padding={false} hover={false} className="overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-forge-secondary/10 to-forge-secondary/5 mb-5">
                    <Users className="w-6 h-6 text-forge-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3">For Candidates</h3>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    Skip the black hole of resume submissions. Prove your skills through real projects and get noticed by companies that value what you can actually do.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Work on industry-real projects",
                      "Get expert evaluation & feedback",
                      "Build a portfolio that speaks",
                      "Get shortlisted for top companies",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button variant="secondary" icon={ArrowRight} iconPosition="right">
                      Start Building
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-primary via-forge-primary-dark to-slate-900" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-forge-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative app-container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-6">
              <Star className="w-3.5 h-3.5" />
              Get Started Today
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white leading-tight mb-4">
              Ready to transform the way you hire?
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
              Join hundreds of companies and thousands of candidates already using MentriQ Forge to build better careers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <UserCheck className="w-5 h-5" />
                  I'm a Candidate
                </Button>
              </Link>
              <Link to="/register">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Building2 className="w-5 h-5" />
                  I'm a Company
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="app-container py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr]">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="MentriQ Forge" className="h-9 w-auto" />
                <div>
                  <p className="font-heading font-bold text-white">MentriQ Forge</p>
                  <p className="text-sm text-slate-400">By MentriQ Technologies</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-400 max-w-md">
                We help companies hire faster with real proof-of-work and help candidates showcase their true capabilities through practical, industry-relevant projects.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  Skill-first hiring
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  Verified project work
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  Faster shortlisting
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white mb-4">Platform</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <Link to="/projects" className="hover:text-white transition-colors">
                    Browse Opportunities
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Join as Company
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Join as Candidate
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <a href="mailto:support@mentriqtechnologies.in" className="hover:text-white transition-colors">
                    support@mentriqtechnologies.in
                  </a>
                </li>
                <li>
                  <span>Jaipur, Rajasthan, India</span>
                </li>
                <li>
                  <span>Building better hiring outcomes</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>
                  <Link to="https://www.mentriqtechnologies.in/about" className="hover:text-white transition-colors">
                    About MentriQ
                  </Link>
                </li>
                <li>
                  <Link to="https://www.mentriqtechnologies.in/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="https://www.mentriqtechnologies.in/terms-of-service" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} MentriQ Technologies. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <Link to="https://www.mentriqtechnologies.in/privacy-policy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="https://www.mentriqtechnologies.in/terms-of-service" className="hover:text-white transition-colors">
                Terms
              </Link>
              
              <Link to="https://www.mentriqtechnologies.in/contact" className="hover:text-white transition-colors">
                Contact
              </Link>

              <Link to="tel:+917665531312" className="hover:text-white transition-colors">
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
