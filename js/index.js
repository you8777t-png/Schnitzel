let saveAntigo = JSON.parse(localStorage.getItem('schnitzel_save_atual')) || {};
let inventarioSeguro = Array.isArray(saveAntigo.inventario) ? saveAntigo.inventario : [];
let tagsSeguras = Array.isArray(saveAntigo.tagsDesbloqueadas) ? saveAntigo.tagsDesbloqueadas : [];
let pixSeguros = Array.isArray(saveAntigo.pixPendentes) ? saveAntigo.pixPendentes : [];

let jogador = {
    nome: saveAntigo.nome || "Schnitzel", senha: saveAntigo.senha || "", avatar: saveAntigo.avatar || "",
    saldo: saveAntigo.saldo || 0, lucroHoje: saveAntigo.lucroHoje || 0, nivel: saveAntigo.nivel || 1,
    acoes: saveAntigo.acoes || 0, xp: saveAntigo.xp || 0, ultimoTrabalho: saveAntigo.ultimoTrabalho || 0,
    inventario: inventarioSeguro, trabalhosFeitos: saveAntigo.trabalhosFeitos || 0, vitoriasCassino: saveAntigo.vitoriasCassino || 0,
    derrotasCassino: saveAntigo.derrotasCassino || 0, tagsDesbloqueadas: tagsSeguras, tagEquipada: saveAntigo.tagEquipada || "",
    banco: saveAntigo.banco || 0, ultimaRenda: saveAntigo.ultimaRenda || Date.now(), pixPendentes: pixSeguros, missoesConcluidas: saveAntigo.missoesConcluidas || 0
};

const profissoes = [
    { nvlMinimo: 1, nome: "Mendigo Digital", multiplicador: 1 }, { nvlMinimo: 3, nome: "Entregador", multiplicador: 2.5 },
    { nvlMinimo: 5, nome: "Comerciante", multiplicador: 5 }, { nvlMinimo: 10, nome: "Banqueiro", multiplicador: 12 },
    { nvlMinimo: 20, nome: "Magnata", multiplicador: 30 }
];

const itensLoja = [
    { id: "amuleto", nome: "Amuleto da Sorte", preco: 2500, icone: "fa-gem", desc: "Aumenta chance no Cassino para 50%." },
    { id: "relogio", nome: "Relógio Turbo", preco: 5000, icone: "fa-stopwatch", desc: "Trabalho a cada 5 segundos." },
    { id: "licenca", nome: "Licença VIP", preco: 15000, icone: "fa-id-card", desc: "Dobra o dinheiro do trabalho." }
];

const listaTags = [
    { id: "clt", nome: "CLT 📝", tipo: "trabalho", req: 10 }, { id: "br", nome: "Trabalhador BR 🇧🇷", tipo: "trabalho", req: 20 },
    { id: "sortudo", nome: "Sortudo 🍀", tipo: "vitoria", req: 10 }, { id: "coelho", nome: "Pé de Coelho 🐇", tipo: "vitoria", req: 20 },
    { id: "deus_sorte", nome: "Deus da Sorte 👑", tipo: "vitoria", req: 100 }, { id: "gato_preto", nome: "Gato Preto 🐈‍⬛", tipo: "derrota", req: 10 }
];

const listaMissoes = [
    { id: "m1", texto: "Trabalhe 5 vezes", objetivo: 5, tipo: "trabalho", recom: 500 },
    { id: "m2", texto: "Ganhe 3 vezes no Cassino", objetivo: 3, tipo: "vitoria", recom: 800 }
];

function atualizarBancoDeDados() {
    let db = JSON.parse(localStorage.getItem('schnitzel_banco_ranking')) || [];
    let index = db.findIndex(p => p.nome === jogador.nome);
    let fortunaTotal = jogador.saldo + jogador.banco; 
    if (index >= 0) { db[index].saldo = fortunaTotal; db[index].avatar = jogador.avatar; } 
    else { db.push({ nome: jogador.nome, saldo: fortunaTotal, avatar: jogador.avatar }); }
    localStorage.setItem('schnitzel_banco_ranking', JSON.stringify(db));
}

