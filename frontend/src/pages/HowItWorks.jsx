import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import Button from "../components/ui/Button";

const steps = [
  {
    number: "01",
    title: "Post a Real Project",
    text: "Companies share a live project brief with scope, timeline, and expected outcomes.",
    icon: Briefcase,
    accent: "from-forge-primary to-blue-600",
  },
  {
    number: "02",
    title: "Candidates Apply with Proof",
    text: "Candidates pick up the challenge and submit real work instead of just a resume.",
    icon: Users,
    accent: "from-forge-secondary to-orange-600",
  },
  {
    number: "03",
    title: "Expert Evaluation",
    text: "MentriQ evaluators review quality, problem-solving, clarity, and delivery standards.",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    number: "04",
    title: "Scorecards & Insights",
    text: "Every submission gets a structured scorecard so hiring decisions feel clear and data-driven.",
    icon: BarChart3,
    accent: "from-purple-500 to-purple-600",
  },
  {
    number: "05",
    title: "Shortlisting & Interviews",
    text: "Top performers are shortlisted for company interviews with confidence and context.",
    icon: CheckCircle2,
    accent: "from-pink-500 to-pink-600",
  },
  {
    number: "06",
    title: "Hire with Confidence",
    text: "Companies onboard talent they have already seen perform, reducing guesswork and ramp-up time.",
    icon: Sparkles,
    accent: "from-forge-primary to-forge-secondary",
  },
];

const benefits = [
  "Real work over resumes",
  "Faster and fairer shortlisting",
  "Transparent evaluation standards",
  "Better hiring outcomes for both sides",
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-forge-primary/90 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="absolute top-10 right-10 h-60 w-60 rounded-full bg-forge-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              How MentriQ Forge Works
            </div>
            <h1 className="text-forge-primary font-bold leading-tight sm:text-5xl lg:text-6xl">
              From project to hire in <span className="text-forge-secondary">6 clear steps</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl">
              We replace traditional resume screening with real, measurable work so companies can hire with confidence and candidates can prove their capabilities.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Get Started
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Explore Opportunities
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-forge-primary">Why this works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              A smarter hiring journey for companies and candidates
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Instead of relying on resumes alone, MentriQ creates a transparent path where talent is evaluated through actual delivery, collaboration, and results.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${step.accent} p-3 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{step.number}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Ready to experience the process yourself?
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Join companies and candidates already using MentriQ Forge to turn work into opportunity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
