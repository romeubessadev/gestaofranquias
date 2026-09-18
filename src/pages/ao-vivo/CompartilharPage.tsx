import { Link } from "react-router-dom";
import { Button, Card, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";

/** Shell — visão externa completa no feature de Compartilhar. */
export default function CompartilharPage() {
  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Compartilhar"
        subtitle="Link e layout para notebook/TV da loja."
        crumbs={[{ label: "Ao Vivo", to: paths.aoVivo.root }, { label: "Compartilhar" }]}
        actions={
          <Link to={paths.aoVivo.root}>
            <Button variant="secondary" size="sm">
              Voltar ao Ao Vivo
            </Button>
          </Link>
        }
      />
      <Card className="mt-4" padding="lg">
        <p className="text-[13.5px] font-semibold text-t0">Em construção</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-t2">
          Esta rota já responde ao botão Compartilhar. O layout da visão externa (notebook/TV) entra no próximo corte.
        </p>
      </Card>
    </div>
  );
}
