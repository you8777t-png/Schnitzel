// --- CONFIGURAÇÃO DA NUVEM DO GOOGLE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyA8a0Gcw7DTZ4lyViUGvMcADK423OgDgTY",
    authDomain: "schnitzel-81f44.firebaseapp.com",
    projectId: "schnitzel-81f44",
    storageBucket: "schnitzel-81f44.firebasestorage.app",
    messagingSenderId: "416321660097",
    appId: "1:416321660097:web:6297caabf3cd6e453fe040"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let rankingGlobal = [];
let valorMercadoCripto = 50; 

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
    banco: saveAntigo.banco || 0, ultimaRenda: saveAntigo.ultimaRenda || Date.now(), pixPendentes: pixSeguros, missoesConcluidas: saveAntigo.missoesConcluidas || 0,
    cripto: saveAntigo.cripto || 0 
};

const profissoes = [
    { nvlMinimo: 1, nome: "Mendigo Digital", multiplicador: 1 }, { nvlMinimo: 3, nome: "Estafeta", multiplicador: 2.5 },
    { nvlMinimo: 5, nome: "Comerciante", multiplicador: 5 }, { nvlMinimo: 10, nome: "Banqueiro", multiplicador: 12 },
    { nvlMinimo: 20, nome: "Magnata", multiplicador: 30 }
];

const catalogoTrabalhos = [
    { id: "t1", nome: "Lavar Pratos", nvlReq: 1, min: 10, max: 30, cd: 5000, icone: "fa-sink", desc: "Rápido mas paga pouco." },
    { id: "t2", nome: "Entregar Encomendas", nvlReq: 3, min: 50, max: 150, cd: 15000, icone: "fa-motorcycle", desc: "Perigoso no trânsito." },
    { id: "t3", nome: "Investir na Bolsa", nvlReq: 5, min: 100, max: 400, cd: 30000, icone: "fa-chart-line", desc: "Mercado financeiro clássico." },
    { id: "t4", nome: "Programar Bot Discord", nvlReq: 10, min: 500, max: 1500, cd: 60000, icone: "fa-robot", desc: "JavaScript e muito café." },
    { id: "t5", nome: "Farmar Rota no MMO", nvlReq: 15, min: 2000, max: 5000, cd: 120000, icone: "fa-gamepad", desc: "Grindar experiência o dia todo." }
];

const itensLoja = [
    { id: "amuleto", nome: "Amuleto da Sorte", preco: 2500, icone: "fa-gem", desc: "Aumenta probabilidade no Casino para 50%." },
    { id: "relogio", nome: "Relógio Turbo", preco: 5000, icone: "fa-stopwatch", desc: "Corta tempo de espera de trabalhos pela metade." },
    { id: "licenca", nome: "Licença VIP", preco: 15000, icone: "fa-id-card", desc: "Duplica o dinheiro de qualquer trabalho." },
    { id: "offshore", nome: "Conta Offshore", preco: 5000000, icone: "fa-file-invoice-dollar", desc: "Proteção de 1 uso. Evita que a Receita Federal penhore o teu Banco." },
    { id: "cartao_black", nome: "Cartão Black Casino", preco: 25000000, icone: "fa-credit-card", desc: "Aumenta a probabilidade no Casino para 55%!" },
    { id: "servidor_quantico", nome: "Servidor Quântico", preco: 100000000, icone: "fa-server", desc: "Velocidade absurda: Reduz tempo de TODOS os trabalhos para 2s!" }
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

// --- FUNÇÕES GERAIS E BANCO DE DADOS ---
function atualizarBancoDeDados() {
    let dadosParaNuvem = { ...jogador };
    delete dadosParaNuvem.pixPendentes;
    dadosParaNuvem.fortunaTotal = dadosParaNuvem.saldo + dadosParaNuvem.banco + (dadosParaNuvem.cripto * valorMercadoCripto); 
    db.collection("contas_globais").doc(jogador.nome).set(dadosParaNuvem, { merge: true }).catch(e => console.error(e));
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
    let elNivel = document.getElementById('nivel-jogador'); if(elNivel) elNivel.innerText = jogador.nivel;
    
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
        if (jogador.avatar && jogador.avatar.trim() !== "") {
            containerAvatar.innerHTML = `<img src="${jogador.avatar.trim()}" class="avatar-img" onerror="this.outerHTML='<i class=\\'fa-solid fa-user-astronaut\\'></i>';">`;
        } else {
            containerAvatar.innerHTML = `<i class="fa-solid fa-user-astronaut"></i>`;
        }
    }

    let editNome = document.getElementById('edit-nome'); if(editNome) editNome.value = jogador.nome;
    let editSenha = document.getElementById('edit-senha'); if(editSenha) editSenha.value = jogador.senha;

    atualizarSelectTags(); verificarNotificacoesCelular(); verificarADM();
    if(document.getElementById('tela-trabalhar').classList.contains('ativa')) renderizarEmpregos();
}