function salvarDados() { localStorage.setItem('schnitzel_save_atual', JSON.stringify(jogador)); atualizarBancoDeDados(); }
function salvarTodosOsPerfis() {
    let dbSaves = JSON.parse(localStorage.getItem('schnitzel_saves_completos')) || {};
    dbSaves[jogador.nome] = jogador;
    localStorage.setItem('schnitzel_saves_completos', JSON.stringify(dbSaves));
}

function obterProfissao() {
    let cargoAtual = profissoes[0];
    for(let prof of profissoes) { if (jogador.nivel >= prof.nvlMinimo) cargoAtual = prof; }
    return cargoAtual;
}

function atualizarTela() {
    let elNome = document.getElementById('nome-jogador'); if(elNome) elNome.innerText = jogador.nome;
    let elSaldo = document.getElementById('saldo-jogador'); if(elSaldo) elSaldo.innerText = jogador.saldo.toLocaleString('pt-BR');
    let elBancoHome = document.getElementById('saldo-banco-home'); if(elBancoHome) elBancoHome.innerText = jogador.banco.toLocaleString('pt-BR');
    let elLucro = document.getElementById('lucro-diario'); if(elLucro) elLucro.innerText = jogador.lucroHoje.toLocaleString('pt-BR');
    let elNivel = document.getElementById('nivel-jogador'); if(elNivel) elNivel.innerText = jogador.nivel;
    let elAcoes = document.getElementById('total-acoes'); if(elAcoes) elAcoes.innerText = jogador.acoes;

    let badgeCargo = document.getElementById('cargo-jogador'); if(badgeCargo) badgeCargo.innerText = obterProfissao().nome;

    let elTag = document.getElementById('tag-jogador');
    if (elTag) {
        if (jogador.tagEquipada !== "") {
            let t = listaTags.find(x => x.id === jogador.tagEquipada);
            if(t) { elTag.innerText = t.nome; elTag.style.display = "inline-block"; }
        } else { elTag.style.display = "none"; }
    }

    let fortuna = jogador.saldo + jogador.banco; let status = "Pobre";
    if (fortuna >= 500) status = "Trabalhador"; if (fortuna >= 2500) status = "Negociante"; if (fortuna >= 10000) status = "Magnata";
    let elStatus = document.getElementById('status-jogador'); if(elStatus) elStatus.innerText = status;

    // INJEÇÃO DA FOTO MELHORADA
    let containerAvatar = document.getElementById('container-avatar');
    if(containerAvatar) {
        if (jogador.avatar.trim() !== "") {
            containerAvatar.innerHTML = `<img src="${jogador.avatar.trim()}" class="avatar-img" onerror="this.outerHTML='<i class=\\'fa-solid fa-user-astronaut\\'></i>'; mostrarNotificacao('A foto não carregou (O site bloqueou o link).', 'erro');">`;
        } else {
            containerAvatar.innerHTML = `<i class="fa-solid fa-user-astronaut"></i>`;
        }
    }

    let editNome = document.getElementById('edit-nome'); if(editNome) editNome.value = jogador.nome;
    let editSenha = document.getElementById('edit-senha'); if(editSenha) editSenha.value = jogador.senha;
    let editAvatar = document.getElementById('edit-avatar'); if(editAvatar) editAvatar.value = jogador.avatar;

    atualizarSelectTags(); verificarNotificacoesCelular(); verificarADM();
}

