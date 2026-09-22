import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  PageHeader,
  useToast,
} from "@/components/ui";
import { useActiveSession } from "@/session/SessionProvider";
import {
  fetchErpIntegrationStatus,
  releaseErpSession,
  resumeErpSync,
  type ErpIntegrationStatus,
} from "@/data/wedash/erp";

function fmtWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Configurações > Integração ERP — desconectar libera o Millennium;
 * logout WeDash NÃO faz isso.
 */
export function ErpIntegrationPage() {
  const session = useActiveSession();
  const { show } = useToast();
  const [info, setInfo] = useState<ErpIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const st = await fetchErpIntegrationStatus(session.tenantId);
    setInfo(st);
    setLoading(false);
  }, [session.tenantId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const canEdit = session.role === "OWNER" || session.role === "MANAGER";

  async function disconnect() {
    if (!canEdit || busy) return;
    setBusy(true);
    try {
      await releaseErpSession({ pauseSync: true });
      show("Integração pausada. O Millennium foi liberado.", "success");
      await reload();
    } catch {
      show("Não foi possível desconectar. Tente de novo.", "danger");
    } finally {
      setBusy(false);
    }
  }

  async function resume() {
    if (!canEdit || busy) return;
    setBusy(true);
    try {
      await resumeErpSync();
      show("Sincronização retomada.", "success");
      await reload();
    } catch {
      show("Não foi possível retomar. Tente de novo.", "danger");
    } finally {
      setBusy(false);
    }
  }

  const paused = info?.syncPaused ?? false;
  const connected = Boolean(info) && info!.status !== "NOT_CONFIGURED";

  return (
    <div>
      <PageHeader
        title="Integração ERP"
        subtitle="Millennium — sincronização de vendas"
        crumbs={[{ label: "Configurações" }, { label: "Integração ERP" }]}
      />

      <div className="mt-6 max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          {loading ? (
            <p className="px-5 pb-5 text-sm text-t2">Carregando…</p>
          ) : !connected ? (
            <p className="px-5 pb-5 text-sm text-t2">
              Nenhuma credencial configurada. Conclua o onboarding ou reconecte o Millennium.
            </p>
          ) : (
            <div className="space-y-3 px-5 pb-5 text-sm">
              <Row label="Usuário Millennium" value={info!.username} />
              <Row
                label="Estado"
                value={
                  <Badge variant={paused ? "warning" : info!.status === "VALID" ? "success" : "danger"}>
                    {paused
                      ? "Pausada"
                      : info!.status === "VALID"
                        ? "Conectada"
                        : info!.status === "INVALID"
                          ? "Senha inválida"
                          : info!.status}
                  </Badge>
                }
              />
              <Row
                label="Tipo de usuário"
                value={info!.dedicated ? "Dedicado (sync a cada ~2 min)" : "Compartilhado (~30 min)"}
              />
              <Row label="Último sucesso" value={fmtWhen(info!.lastSuccessAt)} />
              <Row label="Último sync do dia" value={fmtWhen(info!.lastLightSyncAt)} />
              {info!.lastError ? (
                <Row
                  label="Último erro"
                  value={
                    <span className="text-bad">
                      {info!.lastError}
                      {info!.lastErrorAt ? ` · ${fmtWhen(info!.lastErrorAt)}` : ""}
                    </span>
                  }
                />
              ) : null}
            </div>
          )}
        </Card>

        {connected && canEdit ? (
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-3 px-5 pb-5">
              {paused ? (
                <Button onClick={() => void resume()} disabled={busy}>
                  Retomar sincronização
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => void disconnect()} disabled={busy}>
                  Desconectar
                </Button>
              )}
            </div>
            <p className="border-t border-line px-5 py-3 text-xs text-t2">
              Desconectar encerra a sessão no Millennium e pausa o sync. Sair da WeDash{" "}
              <strong className="font-semibold text-t1">não</strong> desconecta o ERP — use este
              botão quando precisar liberar o usuário no Millennium.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-t2">{label}</span>
      <span className="text-right font-medium text-t0">{value}</span>
    </div>
  );
}

export default ErpIntegrationPage;