function navegar(elementoClicado, idDaTela) {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.getElementById(idDaTela).classList.add('ativa');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('ativo'));
    if(elementoClicado && idDaTela !== 'tela-ranking') elementoClicado.classList.add('ativo');
    if (idDaTela === 'tela-loja') renderizarLoja();
    if (idDaTela === 'tela-perfil') renderizarInventario();
    if (idDaTela === 'tela-ranking') gerarRanking();
    if (idDaTela === 'tela-trabalhar') renderizarEmpregos();
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
    let avatarNovo = document.getElementById('edit-avatar') ? document.getElementById('edit-avatar').value.trim() : "";

    if(nomeNovo === "" || nomeNovo === "Visitante") return mostrarNotificacao("Nome inválido!", "info");

    // COLE AQUI O LINK (.jpg) DA LOGO DO BANCO CENTRAL QUE VOCÊ PEGOU
    let linkLogoBCS = "COLE_O_LINK_DA_FOTO_DO_BCS_AQUI";

    if (nomeNovo !== jogador.nome) {
        db.collection("contas_globais").doc(nomeNovo).get().then((doc) => {
            if (doc.exists) {
                let nuvem = doc.data();
                if (nuvem.senha !== senhaNova) return mostrarNotificacao("Palavra-passe incorreta!", "erro");
                
                jogador = nuvem; 
                if(jogador.cripto === undefined) jogador.cripto = 0; 
                
                if (jogador.nome !== "BancoCentral_Schnitzel" && avatarNovo !== "") {
                    jogador.avatar = avatarNovo;
                }
                if (jogador.nome === "BancoCentral_Schnitzel") jogador.avatar = linkLogoBCS;

                salvarDados();
                mostrarNotificacao(`Bem-vindo de volta, ${nomeNovo}!`, "ouro");
            } else {
                if (senhaNova === "") return mostrarNotificacao("Cria uma palavra-passe!", "erro");
                
                jogador = {
                    nome: nomeNovo, 
                    senha: senhaNova, 
                    avatar: (nomeNovo === "BancoCentral_Schnitzel" ? linkLogoBCS : avatarNovo), 
                    saldo: 0, lucroHoje: 0, 
                    nivel: (nomeNovo === "BancoCentral_Schnitzel" ? 999 : 1), 
                    acoes: 0, xp: 0, ultimoTrabalho: 0, inventario: [],
                    trabalhosFeitos: 0, vitoriasCassino: 0, derrotasCassino: 0, tagsDesbloqueadas: [], tagEquipada: "",
                    banco: 0, ultimaRenda: Date.now(), pixPendentes: [], missoesConcluidas: 0, cripto: 0
                };
                salvarDados(); 
                mostrarNotificacao(`Conta ${nomeNovo} criada na Nuvem!`, "sucesso");
            }
            atualizarTela(); atualizarBancoDeDados(); verificarADM();
        }).catch(e => { console.error(e); mostrarNotificacao("ERRO REAL: " + e.message, "erro"); });
    } else {
        if (jogador.nome === "BancoCentral_Schnitzel") {
            if (jogador.senha !== senhaNova) return mostrarNotificacao("A senha do Banco Central não pode ser alterada!", "erro");
            jogador.avatar = linkLogoBCS;
            mostrarNotificacao("Os dados do Banco Central são blindados!", "info");
        } else {
            jogador.senha = senhaNova; 
            if (avatarNovo !== "") jogador.avatar = avatarNovo;
            mostrarNotificacao("Perfil guardado na Nuvem!", "sucesso");
        }
        salvarDados(); atualizarTela(); atualizarBancoDeDados(); verificarADM();
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
    if (rankingGlobal.length === 0) { divRanking.innerHTML = '<p style="text-align:center; color: var(--texto-apagado);">A ligar aos satélites da base de dados...</p>'; return; }

    let bancoCentral = rankingGlobal.find(p => p.nome === "BancoCentral_Schnitzel");
    let jogadoresReais = rankingGlobal.filter(p => p.nome !== "BancoCentral_Schnitzel");

    if (bancoCentral) {
        let imgTag = bancoCentral.avatar && bancoCentral.avatar.trim() !== "" 
            ? `<img src="${bancoCentral.avatar}" style="width: 55px; height: 55px; border-radius: 50%; border: 2px solid var(--ouro); object-fit: cover;">` 
            : `<div style="width: 55px; height: 55px; border-radius: 50%; background: #333; display:flex; align-items:center; justify-content:center; border: 2px solid var(--ouro);"><i class="fa-solid fa-building-columns"></i></div>`;
        
        let divBC = document.createElement('div');
        divBC.style.cssText = "background: linear-gradient(45deg, #1a0033, #000); border: 1px solid var(--ouro); border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; margin-bottom: 25px; box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);";
        divBC.innerHTML = `
            ${imgTag}
            <div style="flex: 1;">
                <h3 style="color: var(--ouro); font-size: 1.1rem; text-transform: uppercase;">Reserva Federal (BCS$)</h3>
                <p style="color: var(--texto-apagado); font-size: 0.8rem;">Dinheiro Penhorado da População</p>
            </div>
            <div style="font-size: 1.2rem; font-weight: bold; color: #00ff88; text-shadow: 0 0 5px #00ff88;">S$ ${bancoCentral.fortunaTotal.toLocaleString('pt-PT')}</div>
        `;
        divRanking.appendChild(divBC);
    }

    jogadoresReais.forEach((p, index) => {
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

function renderizarEmpregos() {
    const mural = document.getElementById('mural-empregos'); if (!mural) return; mural.innerHTML = '';
    
    let agora = Date.now();
    let bloqueadoGeral = false;
    let tempoRestante = 0;

    if (jogador.ultimoTrabalhoInfo) {
        let tempoEspera = jogador.ultimoTrabalhoInfo.cd;
        
        if (jogador.inventario.includes("servidor_quantico")) {
            tempoEspera = 2000; 
        } else if (jogador.inventario.includes("relogio")) {
            tempoEspera = tempoEspera / 2;
        }

        if (agora - jogador.ultimoTrabalho < tempoEspera) {
            bloqueadoGeral = true;
            tempoRestante = Math.ceil((tempoEspera - (agora - jogador.ultimoTrabalho)) / 1000);
        }
    }

    catalogoTrabalhos.forEach(trab => {
        let nivelInsuficiente = jogador.nivel < trab.nvlReq;
        let blockText = nivelInsuficiente ? `Nvl Mínimo: ${trab.nvlReq}` : (bloqueadoGeral ? `Aguarde ${tempoRestante}s` : `Trabalhar`);
        let btnClasse = (nivelInsuficiente || bloqueadoGeral) ? "btn-desativado" : "btn-primario";
        
        let div = document.createElement('div'); div.className = 'item-loja';
        div.innerHTML = `
            <i class="fa-solid ${trab.icone}" style="color: var(--rosa);"></i>
            <div class="item-loja-info">
                <h3 style="color: ${nivelInsuficiente ? '#555' : 'var(--texto)'};">${trab.nome}</h3>
                <p style="color: var(--texto-apagado);">Paga: S$ ${trab.min} a ${trab.max}</p>
            </div>
            <button class="${btnClasse}" style="padding: 10px; font-size: 0.85rem; margin-top:0; width: 130px; text-align: center;" ${nivelInsuficiente || bloqueadoGeral ? 'disabled' : `onclick="executarTrabalho('${trab.id}')"`}>${blockText}</button>
        `;
        mural.appendChild(div);
    });

    if (bloqueadoGeral) {
        setTimeout(renderizarEmpregos, 1000); 
    }
}

function executarTrabalho(idTrabalho) {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta no Perfil primeiro!", "erro");
    let trab = catalogoTrabalhos.find(t => t.id === idTrabalho);
    let ganhoBase = Math.floor(Math.random() * (trab.max - trab.min + 1)) + trab.min;
    
    let ganhoTotal = Math.floor(ganhoBase * obterProfissao().multiplicador);
    if (jogador.inventario.includes("licenca")) ganhoTotal *= 2;

    jogador.saldo += ganhoTotal; jogador.lucroHoje += ganhoTotal; jogador.acoes += 1;
    jogador.trabalhosFeitos += 1; jogador.xp += 25; 
    jogador.ultimoTrabalho = Date.now(); jogador.ultimoTrabalhoInfo = { cd: trab.cd };

    verificarTags(); verificarNivel(); salvarDados(); atualizarTela(); renderizarEmpregos();
    mostrarNotificacao(`Trabalhaste e ganhaste S$ ${ganhoTotal.toLocaleString('pt-PT')}!`, 'sucesso'); 
    atualizarMissoesCelular(); 
}

function apostar() {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta primeiro!", "erro");
    let input = document.getElementById('valor-aposta'); if (!input) return;
    let valorAposta = parseInt(input.value);
    if (isNaN(valorAposta) || valorAposta <= 0) return mostrarNotificacao("Valor invÃ¡lido!", "info");
    if (valorAposta > jogador.saldo) return mostrarNotificacao("Saldo insuficiente!", "info");

    jogador.saldo -= valorAposta; jogador.acoes += 1;
    
    let limiteVitoria = 0.45;
    if (jogador.inventario.includes("cartao_black")) {
        limiteVitoria = 0.55;
    } else if (jogador.inventario.includes("amuleto")) {
        limiteVitoria = 0.50;
    }

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
                db.collection("contas_globais").doc(adm).set({ banco: firebase.firestore.FieldValue.increment(fatiaAdmin) }, { merge: true });
            }
        });
    }
    input.value = ''; verificarTags(); verificarNivel(); salvarDados(); atualizarTela(); atualizarMissoesCelular();
}