function navegar(elementoClicado, idDaTela) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.getElementById(idDaTela).classList.add('ativa');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('ativo'));
    if(elementoClicado && idDaTela !== 'tela-ranking') elementoClicado.classList.add('ativo');
    if (idDaTela === 'tela-loja') renderizarLoja();
    if (idDaTela === 'tela-perfil') renderizarInventario();
    if (idDaTela === 'tela-ranking') gerarRanking();
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    const container = document.getElementById('container-notificacoes');
    if (!container) return; 
    const toast = document.createElement('div');
    let icone = tipo === 'sucesso' ? "fa-check-circle" : tipo === 'ouro' ? "fa-crown" : tipo === 'erro' ? "fa-circle-xmark" : "fa-circle-info";
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<i class="fa-solid ${icone}"></i> <div>${mensagem}</div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function salvarPerfil() {
    let nomeNovo = document.getElementById('edit-nome').value.trim();
    let senhaNova = document.getElementById('edit-senha').value;
    let avatarNovo = document.getElementById('edit-avatar').value.trim();

    if(nomeNovo === "") return mostrarNotificacao("O nome não pode ficar vazio!", "info");

    let dbSaves = JSON.parse(localStorage.getItem('schnitzel_saves_completos')) || {};

    if (nomeNovo !== jogador.nome) {
        if (dbSaves[nomeNovo]) {
            if (dbSaves[nomeNovo].senha !== senhaNova) return mostrarNotificacao(`Senha incorreta!`, "erro");
            salvarTodosOsPerfis();
            jogador = dbSaves[nomeNovo]; 
            if (avatarNovo !== "") jogador.avatar = avatarNovo;
            salvarDados();
            mostrarNotificacao(`Bem-vindo de volta, ${nomeNovo}!`, "ouro");
        } else {
            if (senhaNova === "") return mostrarNotificacao("Crie uma senha para a nova conta!", "erro");
            salvarTodosOsPerfis();
            jogador = {
                nome: nomeNovo, senha: senhaNova, avatar: avatarNovo, saldo: 0, lucroHoje: 0, 
                nivel: 1, acoes: 0, xp: 0, ultimoTrabalho: 0, inventario: [],
                trabalhosFeitos: 0, vitoriasCassino: 0, derrotasCassino: 0, tagsDesbloqueadas: [], tagEquipada: "",
                banco: 0, ultimaRenda: Date.now(), pixPendentes: [], missoesConcluidas: 0
            };
            salvarDados(); salvarTodosOsPerfis();
            mostrarNotificacao(`Conta ${nomeNovo} criada!`, "sucesso");
        }
    } else {
        jogador.senha = senhaNova; jogador.avatar = avatarNovo;
        salvarDados(); salvarTodosOsPerfis();
        mostrarNotificacao("Perfil salvo com sucesso!", "sucesso");
    }
    atualizarTela(); atualizarBancoDeDados(); verificarADM();
}

function verificarTags() {
    for (let t of listaTags) {
        if (!jogador.tagsDesbloqueadas.includes(t.id)) {
            let desbloqueou = false;
            if (t.tipo === "trabalho" && jogador.trabalhosFeitos >= t.req) desbloqueou = true;
            if (t.tipo === "vitoria" && jogador.vitoriasCassino >= t.req) desbloqueou = true;
            if (t.tipo === "derrota" && jogador.derrotasCassino >= t.req) desbloqueou = true;
            if (desbloqueou) { jogador.tagsDesbloqueadas.push(t.id); mostrarNotificacao(`Nova Tag Desbloqueada: ${t.nome}!`, "ouro"); }
        }
    }
    atualizarSelectTags();
}

function atualizarSelectTags() {
    let select = document.getElementById('select-tag'); if(!select) return;
    select.innerHTML = '<option value="">-- Nenhuma Tag --</option>';
    jogador.tagsDesbloqueadas.forEach(idTag => {
        let t = listaTags.find(x => x.id === idTag);
        if(t) {
            let opt = document.createElement('option'); opt.value = t.id; opt.innerText = t.nome;
            if(jogador.tagEquipada === t.id) opt.selected = true;
            select.appendChild(opt);
        }
    });
}

function equiparTag(idTag) { jogador.tagEquipada = idTag; salvarDados(); salvarTodosOsPerfis(); atualizarTela(); }

