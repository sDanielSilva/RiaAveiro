<?php
$conn = pg_connect("host=YOUR_HOST dbname=YOUR_DBNAME user=YOUR_USERNAME password=YOUR_PASSWORD");

if (!$conn) {
    echo "Erro ao conectar ao banco de dados.";
    exit;
}

if (!isset($_GET['tabela'])) {
    echo "Parâmetro 'tabela' não especificado.";
    exit;
}

$tabela = $_GET['tabela'];

$query = "SELECT id, 
                 ST_AsGeoJSON(geom) AS geom,
                 nome_do_percurso,
                 distancia_km,
                 grau_dificuldade,
                 tipologia,
                 duracao_estimada,
                 ponto_entrada,
                 ponto_saida,
                 icon
          FROM $tabela";
$result = pg_query($conn, $query);

if (!$result) {
    echo "Erro ao executar a consulta: " . pg_last_error($conn);
    exit;
}

$geojson = array(
    'type' => 'FeatureCollection',
    'features' => array()
);

while ($row = pg_fetch_assoc($result)) {
    $properties = array(
        'id' => $row['id'],
        'Nome_do_Percurso' => $row['nome_do_percurso'],
        'Distancia_Km' => $row['distancia_km'],
        'Grau_Dificuldade' => $row['grau_dificuldade'],
        'Tipologia' => $row['tipologia'],
        'Duracao_Estimada' => $row['duracao_estimada'],
        'Ponto_Entrada' => $row['ponto_entrada'],
        'Ponto_Saida' => $row['ponto_saida'],
        'icon' => $row['icon']
    );

    $feature = array(
        'type' => 'Feature',
        'geometry' => json_decode($row['geom'], true),
        'properties' => $properties
    );
    
    array_push($geojson['features'], $feature);
}

pg_close($conn);

$json = json_encode($geojson);

header('Content-Type: application/json');
echo $json;
?>