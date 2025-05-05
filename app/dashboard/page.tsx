import StatsCards from '@/components/Statscard';
import LatestOrders from '@/components/Latestorder';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <StatsCards />
        <LatestOrders />
      </div>
    </ProtectedLayout>
  );
}
