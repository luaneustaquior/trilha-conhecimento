<h2><?= htmlspecialchars($classe['nome'], ENT_QUOTES, 'UTF-8') ?></h2>

<hr>

<p>
    Nome:
    <?= htmlspecialchars($usuario['nome'], ENT_QUOTES, 'UTF-8'); ?>
    <?= htmlspecialchars($usuario['sobrenome'] ?? '', ENT_QUOTES, 'UTF-8'); ?>
</p>

<p>
    XP:
    <?= htmlspecialchars($usuario['xp_total'], ENT_QUOTES, 'UTF-8'); ?>
</p>

<p>
    Classe:
    <?= htmlspecialchars($classe['nome'], ENT_QUOTES, 'UTF-8') ?>
</p>

<p>
    Skills:
    <?php if (empty($skills)): ?>
        Nenhuma Skill liberada.
    <?php else: ?>
        <?php foreach ($skills as $index => $skill): ?>
            <?= $index > 0 ? ', ' : '' ?>
            <?= htmlspecialchars($skill['nome'], ENT_QUOTES, 'UTF-8') ?>
        <?php endforeach; ?>
    <?php endif; ?>
</p>

<?php if (!empty($classe['proxima'])): ?>
    <p>
        Proxima classe:
        <?= htmlspecialchars($classe['proxima'], ENT_QUOTES, 'UTF-8') ?>
        faltam <?= (int) $classe['faltam'] ?> trilhas com o mesmo nome.
    </p>
<?php endif; ?>

<p>
    Criado em:
    <?= htmlspecialchars($usuario['criado_em'], ENT_QUOTES, 'UTF-8'); ?>
</p>