function verificarNivel() {
    let xpNecessario = jogador.nivel * 100; 
    if (jogador.xp >= xpNecessario) { jogador.xp -= xpNecessario; jogador.nivel += 1; mostrarNotificacao(`Level Up! NÃ­vel ${jogador.nivel}!`, 'ouro'); }
}

function verificarADM() {
    let appAdm = document.getElementById('app-icone-adm');
    if(appAdm) {
        if (jogador.nome === "Schnitzel" || jogador.nome === "DevSchnitzel" || jogador.nome === "Admin") { appAdm.style.display = "flex"; } 
        else { appAdm.style.display = "none"; }
    }
}

// --- COMANDOS DE MODERAÃ‡ÃƒO GLOBAL (ADM) ---
function admInjetarDinheiro() {
    jogador.saldo += 1000000; salvarDados(); atualizarTela();
    mostrarNotificacao("HACK: + S$ 1.000.000 injetados na conta!", "ouro");
}

function admDesbloquearTags() {
    listaTags.forEach(t => { if (!jogador.tagsDesbloqueadas.includes(t.id)) jogador.tagsDesbloqueadas.push(t.id); });
    salvarDados(); atualizarTela(); mostrarNotificacao("HACK: Todas as Tags desbloqueadas!", "ouro");
}

