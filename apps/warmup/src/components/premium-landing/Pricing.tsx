import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Free Starter",
        description: "Perfect for testing the waters.",
        featured: false,
        action: "Start for Free",
        link: "/login",
        features: ["1 Email Account", "50 Warmup Emails/day", "Basic Reporting"]
    },
    {
        name: "Pro Growth",
        description: "For professionals and small teams.",
        featured: true,
        action: "Get Started",
        link: "/billing",
        features: ["3 Email Accounts", "200 Warmup Emails/day", "Priority Spam Rescue", "Advanced Analytics"]
    },
    {
        name: "Agency",
        description: "Volume and power for agencies.",
        featured: false,
        action: "Contact Sales",
        link: "/login",
        features: ["Unlimited Accounts", "1000+ Warmup Emails/day", "Dedicated Support", "API Access"]
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="container section-padding">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simple, transparent pricing</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                    Start for free, upgrade as you grow. No hidden fees.
                </p>
            </div>

            <div className="grid-3">
                {plans.map((plan, index) => (
                    <div key={index} className="glass-card pricing-card" style={plan.featured ? { borderColor: 'var(--primary)', transform: 'scale(1.05)', boxShadow: 'var(--shadow-glow)', position: 'relative', zIndex: 10 } : {}}>
                        {plan.featured && (
                            <div style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                alignSelf: 'flex-start',
                                marginBottom: '1rem'
                            }}>
                                MOST POPULAR
                            </div>
                        )}
                        <h3 style={{ fontSize: '1.5rem' }}>{plan.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{plan.description}</p>

                        <ul className="pricing-features">
                            {plan.features.map((feature, i) => (
                                <li key={i}>
                                    <Check className="check-icon" size={20} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <Link href={plan.link} className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', marginTop: 'auto' }}>
                            {plan.action}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    )
}
