import { Plus } from 'lucide-react'; // If you use lucide icons

export default function AddProductButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white  py-2 px-4 rounded shadow transition-all"
    >
      <Plus size={20} />
      Add Product
    </button>
  );
}