function admDarDinheiro() {
    let alvo = document.getElementById('adm-alvo').value.trim();
    if(!alvo) return mostrarNotificacao("Digita o nome de um jogador!", "info");
    let valor = prompt(`Quanto desejas injetar no BANCO de ${alvo}?`);
    if(!valor || isNaN(parseInt(valor))) return;

    if (alvo.toLowerCase() === jogador.nome.toLowerCase()) {
        jogador.banco += parseInt(valor); salvarDados(); atualizarTela(); atualizarTelaBanco();
        mostrarNotificacao(`S$ ${valor} injetados no teu prÃ³prio Banco!`, "sucesso");
        document.getElementById('adm-alvo').value = '';
    } else {
        db.collection("contas_globais").doc(alvo).get().then(doc => {
            if(!doc.exists) return mostrarNotificacao(`Conta "${alvo}" nÃ£o encontrada!`, "erro");
            db.collection("contas_globais").doc(alvo).update({ banco: firebase.firestore.FieldValue.increment(parseInt(valor)) })
            .then(() => { mostrarNotificacao(`S$ ${valor} injetados no Banco de ${alvo}!`, "sucesso"); document.getElementById('adm-alvo').value = ''; });
        });
    }
}

function admDarNivel() {
    let alvo = document.getElementById('adm-alvo').value.trim();
    if(!alvo) return mostrarNotificacao("Digita o nome de um jogador!", "info");
    
    if (alvo.toLowerCase() === jogador.nome.toLowerCase()) {
        jogador.nivel += 1; salvarDados(); atualizarTela();
        mostrarNotificacao("Deste Level Up a ti mesmo!", "ouro");
    } else {
        db.collection("contas_globais").doc(alvo).get().then(doc => {
            if(!doc.exists) return mostrarNotificacao(`Conta "${alvo}" nÃ£o encontrada!`, "erro");
            db.collection("contas_globais").doc(alvo).update({ nivel: firebase.firestore.FieldValue.increment(1) })
            .then(() => { mostrarNotificacao(`Deu Level Up em ${alvo}!`, "ouro"); });
        });
    }
}

