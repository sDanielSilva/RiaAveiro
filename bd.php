<?php
function getGeoJSON($tabela)
{
    if ($tabela === 'spatial_ref_sys') {
        return json_encode(
            array(
                'type' => 'FeatureCollection',
                'features' => array(),
                'message' => 'Tabela spatial_ref_sys foi ignorada.'
            )
        );
    }

    $cacheFile = 'cache/' . $tabela . '.json';
    $cacheTime = 3600;

    if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $cacheTime) {
        return file_get_contents($cacheFile);
    }

    $conn = pg_connect("host={DB_HOST} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}");
    if (!$conn) {
        die("Erro ao conectar à base de dados.");
    }

    $query = "SELECT lat, lng, nome, imgurl" . 
        ($tabela === 'ondas' ? ", velocidadevento, alturaonda, direcaovento, swellaltura, swellperiodo, swelldirecao, mare_high_tides, mare_low_tides, mare_heights" : "") . 
        " FROM " . $tabela . ";";
    
    $result = pg_query($conn, $query);
    if (!$result) {
        die("Erro ao executar a consulta SQL.");
    }

    $geojson = array(
        'type' => 'FeatureCollection',
        'features' => array()
    );

    while ($row = pg_fetch_assoc($result)) {
        $properties = array(
            'nome' => $row['nome'],
            'imgurl' => $row['imgurl']
        );

        if ($tabela === 'ondas') {
            $properties['velocidadevento'] = $row['velocidadevento'];
            $properties['alturaonda'] = $row['alturaonda'];
            $properties['direcaovento'] = $row['direcaovento'];
            $properties['swellaltura'] = $row['swellaltura'];
            $properties['swellperiodo'] = $row['swellperiodo'];
            $properties['swelldirecao'] = $row['swelldirecao'];
            
            $dataAtual = date('Y-m-d');
            $mare_heights = json_decode($row['mare_heights'], true);
            
            $mare_heights_filtrado = array_filter($mare_heights, function($entry) use ($dataAtual) {
                $entryTime = DateTime::createFromFormat('d-m-Y H:i:s', $entry['time']);
                $entryDate = $entryTime->format('Y-m-d');
                return $entryDate === $dataAtual;
            });

            $times = array_map(function($entry) {
                $date = new DateTime($entry['time']);
                return $date->format('H:i');
            }, $mare_heights_filtrado);
            
            $heights = array_map(function($entry) {
                return $entry['height'];
            }, $mare_heights_filtrado);
            
            $properties['mare_heights'] = array(
                'heights' => $heights,
                'times' => $times
            );
            

            $mare_low_tides = json_decode($row['mare_low_tides'], true);
        
            $horas_mare_baixa = array_map(function($datetime) {
                $date = new DateTime($datetime);
                return $date->format('H:i');
            }, $mare_low_tides);
    
            $primeiras_duas_horas_baixa = array_slice($horas_mare_baixa, 0, 2);
    
            $formato_mare_baixa = implode(" | ", $primeiras_duas_horas_baixa);
    
            $properties['mare_low_tides'] = $formato_mare_baixa;
        

            $mare_high_tides = json_decode($row['mare_high_tides'], true);

                       $horas_mare = array_map(function($datetime) {
                        $date = new DateTime($datetime);
                        return $date->format('H:i');
                    }, $mare_high_tides);
        
                    $primeiras_duas_horas = array_slice($horas_mare, 0, 2);
        
                    $formato_mare = implode(" | ", $primeiras_duas_horas);
        
                    $properties['mare_high_tides'] = $formato_mare;
        }

        $feature = array(
            'type' => 'Feature',
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    floatval($row['lng']),
                    floatval($row['lat'])
                )
            ),
            'properties' => $properties
        );
        
        array_push($geojson['features'], $feature);
    }

    pg_close($conn);

    file_put_contents($cacheFile, json_encode($geojson));

    return json_encode($geojson);
}

header('Content-Type: application/json');
echo getGeoJSON($_GET['tabela']);
?>