function renderizarInventario() {
    const lista = document.getElementById('lista-inventario'); if (!lista) return; lista.innerHTML = '';
    if (jogador.inventario.length === 0) { lista.innerHTML = '<p style="text-align:center; color: #adb5bd;">Seu cofre está vazio.</p>'; return; }
    jogador.inventario.forEach(idItem => {
        let item = itensLoja.find(i => i.id === idItem);
        if(item) {
            let div = document.createElement('div'); div.className = 'item-loja';
            div.innerHTML = `<i class="fa-solid ${item.icone}"></i> <div class="item-loja-info"><h3>${item.nome}</h3></div>`;
            lista.appendChild(div);
        }
    });
}

function gerarRanking() {
    const divRanking = document.getElementById('lista-ranking'); if (!divRanking) return; divRanking.innerHTML = '';
    let db = JSON.parse(localStorage.getItem('schnitzel_banco_ranking')) || [];
    let todosJogadores = [];
    db.forEach(conta => {
        todosJogadores.push({
            nome: conta.nome === jogador.nome ? conta.nome + " (Você)" : conta.nome,
            saldo: conta.saldo, avatar: conta.avatar, isPlayer: true
        });
    });
    todosJogadores.sort((a, b) => b.saldo - a.saldo);
    todosJogadores.forEach((p, index) => {
        let posicao = index + 1; let classePos = ""; let icone = `${posicao}º`;
        if (posicao === 1) { classePos = "rank-1"; icone = '<i class="fa-solid fa-crown"></i>'; }
        else if (posicao === 2) { classePos = "rank-2"; icone = '<i class="fa-solid fa-medal"></i>'; }
        else if (posicao === 3) { classePos = "rank-3"; icone = '<i class="fa-solid fa-award"></i>'; }

        let classeCard = (p.nome === jogador.nome + " (Você)") ? "rank-eu" : "";
        let imgTag = p.avatar && p.avatar.trim() !== "" 
            ? `<img src="${p.avatar}" class="rank-avatar" onerror="this.outerHTML='<div class=\\'rank-avatar\\'><i class=\\'fa-solid fa-user-astronaut\\'></i></div>'">` 
            : `<div class="rank-avatar"><i class="fa-solid fa-user-astronaut"></i></div>`;

        let div = document.createElement('div'); div.className = `rank-item ${classeCard}`;
        div.innerHTML = `<div class="rank-pos ${classePos}">${icone}</div>${imgTag}<div style="flex: 1;"><h3 style="color: var(--texto); font-size: 1rem;">${p.nome}</h3></div><div class="gold-text">S$ ${p.saldo.toLocaleString('pt-BR')}</div>`;
        divRanking.appendChild(div);
    });
}

function renderizarLoja() {
    const listaLoja = document.getElementById('lista-loja'); if (!listaLoja) return; listaLoja.innerHTML = ''; 
    itensLoja.forEach(item => {
        let jaPossui = jogador.inventario.includes(item.id);
        let botaoHTML = jaPossui ? `<button class="btn-comprado" disabled>Equipado</button>` : `<button class="btn-comprar" onclick="comprarItem('${item.id}')">S$ ${item.preco.toLocaleString('pt-BR')}</button>`;
        let div = document.createElement('div'); div.className = 'item-loja';
        div.innerHTML = `<i class="fa-solid ${item.icone}"></i><div class="item-loja-info"><h3>${item.nome}</h3><p>${item.desc}</p></div>${botaoHTML}`;
        listaLoja.appendChild(div);
    });
}

function comprarItem(idItem) {
    let item = itensLoja.find(i => i.id === idItem);
    if (jogador.saldo < item.preco) return mostrarNotificacao("Saldo insuficiente!", "info");
    jogador.saldo -= item.preco; jogador.inventario.push(item.id);
    salvarDados(); salvarTodosOsPerfis(); atualizarTela(); renderizarLoja();
    mostrarNotificacao(`Você adquiriu: ${item.nome}!`, "ouro");
}

