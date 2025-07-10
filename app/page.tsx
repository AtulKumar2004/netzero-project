import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import Impact from '@/components/sections/Impact';
import HowItWorks from '@/components/sections/HowItWorks';
import Partners from '@/components/sections/Partners';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Impact />
      <HowItWorks />
      <Partners />
      <Footer />
    </main>
  );
}