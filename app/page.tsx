import ChatButton from '@/components/ChatButton';
import HeroSection from '@/components/HeroSection';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import SmoothScroll from '@/components/SmoothScroll';
import SocialSidebar from '@/components/SocialSidebar';
import SubscribeSection from '@/components/SubscribeSection';
import { getHeroStats } from '@/lib/data';

export default function HomePage() {
  const stats = getHeroStats();

  return (
    <>
      <SmoothScroll />
      <Navigation />
      <SocialSidebar />
      <ChatButton />

      <HeroSection stats={stats} />
      <SubscribeSection />

      <SiteFooter />
    </>
  );
}