function admZerarBanco() {
    let alvo = document.getElementById('adm-alvo').value.trim();
    if(!alvo) return mostrarNotificacao("Digita o nome de um jogador!", "info");
    if(confirm(`ATENÃ‡ÃƒO: Tens a certeza que queres ZERAR todo o dinheiro do banco de ${alvo}?`)) {
        if (alvo.toLowerCase() === jogador.nome.toLowerCase()) {
            jogador.banco = 0; salvarDados(); atualizarTela(); atualizarTelaBanco();
            mostrarNotificacao("Zeraste o teu prÃ³prio banco!", "erro");
            document.getElementById('adm-alvo').value = '';
        } else {
            db.collection("contas_globais").doc(alvo).get().then(doc => {
                if(!doc.exists) return mostrarNotificacao(`Conta "${alvo}" nÃ£o encontrada!`, "erro");
                db.collection("contas_globais").doc(alvo).update({ banco: 0 })
                .then(() => { mostrarNotificacao(`Banco de ${alvo} zerado com sucesso!`, "erro"); document.getElementById('adm-alvo').value = ''; });
            });
        }
    }
}

function admExcluirConta() {
    let alvo = document.getElementById('adm-alvo').value.trim();
    if(!alvo) return mostrarNotificacao("Digita o nome de um jogador!", "info");
    
    if (alvo.toLowerCase() === jogador.nome.toLowerCase()) {
        return mostrarNotificacao("NÃ£o podes apagar a tua prÃ³pria conta por aqui!", "erro");
    }
    if (alvo === "BancoCentral_Schnitzel") {
        return mostrarNotificacao("O Banco Central Ã© imortal!", "erro");
    }

    if(confirm(`ALERTA VERMELHO: Tens a certeza ABSOLUTA que queres APAGAR a conta "${alvo}" do servidor para sempre?`)) {
        db.collection("contas_globais").doc(alvo).get().then(doc => {
            if(!doc.exists) return mostrarNotificacao(`Conta "${alvo}" nÃ£o encontrada na Nuvem!`, "erro");
            
            db.collection("contas_globais").doc(alvo).delete()
            .then(() => { 
                mostrarNotificacao(`MÃFIA: A conta "${alvo}" foi apagada da existÃªncia!`, "sucesso"); 
                document.getElementById('adm-alvo').value = ''; 
            })
            .catch(e => mostrarNotificacao("Erro ao deletar! " + e.message, "erro"));
        });
    }
}

