import { MessageSquare, ShieldCheck, Activity } from 'lucide-react';

const features = [
    {
        icon: <MessageSquare size={32} />,
        title: "Smart Conversations",
        description: "Our AI generates realistic email threads between your account and our network, mimicking real business communication."
    },
    {
        icon: <ShieldCheck size={32} />,
        title: "Spam Rescue",
        description: "When your emails land in spam, our agents automatically find them, mark them as 'Not Spam', and move them to the inbox."
    },
    {
        icon: <Activity size={32} />,
        title: "Reputation Monitoring",
        description: "Track your domain health score in real-time. Know exactly when you are ready to launch your cold outreach campaigns."
    }
];

export default function Features() {
    return (
        <section id="features" className="container section-padding">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything you need to fix your reputation</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                    We replicate human behavior to signal trust to email providers like Gmail, Outlook, and Yahoo.
                </p>
            </div>

            <div className="grid-3">
                {features.map((feature, index) => (
                    <div key={index} className="glass-card">
                        <div className="feature-icon">{feature.icon}</div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{feature.title}</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
