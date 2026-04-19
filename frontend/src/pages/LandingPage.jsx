import { Link } from 'react-router-dom'
import { Zap, BarChart3, Target, Trophy, GitCompare, Flame, ArrowRight, CheckCircle } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const features = [
  { icon: BarChart3, title: 'Unified Analytics', desc: 'Aggregate stats from LeetCode, Codeforces, CodeChef into one dashboard.' },
  { icon: Target, title: 'Goal Tracking', desc: 'Set solve targets with deadlines and track your progress daily.' },
  { icon: Trophy, title: 'Leaderboard', desc: 'Compare your progress with friends and top coders globally.' },
  { icon: GitCompare, title: 'User Comparison', desc: 'Side-by-side comparison of two coders across all platforms.' },
  { icon: Flame, title: 'Streak Tracking', desc: 'Maintain your daily solving streak and beat your personal record.' },
  { icon: Zap, title: 'AI Insights', desc: 'AI-powered recommendations to improve your weak areas.' },
]

const platforms = [
  { name: 'LeetCode', color: 'var(--lc-color)', emoji: '🟡' },
  { name: 'Codeforces', color: 'var(--cf-color)', emoji: '🔵' },
  { name: 'CodeChef', color: '#c8824a', emoji: '🔶' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', textAlign: 'center',
        background: 'var(--grad-hero)',
        padding: '6rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fade-in" style={{ position: 'relative', maxWidth: 780 }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-accent" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              🚀 Track · Analyze · Improve
            </span>
          </div>

          <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Master Competitive<br />
            <span className="gradient-text">Coding with Data</span>
          </h1>

          <p style={{ fontSize: '1.15rem', maxWidth: 560, margin: '0 auto 2.5rem', color: 'var(--text-secondary)' }}>
            LeetMetrices aggregates your solving stats from LeetCode, Codeforces & CodeChef into one beautiful dashboard with AI-powered insights.
          </p>

          <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-3" style={{ marginTop: '3rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports:</span>
            {platforms.map(p => (
              <span key={p.name} className="badge badge-accent" style={{ background: 'var(--bg-overlay)', color: p.color, borderColor: 'var(--border)' }}>
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="animate-fade-in">Everything you need to<br /><span className="gradient-text">level up faster</span></h2>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>All your coding progress in one intelligent platform.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                }}>
                  <f.icon size={22} color="var(--accent-1)" />
                </div>
                <h4 style={{ marginBottom: '0.4rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.875rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'var(--bg-base)' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to track your<br /><span className="gradient-text">coding journey?</span></h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Join thousands of coders who use LeetMetrices to stay consistent and improve faster.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div className="flex items-center justify-center gap-2">
          <Zap size={14} color="var(--accent-1)" />
          <span>LeetMetrices — Built for coders, by coders</span>
        </div>
      </footer>
    </div>
  )
}
