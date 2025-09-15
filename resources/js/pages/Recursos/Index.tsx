import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useToastDismissOnClick } from '@/hooks/use-toast-dismiss-on-click';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type User, type Recurso, type BreadcrumbItem } from '@/types';
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

interface RecursosIndexProps {
    auth: {
        user: User;
    };
    recursos: Recurso[];
}

export default function RecursosIndex({ auth, recursos }: RecursosIndexProps) {
    const { toast } = useToast();
    useToastDismissOnClick(); // Hook para dismissar toast ao clicar em botões

    const handleDelete = (recurso: Recurso) => {
        router.delete(`/recursos/${recurso.id}`, {
            onSuccess: () => {
                toast({
                    title: "Recurso excluído com sucesso!",
                    description: `O recurso ${recurso.nome} foi removido do sistema.`,
                    variant: "success",
                    duration: 5000, // 5 segundos
                });
            },
            onError: () => {
                toast({
                    title: "Erro ao excluir recurso",
                    description: "Ocorreu um erro ao executar a ação, verifique os campos",
                    variant: "destructive",
                    duration: 5000, // 5 segundos
                });
            }
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'disponivel':
                return 'default';
            case 'manutencao':
                return 'destructive';
            case 'indisponivel':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'disponivel':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'manutencao':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'indisponivel':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'disponivel':
                return <CheckCircle className="h-4 w-4" />;
            case 'manutencao':
                return <AlertTriangle className="h-4 w-4" />;
            case 'indisponivel':
                return <XCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const formatStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'disponivel':
                return 'Disponível';
            case 'manutencao':
                return 'Manutenção';
            case 'indisponivel':
                return 'Indisponível';
            default:
                return status;
        }
    };

    const columns: ColumnConfig[] = [
        {
            key: 'nome',
            label: 'Nome',
            render: (value, recurso) => (
                <div className="flex items-center gap-2 font-medium">
                    <Package className="h-4 w-4 text-gray-500" />
                    {value}
                </div>
            )
        },
        {
            key: 'marca_modelo',
            label: 'Marca/Modelo',
            getValue: (recurso) => {
                return recurso.marca && recurso.modelo
                    ? `${recurso.marca} - ${recurso.modelo}`
                    : recurso.marca || recurso.modelo || 'Não informado';
            }
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'disponivel', label: 'Disponível' },
                { value: 'manutencao', label: 'Manutenção' },
                { value: 'indisponivel', label: 'Indisponível' }
            ],
            render: (value, recurso) => (
                <Badge
                    variant={getStatusVariant(recurso.status)}
                    className={`${getStatusColor(recurso.status)} flex items-center gap-1 w-fit`}
                >
                    {getStatusIcon(recurso.status)}
                    {formatStatus(recurso.status)}
                </Badge>
            )
        },
        {
            key: 'tipo',
            label: 'Tipo',
            type: 'select',
            options: [
                { value: 'true', label: 'Fixo' },
                { value: 'false', label: 'Móvel' }
            ],
            getValue: (recurso) => recurso.fixo ? 'true' : 'false',
            render: (value, recurso) => (
                <Badge
                    variant={recurso.fixo ? 'default' : 'outline'}
                    className={
                        recurso.fixo
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                    }
                >
                    {recurso.fixo ? 'Fixo' : 'Móvel'}
                </Badge>
            )
        },
        {
            key: 'acoes',
            label: 'Ações',
            searchable: false,
            sortable: false,
            render: (value, recurso) => (
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
                                <Link href={`/recursos/${recurso.id}/editar`}>
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
                                    Tem certeza que deseja excluir o recurso {recurso.nome}?
                                    Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(recurso)}
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
        { title: 'Recursos', href: '/recursos' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recursos" />

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex-1">
                   <h1 className="text-3xl font-bold text-black dark:text-white">Recursos</h1>
                    </div>
                    <div className="flex-shrink-0 mr-6">
                       <Button asChild className="bg-white dark:bg-white text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-200 cursor-pointer transition-colors">
                            <Link href="/recursos/criar">
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Recurso
                            </Link>
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    data={recursos}
                    columns={columns}
                    emptyMessage="Nenhum recurso encontrado."
                />
            </div>
        </AppLayout>
    );
}