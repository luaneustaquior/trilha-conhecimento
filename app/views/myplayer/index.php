<h1>MyPlayer</h1>

<?php if (!empty($mensagem)): ?>
    <p>
        <?= htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8') ?>
    </p>
<?php endif; ?>

<hr>

<h2><?= htmlspecialchars($classe['nome'], ENT_QUOTES, 'UTF-8') ?></h2>

<p>
    <?= htmlspecialchars($usuario['nome'], ENT_QUOTES, 'UTF-8') ?>
    <?= htmlspecialchars($usuario['sobrenome'] ?? '', ENT_QUOTES, 'UTF-8') ?>
</p>

<p>
    Classe:
    <?= htmlspecialchars($classe['nome'], ENT_QUOTES, 'UTF-8') ?>
</p>

<?php if (!empty($classe['proxima'])): ?>
    <p>
        Proxima classe:
        <?= htmlspecialchars($classe['proxima'], ENT_QUOTES, 'UTF-8') ?>
        faltam <?= (int) $classe['faltam'] ?> trilhas com o mesmo nome.
    </p>
<?php endif; ?>

<button type="button" onclick="document.getElementById('editar-usuario').showModal()">
    Editar perfil
</button>

<dialog id="editar-usuario">
    <form method="post" action="<?= BASE_URL ?>?url=myplayer">
        <input type="hidden" name="acao" value="editar_usuario">

        <h2>Editar perfil</h2>

        <label>
            Nome
        </label>

        <br>

        <input
            type="text"
            name="nome"
            value="<?= htmlspecialchars($usuario['nome'], ENT_QUOTES, 'UTF-8') ?>"
            required
        >

        <br><br>

        <label>
            Sobrenome
        </label>

        <br>

        <input
            type="text"
            name="sobrenome"
            value="<?= htmlspecialchars($usuario['sobrenome'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
        >

        <br><br>

        <button type="submit">
            Salvar
        </button>

        <button
            type="button"
            onclick="document.getElementById('editar-usuario').close()"
        >
            Cancelar
        </button>
    </form>
</dialog>

<hr>

<h2>Skills</h2>

<?php if (empty($skills)): ?>
    <p>
        Nenhuma Skill liberada.
    </p>

    <p>
        Uma Skill aparece aqui depois de existirem 3 trilhas com o mesmo nome.
    </p>
<?php else: ?>
    <ul>
        <?php foreach ($skills as $skill): ?>
            <li>
                <?= htmlspecialchars($skill['nome'], ENT_QUOTES, 'UTF-8') ?>
                (<?= (int) $skill['total'] ?> trilhas)

                <form method="post" action="<?= BASE_URL ?>?url=myplayer">
                    <input type="hidden" name="acao" value="acrescentar">
                    <input
                        type="hidden"
                        name="nome"
                        value="<?= htmlspecialchars($skill['nome'], ENT_QUOTES, 'UTF-8') ?>"
                    >

                    <button type="submit">
                        Acrescentar trilha
                    </button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>

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

                <form method="post" action="<?= BASE_URL ?>?url=myplayer">
                    <input type="hidden" name="acao" value="excluir">
                    <input
                        type="hidden"
                        name="id"
                        value="<?= htmlspecialchars($trilha['id'], ENT_QUOTES, 'UTF-8') ?>"
                    >

                    <button type="submit">
                        Excluir trilha
                    </button>
                </form>
            </li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>

<hr>

<h2>Projetos</h2>

<p>
    Nenhum projeto registrado.
</p>