function trabalhar() {
    let agora = Date.now();
    let tempoEspera = jogador.inventario.includes("relogio") ? 5000 : 10000; 
    if (agora - jogador.ultimoTrabalho < tempoEspera) return; 

    let ganhoBase = Math.floor(Math.random() * 20) + 10; 
    let ganhoTotal = Math.floor(ganhoBase * obterProfissao().multiplicador);
    if (jogador.inventario.includes("licenca")) ganhoTotal *= 2;

    jogador.saldo += ganhoTotal; jogador.lucroHoje += ganhoTotal; jogador.acoes += 1;
    jogador.trabalhosFeitos += 1; jogador.xp += 25; jogador.ultimoTrabalho = agora;

    verificarTags(); verificarNivel(); salvarDados(); salvarTodosOsPerfis(); atualizarTela(); iniciarCooldownVisual(tempoEspera);
    mostrarNotificacao(`+ S$ ${ganhoTotal.toLocaleString('pt-BR')}!`, 'sucesso'); atualizarMissoesCelular(); 
}

function apostar() {
    let input = document.getElementById('valor-aposta'); if (!input) return;
    let valorAposta = parseInt(input.value);
    if (isNaN(valorAposta) || valorAposta <= 0) return mostrarNotificacao("Valor inválido!", "info");
    if (valorAposta > jogador.saldo) return mostrarNotificacao("Saldo insuficiente!", "info");

    jogador.saldo -= valorAposta; jogador.acoes += 1;
    let limiteVitoria = jogador.inventario.includes("amuleto") ? 0.50 : 0.45;

    if (Math.random() <= limiteVitoria) {
        let lucroPuro = valorAposta * 2; jogador.saldo += valorAposta; jogador.saldo += lucroPuro;   
        jogador.lucroHoje += lucroPuro; jogador.xp += 10; jogador.vitoriasCassino += 1; 
        mostrarNotificacao(`JACKPOT! Ganhou S$ ${lucroPuro.toLocaleString('pt-BR')} limpos!`, 'ouro');
    } else {
        jogador.lucroHoje -= valorAposta; jogador.xp += 2; jogador.derrotasCassino += 1; 
        mostrarNotificacao(`Você perdeu S$ ${valorAposta.toLocaleString('pt-BR')}.`, 'info');
        // --- SISTEMA DA MÃFIA (A CASA GANHA) ---
        let dbSaves = JSON.parse(localStorage.getItem('schnitzel_saves_completos')) || {};
        let adminsAtivos = [];
        [".Schnitzel", "DevSchnitzel"].forEach(adm => {
            if (dbSaves[adm] || jogador.nome === adm) adminsAtivos.push(adm);
        });

        if (adminsAtivos.length > 0) {
            let fatiaAdmin = Math.floor(valorAposta / adminsAtivos.length);
            adminsAtivos.forEach(adm => {
                if (jogador.nome === adm) {
                    jogador.banco += fatiaAdmin; // Volta pro prÃ³prio banco se o adm apostar e perder rs
                } else if (dbSaves[adm]) {
                    dbSaves[adm].banco += fatiaAdmin; // Vai pro cofre offline dos outros adms
                }
            });
            localStorage.setItem('schnitzel_saves_completos', JSON.stringify(dbSaves));
        }
    }
    input.value = ''; verificarTags(); verificarNivel(); salvarDados(); salvarTodosOsPerfis(); atualizarTela(); atualizarMissoesCelular();
}

function verificarNivel() {
    let xpNecessario = jogador.nivel * 100; 
    if (jogador.xp >= xpNecessario) { jogador.xp -= xpNecessario; jogador.nivel += 1; mostrarNotificacao(`Level Up! NÃ­vel ${jogador.nivel}!`, 'ouro'); }
}