// --- FUNÃ‡Ã•ES DE APP (CELULAR) ---
function abrirCelular() { document.getElementById('modal-celular').style.display = 'flex'; abrirApp('app-home'); atualizarTelaBanco(); atualizarMissoesCelular(); atualizarTelaCripto(); }
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
            div.innerHTML = `<div><span style="font-size: 0.7rem; color: #adb5bd;">De: ${pix.de}</span><br><strong>S$ ${pix.valor}</strong></div><button class="btn-primario" style="margin:0; padding: 5px 10px; font-size: 0.8rem; background: #00ff88; color: black; border: none;" onclick="resgatarPix(${index})">Resgatar</button>`;
            areaPix.appendChild(div);
        });
    }
}

function depositar() {
    let input = prompt("Quanto desejas depositar? (Digita 'tudo' para depositar tudo)"); if (!input) return;
    let valor = input.toLowerCase() === 'tudo' ? jogador.saldo : parseInt(input);
    if (isNaN(valor) || valor <= 0) return mostrarNotificacao("Valor invÃ¡lido!", "info");
    if (valor > jogador.saldo) return mostrarNotificacao("NÃ£o tens tudo isso na carteira!", "info");
    jogador.saldo -= valor; jogador.banco += valor; salvarDados(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`Depositado S$ ${valor}!`, "sucesso");
}

function sacar() {
    let input = prompt("Quanto desejas sacar? (Digita 'tudo' para sacar tudo)"); if (!input) return;
    let valor = input.toLowerCase() === 'tudo' ? jogador.banco : parseInt(input);
    if (isNaN(valor) || valor <= 0) return mostrarNotificacao("Valor invÃ¡lido!", "info");
    if (valor > jogador.banco) return mostrarNotificacao("NÃ£o tens tudo isso no banco!", "info");
    jogador.banco -= valor; jogador.saldo += valor; salvarDados(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`Sacado S$ ${valor}!`, "sucesso");
}

function enviarPix() {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria uma conta primeiro!", "erro");
    let recebedor = document.getElementById('pix-nome').value.trim();
    let valor = parseInt(document.getElementById('pix-valor').value);
    
    if (recebedor === "" || isNaN(valor) || valor <= 0) return mostrarNotificacao("Preenche os dados corretamente!", "info");
    if (valor > jogador.saldo) return mostrarNotificacao("Saldo da carteira insuficiente!", "erro");
    if (recebedor.toLowerCase() === jogador.nome.toLowerCase()) return mostrarNotificacao("NÃ£o podes fazer PIX a ti mesmo!", "info");

    db.collection("contas_globais").doc(recebedor).get().then((docSnapshot) => {
        if (!docSnapshot.exists) { return mostrarNotificacao(`Conta "${recebedor}" nÃ£o existe!`, "erro"); }
        let dadosAlvo = docSnapshot.data();
        let pendentes = dadosAlvo.pixPendentes || [];
        pendentes.push({ de: jogador.nome, valor: valor });
        db.collection("contas_globais").doc(recebedor).update({ pixPendentes: pendentes }).then(() => {
            jogador.saldo -= valor; salvarDados(); atualizarTela(); atualizarTelaBanco();
            document.getElementById('pix-nome').value = ''; document.getElementById('pix-valor').value = '';
            mostrarNotificacao(`PIX de S$ ${valor} enviado para ${recebedor}!`, "sucesso");
        });
    }).catch(e => mostrarNotificacao("Erro de ligaÃ§Ã£o Ã  Nuvem!", "erro"));
}

