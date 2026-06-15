<h1>Criar Trilha</h1>

<?php if (!empty($erro)): ?>
    <p>
        <?= htmlspecialchars($erro, ENT_QUOTES, 'UTF-8') ?>
    </p>
<?php endif; ?>

<form method="post" action="<?= BASE_URL ?>?url=criar">

    <label>
        Nome da Trilha
    </label>

    <br>

    <input
        type="text"
        name="nome"
        value="<?= htmlspecialchars($dados['nome'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
        required
    >

    <br><br>

    <label>
        Categoria
    </label>

    <br>

    <input
        type="text"
        name="categoria"
        value="<?= htmlspecialchars($dados['categoria'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
    >

    <br><br>

    <label>
        Descrição
    </label>

    <br>

    <textarea
        name="descricao"
        rows="5"
        cols="50"
    ><?= htmlspecialchars($dados['descricao'] ?? '', ENT_QUOTES, 'UTF-8') ?></textarea>

    <br><br>

    <button type="submit">
        Criar Trilha
    </button>

</form>