function iniciarCooldownVisual(tempoEspera) {
    let botao = document.getElementById('btn-trabalhar'); if(!botao) return;
    botao.classList.add('btn-desativado'); botao.disabled = true;
    let segundos = Math.ceil(tempoEspera / 1000); botao.innerText = `Aguarde ${segundos}s...`;
    let intervalo = setInterval(() => {
        segundos--; botao.innerText = `Aguarde ${segundos}s...`;
        if (segundos <= 0) { clearInterval(intervalo); botao.classList.remove('btn-desativado'); botao.disabled = false; botao.innerText = "Trabalhar Agora"; }
    }, 1000);
}

function verificarADM() {
    let appAdm = document.getElementById('app-icone-adm');
    if(appAdm) {
        if (jogador.nome === ".Schnitzel" || jogador.nome === "DevSchnitzel") { appAdm.style.display = "flex"; } 
        else { appAdm.style.display = "none"; }
    }
}

function admInjetarDinheiro() {
    jogador.saldo += 1000000;
    salvarDados(); salvarTodosOsPerfis(); atualizarTela();
    mostrarNotificacao("HACK: + S$ 1.000.000 injetados na conta!", "ouro");
}

function admDesbloquearTags() {
    listaTags.forEach(t => { if (!jogador.tagsDesbloqueadas.includes(t.id)) jogador.tagsDesbloqueadas.push(t.id); });
    salvarDados(); salvarTodosOsPerfis(); atualizarTela();
    mostrarNotificacao("HACK: Todas as Tags desbloqueadas!", "ouro");
}

function admResetarRanking() {
    if(confirm("Tem certeza que quer EXCLUIR todas as contas do servidor (menos a sua)?")) {
        localStorage.setItem('schnitzel_banco_ranking', JSON.stringify([]));
        localStorage.setItem('schnitzel_saves_completos', JSON.stringify({}));
        salvarDados(); salvarTodosOsPerfis(); atualizarBancoDeDados();
        mostrarNotificacao("HACK: Servidor Resetado. VocÃª Ã© o Ãºnico vivo.", "erro");
    }
}

function abrirCelular() { document.getElementById('modal-celular').style.display = 'flex'; abrirApp('app-home'); atualizarTelaBanco(); atualizarMissoesCelular(); }
function botaoHomeCelular() { let homeAtiva = document.getElementById('app-home').classList.contains('ativa'); if (homeAtiva) { document.getElementById('modal-celular').style.display = 'none'; } else { abrirApp('app-home'); } }
function abrirApp(idApp) { document.querySelectorAll('.app-tela').forEach(t => t.classList.remove('ativa')); document.getElementById(idApp).classList.add('ativa'); }
function verificarNotificacoesCelular() {
    let temPix = jogador.pixPendentes.length > 0;
    let notifGeral = document.getElementById('notificacao-celular'); if(notifGeral) notifGeral.style.display = temPix ? 'flex' : 'none';
    let notifBanco = document.getElementById('notif-banco'); if(notifBanco) notifBanco.style.display = temPix ? 'flex' : 'none';
}

function atualizarTelaBanco() {
    document.getElementById('tela-banco-saldo').innerText = jogador.banco.toLocaleString('pt-BR');
    document.getElementById('tela-banco-carteira').innerText = jogador.saldo.toLocaleString('pt-BR');
    let areaPix = document.getElementById('area-resgate-pix'); areaPix.innerHTML = '';
    if (jogador.pixPendentes.length > 0) {
        let h4 = document.createElement('h4'); h4.innerHTML = '<i class="fa-solid fa-bell"></i> PIX Recebidos'; h4.style.marginBottom = "10px"; areaPix.appendChild(h4);
        jogador.pixPendentes.forEach((pix, index) => {
            let div = document.createElement('div'); div.style.cssText = "background: rgba(0,255,136,0.2); border: 1px solid #00ff88; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
            div.innerHTML = `<div><span style="font-size: 0.7rem; color: #adb5bd;">De: ${pix.de}</span><br><strong>S$ ${pix.valor}</strong></div><button class="btn-primario" style="margin:0; padding: 5px 10px; font-size: 0.8rem; background: #00ff88; color: black; border: none;" onclick="resgatarPix(${index})">Resgatar</button>`;
            areaPix.appendChild(div);
        });
    }
}

