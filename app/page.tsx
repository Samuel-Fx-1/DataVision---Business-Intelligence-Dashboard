import ChatButton from '@/components/ChatButton';
import DataComparison from '@/components/DataComparison';
import HeroSection from '@/components/HeroSection';
import KpiDashboard from '@/components/KpiDashboard';
import Navigation from '@/components/Navigation';
import RealtimeStream from '@/components/RealtimeStream';
import SiteFooter from '@/components/SiteFooter';
import SmoothScroll from '@/components/SmoothScroll';
import SocialSidebar from '@/components/SocialSidebar';
import SubscribeSection from '@/components/SubscribeSection';
import TrendAnalysis from '@/components/TrendAnalysis';
import { getDashboard } from '@/lib/data';
import type { Period } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DEFAULT_PERIOD: Period = '1y';

export default async function HomePage() {
  const data = getDashboard(DEFAULT_PERIOD);

  return (
    <>
      <SmoothScroll />
      <Navigation />
      <SocialSidebar />
      <ChatButton />

      <HeroSection stats={data.heroStats} />
      <KpiDashboard kpis={data.kpis} />
      <TrendAnalysis
        revenue={data.revenue}
        users={data.users}
        initialPeriod={DEFAULT_PERIOD}
      />
      <DataComparison comparison={data.comparison} regions={data.regions} />
      <RealtimeStream initialEvents={data.stream} />

      <SubscribeSection />
      <SiteFooter />
    </>
  );
}