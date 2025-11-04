/* script.js - Rede do Bem
   controla menu, formulário, mural dinâmico, certificados e painel admin
*/

(function () {
  // --- Dados iniciais de projetos (podemos guardar no localStorage se quiser)
  const defaultProjects = [
    {
      id: 'projeto-1',
      title: 'Distribuição de Alimentos',
      short: 'Levamos alimentos saudáveis para famílias em situação de vulnerabilidade.',
      description: 'Projeto de arrecadação e entrega de cestas básicas com foco em famílias em situação de insegurança alimentar. Atuamos com parcerias locais e voluntariado.',
      images: ['Imagens/projeto1.png'],
      indicators: { atendidos: 1200, metas: 'Mensal' }
    },
    {
      id: 'projeto-2',
      title: 'Educação e Capacitação',
      short: 'Oferecemos cursos e atividades educativas para crianças e jovens.',
      description: 'Aulas, oficinas e reforço escolar para crianças e jovens. Também promovemos capacitações para empregabilidade de jovens e adultos.',
      images: ['Imagens/Projeto.2.png'],
      indicators: { atendidos: 600, metas: 'Trimestral' }
    },
    {
      id: 'projeto-3',
      title: 'Apoio à Saúde',
      short: 'Campanhas de saúde, vacinação e acompanhamento médico.',
      description: 'Realizamos campanhas de saúde preventiva, oficinas de prevenção e mutirões de vacinação em parceria com unidades de saúde locais.',
      images: ['Imagens/projeto 3.png'],
      indicators: { atendidos: 800, metas: 'Bimestral' }
    },
    {
      id: 'projeto-4',
      title: 'Apoio Administrativo',
      short: 'Organizamos processos internos e damos suporte aos voluntários.',
      description: 'Estruturação administrativa, apoio logístico e treinamento para voluntariado, garantindo eficiência nas ações.',
      images: ['Imagens/projeto 4.png'],
      indicators: { atendidos: '-', metas: 'Contínuo' }
    }
  ];

  // Guarda default se não houver no localStorage
  if (!localStorage.getItem('projetos')) {
    localStorage.setItem('projetos', JSON.stringify(defaultProjects));
  }

  // ----------------------
  // Menu mobile
  window.toggleMenu = function toggleMenu() {
    const menu = document.getElementById('navMenu');
    if (!menu) return;
    menu.classList.toggle('active');
    const btn = document.querySelector('.menu-toggle');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
  };

  // ----------------------
  // Scroll suave para seção (se necessário)
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector('header');
    const offset = header ? header.offsetHeight : 70;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    document.getElementById('navMenu')?.classList.remove('active');
  };

  // ----------------------
  // Cadastro de voluntários
  window.handleSubmit = function handleSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('volunteerForm');
    if (!form) return;

    // simples validação
    if (!form.nome.value.trim() || !form.email.value.trim()) {
      showFormError('Por favor, preencha os campos obrigatórios (nome e e-mail).');
      return;
    }

    const formData = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
      idade: Number(form.idade.value) || null,
      disponibilidade: form.disponibilidade.value,
      area_interesse: form['area-interesse'].value,
      experiencia: form.experiencia.value.trim(),
      motivacao: form.motivacao.value.trim(),
      dataCadastro: new Date().toISOString()
    };

    const voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
    voluntarios.push(formData);
    localStorage.setItem('voluntarios', JSON.stringify(voluntarios));

    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.classList.add('Show');
      successMessage.focus?.();
      setTimeout(() => {
        successMessage.classList.remove('Show');
      }, 4500);
    }

    setTimeout(() => form.reset(), 1000);
    renderVolunteersTable(); // atualiza painel caso aberto
  };

  function showFormError(msg) {
    let el = document.getElementById('formError');
    if (!el) {
      el = document.createElement('div');
      el.id = 'formError';
      el.style.color = '#a94442';
      el.style.background = '#fdecea';
      el.style.padding = '.6rem';
      el.style.borderRadius = '8px';
      const container = document.querySelector('.signup-section') || document.body;
      container.insertBefore(el, container.firstChild);
    }
    el.textContent = msg;
    setTimeout(() => el.remove(), 4000);
  }

  // ----------------------
  // Exibir voluntários (usado no painel)
  window.renderVolunteersTable = function renderVolunteersTable() {
    const tabelaContainer = document.getElementById('tabelaVoluntarios');
    if (!tabelaContainer) return;
    const voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
    if (voluntarios.length === 0) {
      tabelaContainer.innerHTML = '<p>Nenhum voluntário cadastrado.</p>';
      return;
    }

    const rows = voluntarios.map((v, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(v.nome)}</td>
        <td>${escapeHtml(v.email)}</td>
        <td>${escapeHtml(v.telefone)}</td>
        <td>${escapeHtml(v.area_interesse || '')}</td>
        <td>${new Date(v.dataCadastro).toLocaleString()}</td>
        <td><button onclick="removeVolunteer(${idx})" aria-label="Remover voluntário ${escapeHtml(v.nome)}">Excluir</button></td>
      </tr>
    `).join('');

    tabelaContainer.innerHTML = `
      <table class="vol-table" role="table" aria-label="Tabela de voluntários">
        <thead><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Área</th><th>Data</th><th>Ações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  window.removeVolunteer = function removeVolunteer(index) {
    const voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
    if (!voluntarios[index]) return;
    if (!confirm(`Remover ${voluntarios[index].nome}?`)) return;
    voluntarios.splice(index, 1);
    localStorage.setItem('voluntarios', JSON.stringify(voluntarios));
    renderVolunteersTable();
  };

  window.clearAllVolunteers = function clearAllVolunteers() {
    if (!confirm('Tem certeza que deseja apagar todos os cadastros? Esta ação é irreversível.')) return;
    localStorage.removeItem('voluntarios');
    renderVolunteersTable();
  };

  window.exportVolunteersCSV = function exportVolunteersCSV() {
    const voluntarios = JSON.parse(localStorage.getItem('voluntarios')) || [];
    if (voluntarios.length === 0) { alert('Nenhum cadastro para exportar.'); return; }
    const header = ['nome','email','telefone','idade','disponibilidade','area_interesse','experiencia','motivacao','dataCadastro'];
    const rows = voluntarios.map(v => header.map(h => `"${(v[h]||'').toString().replace(/"/g,'""')}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voluntarios_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ----------------------
  // Projects / Mural (dinâmico)
  function getProjects() {
    try {
      return JSON.parse(localStorage.getItem('projetos')) || defaultProjects;
    } catch (e) {
      return defaultProjects;
    }
  }

  function renderMural() {
    const container = document.getElementById('muralContainer');
    if (!container) return;
    const projects = getProjects();
    container.innerHTML = projects.map(p => `
      <article id="${p.id}" class="project-card" tabindex="0">
        <img src="${p.images[0]}" alt="${escapeHtml(p.title)}" loading="lazy" />
        <div class="card-content">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.short)}</p>
          <div style="display:flex; gap:.6rem;">
            <button class="btn-primary" onclick="openProjectModal('${p.id}')">Ver detalhes</button>
            <a class="btn-secondary" href="projeto.html">Voltar</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  window.openProjectModal = function openProjectModal(id) {
    const projects = getProjects();
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <h2>${escapeHtml(proj.title)}</h2>
      <p>${escapeHtml(proj.description)}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:1rem;">
        ${proj.images.map(img => `<img src="${img}" alt="${escapeHtml(proj.title)}" style="max-width:180px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.08)" loading="lazy">`).join('')}
      </div>
      <div style="margin-top:1rem;">
        <strong>Indicadores:</strong>
        <p>Atendidos: ${escapeHtml(String(proj.indicators?.atendidos || '-'))} • Meta: ${escapeHtml(String(proj.indicators?.metas || '-'))}</p>
      </div>
    `;
    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'flex';
    // foco para acessibilidade
    modal.querySelector('.modal-content')?.focus?.();
  };

  window.closeProjectModal = function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden','true');
    modal.style.display = 'none';
  };

  // Fecha modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // ----------------------
  // Certificados (gera nova janela pronto para imprimir/salvar PDF)
  window.generateCertificate = function generateCertificate() {
    const name = (document.getElementById('certName')?.value || '').trim();
    if (!name) { alert('Digite o nome para gerar o certificado.'); return; }
    const dateStr = new Date().toLocaleDateString();
    const html = `
      <html>
      <head>
        <title>Certificado - ${escapeHtml(name)}</title>
        <style>
          body{ font-family: Arial, sans-serif; padding:40px; text-align:center; }
          .card{ border:8px solid #4fc3f7; padding:30px; border-radius:12px; }
          h1{ color:#1565c0; margin-bottom:0.2rem; }
          p{ color:#333; font-size:1.1rem; }
          .name{ font-size:1.6rem; font-weight:700; margin:1rem 0; color:#2e7d32; }
          .footer{ margin-top:2rem; display:flex; justify-content:space-between; align-items:center; }
          .logo{ font-size:1.2rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">🌻 Rede do Bem</div>
          <h1>Certificado de Participação</h1>
          <p>Certificamos que</p>
          <div class="name">${escapeHtml(name)}</div>
          <p>participou das atividades promovidas pela Rede do Bem.</p>
          <div class="footer">
            <div>Emitido em: ${escapeHtml(dateStr)}</div>
            <div>Assinatura: ____________________</div>
          </div>
        </div>
      </body>
      </html>
    `;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  window.downloadSampleCertificate = function downloadSampleCertificate() {
    const w = window.open('', '_blank');
    w.document.write('<p style="font-family:Arial;padding:40px">Modelo de certificado — gere um com seu nome.</p>');
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  // ----------------------
  // Utilidades
  function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ----------------------
  // Inicialização ao carregar páginas
  document.addEventListener('DOMContentLoaded', () => {
    // Render mural se estiver na página
    renderMural();
    // Render volunteers table se existir container
    renderVolunteersTable();
    // Se URL tiver hash de projeto, abrir modal (ex: mural.html#projeto-1)
    const hash = location.hash?.replace('#','');
    if (hash && document.getElementById(hash)) {
      // Aguarda renderização
      setTimeout(() => {
        openProjectModal(hash);
      }, 300);
    }
  });

})();