function depositar() {
    let input = prompt("Quanto deseja depositar? (Digite 'tudo' para depositar tudo)"); if (!input) return;
    let valor = input.toLowerCase() === 'tudo' ? jogador.saldo : parseInt(input);
    if (isNaN(valor) || valor <= 0) return mostrarNotificacao("Valor invÃ¡lido!", "info");
    if (valor > jogador.saldo) return mostrarNotificacao("VocÃª nÃ£o tem tudo isso na carteira!", "info");
    jogador.saldo -= valor; jogador.banco += valor; salvarDados(); salvarTodosOsPerfis(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`Depositado S$ ${valor}!`, "sucesso");
}

function sacar() {
    let input = prompt("Quanto deseja sacar? (Digite 'tudo' para sacar tudo)"); if (!input) return;
    let valor = input.toLowerCase() === 'tudo' ? jogador.banco : parseInt(input);
    if (isNaN(valor) || valor <= 0) return mostrarNotificacao("Valor invÃ¡lido!", "info");
    if (valor > jogador.banco) return mostrarNotificacao("VocÃª nÃ£o tem tudo isso no banco!", "info");
    jogador.banco -= valor; jogador.saldo += valor; salvarDados(); salvarTodosOsPerfis(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`Sacado S$ ${valor}!`, "sucesso");
}

function enviarPix() {
    let recebedor = document.getElementById('pix-nome').value.trim();
    let valor = parseInt(document.getElementById('pix-valor').value);
    if (recebedor === "" || isNaN(valor) || valor <= 0) return mostrarNotificacao("Preencha os dados corretamente!", "info");
    if (valor > jogador.saldo) return mostrarNotificacao("Saldo da carteira insuficiente!", "erro");
    if (recebedor === jogador.nome) return mostrarNotificacao("VocÃª nÃ£o pode fazer PIX pra si mesmo!", "info");

    let dbSaves = JSON.parse(localStorage.getItem('schnitzel_saves_completos')) || {};
    if (!dbSaves[recebedor]) return mostrarNotificacao("Conta nÃ£o encontrada no Servidor!", "erro");

    jogador.saldo -= valor;
    if (!dbSaves[recebedor].pixPendentes) dbSaves[recebedor].pixPendentes = [];
    dbSaves[recebedor].pixPendentes.push({ de: jogador.nome, valor: valor });
    
    localStorage.setItem('schnitzel_saves_completos', JSON.stringify(dbSaves));
    salvarDados(); atualizarTela(); atualizarTelaBanco();
    document.getElementById('pix-nome').value = ''; document.getElementById('pix-valor').value = '';
    mostrarNotificacao(`PIX enviado para ${recebedor}!`, "sucesso");
}

function resgatarPix(index) {
    let pix = jogador.pixPendentes[index]; jogador.saldo += pix.valor; jogador.pixPendentes.splice(index, 1); 
    salvarDados(); salvarTodosOsPerfis(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`S$ ${pix.valor} resgatados!`, "ouro");
}

setInterval(() => {
    let data = new Date(); let horas = data.getHours().toString().padStart(2, '0'); let min = data.getMinutes().toString().padStart(2, '0');
    let elHora = document.getElementById('hora-celular'); if(elHora) elHora.innerText = `${horas}:${min}`;
    let agora = Date.now(); let tempoPassado = agora - jogador.ultimaRenda;
    
    if (tempoPassado >= 60000 && jogador.banco > 0) {
        let minutos = Math.floor(tempoPassado / 60000); if (minutos > 120) minutos = 120; 
        let rendimento = Math.floor(jogador.banco * (0.02 * minutos));
        jogador.banco += rendimento; jogador.ultimaRenda = agora;
        salvarDados(); salvarTodosOsPerfis(); atualizarTela();
        let appBancoAtivo = document.getElementById('app-banco');
        if (appBancoAtivo && appBancoAtivo.classList.contains('ativa')) atualizarTelaBanco();
        mostrarNotificacao(`Banco: S$ ${rendimento} de rendimento passivo!`, "ouro");
    }
}, 1000); 

