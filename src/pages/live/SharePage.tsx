import { Link } from "react-router-dom";
import { Button, Card, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";

/** Shell — visão externa completa no feature de Compartilhar. */
export default function SharePage() {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Compartilhar"
        subtitle="Link para compartilhar o painel da loja."
        crumbs={[{ label: "Ao vivo", to: paths.live.root }, { label: "Compartilhar" }]}
        actions={
          <Link to={paths.live.root}>
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
