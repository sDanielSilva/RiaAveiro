<?php
$conn = pg_connect("host={DB_HOST} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}");

if (!$conn) {
    echo "Erro ao conectar a base de dados.";
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
                 duracao_estimada,
                 ambito,
                 grau_dificuldade,
                 epoca_aconselhada,
                 imgUrl 
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
        'Duracao_Estimada' => $row['duracao_estimada'],
        'Ambito' => $row['ambito'],
        'Grau_Dificuldade' => $row['grau_dificuldade'],
        'Epoca_Aconselhada' => $row['epoca_aconselhada'],
        'imgurl' => $row['imgurl']
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