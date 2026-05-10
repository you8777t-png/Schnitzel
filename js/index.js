// --- CONFIGURAÇÃO DA NUVEM DO GOOGLE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyA8a0Gcw7DTZ4lyViUGvMcADK423OgDgTY",
    authDomain: "schnitzel-81f44.firebaseapp.com",
    projectId: "schnitzel-81f44",
    storageBucket: "schnitzel-81f44.firebasestorage.app",
    messagingSenderId: "416321660097",
    appId: "1:416321660097:web:6297caabf3cd6e453fe040"
};

// Iniciar Ligação à Base de Dados
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let rankingGlobal = [];

// --- SISTEMA LOCAL DO JOGADOR ---
let saveAntigo = JSON.parse(localStorage.getItem('schnitzel_save_atual')) || {};
let inventarioSeguro = Array.isArray(saveAntigo.inventario) ? saveAntigo.inventario : [];
let tagsSeguras = Array.isArray(saveAntigo.tagsDesbloqueadas) ? saveAntigo.tagsDesbloqueadas : [];
let pixSeguros = Array.isArray(saveAntigo.pixPendentes) ? saveAntigo.pixPendentes : [];

let jogador = {
    nome: saveAntigo.nome || "Visitante", senha: saveAntigo.senha || "", avatar: saveAntigo.avatar || "",
    saldo: saveAntigo.saldo || 0, lucroHoje: saveAntigo.lucroHoje || 0, nivel: saveAntigo.nivel || 1,
    acoes: saveAntigo.acoes || 0, xp: saveAntigo.xp || 0, ultimoTrabalho: saveAntigo.ultimoTrabalho || 0,
    inventario: inventarioSeguro, trabalhosFeitos: saveAntigo.trabalhosFeitos || 0, vitoriasCassino: saveAntigo.vitoriasCassino || 0,
    derrotasCassino: saveAntigo.derrotasCassino || 0, tagsDesbloqueadas: tagsSeguras, tagEquipada: saveAntigo.tagEquipada || "",
    banco: saveAntigo.banco || 0, ultimaRenda: saveAntigo.ultimaRenda || Date.now(), pixPendentes: pixSeguros, missoesConcluidas: saveAntigo.missoesConcluidas || 0
};

const profissoes = [
    { nvlMinimo: 1, nome: "Mendigo Digital", multiplicador: 1 }, { nvlMinimo: 3, nome: "Estafeta", multiplicador: 2.5 },
    { nvlMinimo: 5, nome: "Comerciante", multiplicador: 5 }, { nvlMinimo: 10, nome: "Banqueiro", multiplicador: 12 },
    { nvlMinimo: 20, nome: "Magnata", multiplicador: 30 }
];

const itensLoja = [
    { id: "amuleto", nome: "Amuleto da Sorte", preco: 2500, icone: "fa-gem", desc: "Aumenta probabilidade no Casino para 50%." },
    { id: "relogio", nome: "Relógio Turbo", preco: 5000, icone: "fa-stopwatch", desc: "Trabalho a cada 5 segundos." },
    { id: "licenca", nome: "Licença VIP", preco: 15000, icone: "fa-id-card", desc: "Duplica o dinheiro do trabalho." }
];

const listaTags = [
    { id: "clt", nome: "CLT 📝", tipo: "trabalho", req: 10 }, { id: "br", nome: "Trabalhador BR 🇧🇷", tipo: "trabalho", req: 20 },
    { id: "sortudo", nome: "Sortudo 🍀", tipo: "vitoria", req: 10 }, { id: "coelho", nome: "Pé de Coelho 🐇", tipo: "vitoria", req: 20 },
    { id: "deus_sorte", nome: "Deus da Sorte 👑", tipo: "vitoria", req: 100 }, { id: "gato_preto", nome: "Gato Preto 🐈‍⬛", tipo: "derrota", req: 10 }
];

const listaMissoes = [
    { id: "m1", texto: "Trabalha 5 vezes", objetivo: 5, tipo: "trabalho", recom: 500 },
    { id: "m2", texto: "Ganha 3 vezes no Casino", objetivo: 3, tipo: "vitoria", recom: 800 }
];

