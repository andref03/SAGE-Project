import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Building } from 'lucide-react';
import { type User, type Localizacao, type BreadcrumbItem } from '@/types';
import { FilterableTable, type ColumnConfig } from '@/components/ui/filterable-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface LocalizacoesIndexProps {
    auth: {
        user: User;
    };
    localizacoes: Localizacao[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function LocalizacoesIndex({ auth, localizacoes, flash }: LocalizacoesIndexProps) {
    const { toast } = useToast();

    // Mostrar toasts baseados nas flash messages
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Sucesso!",
                description: flash.success,
                variant: "success",
                duration: 5000, // 5 segundos
            });
        }
        if (flash?.error) {
            toast({
                title: "Erro!",
                description: flash.error,
                variant: "destructive",
                duration: 5000, // 5 segundos
            });
        }
    }, [flash, toast]);

    const handleDelete = (localizacao: Localizacao) => {
        router.delete(`/localizacoes/${localizacao.id}`, {
            onSuccess: () => {
                toast({
                    title: "Localização excluída com sucesso!",
                    description: `A localização ${localizacao.nome} foi removida do sistema.`,
                    variant: "success",
                    duration: 5000, // 5 segundos
                });
            },
            onError: () => {
                toast({
                    title: "Erro ao excluir localização",
                    description: "Ocorreu um erro ao executar a ação, verifique se não há espaços vinculados.",
                    variant: "destructive",
                    duration: 5000, // 5 segundos
                });
            }
        });
    };

    const columns: ColumnConfig[] = [
        {
            key: 'nome',
            label: 'Nome',
            render: (value, localizacao) => (
                <div className="flex items-center gap-2 font-medium">
                    <Building className="h-4 w-4 text-gray-500" />
                    {value}
                </div>
            )
        },
        {
            key: 'descricao',
            label: 'Descrição',
            getValue: (localizacao) => localizacao.descricao || 'Sem descrição'
        },
        {
            key: 'acoes',
            label: 'Ações',
            searchable: false,
            sortable: false,
            render: (value, localizacao) => (
                <div className="flex items-center justify-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="cursor-pointer bg-gray-200 border border-transparent text-gray-600
                                    hover:bg-gray-300 hover:border-gray-400 hover:text-gray-800
                                    dark:bg-gray-200 dark:border-transparent dark:text-gray-600
                                    dark:hover:bg-gray-300 dark:hover:border-gray-400 dark:hover:text-gray-800"
                            >
                                <Link href={`/localizacoes/${localizacao.id}/editar`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar</p>
                        </TooltipContent>
                    </Tooltip>
                    <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer bg-gray-200 border border-transparent text-red-600
                                            hover:bg-[#F26326]/10 hover:border-[#F26326]/60 hover:text-[#F26326]
                                            dark:bg-gray-200 dark:border-transparent dark:text-red-600
                                            dark:hover:border-[#F26326]/60 dark:hover:text-[#F26326]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Excluir</p>
                            </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Confirmar exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tem certeza que deseja excluir a localização {localizacao.nome}?
                                    Esta ação não pode ser desfeita e pode afetar espaços vinculados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(localizacao)}
                                    className="cursor-pointer bg-red-600 hover:bg-red-700"
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Localizações', href: '/localizacoes' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Localizações" />

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-black dark:text-white">Localizações</h1>
                    </div>
                    <div className="flex-shrink-0 mr-0">
                        <Button asChild className="bg-white dark:bg-white text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
                            <Link href="/localizacoes/criar">
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Localização
                            </Link>
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    data={localizacoes}
                    columns={columns}
                    emptyMessage="Nenhuma localização encontrada."
                />
            </div>
        </AppLayout>
    );
}
