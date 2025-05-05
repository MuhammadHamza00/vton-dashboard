import StatsCards from '@/components/Statscard';
import LatestOrders from '@/components/Latestorder';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <StatsCards />
      <LatestOrders />
    </div>
  );
}
