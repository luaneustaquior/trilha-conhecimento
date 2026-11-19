document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Switcher (Dark <-> Light persisted in localStorage)
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-toggle-label');

  const syncThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Tema Claro' : 'Tema Escuro';
    }
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  syncThemeUI(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('trilha-theme', next);
      syncThemeUI(next);
    });
  }

  // 2. Accordion expand/collapse on Gestão de Trilha
  const accordionTriggers = document.querySelectorAll('[data-accordion-trigger]');
  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('aria-controls');
      const body = targetId ? document.getElementById(targetId) : null;
      if (!body) return;

      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
  });

  // 3. Confirmation safeguard on destructive trilha deletion
  const deleteForms = document.querySelectorAll('form[data-confirm-delete]');
  deleteForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      const trilhaNome = form.getAttribute('data-trilha-nome') || 'esta trilha';
      const warning = form.getAttribute('data-skill-warning') || '';
      const message = warning
        ? `Excluir "${trilhaNome}"?\n\nAtenção: ${warning}`
        : `Tem certeza que deseja excluir "${trilhaNome}"? Os níveis associados também serão removidos.`;

      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  // 4. Dialog modal controls (open / close / backdrop click)
  const dialogTriggers = document.querySelectorAll('[data-open-dialog]');
  dialogTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-dialog');
      const dialog = document.getElementById(id);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  });

  const dialogClosers = document.querySelectorAll('[data-close-dialog]');
  dialogClosers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) {
        dialog.close();
      }
    });
  });

  document.querySelectorAll('dialog.modal-dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) {
        dialog.close();
      }
    });
  });

  // 5. Live filtering on Gestão de Trilha / Desenvolvimento page
  const filterTabs = document.querySelectorAll('[data-filter-status]');
  const searchInput = document.getElementById('trilha-search');
  const trilhaRows = document.querySelectorAll('[data-trilha-row]');
  const emptyFiltered = document.getElementById('trilha-filter-empty');

  if (trilhaRows.length > 0) {
    let activeStatus = 'all';

    const applyFilter = () => {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      let visibleCount = 0;

      trilhaRows.forEach((row) => {
        const status = row.getAttribute('data-status') || '';
        const text = (row.getAttribute('data-search') || '').toLowerCase();
        const matchesStatus = activeStatus === 'all' || status === activeStatus;
        const matchesQuery = !query || text.includes(query);
        const visible = matchesStatus && matchesQuery;

        row.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (emptyFiltered) {
        emptyFiltered.hidden = visibleCount > 0;
      }
    };

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        activeStatus = tab.getAttribute('data-filter-status') || 'all';
        filterTabs.forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        applyFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
  }
});
