import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/premium-landing/Navbar'
import Hero from '@/components/premium-landing/Hero'
import Features from '@/components/premium-landing/Features'
import HowItWorks from '@/components/premium-landing/HowItWorks'
import Pricing from '@/components/premium-landing/Pricing'
import Footer from '@/components/premium-landing/Footer'

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div id="premium-landing">
      {/* Background Gradients */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'fixed',
        top: '20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
        zIndex: -1,
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>

      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
