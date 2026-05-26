<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$productsFile = __DIR__ . '/../js/products.json';

// Méthode GET : Lire les produits
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($productsFile)) {
        echo file_get_contents($productsFile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Fichier products.json non trouvé']);
    }
}

// Méthode POST : Sauvegarder les produits
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON invalide']);
        exit;
    }

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        exit;
    }

    // Sauvegarder dans le fichier
    if (file_put_contents($productsFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'message' => 'Produits sauvegardés avec succès']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Impossible de sauvegarder le fichier']);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
?>
