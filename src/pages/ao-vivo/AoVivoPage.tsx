import { Card, PageHeader } from "@/components/ui";

/** Placeholder até T3 montar a página completa. */
export default function AoVivoPage() {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader title="Ao vivo" subtitle="Andamento do mês na loja, com pulso do dia." />
      <Card className="mt-4" padding="lg">
        <p className="text-[13px] text-t2">Carregando painel…</p>
      </Card>
    </div>
  );
}
