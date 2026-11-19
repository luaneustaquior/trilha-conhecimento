export const VALID_STATUSES = ['Em andamento', 'Concluída', 'Pausada'];

export function validateTrilhaInput(body = {}) {
  const nome = String(body.nome ?? '').trim();
  const categoria = String(body.categoria ?? '').trim();
  const descricao = String(body.descricao ?? '').trim();
  const status = String(body.status ?? 'Em andamento').trim() || 'Em andamento';

  if (!nome) {
    return { valid: false, error: 'Informe o nome da trilha.', data: { nome, categoria, descricao, status } };
  }
  if (nome.length > 120) {
    return { valid: false, error: 'O nome da trilha deve ter no máximo 120 caracteres.', data: { nome, categoria, descricao, status } };
  }
  if (categoria.length > 80) {
    return { valid: false, error: 'A categoria deve ter no máximo 80 caracteres.', data: { nome, categoria, descricao, status } };
  }
  if (descricao.length > 1000) {
    return { valid: false, error: 'A descrição deve ter no máximo 1000 caracteres.', data: { nome, categoria, descricao, status } };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { valid: false, error: 'Status inválido selecionado.', data: { nome, categoria, descricao, status: 'Em andamento' } };
  }

  return {
    valid: true,
    error: null,
    data: { nome, categoria, descricao, status }
  };
}

export function validateUsuarioInput(body = {}) {
  const nome = String(body.nome ?? '').trim();
  const sobrenome = String(body.sobrenome ?? '').trim();

  if (!nome) {
    return { valid: false, error: 'Informe o nome do usuário.', data: { nome, sobrenome } };
  }
  if (nome.length > 80) {
    return { valid: false, error: 'O nome deve ter no máximo 80 caracteres.', data: { nome, sobrenome } };
  }
  if (sobrenome.length > 80) {
    return { valid: false, error: 'O sobrenome deve ter no máximo 80 caracteres.', data: { nome, sobrenome } };
  }

  return {
    valid: true,
    error: null,
    data: { nome, sobrenome }
  };
}

export function validateNivelInput(body = {}) {
  const nome = String(body.nome ?? '').trim();

  if (!nome) {
    return { valid: false, error: 'Informe o nome do nível.', data: { nome } };
  }
  if (nome.length > 120) {
    return { valid: false, error: 'O nome do nível deve ter no máximo 120 caracteres.', data: { nome } };
  }

  return {
    valid: true,
    error: null,
    data: { nome }
  };
}