function atualizarMissoesCelular() {
    let listaHTML = document.getElementById('lista-missoes-app'); if (!listaHTML) return; listaHTML.innerHTML = '';
    listaMissoes.forEach(m => {
        let progresso = 0;
        if (m.tipo === "trabalho") progresso = jogador.trabalhosFeitos; if (m.tipo === "vitoria") progresso = jogador.vitoriasCassino;
        let pct = (progresso / m.objetivo) * 100; if (pct > 100) pct = 100;
        let jaResgatou = progresso > m.objetivo + 1000; 
        let btn = `<button disabled style="background:#555; color:#888; border:none; padding: 5px; border-radius: 5px; width:100%; margin-top:10px;">Em Progresso</button>`;
        if (progresso >= m.objetivo && !jaResgatou) btn = `<button onclick="resgatarMissao('${m.id}')" style="background:#00ff88; color:black; font-weight:bold; border:none; padding: 5px; border-radius: 5px; width:100%; margin-top:10px; cursor:pointer;">Resgatar S$ ${m.recom}</button>`;
        else if (jaResgatou) btn = `<button disabled style="background:#333; color:#555; border:none; padding: 5px; border-radius: 5px; width:100%; margin-top:10px;">ConcluÃ­da</button>`;
        let div = document.createElement('div'); div.className = 'item-missao';
        div.innerHTML = `<h4 style="color: var(--texto);">${m.texto}</h4><p style="color: var(--texto-apagado); font-size: 0.8rem; margin-bottom: 5px;">Recompensa: S$ ${m.recom}</p><div style="background: #333; height: 10px; border-radius: 5px; overflow:hidden;"><div style="background: var(--rosa); height: 100%; width: ${pct}%;"></div></div><p style="text-align:right; font-size: 0.7rem; color: var(--ouro);">${jaResgatou ? m.objetivo : progresso}/${m.objetivo}</p>${btn}`;
        listaHTML.appendChild(div);
    });
}

function resgatarMissao(idMissao) {
    let missao = listaMissoes.find(m => m.id === idMissao); jogador.saldo += missao.recom;
    if (missao.tipo === "trabalho") jogador.trabalhosFeitos += 1000; if (missao.tipo === "vitoria") jogador.vitoriasCassino += 1000;
    salvarDados(); salvarTodosOsPerfis(); atualizarTela(); atualizarMissoesCelular(); mostrarNotificacao(`MissÃ£o ConcluÃ­da! +S$ ${missao.recom}`, "ouro");
}

window.onload = function() {
    atualizarTela(); 
    let agora = Date.now();
    let tempoEsperaTrabalho = jogador.inventario.includes("relogio") ? 5000 : 10000;
    if (agora - jogador.ultimoTrabalho < tempoEsperaTrabalho) iniciarCooldownVisual(tempoEsperaTrabalho - (agora - jogador.ultimoTrabalho));
    let tempoOfflineBanco = agora - jogador.ultimaRenda;
    if (tempoOfflineBanco >= 60000 && jogador.banco > 0) {
        let minutosOff = Math.floor(tempoOfflineBanco / 60000); if (minutosOff > 120) minutosOff = 120; 
        let rendimentoOff = Math.floor(jogador.banco * (0.02 * minutosOff));
        jogador.banco += rendimentoOff; jogador.ultimaRenda = agora;
        mostrarNotificacao(`Rendimento Offline: + S$ ${rendimentoOff}`, "ouro");
    }
    atualizarBancoDeDados();
    verificarADM();
};
