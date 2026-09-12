import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import {
  Star,
  Code2,
  Brain,
  MessageSquare,
  Ruler,
  Layers,
  Sparkles,
  Users,
  BadgeCheck,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const avatarPalette = [
  "from-forge-primary to-blue-500",
  "from-forge-secondary to-orange-400",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-400",
];

const talentDomains = [
  "Frontend",
  "Backend",
  "Full Stack",
  "UI/UX",
  "Data Science",
  "AI/ML",
  "DevOps",
  "Mobile",
];

const MemberPhoto = ({ member, index }) => {
  const [failed, setFailed] = useState(false);
  const showImg = member.photo && !failed;
  const gradient = avatarPalette[index % avatarPalette.length];

  if (showImg) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
      <span className="text-4xl font-extrabold text-white">
        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </span>
    </div>
  );
};

const rubric = [
  { icon: Code2, title: "Code Quality", text: "Structure, readability, and engineering best practices." },
  { icon: Brain, title: "Problem Solving", text: "Approach, trade-offs, and clarity of thinking." },
  { icon: Ruler, title: "Standards Adherence", text: "Alignment with the brief and delivery expectations." },
  { icon: Layers, title: "Completeness", text: "Scope coverage, finishing touches, and edge cases." },
  { icon: MessageSquare, title: "Communication", text: "Documentation, notes, and how work is presented." },
];

const EvaluatorTeam = () => {
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/evaluators");
        if (active && res.data.members?.length) {
          setEvaluators(res.data.members);
        }
      } catch (err) {
        // Server unavailable — nothing to show
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-slate-50">
        <div className="relative mx-auto max-w-7xl px-4 py-1.5 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} className="soft-badge mx-auto mb-1">
              <Sparkles className="h-3 w-3" />
              Our Evaluators
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-lg font-extrabold leading-tight tracking-[-0.02em] text-slate-900 sm:text-2xl lg:text-3xl">
              Meet Our <span className="text-gradient">Top Talent Team</span>
            </motion.h1>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-[330px] rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-3 grid items-center gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  The people behind every <span className="text-gradient">fair score</span>
                </h2>
                <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-600 sm:text-[13px] sm:leading-6">
                  Every submission is reviewed by a senior specialist matched to the project domain — real work, not resumes.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {talentDomains.map((domain) => (
                    <span key={domain} className="dashboard-chip">{domain}</span>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                {[
                  { icon: BadgeCheck, title: "Verified experts", text: "Sr. professionals, 7-12+ yrs experience." },
                  { icon: Layers, title: "Consistent rubric", text: "Same 5-score standard, every time." },
                  { icon: MessageSquare, title: "Actionable feedback", text: "Notes that tell you where you stand." },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      style={{ animationDelay: `${i * 0.08}s` }}
                      className="animate-fade-in flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <div className="inline-flex shrink-0 items-center justify-center rounded-lg bg-forge-primary/10 p-2 text-forge-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900">{feature.title}</h3>
                        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{feature.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {evaluators.length === 0 ? (
              <div className="portal-card p-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900">No evaluators added yet</h3>
                <p className="mt-1 text-sm text-slate-500">
                  The admin adds the evaluator team from the Evaluators section — profiles appear here automatically.
                  Check back soon!
                </p>
              </div>
            ) : (

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {evaluators.map((evaluator, i) => (
                <div
                  key={evaluator._id || evaluator.name}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  className="animate-fade-in h-full"
                >
                  <Card className="group h-full overflow-hidden p-0">
                    <div className="relative h-48 overflow-hidden">
                      <MemberPhoto member={evaluator} index={i} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                      <div className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Number(evaluator.rating || 0).toFixed(1)}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="truncate text-xl font-bold text-white">{evaluator.name}</h3>
                            <BadgeCheck className="h-4 w-4 shrink-0 text-sky-300" />
                          </div>
                          <p className="truncate text-xs font-medium text-slate-300">{evaluator.experience} experience</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-forge-primary px-2.5 py-1 text-[11px] font-bold text-white">
                          {evaluator.evaluates}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-sm leading-6 text-slate-600">{evaluator.bio}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(evaluator.tags || []).map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {Number(evaluator.reviews || 0).toLocaleString()} reviews
                        </span>
                        <Link to="/register" className="text-xs font-bold text-forge-primary hover:text-forge-primary-dark">
                          View work →
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            )}
          </>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="soft-badge mx-auto">Evaluation rubric</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Five scores. One trustworthy signal.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {rubric.map((dimension, i) => {
              const Icon = dimension.icon;
              return (
                <div
                  key={dimension.title}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  className="animate-fade-in"
                >
                  <Card className="h-full">
                    <div className="mb-3 inline-flex rounded-xl bg-forge-primary/10 p-2.5 text-forge-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{dimension.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{dimension.text}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-forge-primary to-forge-primary-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-12 text-center sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:text-left">
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Put your work in front of expert reviewers</h2>
            <p className="mt-1 max-w-xl text-slate-200">Submit real project work and get a transparent scorecard from our evaluation team.</p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white/40 bg-white text-forge-primary hover:bg-white/90">
                I&apos;m a Candidate
              </Button>
            </Link>
            <Link to="/projects">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" icon={Sparkles}>
                Explore Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EvaluatorTeam;