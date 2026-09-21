import { Link } from "react-router-dom";
import { Button, Card, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";

/** Shell — Modo TV completo no feature de Compartilhar. */
export default function TvPage() {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Modo TV"
        subtitle="Exibição em tela cheia para a loja."
        crumbs={[{ label: "Ao vivo", to: paths.aoVivo.root }, { label: "Modo TV" }]}
        actions={
          <Link to={paths.aoVivo.root}>
            <Button variant="secondary" size="sm">
              Voltar ao Ao vivo
            </Button>
          </Link>
        }
      />
      <Card className="mt-4" padding="lg">
        <p className="text-[13.5px] font-semibold text-t0">Em breve</p>
      </Card>
    </div>
  );
}
