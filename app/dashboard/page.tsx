'use client';
import StatsCards from '@/components/Statscard';
import LatestOrders from '@/components/Latestorder';
import ProtectedLayout from '@/components/ProtectedLayout';
import AddProductButton from "@/components/AddProductButton";
import { useRouter } from 'next/navigation';


export default function DashboardPage() {
  const router = useRouter();

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <StatsCards />
        <AddProductButton onClick={() => router.push("/dashboard/products/addproduct")} />
        <LatestOrders />
      </div>
    </ProtectedLayout>
  );
}
