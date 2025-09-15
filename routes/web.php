<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\EspacoController;
use App\Http\Controllers\LocalizacaoController;
use App\Http\Controllers\RecursoController;
use App\Http\Controllers\EspacoUserController;
use App\Http\Controllers\FotoController;
use App\Http\Controllers\AgendamentoController;
use App\Http\Controllers\notificacaoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $selectedDate = request('date');
        $day = $selectedDate ? \Carbon\Carbon::parse($selectedDate)->toDateString() : now()->toDateString();
        $userId = auth()->id();

        $agendamentosHoje = \App\Models\Agendamento::with(['espaco:id,nome'])
            ->where('user_id', $userId)
            ->whereIn('status', ['pendente', 'aprovado'])
            ->where(function ($q) use ($day) {
                $q->whereDate('data_inicio', '<=', $day)
                  ->whereDate('data_fim', '>=', $day);
            })
            ->orderBy('hora_inicio')
            ->get([
                'id',
                'titulo',
                'hora_inicio',
                'hora_fim',
                'status',
                'espaco_id',
                'color_index',
                'data_inicio',
                'data_fim',
                'user_id',
                'justificativa',
            ]);

        return Inertia::render('dashboard', [
            'agendamentosHoje' => $agendamentosHoje,
            'selectedDate' => $day,
        ]);
    })->name('dashboard');

    // Rotas para gerenciar usuários (APENAS para usuários com permissão de administrador)
    Route::middleware(['can-manage-users'])->group(function () {
        // Rotas de Usuários em português
        Route::get("usuarios", [UserController::class, "index"])->name("users.index");
        Route::get("usuarios/criar", [UserController::class, "create"])->name("users.create");
        Route::post("usuarios", [UserController::class, "store"])->name("users.store");
        Route::get("usuarios/{user}", [UserController::class, "show"])->name("users.show");
        Route::get("usuarios/{user}/editar", [UserController::class, "edit"])->name("users.edit");
        Route::put("usuarios/{user}", [UserController::class, "update"])->name("users.update");
        Route::delete("usuarios/{user}", [UserController::class, "destroy"])->name("users.destroy");
        Route::get('/usuarios/{id}/espacos', [EspacoUserController::class, 'getEspacosForUser']);
    });

    // Rotas para gerenciamento de espaços, localizações e recursos (APENAS Diretor Geral)
    Route::middleware(['diretor-geral'])->group(function () {
        // Rotas de Espaços em português
        Route::get("espacos", [EspacoController::class, "index"])->name("espacos.index");
        Route::get("espacos/criar", [EspacoController::class, "create"])->name("espacos.create");
        Route::post("espacos", [EspacoController::class, "store"])->name("espacos.store");
        Route::get("espacos/{espaco}", [EspacoController::class, "show"])->name("espacos.show");
        Route::get("espacos/{espaco}/editar", [EspacoController::class, "edit"])->name("espacos.edit");
        Route::put("espacos/{espaco}", [EspacoController::class, "update"])->name("espacos.update");
        Route::delete("espacos/{espaco}", [EspacoController::class, "destroy"])->name("espacos.destroy");

        // Rotas de Localizações em português
        Route::get("localizacoes/criar", [LocalizacaoController::class, "create"])->name("localizacoes.create");
        Route::get("localizacoes", [LocalizacaoController::class, "index"])->name("localizacoes.index");
        Route::get("localizacoes/{localizacao}", [LocalizacaoController::class, "show"])->name("localizacoes.show");
        Route::post("localizacoes", [LocalizacaoController::class, "store"])->name("localizacoes.store");
        Route::get("localizacoes/{localizacao}/editar", [LocalizacaoController::class, "edit"])->name("localizacoes.edit");
        Route::put("localizacoes/{localizacao}", [LocalizacaoController::class, "update"])->name("localizacoes.update");
        Route::delete("localizacoes/{localizacao}", [LocalizacaoController::class, "destroy"])->name("localizacoes.destroy");

        // Rotas de Recursos em português
        Route::get("recursos", [RecursoController::class, "index"])->name("recursos.index");
        Route::get("recursos/criar", [RecursoController::class, "create"])->name("recursos.create");
        Route::post("recursos", [RecursoController::class, "store"])->name("recursos.store");
        Route::get("recursos/{recurso}", [RecursoController::class, "show"])->name("recursos.show");
        Route::get("recursos/{recurso}/editar", [RecursoController::class, "edit"])->name("recursos.edit");
        Route::put("recursos/{recurso}", [RecursoController::class, "update"])->name("recursos.update");
        Route::delete("recursos/{recurso}", [RecursoController::class, "destroy"])->name("recursos.destroy");

        // Rotas de Atribuir Permissões em português
        Route::get("atribuir-permissoes", [EspacoUserController::class, "index"])->name("espaco-users.index");
        Route::get("atribuir-permissoes/criar", [EspacoUserController::class, "create"])->name("espaco-users.create");
        Route::post("atribuir-permissoes", [EspacoUserController::class, "store"])->name("espaco-users.store");
        Route::get("atribuir-permissoes/{espacoUser}", [EspacoUserController::class, "show"])->name("espaco-users.show");
        Route::get("atribuir-permissoes/{id}/criar", [EspacoUserController::class, "create"])->name("espaco-users.atribuir");
        Route::put("atribuir-permissoes/{espacoUser}", [EspacoUserController::class, "update"])->name("espaco-users.update");
        Route::delete("atribuir-permissoes/{espacoUser}", [EspacoUserController::class, "destroy"])->name("espaco-users.destroy");
        Route::get('/usuarios/{id}/espacos', [EspacoUserController::class, 'getEspacosForUser']);

        // Rotas de Fotos
        Route::resource('fotos', FotoController::class);
        Route::post('fotos/reorder', [FotoController::class, 'reorder'])->name('fotos.reorder');
    });

    // Rotas de Agendamentos (disponível para todos os usuários autenticados)
    Route::get("agendamentos", [AgendamentoController::class, "index"])->name("agendamentos.index");
    Route::get("agendamentos/criar", [AgendamentoController::class, "create"])->name("agendamentos.create");
    Route::post("agendamentos", [AgendamentoController::class, "store"])->name("agendamentos.store");
    Route::post("agendamentos/verificar-disponibilidade", [AgendamentoController::class, "verificarDisponibilidade"])->name("agendamentos.verificar-disponibilidade");
    Route::get("agendamentos/{agendamento}", [AgendamentoController::class, "show"])->name("agendamentos.show");
    Route::get("agendamentos/{agendamento}/editar", [AgendamentoController::class, "edit"])->name("agendamentos.edit");
    Route::put("agendamentos/{agendamento}", [AgendamentoController::class, "update"])->name("agendamentos.update");
    Route::delete("agendamentos/{agendamento}", [AgendamentoController::class, "destroy"])->name("agendamentos.destroy");
    Route::post("agendamentos/{agendamento}/descancelar", [AgendamentoController::class, "descancelar"])->name("agendamentos.descancelar");
    Route::delete("agendamentos/{agendamento}/force-delete", [AgendamentoController::class, "forceDelete"])->name("agendamentos.force-delete");

    // Redirecionamento da URL antiga para a nova (compatibilidade)
    // Route::get("gerenciar-agendamentos", function () {
    //     return redirect("/avaliar-agendamentos", 301);
    // })->middleware(['diretor-geral']);

    // Rotas de Avaliação e Gerenciamento de Agendamentos (Diretor Geral ou usuários com espaços atribuídos)
    Route::middleware(['can-manage-agendamentos'])->group(function () {
        Route::get("avaliar-agendamentos", [AgendamentoController::class, "gerenciar"])->name("agendamentos.avaliar");
        Route::post("agendamentos/{agendamento}/aprovar", [AgendamentoController::class, "aprovar"])->name("agendamentos.aprovar");
        Route::post("agendamentos/{agendamento}/rejeitar", [AgendamentoController::class, "rejeitar"])->name("agendamentos.rejeitar");

        // Rotas de Gerenciamento de Conflitos
        Route::get("gerenciar-agendamentos", [\App\Http\Controllers\GerenciarAgendamentosController::class, "index"])->name("agendamentos.gerenciar");
        Route::post("conflitos/resolver", [\App\Http\Controllers\GerenciarAgendamentosController::class, "resolverConflito"])->name("conflitos.resolver");
        Route::post("conflitos/rejeitar-todos", [\App\Http\Controllers\GerenciarAgendamentosController::class, "rejeitarTodosConflito"])->name("conflitos.rejeitar-todos");
        Route::get("conflitos/{grupoConflito}/detalhes", [\App\Http\Controllers\GerenciarAgendamentosController::class, "detalhesConflito"])->name("conflitos.detalhes");
        Route::get("conflitos/resolvidos-hoje", [\App\Http\Controllers\GerenciarAgendamentosController::class, "conflitosResolvidosHoje"])->name("conflitos.resolvidos-hoje");
    });

    // Rotas para Notificações
    Route::get('/notificacoes/user/{user_id}', [notificacaoController::class, 'getUserNotifications']);
    Route::put('/notificacoes/{notificacao_id}/read', [notificacaoController::class, 'markAsRead']);
    Route::delete('/notificacoes/{notificacao_id}', [notificacaoController::class, 'deleteNotification']);
    Route::get('/notificacoes/visualizar/{user_id}', [notificacaoController::class, 'index'])->name('notificacoes.index');
    Route::post('/notificacoes/user/{user_id}', [notificacaoController::class, 'notificaUser']);
    Route::post('/notificacoes/espaco/{espaco_id}/managers', [notificacaoController::class, 'notificaEspacoManagers']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
