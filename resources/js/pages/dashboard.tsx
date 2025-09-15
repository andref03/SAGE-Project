import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { type PageProps, type BreadcrumbItem } from '@/types';
import { CalendarDays, Clock3, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, useAgendamentoColors } from '@/components/ui/agend-colors';
import { useEffect, useState } from 'react';

type AgendamentoHoje = {
  id: number;
  titulo: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
  espaco?: { id: number; nome: string };
  color_index?: number | null;
  data_inicio?: string;
  data_fim?: string;
  user_id?: number;
  justificativa?: string;
};

export default function Dashboard() {
  const { auth, agendamentosHoje = [], selectedDate } = usePage<PageProps>().props as PageProps & {
    agendamentosHoje?: AgendamentoHoje[];
    selectedDate?: string;
  };

  const currentDate = new Date((selectedDate ?? new Date().toISOString().slice(0, 10)) + 'T00:00:00').toLocaleDateString('pt-BR');

  const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

  const { getEventBorderColor } = useAgendamentoColors();

  // Controls visibility of trailing ellipsis based on scroll position
  const [showEllipsis, setShowEllipsis] = useState(false);
  useEffect(() => {
    const el = document.getElementById('ag-list');
    if (!el) return;

    const update = () => {
      // Show ellipsis only when there is overflow and we are at the top
      const hasOverflow = el.scrollHeight > el.clientHeight + 2; // tolerance
      const atTop = el.scrollTop <= 1;
      setShowEllipsis(hasOverflow && atTop);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    // Recalculate on window resize (layout changes)
    window.addEventListener('resize', update, { passive: true } as any);

    return () => {
      el.removeEventListener('scroll', update as any);
      window.removeEventListener('resize', update as any);
    };
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo ao <span className="text-primary">SAGE</span>, {auth.user.name}!
          </h1>
          <p className="mt-2 text-muted-foreground">Sistema de Agendamento e Gerenciamento de Espaços</p>
        </div>



        <div className="w-full sm:max-w-2xl mx-auto">
          <div className="flex justify-center">
            <div className="flex w-full items-center justify-between rounded-xl border border-input bg-muted dark:bg-gradient-to-br dark:from-background dark:to-accent/10 px-3 py-2 shadow-sm">
              <button
                aria-label="Dia anterior"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground px-2.5 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.visit('/dashboard?date=' + new Date(new Date((selectedDate ?? new Date().toISOString().slice(0,10)) + 'T00:00:00').getTime() - 86400000).toISOString().slice(0,10))}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-primary" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Data</span>
                  <span className="font-semibold text-lg tracking-tight text-foreground">{currentDate}</span>
                </div>
              </div>
              <button
                aria-label="Próximo dia"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground px-2.5 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => router.visit('/dashboard?date=' + new Date(new Date((selectedDate ?? new Date().toISOString().slice(0,10)) + 'T00:00:00').getTime() + 86400000).toISOString().slice(0,10))}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <Card className="rounded-xl border border-border shadow-sm">
          <CardHeader className="flex items-center justify-between sm:flex-row sm:items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-muted-foreground" />
              Meus agendamentos
            </CardTitle>
            <Link href="/agendamentos" className="text-sm text-foreground dark:text-white hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent id="ag-list" className="space-y-3 max-h-[473px] overflow-y-auto overflow-x-hidden scrollbar-hide">
            {Array.isArray(agendamentosHoje) && agendamentosHoje.length > 0 ? (
              agendamentosHoje.map((a) => {
                // Monta um objeto compatível com o hook de cores
                const ag = {
                  id: a.id,
                  titulo: a.titulo,
                  hora_inicio: a.hora_inicio,
                  hora_fim: a.hora_fim,
                  status: a.status,
                  espaco_id: a.espaco?.id ?? 0,
                  user_id: a.user_id ?? 0,
                  justificativa: a.justificativa ?? '',
                  data_inicio: a.data_inicio ?? new Date().toISOString().slice(0, 10),
                  data_fim: a.data_fim ?? new Date().toISOString().slice(0, 10),
                  color_index: a.color_index ?? null,
                } as any;
                const borderClass = getEventBorderColor(ag);

                return (
                  <Link
                    key={a.id}
                    href={`/agendamentos/${a.id}?return_url=${encodeURIComponent('/dashboard?date=' + (selectedDate ?? new Date().toISOString().slice(0,10)))}`}
                    className={`group block rounded-lg border bg-gradient-to-tr from-background to-accent/5 p-3 border-l-4 cursor-pointer shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md dark:hover:shadow-white/5 hover:bg-accent/20 ${borderClass}`}
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {a.hora_inicio} - {a.hora_fim}
                          </span>
                          <StatusBadge status={a.status} className="capitalize" />
                        </div>
                        <div className="mt-1 font-semibold tracking-tight">{a.titulo}</div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1.5 sm:self-center">
                        {a.espaco?.nome ? (
                          <>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{a.espaco.nome}</span>
                          </>
                        ) : ''}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-sm text-muted-foreground py-1">
                Nenhum agendamento para esta data.
              </div>
            )}

            {/* Trailing ellipsis shown only when there are more items below and user is at the top */}
            {showEllipsis && (
              <div className="sticky bottom-0 left-0 right-0 flex justify-center">
                <div className="pointer-events-none -mt-2 rounded-full bg-gradient-to-t from-background/95 to-background/0 px-2 py-1 text-muted-foreground select-none">...</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
