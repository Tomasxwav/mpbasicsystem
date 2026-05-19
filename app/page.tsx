import NegadosTable from '@/components/negados-table';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background text-foreground font-sans max-w-6xl mx-auto">
      Holas
      <NegadosTable />
    </div>
  );
}
