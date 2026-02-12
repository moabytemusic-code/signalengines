import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link href="/" className="logo">
                    <Flame className="text-primary" size={28} />
                    Warmup <span className="text-gradient">Hero</span>
                </Link>

                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it works</a>
                    <a href="#pricing" className="nav-link">Pricing</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="nav-link" style={{ marginRight: '1.5rem' }}>Log in</Link>
                    <Link href="/login" className="btn btn-primary">Get Started</Link>
                </div>
            </div>
        </nav>
    );
}
