import { Link as LinkIcon, Zap, ThumbsUp, TrendingUp } from 'lucide-react';

const steps = [
    {
        icon: <LinkIcon size={24} />,
        title: "Connect Account",
        description: "Securely connect your email account via SMTP/IMAP. We support all major providers."
    },
    {
        icon: <Zap size={24} />,
        title: "AI Warming",
        description: "Our network begins sending unique, AI-generated emails to other high-reputation inboxes."
    },
    {
        icon: <ThumbsUp size={24} />,
        title: "Engagement",
        description: "Recipients (our network) open, reply, and mark your emails as important automatically."
    },
    {
        icon: <TrendingUp size={24} />,
        title: "Reputation Boost",
        description: "Your sender score increases, and ISPs verify you as a trusted sender."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="container section-padding" style={{ background: 'linear-gradient(to bottom, transparent, rgba(30, 41, 59, 0.3) 100%)', borderRadius: 'var(--radius-2xl)' }}>
            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>How WarmUpHero Works</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '2rem' }}>
                        Getting started is easy. We handle the heavy lifting while you focus on your business.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {steps.map((step, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    flexShrink: 0,
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '50%',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)'
                                }}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', position: 'relative', overflow: 'hidden' }}>
                    {/* Abstract representation of email network */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'radial-gradient(circle at 50% 50%, var(--primary) 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Warming in progress...</div>
                        <div style={{ color: 'var(--primary)', marginTop: '0.5rem', fontWeight: '500' }}>+45 Rep score today</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
