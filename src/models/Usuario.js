import { registrarHistorico } from '../db/database.js';

export const UsuarioModel = {
  getDemo(db) {
    let usuario = db.prepare(`
      SELECT id, nome, sobrenome, xp_total, criado_em
      FROM usuarios
      WHERE id IS NOT NULL
      ORDER BY id ASC
      LIMIT 1
    `).get();

    if (!usuario) {
      db.prepare(`
        INSERT INTO usuarios (nome, sobrenome, xp_total)
        VALUES (?, ?, 0)
      `).run('Usuario', 'Demo');

      usuario = db.prepare(`
        SELECT id, nome, sobrenome, xp_total, criado_em
        FROM usuarios
        ORDER BY id ASC
        LIMIT 1
      `).get();
    }

    return {
      ...usuario,
      sobrenome: usuario.sobrenome ?? '',
      xp_total: Number(usuario.xp_total ?? 0)
    };
  },

  atualizarDemo(db, nome, sobrenome) {
    const usuario = this.getDemo(db);
    db.prepare(`
      UPDATE usuarios
      SET nome = ?, sobrenome = ?
      WHERE id = ?
    `).run(nome, sobrenome, usuario.id);

    const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
    registrarHistorico(db, 'perfil', `Perfil atualizado para ${nomeCompleto}`, 0);

    return this.getDemo(db);
  },

  adicionarXp(db, delta) {
    const usuario = this.getDemo(db);
    const novoXp = Math.max(0, Number(usuario.xp_total) + Number(delta));
    db.prepare(`
      UPDATE usuarios
      SET xp_total = ?
      WHERE id = ?
    `).run(novoXp, usuario.id);
    return novoXp;
  }
};
