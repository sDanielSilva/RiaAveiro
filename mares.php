<?php
$pdo = new PDO('pgsql:host=YOUR_HOST;dbname=YOUR_DBNAME', 'YOUR_USERNAME', 'YOUR_PASSWORD', [
    PDO::ATTR_PERSISTENT => true
]);



$hoje = date('Y-m-d');
$queryDataUltimaAtualizacao = "SELECT MAX(data_ult_at) as ultima_atualizacao FROM ondas";
$stmtDataUltimaAtualizacao = $pdo->query($queryDataUltimaAtualizacao);
$dataUltimaAtualizacao = $stmtDataUltimaAtualizacao->fetch(PDO::FETCH_ASSOC);

if ($dataUltimaAtualizacao['ultima_atualizacao'] != $hoje) {
    $query = "SELECT id, lat, lng FROM ondas WHERE data_ult_at != :hoje OR data_ult_at IS NULL LIMIT 100";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':hoje', $hoje);
    $stmt->execute();
    $ondas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($ondas as $onda) {
        $lat = $onda['lat'];
        $lon = $onda['lng'];
        $apiKey = 'YOUR_API_KEY';


        $url = "https://www.worldtides.info/api/v3?heights&lat={$lat}&lon={$lon}&key={$apiKey}";
        $response = file_get_contents($url);
        
        if ($response === false) {
            continue;
        }

        $data = json_decode($response, true);

        if ($data === null || !isset($data['heights']) || !is_array($data['heights'])) {
            continue;
        }

        $lowTides = [];
        $highTides = [];
        $heights = [];

          for ($i = 1; $i < count($data['heights']) - 1; $i++) {
              $currentHeight = $data['heights'][$i]['height'];
              $previousHeight = $data['heights'][$i - 1]['height'];
              $nextHeight = $data['heights'][$i + 1]['height'];
             if ($currentHeight > $previousHeight && $currentHeight > $nextHeight) {
                 $highTides[] = date('d-m-Y H:i:s', strtotime($data['heights'][$i]['date']));
            } elseif ($currentHeight < $previousHeight && $currentHeight < $nextHeight) {
                $lowTides[] = date('d-m-Y H:i:s', strtotime($data['heights'][$i]['date']));
            }
        }
        
        $startTime = strtotime($data['heights'][0]['date']);
        $endTime = strtotime(end($data['heights'])['date']);

        foreach ($data['heights'] as $tide) {
            $time = strtotime($tide['date']);
            $heights[] = [
                'time' => date('d-m-Y H:i:s', $time),
                'height' => $tide['height']
            ];
        }

        $updateQuery = "UPDATE ondas SET mare_high_tides = :highTides, mare_low_tides = :lowTides, mare_heights = :heights, data_ult_at = :hoje WHERE id = :id";
        $stmtUpdate = $pdo->prepare($updateQuery);
        $encodedHighTides = json_encode($highTides);
        $encodedLowTides = json_encode($lowTides);
        $encodedHeights = json_encode($heights);
        $dataAtual = date('Y-m-d');
        $stmtUpdate->bindParam(':highTides', $encodedHighTides);
        $stmtUpdate->bindParam(':lowTides', $encodedLowTides);
        $stmtUpdate->bindParam(':heights', $encodedHeights);
        $stmtUpdate->bindParam(':id', $onda['id']);
        $stmtUpdate->bindParam(':hoje', $hoje);
        $stmtUpdate->execute();
    }
}
?>