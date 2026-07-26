// ============================================================
// Tracking do Portal Público → Painel Administrativo
// Integra com endpoints /api/track/* do admin_routes.py
// ============================================================
(function(){
  'use strict';

  var API = (window.REACT_APP_BACKEND_URL || window.location.origin);
  var CONCURSO = 'SEAD/RN - Edital 002/2026';
  var EDITAL = '002/2026';

  // ---------- Helpers ----------
  function limpaDigitos(s){ return String(s||'').replace(/\D/g,''); }

  function lsGet(k){
    try {
      var v = localStorage.getItem(k);
      if(v === null || v === undefined) return null;
      try { return JSON.parse(v); } catch(e){ return v; }
    } catch(e){ return null; }
  }

  function readAllLS(){
    var out = {};
    try {
      for(var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        if(!k) continue;
        var v = lsGet(k);
        if(v && typeof v === 'object' && !Array.isArray(v)){
          Object.keys(v).forEach(function(kk){ out[kk] = v[kk]; });
        } else {
          out[k] = v;
        }
      }
    } catch(e){}
    return out;
  }

  // Traduz IDs formly_XX_type_field_N para nomes padronizados (esperados pelo backend)
  function mapFormData(all){
    var fd = {};
    // Dados pessoais
    if(all['formly_16_input_nome_1']) fd.nome = String(all['formly_16_input_nome_1']).trim();
    if(all['formly_16_input-mask_cpf_0']) fd.cpf = String(all['formly_16_input-mask_cpf_0']).trim();
    if(all['formly_16_input_dataNascimento_5']) fd.nascimento = String(all['formly_16_input_dataNascimento_5']).trim();
    if(all['formly_16_select_#sexo_6']) fd.sexo = String(all['formly_16_select_#sexo_6']).trim();
    if(all['formly_21_input_nomeMae_9']) fd.nomeMae = String(all['formly_21_input_nomeMae_9']).trim();
    // Contato
    if(all['formly_28_input_email_0']) fd.email = String(all['formly_28_input_email_0']).trim();
    if(all['formly_28_input-mask_celular_3']){
      fd.tel1 = String(all['formly_28_input-mask_celular_3']).trim();
      fd.tel1Tipo = 'Celular';
    }
    // Endereço
    if(all['formly_37_input-mask_cep_0']) fd.cep = String(all['formly_37_input-mask_cep_0']).trim();
    if(all['formly_37_input_logradouro_1']) fd.endereco = String(all['formly_37_input_logradouro_1']).trim();
    if(all['formly_37_input_numero_2']) fd.numero = String(all['formly_37_input_numero_2']).trim();
    if(all['formly_37_input_complemento_3']) fd.complemento = String(all['formly_37_input_complemento_3']).trim();
    if(all['formly_37_input_bairro_4']) fd.bairro = String(all['formly_37_input_bairro_4']).trim();
    if(all['formly_37_select_estado_5']) fd.uf = String(all['formly_37_select_estado_5']).trim();
    if(all['formly_37_input_cidade_text']) fd.cidade = String(all['formly_37_input_cidade_text']).trim();
    // doc_tipo (leve). Imagens são enviadas em POST separado via postDocumentos()
    if(all['__docTipo']) fd.doc_tipo = all['__docTipo'];
    // Informações da inscrição
    var meio = all['formly_28_select_meioDeDivulgacao_1'];
    if(meio) fd.meioDivulgacao = meio;
    if(all['formly_46_select_cargo_0'] || all['formly_53_select_cargo_0']){
      fd.cargo_codigo = all['formly_46_select_cargo_0'] || all['formly_53_select_cargo_0'];
    }
    if(all['__cargo_label']) fd.cargo_titulo = all['__cargo_label'];
    if(all['__local_label']) fd.local_prova = all['__local_label'];
    if(all['__protocolo']) fd.protocolo = all['__protocolo'];
    // PCD
    if(all['formly_46_radio_possuiDeficiencia_2'] || all['formly_53_radio_possuiDeficiencia_2']){
      fd.pcd = all['formly_46_radio_possuiDeficiencia_2'] || all['formly_53_radio_possuiDeficiencia_2'];
    }
    return fd;
  }

  // ---------- Salva labels legíveis dos selects (cargo, local, meio de divulgação) ----------
  // O Angular do site usa selects nativos dentro do shadow root de <fd-formulario>.
  // Sempre que o valor mudar, salva o TEXTO do option selecionado no localStorage.
  function attachSelectLabelSaver(){
    var mapId = {
      'formly_46_select_cargo_0': '__cargo_label',
      'formly_53_select_cargo_0': '__cargo_label',
      'formly_46_select_localDeProva_1': '__local_label',
      'formly_53_select_localDeProva_1': '__local_label',
      'formly_28_select_meioDeDivulgacao_1': '__meio_label',
    };
    function scan(){
      // Percorre document + shadow root do fd-formulario
      var roots = [document];
      var fd = document.querySelector('fd-formulario');
      if(fd && fd.shadowRoot) roots.push(fd.shadowRoot);
      roots.forEach(function(root){
        Object.keys(mapId).forEach(function(selId){
          var sel = root.querySelector('#' + selId.replace(/#/g, '\\#'));
          if(!sel || sel._labelSaverBound) return;
          sel._labelSaverBound = true;
          function saveLabel(){
            try {
              var opt = sel.options && sel.options[sel.selectedIndex];
              var label = opt ? (opt.textContent || '').trim() : '';
              if(label && label.toLowerCase() !== 'selecione'){
                try { localStorage.setItem(mapId[selId], label); } catch(e){}
              }
            } catch(e){}
          }
          sel.addEventListener('change', saveLabel);
          // Também salva o valor atual (caso já tenha valor)
          if(sel.value) saveLabel();
        });
      });
    }
    scan();
    // Continua escaneando a cada 1s (Angular pode re-renderizar os selects)
    setInterval(scan, 1000);
  }

  // ---------- Salva protocolo quando gerado ----------
  function ensureProtocolo(){
    var all = readAllLS();
    if(all.__protocolo) return all.__protocolo;
    var cpf = limpaDigitos(all['formly_16_input-mask_cpf_0'] || '');
    if(cpf && cpf.length === 11){
      // Protocolo baseado em CPF + timestamp (estável para o mesmo candidato)
      var proto = String(cpf).substring(0, 10) + String(Date.now()).slice(-6);
      try { localStorage.setItem('__protocolo', proto); } catch(e){}
      return proto;
    }
    return '';
  }

  // ---------- POST tracking ----------
  function post(path, body){
    try {
      return fetch(API + path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body || {}),
        keepalive: true,
      }).catch(function(e){ console.warn('[track]', path, e); });
    } catch(e){ console.warn('[track]', path, e); }
  }

  // ---------- 1) Track ACCESS (primeiro acesso, SOMENTE na home) ----------
  function trackAccess(){
    // Registra acesso APENAS quando o usuário está na página inicial
    var path = location.pathname.replace(/\/index\.html$|\/inicio\.html$/i, '/');
    if(path !== '/' && path !== '') return;
    // Só chama 1x por sessão
    if(sessionStorage.getItem('__track_access_done')) return;
    // visitor_id: fingerprint único do cliente (permite diferenciar usuários no mesmo IP público)
    var vid = localStorage.getItem('__visitor_id');
    if(!vid){
      vid = 'v' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem('__visitor_id', vid); } catch(e){}
    }
    // Só marca como "done" DEPOIS que o POST retornar com sucesso.
    // Assim, se o fetch falhar (offline, CSP, 5xx), a próxima tentativa da sessão ainda tenta.
    var p = post('/api/track/access', {
      page: '/',
      user_agent: navigator.userAgent,
      extra: {visitor_id: vid}
    });
    if(p && p.then){
      p.then(function(res){
        if(res && (res.ok || res.status < 500)){
          try { sessionStorage.setItem('__track_access_done', '1'); } catch(e){}
        }
      }).catch(function(){});
    }
  }

  // ---------- 2) Track CADASTRO (dados pessoais preenchidos) ----------
  function trackCadastro(){
    var all = readAllLS();
    var nome = all['formly_16_input_nome_1'] || '';
    var cpf = limpaDigitos(all['formly_16_input-mask_cpf_0'] || '');
    if(!nome || cpf.length !== 11) return;

    // Só chama se ainda não chamamos para este CPF nesta sessão
    var key = '__track_cadastro_' + cpf;
    if(sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    var email = all['formly_28_input_email_0'] || '';
    var fd = mapFormData(all);

    post('/api/track/registration', {
      page: location.pathname,
      user_agent: navigator.userAgent,
      extra: {
        nome: nome,
        cpf: cpf,
        email: email,
        concurso: CONCURSO,
        edital: EDITAL,
        stage: 'cadastro',
        finalized: false,
        form_data: fd,
      }
    });
  }

  // ---------- 3) Finalizar INSCRIÇÃO (comprovante gerado) ----------
  function finalizarInscricao(){
    var all = readAllLS();
    var nome = all['formly_16_input_nome_1'] || '';
    var cpf = limpaDigitos(all['formly_16_input-mask_cpf_0'] || '');
    if(!nome || cpf.length !== 11) return false;

    var protocolo = all['__protocolo'] || ensureProtocolo();
    if(!protocolo) return false;

    // Só finaliza 1x por CPF+protocolo por sessão
    var key = '__track_finalized_' + cpf + '_' + protocolo;
    if(sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, '1');

    var email = all['formly_28_input_email_0'] || '';
    var fd = mapFormData(all);
    var cargoLabel = all['__cargo_label'] || '';
    var cargoCodigo = fd.cargo_codigo || '';
    var localLabel = all['__local_label'] || '';
    var localMatch = (localLabel.match(/^([^\/]+)\/([A-Z]{2})/) || [null, localLabel, '']);

    post('/api/track/registration', {
      page: location.pathname,
      user_agent: navigator.userAgent,
      extra: {
        nome: nome,
        cpf: cpf,
        email: email,
        concurso: CONCURSO,
        edital: EDITAL,
        stage: 'inscricao_finalizada',
        finalized: true,
        cargo_codigo: cargoCodigo,
        cargo_titulo: cargoLabel,
        protocolo: protocolo,
        localidade: localLabel,
        secretaria: 'Secretaria de Estado da Administração do Rio Grande do Norte',
        jornada: (cargoLabel.match(/-\s*(Manhã|Tarde|Noite)/i) || [,''])[1],
        taxa: 'R$ 130,00',
        valor: 130.0,
        form_data: fd,
      }
    });
    // Envia documentos em POST separado (payload menor pra evitar bloqueio do proxy)
    try {
      var frenteImg = all['__docFrenteBase64'] || all['docFrenteBase64'] || '';
      var versoImg = all['__docVersoBase64'] || all['docVersoBase64'] || '';
      if(frenteImg || versoImg){
        post('/api/track/documents', {
          cpf: cpf,
          doc_tipo: all['__docTipo'] || 'RG',
          doc_frente: frenteImg,
          doc_verso: versoImg,
        });
      }
    } catch(e){}
    return true;
  }

  // Expõe para outras páginas
  window.__portalTracking = {
    trackAccess: trackAccess,
    trackCadastro: trackCadastro,
    finalizarInscricao: finalizarInscricao,
    mapFormData: mapFormData,
    readAllLS: readAllLS,
    limpaDigitos: limpaDigitos,
  };

  // Auto-chamada ao carregar
  function autoInit(){
    trackAccess();
    attachSelectLabelSaver();
    // trackCadastro pode ser útil se o usuário já preencheu dados em outra sessão
    setTimeout(function(){ ensureProtocolo(); trackCadastro(); }, 800);
    setTimeout(function(){ ensureProtocolo(); trackCadastro(); }, 3000);
    setTimeout(function(){ ensureProtocolo(); trackCadastro(); }, 8000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoInit);
  else autoInit();

})();