// --- FUNÇÕES DA BASE DE DADOS GLOBAL ---
function atualizarBancoDeDados() {
    let dadosParaNuvem = { ...jogador };
    delete dadosParaNuvem.pixPendentes;
    dadosParaNuvem.fortunaTotal = dadosParaNuvem.saldo + dadosParaNuvem.banco; 
    db.collection("contas_globais").doc(jogador.nome).set(dadosParaNuvem, { merge: true })
      .catch(e => console.error("Erro Nuvem:", e));
}

function salvarDados() { 
    localStorage.setItem('schnitzel_save_atual', JSON.stringify(jogador)); 
    if(jogador.nome !== "Visitante") atualizarBancoDeDados(); 
}

function obterProfissao() {
    let cargoAtual = profissoes[0];
    for(let prof of profissoes) { if (jogador.nivel >= prof.nvlMinimo) cargoAtual = prof; }
    return cargoAtual;
}

function atualizarTela() {
    let elNome = document.getElementById('nome-jogador'); if(elNome) elNome.innerText = jogador.nome;
    let elSaldo = document.getElementById('saldo-jogador'); if(elSaldo) elSaldo.innerText = jogador.saldo.toLocaleString('pt-PT');
    let elBancoHome = document.getElementById('saldo-banco-home'); if(elBancoHome) elBancoHome.innerText = jogador.banco.toLocaleString('pt-PT');
    let elLucro = document.getElementById('lucro-diario'); if(elLucro) elLucro.innerText = jogador.lucroHoje.toLocaleString('pt-PT');
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

    let containerAvatar = document.getElementById('container-avatar');
    if(containerAvatar) {
        if (jogador.avatar.trim() !== "") {
            containerAvatar.innerHTML = `<img src="${jogador.avatar.trim()}" class="avatar-img" onerror="this.outerHTML='<i class=\\'fa-solid fa-user-astronaut\\'></i>';">`;
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

    if(nomeNovo === "" || nomeNovo === "Visitante") return mostrarNotificacao("Nome inválido!", "info");

    if (nomeNovo !== jogador.nome) {
        db.collection("contas_globais").doc(nomeNovo).get().then((doc) => {
            if (doc.exists) {
                let nuvem = doc.data();
                if (nuvem.senha !== senhaNova) return mostrarNotificacao("Palavra-passe incorreta!", "erro");
                
                jogador = nuvem; 
                if (avatarNovo !== "") jogador.avatar = avatarNovo;
                salvarDados();
                mostrarNotificacao(`Bem-vindo de volta, ${nomeNovo}!`, "ouro");
            } else {
                if (senhaNova === "") return mostrarNotificacao("Cria uma palavra-passe!", "erro");
                jogador = {
                    nome: nomeNovo, senha: senhaNova, avatar: avatarNovo, saldo: 0, lucroHoje: 0, 
                    nivel: 1, acoes: 0, xp: 0, ultimoTrabalho: 0, inventario: [],
                    trabalhosFeitos: 0, vitoriasCassino: 0, derrotasCassino: 0, tagsDesbloqueadas: [], tagEquipada: "",
                    banco: 0, ultimaRenda: Date.now(), pixPendentes: [], missoesConcluidas: 0
                };
                salvarDados(); 
                mostrarNotificacao(`Conta ${nomeNovo} criada na Nuvem!`, "sucesso");
            }
            atualizarTela(); atualizarBancoDeDados(); verificarADM();
        }).catch(e => {
            console.error(e);
            mostrarNotificacao("ERRO REAL: " + e.message, "erro");
        });
    } else {
        jogador.senha = senhaNova; jogador.avatar = avatarNovo;
        salvarDados(); 
        mostrarNotificacao("Perfil guardado na Nuvem!", "sucesso");
        atualizarTela(); atualizarBancoDeDados(); verificarADM();
    }
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

function equiparTag(idTag) { jogador.tagEquipada = idTag; salvarDados(); atualizarTela(); }

function renderizarInventario() {
    const lista = document.getElementById('lista-inventario'); if (!lista) return; lista.innerHTML = '';
    if (jogador.inventario.length === 0) { lista.innerHTML = '<p style="text-align:center; color: #adb5bd;">O teu cofre está vazio.</p>'; return; }
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
    
    if (rankingGlobal.length === 0) {
        divRanking.innerHTML = '<p style="text-align:center; color: var(--texto-apagado);">A ligar aos satélites da base de dados...</p>';
        return;
    }

    rankingGlobal.forEach((p, index) => {
        let posicao = index + 1; let classePos = ""; let icone = `${posicao}º`;
        if (posicao === 1) { classePos = "rank-1"; icone = '<i class="fa-solid fa-crown"></i>'; }
        else if (posicao === 2) { classePos = "rank-2"; icone = '<i class="fa-solid fa-medal"></i>'; }
        else if (posicao === 3) { classePos = "rank-3"; icone = '<i class="fa-solid fa-award"></i>'; }

        let classeCard = (p.nome === jogador.nome) ? "rank-eu" : "";
        let nomeDisplay = (p.nome === jogador.nome) ? p.nome + " (Tu)" : p.nome;
        let imgTag = p.avatar && p.avatar.trim() !== "" 
            ? `<img src="${p.avatar}" class="rank-avatar" onerror="this.outerHTML='<div class=\\'rank-avatar\\'><i class=\\'fa-solid fa-user-astronaut\\'></i></div>'">` 
            : `<div class="rank-avatar"><i class="fa-solid fa-user-astronaut"></i></div>`;

        let div = document.createElement('div'); div.className = `rank-item ${classeCard}`;
        div.innerHTML = `<div class="rank-pos ${classePos}">${icone}</div>${imgTag}<div style="flex: 1;"><h3 style="color: var(--texto); font-size: 1rem;">${nomeDisplay}</h3></div><div class="gold-text">S$ ${p.fortunaTotal.toLocaleString('pt-PT')}</div>`;
        divRanking.appendChild(div);
    });
}

function renderizarLoja() {
    const listaLoja = document.getElementById('lista-loja'); if (!listaLoja) return; listaLoja.innerHTML = ''; 
    itensLoja.forEach(item => {
        let jaPossui = jogador.inventario.includes(item.id);
        let botaoHTML = jaPossui ? `<button class="btn-comprado" disabled>Equipado</button>` : `<button class="btn-comprar" onclick="comprarItem('${item.id}')">S$ ${item.preco.toLocaleString('pt-PT')}</button>`;
        let div = document.createElement('div'); div.className = 'item-loja';
        div.innerHTML = `<i class="fa-solid ${item.icone}"></i><div class="item-loja-info"><h3>${item.nome}</h3><p>${item.desc}</p></div>${botaoHTML}`;
        listaLoja.appendChild(div);
    });
}

function comprarItem(idItem) {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta primeiro!", "erro");
    let item = itensLoja.find(i => i.id === idItem);
    if (jogador.saldo < item.preco) return mostrarNotificacao("Saldo insuficiente!", "info");
    jogador.saldo -= item.preco; jogador.inventario.push(item.id);
    salvarDados(); atualizarTela(); renderizarLoja();
    mostrarNotificacao(`Adquiriste: ${item.nome}!`, "ouro");
}

function trabalhar() {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta no Perfil primeiro!", "erro");
    let agora = Date.now();
    let tempoEspera = jogador.inventario.includes("relogio") ? 5000 : 10000; 
    if (agora - jogador.ultimoTrabalho < tempoEspera) return; 

    let ganhoBase = Math.floor(Math.random() * 20) + 10; 
    let ganhoTotal = Math.floor(ganhoBase * obterProfissao().multiplicador);
    if (jogador.inventario.includes("licenca")) ganhoTotal *= 2;

    jogador.saldo += ganhoTotal; jogador.lucroHoje += ganhoTotal; jogador.acoes += 1;
    jogador.trabalhosFeitos += 1; jogador.xp += 25; jogador.ultimoTrabalho = agora;

    verificarTags(); verificarNivel(); salvarDados(); atualizarTela(); iniciarCooldownVisual(tempoEspera);
    mostrarNotificacao(`+ S$ ${ganhoTotal.toLocaleString('pt-PT')}!`, 'sucesso'); atualizarMissoesCelular(); 
}

function apostar() {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta primeiro!", "erro");
    let input = document.getElementById('valor-aposta'); if (!input) return;
    let valorAposta = parseInt(input.value);
    if (isNaN(valorAposta) || valorAposta <= 0) return mostrarNotificacao("Valor inválido!", "info");
    if (valorAposta > jogador.saldo) return mostrarNotificacao("Saldo insuficiente!", "info");

    jogador.saldo -= valorAposta; jogador.acoes += 1;
    let limiteVitoria = jogador.inventario.includes("amuleto") ? 0.50 : 0.45;

    if (Math.random() <= limiteVitoria) {
        let lucroPuro = valorAposta * 2; jogador.saldo += valorAposta; jogador.saldo += lucroPuro;   
        jogador.lucroHoje += lucroPuro; jogador.xp += 10; jogador.vitoriasCassino += 1; 
        mostrarNotificacao(`JACKPOT! Ganhaste S$ ${lucroPuro.toLocaleString('pt-PT')} limpos!`, 'ouro');
    } else {
        jogador.lucroHoje -= valorAposta; jogador.xp += 2; jogador.derrotasCassino += 1; 
        mostrarNotificacao(`Perdeste S$ ${valorAposta.toLocaleString('pt-PT')}.`, 'info');

        let admins = ["Schnitzel", "DevSchnitzel", "Admin"];
        let fatiaAdmin = Math.floor(valorAposta / admins.length);
        admins.forEach(adm => {
            if (jogador.nome === adm) {
                jogador.banco += fatiaAdmin;
            } else {
                db.collection("contas_globais").doc(adm).set({
                    banco: firebase.firestore.FieldValue.increment(fatiaAdmin)
                }, { merge: true });
            }
        });
    }
    input.value = ''; verificarTags(); verificarNivel(); salvarDados(); atualizarTela(); atualizarMissoesCelular();
}

function verificarNivel() {
    let xpNecessario = jogador.nivel * 100; 
    if (jogador.xp >= xpNecessario) { jogador.xp -= xpNecessario; jogador.nivel += 1; mostrarNotificacao(`Level Up! Nível ${jogador.nivel}!`, 'ouro'); }
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
        if (jogador.nome === "Schnitzel" || jogador.nome === "DevSchnitzel" || jogador.nome === "Admin") { appAdm.style.display = "flex"; } 
        else { appAdm.style.display = "none"; }
    }
}

function admInjetarDinheiro() {
    jogador.saldo += 1000000; salvarDados(); atualizarTela();
    mostrarNotificacao("HACK: + S$ 1.000.000 injetados na conta!", "ouro");
}

function admDesbloquearTags() {
    listaTags.forEach(t => { if (!jogador.tagsDesbloqueadas.includes(t.id)) jogador.tagsDesbloqueadas.push(t.id); });
    salvarDados(); atualizarTela(); mostrarNotificacao("HACK: Todas as Tags desbloqueadas!", "ouro");
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
    document.getElementById('tela-banco-saldo').innerText = jogador.banco.toLocaleString('pt-PT');
    document.getElementById('tela-banco-carteira').innerText = jogador.saldo.toLocaleString('pt-PT');
    let areaPix = document.getElementById('area-resgate-pix'); areaPix.innerHTML = '';
    if (jogador.pixPendentes.length > 0) {
        let h4 = document.createElement('h4'); h4.innerHTML = '<i class="fa-solid fa-bell"></i> PIX Recebidos da Nuvem'; h4.style.marginBottom = "10px"; areaPix.appendChild(h4);
        jogador.pixPendentes.forEach((pix, index) => {
            let div = document.createElement('div'); div.style.cssText = "background: rgba(0,255,136,0.2); border: 1px solid #00ff88; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
            div.innerHTML = `<div><span style="font-size: 0.7rem; color: #adb5bd;">De: ${pix.de}</span><br><strong>S$ ${pix.valor}</strong></div><button c