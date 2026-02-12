import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0', marginTop: '4rem', background: 'var(--bg-secondary)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <Link href="/" className="logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                        <Flame className="text-primary" size={24} />
                        Warmup <span className="text-gradient">Hero</span>
                    </Link>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        © 2024 WarmUpHero. All rights reserved.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Privacy Policy</a>
                    <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Terms of Service</a>
                </div>
            </div>
        </footer>
    )
}
