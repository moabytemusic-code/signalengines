import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
    return (
        <section className="container section-padding" style={{ paddingTop: '10rem', textAlign: 'center' }}>
            <div className="animate-fade-in">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                    <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                        <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: 'currentColor', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                        <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', background: 'currentColor' }}></span>
                    </span>
                    AI-Powered Email Warmup
                </div>

                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.1' }}>
                    Stop landing in Spam. <br />
                    Start hitting the <span className="text-gradient">Inbox</span>.
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    WarmUpHero automatically improves your email deliverability using a peer-to-peer network of real inboxes. Recover your reputation in days, not months.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '4rem' }}>
                    <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                        Start Warming for Free <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </Link>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} className="text-primary" /> No credit card required • Cancel anytime
                    </span>
                </div>
            </div>

            <div className="hero-stats animate-fade-in delay-200">
                <div className="stat-item glass-card" style={{ minWidth: '200px' }}>
                    <span className="stat-value text-gradient">99%</span>
                    <span className="stat-label">Inbox Rate</span>
                </div>
                <div className="stat-item glass-card" style={{ minWidth: '200px' }}>
                    <span className="stat-value text-gradient">10k+</span>
                    <span className="stat-label">Real Inboxes</span>
                </div>
                <div className="stat-item glass-card" style={{ minWidth: '200px' }}>
                    <span className="stat-value text-gradient">24/7</span>
                    <span className="stat-label">Auto-Warming</span>
                </div>
                <div className="stat-item glass-card" style={{ minWidth: '200px' }}>
                    <span className="stat-value text-gradient">0%</span>
                    <span className="stat-label">Effort</span>
                </div>
            </div>

            <div className="glass-card animate-fade-in delay-300" style={{ marginTop: '6rem', padding: '0', overflow: 'hidden', maxWidth: '1000px', margin: '6rem auto 0', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                {/* Window Header */}
                <div style={{ background: 'rgba(2, 6, 23, 0.8)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#ef4444' }}></div>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#eab308' }}></div>
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#22c55e' }}></div>
                </div>
                {/* Window Content */}
                <div style={{ background: 'var(--bg-card)', padding: '2rem', minHeight: '300px', position: 'relative', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Current Reputation</div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>98/100</div>
                        </div>
                        <div className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Export Report</div>
                    </div>

                    {/* Fake Chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1%', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        {[40, 45, 55, 60, 58, 65, 70, 75, 80, 85, 82, 90, 95, 98].map((h, i) => (
                            <div key={i} style={{
                                flex: 1,
                                height: `${h}%`,
                                background: 'linear-gradient(to top, var(--primary) 0%, #ec4899 100%)',
                                opacity: 0.5 + (i / 14) * 0.5,
                                borderRadius: '4px 4px 0 0',
                            }}></div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {[
                            { label: 'Emails Sent', val: '1,240' },
                            { label: 'Saved from Spam', val: '43' },
                            { label: 'Replies Received', val: '128' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
        </section>
    )
}