function resgatarPix(index) {
    let pix = jogador.pixPendentes[index]; 
    jogador.saldo += pix.valor; 
    jogador.pixPendentes.splice(index, 1); 
    db.collection("contas_globais").doc(jogador.nome).update({ pixPendentes: jogador.pixPendentes });
    salvarDados(); atualizarTela(); atualizarTelaBanco(); mostrarNotificacao(`S$ ${pix.valor} resgatados!`, "ouro");
}

// --- CRIPTO, RENDIMENTO PASSIVO E RECEITA FEDERAL ---
setInterval(() => {
    let variacao = Math.floor(Math.random() * 41) - 20; 
    valorMercadoCripto += variacao;
    if (valorMercadoCripto < 5) valorMercadoCripto = 5; 
    if (valorMercadoCripto > 300) valorMercadoCripto -= 100; 

    let appCriptoAtivo = document.getElementById('app-cripto');
    if (appCriptoAtivo && appCriptoAtivo.classList.contains('ativa')) atualizarTelaCripto();

    let data = new Date(); let horas = data.getHours().toString().padStart(2, '0'); let min = data.getMinutes().toString().padStart(2, '0');
    let elHora = document.getElementById('hora-celular'); if(elHora) elHora.innerText = `${horas}:${min}`;
    
    let agora = Date.now(); let tempoPassado = agora - jogador.ultimaRenda;
    if (tempoPassado >= 60000 && jogador.banco > 0) {
        let minutos = Math.floor(tempoPassado / 60000); if (minutos > 120) minutos = 120; 
        
        let rendimento = Math.floor(jogador.banco * (0.02 * minutos));
        jogador.banco += rendimento; 
        jogador.ultimaRenda = agora;
        mostrarNotificacao(`Banco: S$ ${rendimento} de rendimento passivo!`, "ouro");

        if (jogador.nome !== "BancoCentral_Schnitzel" && jogador.banco >= 1000000) {
            if (Math.random() <= 0.15) { 
                if (jogador.inventario.includes("offshore")) {
                    jogador.inventario = jogador.inventario.filter(item => item !== "offshore");
                    mostrarNotificacao("A Receita Federal investigou-te, mas a tua Conta Offshore salvou-te! Defesa consumida.", "ouro");
                } else {
                    let valorPenhorado = Math.floor(jogador.banco * 0.40);
                    jogador.banco -= valorPenhorado;
                    
                    // COLE O LINK DA FOTO DO BCS AQUI NESSA LINHA:
                    let linkLogoBCS = "COLE_O_LINK_DA_FOTO_DO_BCS_AQUI";

                    db.collection("contas_globais").doc("BancoCentral_Schnitzel").set({
                        nome: "BancoCentral_Schnitzel", 
                        banco: firebase.firestore.FieldValue.increment(valorPenhorado),
                        fortunaTotal: firebase.firestore.FieldValue.increment(valorPenhorado),
                        avatar: linkLogoBCS, 
                        nivel: 999 
                    }, { merge: true });

                    mostrarNotificacao(`A Receita Federal penhorou S$ ${valorPenhorado.toLocaleString('pt-PT')} e enviou para o BCS$!`, "erro");
                }
            }
        }

        salvarDados(); 
        atualizarTela();
        let appBancoAtivo = document.getElementById('app-banco');
        if (appBancoAtivo && appBancoAtivo.classList.contains('ativa')) atualizarTelaBanco();
    }
}, 10000); 

function atualizarTelaCripto() {
    let displayPreco = document.getElementById('preco-cripto-tela');
    if(displayPreco) {
        displayPreco.innerText = `S$ ${valorMercadoCripto}`;
        displayPreco.style.color = valorMercadoCripto > 100 ? "#00ff88" : (valorMercadoCripto < 40 ? "#ff2a6d" : "#ffd700");
    }
    let displayMinhas = document.getElementById('minhas-criptos');
    if(displayMinhas) displayMinhas.innerText = jogador.cripto;
}

