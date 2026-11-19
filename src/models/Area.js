export const AreaModel = {
  getAllWithSubareas(db) {
    const areas = db.prepare(`
      SELECT id, nome_area, descricao
      FROM areas
      ORDER BY nome_area COLLATE NOCASE ASC
    `).all();

    const subareas = db.prepare(`
      SELECT
        s.id,
        s.area_id,
        s.nome_subarea,
        COUNT(t.id) AS total_trilhas
      FROM subareas s
      LEFT JOIN trilhas t ON t.subarea_id = s.id
      GROUP BY s.id
      ORDER BY s.nome_subarea COLLATE NOCASE ASC
    `).all();

    const subareasByArea = new Map();
    for (const sub of subareas) {
      if (!subareasByArea.has(sub.area_id)) {
        subareasByArea.set(sub.area_id, []);
      }
      subareasByArea.get(sub.area_id).push(sub);
    }

    return areas.map((area) => {
      const subs = subareasByArea.get(area.id) || [];
      const totalTrilhas = subs.reduce((acc, s) => acc + Number(s.total_trilhas || 0), 0);
      return {
        ...area,
        subareas: subs,
        total_trilhas: totalTrilhas
      };
    });
  },

  getAllSubareas(db) {
    return db.prepare(`
      SELECT s.id, s.nome_subarea, a.nome_area
      FROM subareas s
      INNER JOIN areas a ON a.id = s.area_id
      ORDER BY s.nome_subarea COLLATE NOCASE ASC
    `).all();
  }
};
