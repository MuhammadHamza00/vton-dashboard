'use client';
import StatsCards from '@/components/Statscard';
import LatestOrders from '@/components/Latestorder';
import ProtectedLayout from '@/components/ProtectedLayout';
import AdminAlerts from '@/components/AdminAlerts';
import DashboardActions from '@/components/DashboardActions';
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const router = useRouter();

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <StatsCards />
          <DashboardActions />
        <AdminAlerts />
      </div>
    </ProtectedLayout>
  );
}
