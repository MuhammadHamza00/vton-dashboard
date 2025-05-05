export default function LatestOrders() {
    const orders = [
      { id: '#3501', customer: 'Alice Brown', status: 'Paid', date: '8/5/2020', total: '$330' },
      { id: '#3500', customer: 'John Doe', status: 'Pending', date: '6/30/2020', total: '$350' },
      { id: '#3499', customer: 'Michael Smith', status: 'Delivered', date: '8/15/2020', total: '$1205' },
      { id: '#3498', customer: 'Emily White', status: 'Cancelled', date: '8/15/2020', total: '$145' },
      { id: '#3497', customer: 'Sarah Johnson', status: 'Paid', date: '6/15/2020', total: '$Paid' },
    ];
  
    const statusColors = {
      Paid: 'text-green-400',
      Pending: 'text-orange-400',
      Delivered: 'text-blue-400',
      Cancelled: 'text-red-500',
    };
  
    return (
      <div className="bg-[#111827] border-1 border-[#334155] p-6 rounded-2xl shadow hover:shadow-lg transition-all">
        <h3 className="text-white text-xl mb-4">Latest Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-white">
                <th className="py-3 px-3">Order</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Total</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {orders.map((order) => (
                <tr key={order.id} className="border-t px-3 py-3 border-[#334155] hover:bg-[#000000] hover:border-[#334155] ">
                  <td className="py-3 px-3">{order.id}</td>
                  <td className="py-3 px-3">{order.customer}</td>
                  <td className={`py-3 px-3 ${statusColors[order.status as keyof typeof statusColors]}`}>{order.status}</td>
                  <td className="py-3 px-3">{order.date}</td>
                  <td className="py-3 px-3">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  