function comprarCripto() {
    if(jogador.nome === "Visitante") return mostrarNotificacao("Cria conta primeiro!", "erro");
    let qtd = parseInt(document.getElementById('qtd-cripto').value);
    if(isNaN(qtd) || qtd <= 0) return mostrarNotificacao("Quantidade invÃ¡lida!", "info");
    let custoTotal = qtd * valorMercadoCripto;
    if(jogador.saldo < custoTotal) return mostrarNotificacao(`Precisas de S$ ${custoTotal}!`, "erro");
    jogador.saldo -= custoTotal; jogador.cripto += qtd;
    salvarDados(); atualizarTela(); atualizarTelaCripto();
    mostrarNotificacao(`Compraste ${qtd} SNC por S$ ${custoTotal}!`, "sucesso");
    document.getElementById('qtd-cripto').value = '';
}

function venderCripto() {
    if(jogador.nome === "Visitante") return;
    let qtd = parseInt(document.getElementById('qtd-cripto').value);
    if(isNaN(qtd) || qtd <= 0) return mostrarNotificacao("Quantidade invÃ¡lida!", "info");
    if(jogador.cripto < qtd) return mostrarNotificacao("NÃ£o tens essa quantidade de SNC!", "erro");
    let ganhoTotal = qtd * valorMercadoCripto;
    jogador.cripto -= qtd; jogador.saldo += ganhoTotal;
    salvarDados(); atualizarTela(); atualizarTelaCripto();
    mostrarNotificacao(`Vendeste ${qtd} SNC por S$ ${ganhoTotal}!`, "ouro");
    document.getElementById('qtd-cripto').value = '';
}

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
    salvarDados(); atualizarTela(); atualizarMissoesCelular(); mostrarNotificacao(`MissÃ£o ConcluÃ­da! +S$ ${missao.recom}`, "ouro");
}

window.onload = function() {
    atualizarTela(); 
    let agora = Date.now();
    let tempoOfflineBanco = agora - jogador.ultimaRenda;
    if (tempoOfflineBanco >= 60000 && jogador.banco > 0) {
        let minutosOff = Math.floor(tempoOfflineBanco / 60000); if (minutosOff > 120) minutosOff = 120; 
        let rendimentoOff = Math.floor(jogador.banco * (0.02 * minutosOff));
        jogador.banco += rendimentoOff; jogador.ultimaRenda = agora;
        mostrarNotificacao(`Rendimento Offline: + S$ ${rendimentoOff}`, "ouro");
    }

    if(jogador.nome !== "Visitante") atualizarBancoDeDados();
    verificarADM();

    db.collection("contas_globais").orderBy("fortunaTotal", "desc").limit(50).onSnapshot((querySnapshot) => {
        rankingGlobal = [];
        querySnapshot.forEach((doc) => { rankingGlobal.push(doc.data()); });
        if (document.getElementById('tela-ranking').classList.contains('ativa')) gerarRanking();
    });

    if(jogador.nome !== "Visitante") {
        db.collection("contas_globais").doc(jogador.nome).onSnapshot((docSnapshot) => {
            if(docSnapshot.exists) {
                let nuvem = docSnapshot.data();
                let atualizou = false;
                
                if (nuvem.pixPendentes && JSON.stringify(nuvem.pixPendentes) !== JSON.stringify(jogador.pixPendentes)) {
                    if (nuvem.pixPendentes.length > jogador.pixPendentes.length) mostrarNotificacao("Acabaste de receber um PIX Global!", "ouro");
                    jogador.pixPendentes = nuvem.pixPendentes; atualizou = true;
                }
                
                if (nuvem.banco > jogador.banco) { jogador.banco = nuvem.banco; atualizou = true; }
                
                if(atualizou) {
                    localStorage.setItem('schnitzel_save_atual', JSON.stringify(jogador));
                    atualizarTela(); atualizarTelaBanco(); verificarNotificacoesCelular();
                }
            }
        });
    }
};