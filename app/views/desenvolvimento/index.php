<h1>Desenvolvimento</h1>

<hr>

<h2>Trilhas</h2>

<?php if (empty($trilhas)): ?>
    <p>
        Nenhuma trilha cadastrada.
    </p>
<?php else: ?>
    <ul>
        <?php foreach ($trilhas as $trilha): ?>
            <li>
                <strong>
                    <?= htmlspecialchars($trilha['nome'], ENT_QUOTES, 'UTF-8') ?>
                </strong>

                <br>

                Categoria:
                <?= htmlspecialchars($trilha['categoria'], ENT_QUOTES, 'UTF-8') ?>

                <br>

                Status:
                <?= htmlspecialchars($trilha['status'], ENT_QUOTES, 'UTF-8') ?>

                <?php if (!empty($trilha['descricao'])): ?>
                    <br>

                    <?= nl2br(htmlspecialchars($trilha['descricao'], ENT_QUOTES, 'UTF-8')) ?>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>

<hr>

<h2>Histórico</h2>

<p>
    Nenhum histórico encontrado.
</p>

<hr>

<h2>Estatísticas</h2>

<p>
    Sem dados.
</p>
