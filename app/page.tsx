import ProductosTable from '@/components/productos-table';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-sans max-w-6xl mx-auto w-full p-6">
      <ProductosTable />
    </div>
  );
}
