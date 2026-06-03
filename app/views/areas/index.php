<?php require_once __DIR__ . '/../layouts/header.php'; ?>

<h1>Áreas cadastradas</h1>

<ul>
    <?php foreach ($areas as $area): ?>
        <li>
            <?= $area['nome_area'] ?>
        </li>
    <?php endforeach; ?>
</ul>

<?php require_once __DIR__ . '/../layouts/footer.php'; ?>