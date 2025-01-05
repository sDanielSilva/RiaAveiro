var markerA, markerB, markerIntermedio, markerAtual, markerPI_maisProximo;

function openWidget(evt, widgetName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("custom-tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("custom-tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(widgetName).style.display = "block";
  evt.currentTarget.className += " active";

  if (widgetName == 'windfinder') {
    var widgetDiv = document.getElementById('windfinder-widget');
    widgetDiv.innerHTML = '';
    var s = document.createElement('script');
    s.src = 'https://www.windfinder.com/widget/forecast/js/barra?unit_wave=m&unit_rain=mm&unit_temperature=c&unit_wind=kmh&unit_pressure=hPa&days=4&show_day=0';
    widgetDiv.appendChild(s);
  } else if (widgetName == 'windy') {
    document.getElementById('windy-widget').innerHTML = '<iframe src="https://embed.windy.com/embed2.html?lat=40.643&lon=-8.745&detailLat=40.643&detailLon=-8.745&width=800&height=600&zoom=10&level=surface&overlay=waves&product=ecmwf&menu=&message=true&marker=&calendar=12&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1&key=YOUR_API_KEY" frameborder="0" style="width: 100%; height: 502px;"></iframe>';
  }
}

// Get the first element with class="custom-tablinks" and click on it
document.getElementsByClassName("custom-tablinks")[0].click();

function callPhpFile() {
  fetch('https://gis4cloud.com/grupo4_ptas2024/mares.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na rede');
      }
    })
    .catch(error => {
      console.error('Erro ao chamar o arquivo PHP:', error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  callPhpFile();

  var popup = document.getElementById("popupLayers");
  var popup_mapa = document.getElementById("popupOpcoesMapa");

  setTimeout(function () {
    popup.style.display = "block";
    popup.style.animation = "slideInFromRight 0.5s ease forwards";
  }, 2000);

  setTimeout(function () {
    popup.style.animation = "slideOutToRight 0.5s ease forwards";
    setTimeout(function () {
      popup.style.display = "none";
    }, 500);
  }, 7000);

  setTimeout(function () {
    popup_mapa.style.display = "block";
    popup_mapa.style.animation = "slideInFromLeft 0.5s ease forwards";
  }, 2000);

  setTimeout(function () {
    popup_mapa.style.animation = "slideOutToLeft 0.5s ease forwards";
    setTimeout(function () {
      popup_mapa.style.display = "none";
    }, 500);
  }, 7000);

});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
  });
});

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const map = new mapboxgl.Map({
  container: "map",
  center: [-8.654168722609962, 40.63221083028599],
  zoom: 16.4, 
  pitch: 75, 
  bearing: 7.5, 
  maxBounds: [-9.6, 40.4, -8.45, 41], 
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.ScaleControl(), "bottom-right");

map.addControl(new mapboxgl.FullscreenControl());

const geolocateControl = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
  showUserHeading: true,
});

map.addControl(geolocateControl);

geolocateControl.on('geolocate', function (event) {
  const lng = event.coords.longitude;
  const lat = event.coords.latitude;
  const coords = [lng, lat];

  if (markerAtual) {
    markerAtual.setLngLat(coords);
  } else {
    
    const markerColor = 'pink'; 
    markerAtual = new mapboxgl.Marker({ color: markerColor, draggable: true })
      .setLngLat(coords)
      .addTo(map);

    var popupAtual;
    popupAtual = new mapboxgl.Popup({ offset: 25 })
      .setLngLat(coords)
      .setText('Ponto de localização atual')
      .addTo(map);

    markerAtual.setPopup(popupAtual);

    
    popupAtual.getElement().addEventListener('click', function () {
      if (markerAtual) {
        markerAtual.remove();
        markerAtual = null;
      }
    });
  }

  calculateRoute();
});

function removeMarker() {
  if (markerAtual) {
    markerAtual.remove();
    markerAtual = null;
  }

  calculateRoute();
}

map.on('load', function () {
  const geolocateButton = document.querySelector('.mapboxgl-ctrl-geolocate');
  if (geolocateButton) {
    geolocateButton.addEventListener('click', function () {
      setTimeout(function () {
        if (geolocateControl._watchState === 'OFF') {
          removeMarker();
        }
      }, 250);
    });
  }
});

let isRotating = true;
let lastInteractionTime = Date.now();

function rotateCamera(timestamp) {
  if (isRotating) {
    map.rotateTo((timestamp / 300) % 360, { duration: 0 });
  }
  requestAnimationFrame(rotateCamera);
}

map.on('mousedown', () => {
  isRotating = false;
  lastInteractionTime = Date.now();
});

map.on('mouseup', () => {
  setTimeout(() => {
    if (Date.now() - lastInteractionTime >= 100000) {
      isRotating = true;
    }
  }, 100000);
});

const tabelas = [
  "point_alojamento_local",
  "aluguer_bicicletas",
  "aluguer_carros",
  "arte_xavega",
  "aves",
  "bancos",
  "bombas_gasolina",
  "estacao",
  "farmacias",
  "hospitais",
  "kitesurf",
  "local_ferry",
  "point_marinas_docas",
  "multibanco",
  "natacao_pontoprofessora",
  "nucleos_pesca",
  "ondas",
  "paragensautocarro",
  "percurso_azul",
  "percurso_dourado",
  "percurso_natureza",
  "percurso_verde",
  "point_porto",
  "praias",
  "restaurantes",
  "point_surf",
  "terminal_ferry",
  "salinas",
  "voleipraia",
  "barra",
];

const nomesTratados = {
  "point_alojamento_local": "Alojamento Local",
  "aluguer_bicicletas": "Aluguer de Bicicletas",
  "aluguer_carros": "Aluguer de Carros",
  "arte_xavega": "Arte Xávega",
  "aves": "Observação de Aves",
  "bancos": "Banco",
  "bombas_gasolina": "Bomba de Gasolina",
  "estacao": "Estação",
  "farmacias": "Farmácia",
  "hospitais": "Hospital",
  "kitesurf": "Kitesurf",
  "local_ferry": "Local de Ferry",
  "point_marinas_docas": "Marinas e Docas",
  "multibanco": "Multibanco",
  "natacao_pontoprofessora": "Natação",
  "nucleos_pesca": "Núcleo de Pesca",
  "ondas": "Onda",
  "paragensautocarro": "Paragem de autocarro",
  "percurso_azul": "Percurso Azul",
  "percurso_dourado": "Percurso Dourado",
  "percurso_natureza": "Percurso Natureza",
  "percurso_verde": "Percurso Verde",
  "point_porto": "Porto",
  "praias": "Praia",
  "restaurantes": "Restaurante",
  "point_surf": "Surf",
  "terminal_ferry": "Terminal de Ferry",
  "salinas": "Salina",
  "voleipraia": "Volei de Praia",
  "barra": "Estação Meteorológica"
};

var originalPointsData = {};

map.on("load", () => {
  setTimeout(() => {
    isRotating = true;
    rotateCamera(0); 
  }, 100000);

  map.setFog({
    'range': [-1, 9],
    'horizon-blend': 0.3,
    'color': '#242B4B',
    'high-color': '#161B36',
    'space-color': '#0B1026',
    'star-intensity': 0.8
  })

  map.addSource('batimetria25mLayer', {
    'type': 'raster',
    'tiles': [
      'https://gis4cloud.pt/geoserver/wms?service=WMS&request=GetMap&layers=grupo4_ptas2024:Aveiro&styles=&format=image%2Fpng&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'
    ],
    'tileSize': 256
  });

  map.addLayer({
    'id': 'batimetria25m',
    'type': 'raster',
    'source': 'batimetria25mLayer',
    'paint': {
      'raster-opacity': 0
    },
  });

  map.addSource('batimetria2mLayer', {
    'type': 'raster',
    'tiles': [
      'https://gis4cloud.pt/geoserver/wms?service=WMS&request=GetMap&layers=grupo4_ptas2024:AveiroBatimetriaFinal&styles=&format=image%2Fpng&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'
    ],
    'tileSize': 256
  });

  map.addLayer({
    'id': 'batimetria2m',
    'type': 'raster',
    'source': 'batimetria2mLayer',
    'paint': {
      'raster-opacity': 0
    }
  });
 
  function createPopupHTMLPI(tabela, nome, addressHTML, streetViewUrl, imgurl, extraInfo = {}) {
    let extraHTML = '';
    let estacao = '';
    let imagemHTML = '';
    
    if (imgurl !== "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png") {
      imagemHTML = `<p><img src="${imgurl}" alt="Imagem" width="200px" height="150px"/></p>`;
    }

    if (tabela === 'ondas') {
      extraHTML = `
        <p><button class="btnPraias" id="saber-mais" data-extra-info='${JSON.stringify(extraInfo)}'>Ver Informações
        <i class="fas fa-info-circle" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
    } else if (tabela === 'barra') {
      estacao = `
        ${imagemHTML}
        <p><button class="btnPraias" id="estacao-barra">Ver Informações
        <i class="fas fa-info-circle" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
      return `
        <h6><b>Tipo:</b>Estação Meteorológica</h6>
        ${estacao}
      `;
    } else if (tabela === 'praias' && nome === 'Praia da Barra') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-barra">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;

    } else if (tabela === 'praias' && nome === 'Praia da Furadouro') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-furadouro">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;

    } else if (tabela === 'praias' && nome === 'Praia da Torreira') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-torreira">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
    } else if (tabela === 'praias' && nome === 'Praia da Costa Nova') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-costa-nova">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
    } else if (tabela === 'praias' && nome === 'Praia da Vagueira') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-vagueira">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
    } else if (tabela === 'praias' && nome === 'Praia de Mira') {
      extraHTML = `
        <p><button class="btnPraias" id="praia-mira">Ver Praia
        <i class="fa fa-video-camera" style="font-size: 18px; margin-left: 5px;"></i></button></p>
      `;
    }

    const nomeTratado = nomesTratados[tabela] || tabela;

    return `
      <h6><b>Tipo:</b> ${nomeTratado}</h6>
        ${imagemHTML}
      <p><b>Nome:</b> ${nome}</p>
      ${addressHTML}
      <p><a href="${streetViewUrl}" target="_blank">Ver no Google Street View</a></p>
      ${extraHTML}
      <p><button id="add_PI_to_Route">Adicionar à rota
      <i class="fa fa-road" style="font-size: 18px; margin-left: 5px;"></i></button></p>
    `;
  }

  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'saber-mais') {
      let extraInfo = JSON.parse(e.target.getAttribute('data-extra-info'));
      openModalWithExtraInfo(extraInfo);
    }
  });


  function openModalWithExtraInfo(extraInfo) {
    var mareHeights = JSON.parse(extraInfo.mare_heights);

    var modal = document.getElementById('infoModal');

    var contentElement = document.getElementById('modalContent');

    var heightsArray = Object.keys(mareHeights.heights).map(function (key) {
      return mareHeights.heights[key];
    });

    var timesArray = Object.keys(mareHeights.times).map(function (key) {
      return mareHeights.times[key];
    });

    createChart(heightsArray, timesArray);

    var extraHTML = `
      <p><b>Informação sobre o mar:</b></p>
      <p><b>Velocidade do Vento:</b> ${extraInfo.velocidadevento || 'Desconhecido'}</p>
      <p><b>Altura da Onda:</b> ${extraInfo.alturaonda || 'Desconhecido'}</p>
      <p><b>Direção do Vento:</b> ${extraInfo.direcaovento || 'Desconhecido'}</p>
      <p><b>Altura do 'swell':</b> ${extraInfo.swellaltura || 'Desconhecido'}</p>
      <p><b>Período do 'swell':</b> ${extraInfo.swellperiodo || 'Desconhecido'}</p>
      <p><b>Direção do 'swell':</b> ${extraInfo.swelldirecao || 'Desconhecido'}</p>
      <p><b>Preia-mar:</b> ${extraInfo.mare_high_tides || 'Desconhecido'}</p>
      <p><b>Baixa-mar:</b> ${extraInfo.mare_low_tides || 'Desconhecido'}</p>
    `;

    contentElement.innerHTML = extraHTML;

    modal.style.display = 'block';
    modal.style.display = 'flex';
  }

  var chart;

  function createChart(heights, times) {
    if (Array.isArray(heights) && Array.isArray(times)) {
      var ctx = document.getElementById('mareGraph').getContext('2d');

      if (chart) {
        chart.destroy();
      }

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: times,
          datasets: [{
            label: 'Altura da Maré (metros)',
            backgroundColor: '#0496C7',
            borderColor: '#0496C7',
            data: heights,
          }]
        },
        options: {}
      });
    } else {
      console.error('Dados inválidos para criar o gráfico');
    }
  }


  function loadStream(videoElementId, streamUrl) {
    var video = document.getElementById(videoElementId);
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('canplay', function () {
        video.play();
      });
    }
  }


  loadStream('video2', 'https://video-auth1.iol.pt/beachcam/costanova/playlist.m3u8');
  loadStream('video3', 'https://video-auth1.iol.pt/beachcam/barra/playlist.m3u8');
  loadStream('video4', 'https://video-auth1.iol.pt/beachcam/torreira/playlist.m3u8');
  loadStream('video5', 'https://video-auth1.iol.pt/beachcam/vagueiracasablanca/playlist.m3u8');
  loadStream('video6', 'https://video-auth1.iol.pt/beachcam/furadouro/playlist.m3u8');
  loadStream('video7', 'https://video-auth1.iol.pt/beachcam/bcmira/playlist.m3u8');

  function addLayers() {
    let currentPopup = null; 
    let closePopupTimeout = null; 

    tabelas.forEach((tabela) => {
      fetch(`https://gis4cloud.com/grupo4_ptas2024/bd.php?tabela=${tabela}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          map.addSource(tabela, {
            type: "geojson",
            data: data,
          });

          map.loadImage(getLayerImage(tabela), function (error, image) {
            if (error) {
              console.error("Error loading image:", error);
              return;
            }

            map.addImage(tabela, image);

            map.addLayer({
              id: tabela,
              type: "symbol",
              source: tabela,
              layout: {
                "icon-image": tabela,
                "icon-size": 0.03,
                "icon-allow-overlap": true,
                visibility: "none",
              },
            });

            const popup = new mapboxgl.Popup({
              closeButton: true, 
              closeOnClick: false,
            });

            function closeCurrentPopup() {
              if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
              }
            }

            map.on("mouseenter", tabela + "_within", function (e) {
              closeCurrentPopup(); 
              if (closePopupTimeout) {
                clearTimeout(closePopupTimeout);
                closePopupTimeout = null;
              }

              map.getCanvas().style.cursor = "pointer";

              const coordinates = e.features[0].geometry.coordinates.slice();
              const nome = e.features[0].properties.nome ? e.features[0].properties.nome : 'Desconhecido';
              const imgurl = e.features[0].properties.imgurl ? e.features[0].properties.imgurl : 'Imagem desconhecida';
              var streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates[1]},${coordinates[0]}`;

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordinates[1]}&lon=${coordinates[0]}&format=json`)
                .then(response => response.json())
                .then(data => {
                  const addressParts = data.address;
                  const rua = addressParts.road ? addressParts.road : 'Desconhecido';
                  const codigoPostal = addressParts.postcode ? addressParts.postcode : 'Desconhecido';
                  const cidade = addressParts.city ? addressParts.city : 'Desconhecido';
                  const addressHTML = `
                    <p><strong>Rua:</strong> ${rua}</p>
                    <p><strong>Código Postal:</strong> ${codigoPostal}</p>
                    <p><strong>Cidade:</strong> ${cidade}</p>
                  `;

                  popup
                    .setLngLat(coordinates)
                    .setHTML(createPopupHTMLPI(tabela, nome, addressHTML, streetViewUrl, imgurl))
                    .addTo(map);
                  currentPopup = popup; 

                  document.getElementById("add_PI_to_Route").addEventListener("click", function () {
                    addToRoute(coordinates);
                  });
                })
                .catch(error => console.error("Error fetching address:", error));
            });

            map.on("mouseleave", tabela + "_within", function () {
              map.getCanvas().style.cursor = "";
              closePopupTimeout = setTimeout(() => {
                closeCurrentPopup(); 
              }, 2000);
            });

            map.on("mouseenter", tabela, function (e) {
              closeCurrentPopup();
              if (closePopupTimeout) {
                clearTimeout(closePopupTimeout);
                closePopupTimeout = null;
              }

              map.getCanvas().style.cursor = "pointer";
              const properties = e.features[0].properties;
              const coordinates = e.features[0].geometry.coordinates.slice();
              const nome = e.features[0].properties.nome ? e.features[0].properties.nome : 'Desconhecido';
              const imgurl = e.features[0].properties.imgurl ? e.features[0].properties.imgurl : 'Imagem desconhecida';
              var streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates[1]},${coordinates[0]}`;

              let extraInfo = {};
              if (tabela === 'ondas') {
                extraInfo = {
                  velocidadevento: e.features[0].properties.velocidadevento,
                  alturaonda: e.features[0].properties.alturaonda,
                  direcaovento: e.features[0].properties.direcaovento,
                  swellaltura: e.features[0].properties.swellaltura,
                  swellperiodo: e.features[0].properties.swellperiodo,
                  swelldirecao: e.features[0].properties.swelldirecao,
                  mare_high_tides: e.features[0].properties.mare_high_tides,
                  mare_low_tides: e.features[0].properties.mare_low_tides,
                  mare_heights: e.features[0].properties.mare_heights
                };
              }

              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }

              fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordinates[1]}&lon=${coordinates[0]}&format=json`)
                .then(response => response.json())
                .then(data => {
                  const addressParts = data.address;
                  const rua = addressParts.road ? addressParts.road : 'Desconhecido';
                  const codigoPostal = addressParts.postcode ? addressParts.postcode : 'Desconhecido';
                  const cidade = addressParts.city ? addressParts.city : 'Desconhecido';
                  const addressHTML = `
                    <p><strong>Rua:</strong> ${rua}</p>
                    <p><strong>Código Postal:</strong> ${codigoPostal}</p>
                    <p><strong>Cidade:</strong> ${cidade}</p>
                  `;

                  popup
                    .setLngLat(coordinates)
                    .setHTML(createPopupHTMLPI(tabela, nome, addressHTML, streetViewUrl, imgurl, extraInfo))
                    .addTo(map);
                  currentPopup = popup;

                  document.getElementById("add_PI_to_Route").addEventListener("click", function () {
                    addToRoute(coordinates);
                  });
                })
                .catch(error => console.error("Error fetching address:", error));
            });

            map.on("mouseleave", tabela, function () {
              map.getCanvas().style.cursor = "";
              closePopupTimeout = setTimeout(() => {
                closeCurrentPopup(); 
              }, 2000);
            });
          });
        })
        .catch((error) => console.error("Error:", error));
    });
  }

  function addHeatMap() {
    tabelas.forEach((tabela) => {
      fetch(`https://gis4cloud.com/grupo4_ptas2024/bd.php?tabela=${tabela}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); 
        })
        .then((data) => {
          const sourceId = `heatmap-data-${tabela}`;
          const layerId = `heatmap-layer-${tabela}`;

          if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
              type: 'geojson',
              data: data
            });

            map.addLayer({
              'id': layerId,
              'type': 'heatmap',
              'source': sourceId,
            });
          }
        })
    });
  }

  function removeHeatMap() {
    tabelas.forEach((tabela) => {
      const sourceId = `heatmap-data-${tabela}`;
      const layerId = `heatmap-layer-${tabela}`;

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }

      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });
  }

  document.getElementById("heatmap").addEventListener("change", function () {
    if (this.checked) {
      addHeatMap();
    } else {
      removeHeatMap();
    }
  });

  var percursos = [
    "percurso_azul",
    "percurso_dourado",
    "percurso_natureza",
    "percurso_verde",
    "percurso_salreu",
    "percurso_fermela",
    "percurso_pardilho",
    "percurso_veiros",
    "percurso_btt",
  ];

  function createPopupHTML(properties) {

    return `

      <div>

        <h4>${properties.Nome_do_Percurso}</h4>
        <p>
        <img src="${properties.imgurl}" alt="Imagem" width="200px" height="150px"/>
        </p>
        <p><b>Distância:</b> ${properties.Distancia_Km}</p>

        <p><b>Duração Estimada:</b> ${properties.Duracao_Estimada}</p>

        <p><b>Âmbito:</b> ${properties.Ambito}</p>

        <p><b>Grau de Dificuldade:</b> ${properties.Grau_Dificuldade}</p>

        <p><b>Época Aconselhada:</b> ${properties.Epoca_Aconselhada}</p>

      </div>

    `;

  }
  function createPopupHTML_Nauticos(properties) {

    return `

      <div>

        <p><img src="${properties.icon}" alt="Imagem" width="200px" height="150px"/></p>

        <h4>${properties.Nome_do_Percurso}</h4>

        <p><b>Distância:</b> ${properties.Distancia_Km}</p>

        <p><b>Grau de Dificuldade:</b> ${properties.Grau_Dificuldade}</p>

        <p><b>Tipologia:</b> ${properties.Tipologia}</p>

        <p><b>Duração Estimada:</b> ${properties.Duracao_Estimada}</p>

        <p><b>Ponto de entrada:</b> ${properties.Ponto_Entrada}</p>

        <p><b>Ponto de saída:</b> ${properties.Ponto_Saida}</p>


      </div>

    `;

  }

  let currentPopup = null;

  const coresDosPercursos = {

    "percurso_azul": "#0000FF",

    "percurso_dourado": "#FFD700",

    "percurso_verde": "#008000",

    "percurso_natureza": "#2E8B57", 

    "percurso_salreu": "#ADD8E6",

    "percurso_fermela": "#FFC0CB", 

    "percurso_pardilho": "#A52A2A", 

    "percurso_veiros": "#FFFF00", 

    "percurso_btt": "#FFA500" 
  };

  const coresDosPercursosNauticos = {

    "percurso_a": "#FF69B4",
    "percurso_b": "#FF69B4",
    "percurso_c": "#FF69B4",
    "percurso_d": "#FF69B4",
    "percurso_e": "#FF69B4",
    "percurso_f": "#FF69B4",
    "percurso_g": "#FF69B4",
    "percurso_h": "#FF69B4",
    "percurso_i": "#FF69B4",
    "percurso_j": "#FF69B4",
    "percurso_k": "#FF69B4",
    "percurso_l": "#FF69B4",
  };


  percursos.forEach(function (percurso) {

    fetch(`https://gis4cloud.com/grupo4_ptas2024/percursos.php?tabela=${percurso}`)

      .then((response) => response.json()) 

      .then((data) => {

        map.addSource(percurso, {

          type: "geojson",

          data: data,

        });

        map.addLayer({

          id: percurso,

          type: "line",

          source: percurso,

          layout: {

            "line-join": "round",

            "line-cap": "round",

            visibility: "none",

          },

          paint: {

            "line-color": coresDosPercursos[percurso], 

            "line-width": 5,

          },

        });

        map.on('mouseenter', percurso, function (e) {
          if (e.features.length > 0) {

            var feature = e.features[0];

            var popupHTML = createPopupHTML(feature.properties);

            if (currentPopup) {

              currentPopup.remove();

            }

            currentPopup = new mapboxgl.Popup()

              .setLngLat(e.lngLat)

              .setHTML(popupHTML)

              .addTo(map);

          }

        });

        map.on('mouseleave', percurso, function () {

          map.getCanvas().style.cursor = '';

          if (currentPopup) {

            currentPopup.remove();

            currentPopup = null;

          }
        });
      });
  });

  var percursos_nauticos = [
    "percurso_a",
    "percurso_b",
    "percurso_c",
    "percurso_d",
    "percurso_e",
    "percurso_f",
    "percurso_g",
    "percurso_h",
    "percurso_i",
    "percurso_j",
    "percurso_k",
    "percurso_l",
  ];

  percursos_nauticos.forEach(function (percurso_nautico) {
    fetch(`https://gis4cloud.com/grupo4_ptas2024/percursos_nauticos.php?tabela=${percurso_nautico}`)
      .then((response) => response.json())
      .then((data) => {
        map.addSource(percurso_nautico, {
          type: "geojson",
          data: data,
        });

        map.addLayer({
          id: percurso_nautico,
          type: "line",
          source: percurso_nautico,
          layout: {
            "line-join": "round",
            "line-cap": "round",
            visibility: "none",
          },
          paint: {

            "line-color": coresDosPercursosNauticos[percurso_nautico],

            "line-width": 5,

          },
        });

        map.on('mouseenter', percurso_nautico, function (e) {

          if (e.features.length > 0) {

            var feature = e.features[0];

            var popupHTML = createPopupHTML_Nauticos(feature.properties);

            if (currentPopup) {

              currentPopup.remove();

            }

            currentPopup = new mapboxgl.Popup()

              .setLngLat(e.lngLat)

              .setHTML(popupHTML)

              .addTo(map);

          }

        });

        map.on('mouseleave', percurso_nautico, function () {

          map.getCanvas().style.cursor = '';

          if (currentPopup) {

            currentPopup.remove();

            currentPopup = null;

          }
        });
      });
  });

  addLayers();

  map.on("style.load", addLayers);

  const layerClasses = {
    "Alojamento-e-Transporte": [
      "point_alojamento_local",
      "aluguer_bicicletas",
      "aluguer_carros",
      "local_ferry",
      "terminal_ferry",
    ],
    "Pontos-de-Interesse": [
      "arte_xavega",
      "aves",
      "point_marinas_docas",
      "nucleos_pesca",
      "point_porto",
      "praias",
      "barra",
      "salinas",
    ],
    Serviços: [
      "bancos",
      "bombas_gasolina",
      "estacao",
      "farmacias",
      "hospitais",
      "multibanco",
      "paragensautocarro",
      "restaurantes",
    ],
    Atividades: [
      "kitesurf",
      "point_surf",
      "natacao_pontoprofessora",
      "voleipraia",
      "ondas",
      "percurso_azul",
      "percurso_dourado",
      "percurso_verde",
      "percurso_natureza",
      "percurso_salreu",
      "percurso_fermela",
      "percurso_pardilho",
      "percurso_veiros",
      "percurso_btt"
    ],
    PercursosNauticos: [
      "percurso_a",
      "percurso_b",
      "percurso_c",
      "percurso_d",
      "percurso_e",
      "percurso_f",
      "percurso_g",
      "percurso_h",
      "percurso_i",
      "percurso_j",
      "percurso_k",
      "percurso_l"
    ]
  };

  const layerNames = {
    point_alojamento_local: "Alojamento Local",
    aluguer_bicicletas: "Aluguer de Bicicletas",
    aluguer_carros: "Aluguer de Carros",
    arte_xavega: "Arte Xávega",
    aves: "Observação de Aves",
    bancos: "Bancos",
    bombas_gasolina: "Bombas de Gasolina",
    estacao: "Estação",
    farmacias: "Farmácias",
    hospitais: "Hospitais",
    kitesurf: "Kitesurf",
    local_ferry: "Ferry Local",
    point_marinas_docas: "Marinas e Docas",
    multibanco: "Multibanco",
    natacao_pontoprofessora: "Natação",
    nucleos_pesca: "Núcleos de Pesca",
    ondas: "Ondas",
    paragensautocarro: "Paragens de Autocarro",
    percurso_azul: "Percurso Azul",
    percurso_dourado: "Percurso Dourado",
    percurso_natureza: "Percurso Natureza",
    percurso_verde: "Percurso Verde",
    percurso_salreu: "Percurso Salreu",
    percurso_fermela: "Percurso Fermelã",
    percurso_pardilho: "Percurso Pardilhó",
    percurso_veiros: "Percurso Veiros",
    percurso_btt: "Percurso BTT",
    percurso_a: "Percurso A",
    percurso_b: "Percurso B",
    percurso_c: "Percurso C",
    percurso_d: "Percurso D",
    percurso_e: "Percurso E",
    percurso_f: "Percurso F",
    percurso_g: "Percurso G",
    percurso_h: "Percurso H",
    percurso_i: "Percurso I",
    percurso_j: "Percurso J",
    percurso_k: "Percurso K",
    percurso_l: "Percurso L",
    point_porto: "Porto",
    praias: "Praias",
    barra: "Estação Meteorológica",
    restaurantes: "Restaurantes",
    point_surf: "Surf",
    terminal_ferry: "Terminal de Ferry",
    salinas: "Salinas",
    voleipraia: "Vólei de Praia",
  };

  let layersAdded = false;

  map.on("idle", () => {
    if (!layersAdded) {
      for (const [classId, layers] of Object.entries(layerClasses)) {
        const layersDiv = document.querySelector(`#${classId} .layers`);
        for (const layer of layers) {
          const layerContainer = document.createElement("div");
          layerContainer.className = "form-check form-switch";

          const checkbox = document.createElement("input");
          checkbox.className = "form-check-input";
          checkbox.type = "checkbox";
          checkbox.role = "switch";
          checkbox.id = layer;
          checkbox.onchange = function () {
            toggleLayerVisibility(layer, this);
          };

          const label = document.createElement("label");
          label.className = "form-check-label";
          label.htmlFor = layer;
          label.textContent = layerNames[layer] || layer;

          layerContainer.appendChild(checkbox);
          layerContainer.appendChild(label);
          layersDiv.appendChild(layerContainer);
        }
      }

      const batimetriaDiv = document.querySelector("#Batimetrias .layers");
      const batimetriaLayers = ["batimetria25m", "batimetria2m"];

      for (const layer of batimetriaLayers) {
        const layerContainer = document.createElement("div");
        layerContainer.className = "form-check form-switch";

        const checkbox = document.createElement("input");
        checkbox.className = "form-check-input";
        checkbox.type = "checkbox";
        checkbox.role = "switch";
        checkbox.id = layer;
        checkbox.onchange = function () {
          toggleBatimetriaVisibility(layer, this);
        };

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.htmlFor = layer;
        label.textContent = layerNames[layer] || layer;

        layerContainer.appendChild(checkbox);
        layerContainer.appendChild(label);
        batimetriaDiv.appendChild(layerContainer);
      }

      layersAdded = true;
    }
  });

  function toggleBatimetriaVisibility(layerId, checkbox) {
    const legend25m = document.getElementById('legend25m');
    const legend2m = document.getElementById('legend2m');

    if (checkbox.checked) {
      map.setPaintProperty(layerId, 'raster-opacity', 1);
      if (layerId === 'batimetria25m') {
        legend25m.style.display = 'block';
      } else if (layerId === 'batimetria2m') {
        legend2m.style.display = 'block';
      }
    } else {
      map.setPaintProperty(layerId, 'raster-opacity', 0);
      if (layerId === 'batimetria25m') {
        legend25m.style.display = 'none';
      } else if (layerId === 'batimetria2m') {
        legend2m.style.display = 'none';
      }
    }
  }

  function toggleLayerVisibility(layer, switchElement) {
    const layerId = [layer, layer + "_within"].find((id) => map.getLayer(id));
    if (layerId) {
      const visibility = map.getLayoutProperty(layerId, "visibility");

      if (visibility === "visible") {
        map.setLayoutProperty(layerId, "visibility", "none");
        switchElement.checked = false;
      } else {
        map.setLayoutProperty(layerId, "visibility", "visible");
        switchElement.checked = true;
      }
    }
  }

  function getLayerImage(tabela) {
    switch (tabela) {
      case "point_alojamento_local":
        return "imagens/alojamento_local.png";
      case "aluguer_bicicletas":
        return "imagens/aluguer_bicicletas.png";
      case "aluguer_carros":
        return "imagens/aluguer_carros.png";
      case "arte_xavega":
        return "imagens/arte_xavega.png";
      case "aves":
        return "imagens/aves.png";
      case "bancos":
        return "imagens/bancos.png";
      case "bombas_gasolina":
        return "imagens/bombas_gasolina.png";
      case "estacao":
        return "imagens/estacao.png";
      case "farmacias":
        return "imagens/farmacias.png";
      case "hospitais":
        return "imagens/hospital.png";
      case "kitesurf":
        return "imagens/kitesurf.png";
      case "local_ferry":
        return "imagens/local_ferry.png";
      case "point_marinas_docas":
        return "imagens/marinas_docas.png";
      case "multibanco":
        return "imagens/multibanco.png";
      case "natacao_pontoprofessora":
        return "imagens/natacao_pontoprofessora.png";
      case "nucleos_pesca":
        return "imagens/nucleos_pesca.png";
      case "ondas":
        return "imagens/ondas.png";
      case "paragensautocarro":
        return "imagens/paragensautocarro.png";
      case "point_porto":
        return "imagens/porto.png";
      case "praias":
        return "imagens/praias.png";
      case "barra":
        return "imagens/windsign.png";
      case "restaurantes":
        return "imagens/restaurantes.png";
      case "point_surf":
        return "imagens/surf.png";
      case "terminal_ferry":
        return "imagens/local_ferry.png";
      case "salinas":
        return "imagens/salinas.png";
      case "voleipraia":
        return "imagens/voleipraia.png";
    }
  }
});

map.on("style.load", () => {
  map.setConfigProperty("basemap", "lightPreset", "dusk");
  updateIsochroneColor("dusk");
});


function updateIsochroneColor(periodType) {
  let color;
  if (periodType === "dusk" || periodType === "night") {
    color = "#FFE900"; 
  } else {
    color = "#5a3fc0"; 
  }
  map.setPaintProperty("isochrone", "fill-color", color);
}

function selectPeriod(periodType) {
  const isSelected = document.querySelector(`.periods .option[data-value="${periodType}"]`).classList.contains('selected');

  if (isSelected) {
    return;
  }

  document.querySelectorAll('.periods .option').forEach(option => {
    option.classList.remove('selected');
  });

  document.querySelector(`.periods .option[data-value="${periodType}"]`).classList.add('selected');

  document.querySelectorAll('.periods .option').forEach(option => {
    if (option.getAttribute('data-value') === periodType) {
      option.classList.add('selected');
    }

    if (periodType === 'dawn') {
      map.setConfigProperty("basemap", "lightPreset", "dawn");
    } else if (periodType === 'day') {
      map.setConfigProperty("basemap", "lightPreset", "day");
    } else if (periodType === 'dusk') {
      map.setConfigProperty("basemap", "lightPreset", "dusk");
    } else if (periodType === 'night') {
      map.setConfigProperty("basemap", "lightPreset", "night");
    }
  });
  updateIsochroneColor(periodType);
}

document.getElementById("selectAll").addEventListener("change", function () {
  configIds.forEach((id) => map.setConfigProperty("basemap", id, this.checked));
});

document
  .querySelectorAll('.map-overlay-inner input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      map.setConfigProperty("basemap", this.id, this.checked);
    });
  });

const configIds = [
  "showPlaceLabels",
  "showPointOfInterestLabels",
  "showRoadLabels",
  "showTransitLabels",
];

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const arrowIcon = document.querySelector(".sidebar-toggle .arrow-icon");
  sidebar.classList.toggle("show");
  if (sidebar.classList.contains("show")) {
    arrowIcon.innerHTML = "«";
  } else {
    arrowIcon.innerHTML = "»";
  }
}

function toggleSidebarLayers() {
  const sidebar = document.getElementById("sidebarLayers");
  const arrowIcon = document.querySelector(".sidebarLayers-toggle .arrow-icon");
  sidebar.classList.toggle("show");
  if (sidebar.classList.contains("show")) {
    arrowIcon.innerHTML = "»";
  } else {
    arrowIcon.innerHTML = "«";
  }
}

function toggleArrow(element) {
  element.querySelector("span").classList.toggle("fa-arrow-up");
  element.querySelector("span").classList.toggle("fa-arrow-down");
}

var lastClickedPoint = null;

function addOrUpdateSource(sourceId, data) {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(data);
  } else {
    map.addSource(sourceId, {
      type: "geojson",
      data: data,
    });
  }
}

var mapClicked = false;

function calculateIsochrone() {
  if (mapClicked == false) {
    return;
  }

  for (const [tabela, data] of Object.entries(originalPointsData)) {
    if (!map.getSource(tabela)) {
      addOrUpdateSource(tabela, data);
    }
  }

  if (lastClickedPoint === null) return;

  var coordinates = lastClickedPoint;

  var selectedVehicle = document.querySelector('.veiculos .option.selected');
  var routingProfile = selectedVehicle ? selectedVehicle.getAttribute('data-value') : null;

  var selectedMetric = document.querySelector('.metrica .option.selected');
  var contourType = selectedMetric ? selectedMetric.getAttribute('data-value') : null;

  var sliderValue = document.getElementById("myRange").value;
  var contour;

  if (contourType === 'minutes') {
    contour = valuesMinutos[sliderValue];
  } else if (contourType === 'meters') {
    contour = valuesMetros[sliderValue];
  } else {
    contour = ''; 
  }

  var apiUrl = `https://api.mapbox.com/isochrone/v1/mapbox/${routingProfile}/${coordinates.lng}%2C${coordinates.lat}?contours_${contourType}=${contour}&polygons=true&denoise=1&access_token=pk.eyJ1Ijoic2RhbmllbHNpbHZhIiwiYSI6ImNsdmY0bTUwNDAzbWwyamw4NjUwMW5paTUifQ.0MAtfqLmatOkT_NjHAo9Ag`;

  if (map.getLayer("isochrone")) {
    map.removeLayer("isochrone");
    map.removeSource("isochrone");
  }

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      map.addSource("isochrone", {
        type: "geojson",
        data: data,
      });

      map.addLayer({
        id: "isochrone",
        type: "fill",
        source: "isochrone",
        layout: {},
        paint: {
          "fill-color": "#5a3fc0",
          "fill-opacity": 0.33,
        },
      });

      const periodType = document.querySelector('.periods .option.selected').getAttribute('data-value');
      updateIsochroneColor(periodType);

      var bounds = new mapboxgl.LngLatBounds();
      data.features[0].geometry.coordinates[0].forEach((coord) =>
        bounds.extend(coord)
      );
      map.fitBounds(bounds, { padding: 20 });

      tabelas.forEach((tabela) => {
        const source = map.getSource(tabela);
        if (source) {
          const pointsData = source._data;

          originalPointsData[tabela] = pointsData;

          const pointsWithin = turf.pointsWithinPolygon(pointsData, data);

          if (map.getLayer(tabela)) {
            map.removeLayer(tabela);
            map.removeSource(tabela);
          }

          if (map.getLayer(tabela + "_within")) {
            map.removeLayer(tabela + "_within");
          }
          if (map.getSource(tabela + "_within")) {
            map.removeSource(tabela + "_within");
          }
          addOrUpdateSource(tabela + "_within", pointsWithin);

          map.addLayer({
            id: tabela + "_within",
            type: "symbol",
            source: tabela + "_within",
            layout: {
              "icon-image": tabela,
              "icon-size": 0.02,
              "icon-allow-overlap": true,
            },
          });
        } else {
          console.error("Fonte de dados não encontrada para tabela: ", tabela);
        }
      });
    });
}

map.on("click", function (e) {
  mapClicked = true;

  lastClickedPoint = e.lngLat;

  tabelas.forEach((tabela) => {
    if (map.getLayer(tabela + "_within")) {
      map.removeLayer(tabela + "_within");
      map.removeSource(tabela + "_within");
    }
  });

  calculateIsochrone();
});

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
var sliderContainer = document.getElementById("sliderContainer");

var valuesMinutos = {
  1: "5",
  2: "10",
  3: "15",
  4: "20",
  5: "25",
  6: "30"
};

var valuesMetros = {
  1: "1000",
  2: "2000",
  3: "3000",
  4: "4000",
  5: "5000"
};

output.innerHTML = valuesMinutos[slider.value];

slider.oninput = function () {
  updateSliderValue();
};

function updateSliderValue() {
  var selectedMetric = document.querySelector('.metrica .option.selected');
  var contourType = selectedMetric ? selectedMetric.getAttribute('data-value') : null;

  if (contourType === 'minutes') {
    output.innerHTML = valuesMinutos[slider.value];
  } else if (contourType === 'meters') {
    output.innerHTML = valuesMetros[slider.value];
  }

  calculateIsochrone();
}

function selectMetric(metricType) {
  document.querySelectorAll('.metrica .option').forEach(option => {
    if (option.getAttribute('data-value') === metricType) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });

  if (metricType === 'minutes') {
    slider.setAttribute('max', 6); 
    output.innerHTML = valuesMinutos[slider.value];
  } else {
    slider.setAttribute('max', 5); 
    output.innerHTML = valuesMetros[slider.value];
  }

  sliderContainer.style.display = 'block';

  updateSliderValue();

  calculateIsochrone();
}

function selectOption(element, inputId, value) {
  const input = document.getElementById(inputId);

  const container = element.parentElement;

  if (element.classList.contains('selected')) {
    element.classList.remove('selected');
    if (input) {
      input.value = '';
    } else {
      console.warn("Input element not found with ID:", inputId);
    }
  } else {
    container.querySelectorAll('.option').forEach(option => {
      option.classList.remove('selected');
    });

    element.classList.add('selected');
    if (input) {
      input.value = value; 
    } else {
      console.warn("Input element not found with ID:", inputId);
    }
  }

  calculateIsochrone();
}

function limparIsocronas() {
  if (map.getLayer("isochrone")) {
    map.removeLayer("isochrone");
  }

  if (map.getSource("isochrone")) {
    map.removeSource("isochrone");
  }

  tabelas.forEach((tabela) => {
    const sourceWithinId = tabela + "_within";
    if (map.getLayer(sourceWithinId)) {
      map.removeLayer(sourceWithinId);
    }
    if (map.getSource(sourceWithinId)) {
      map.removeSource(sourceWithinId);
    }
  });

  lastClickedPoint = null;
  refreshLayersAfterClear();

  document.getElementById("addressInputA").value = "";
  document.getElementById("addressInputB").value = "";
  document.getElementById("addressInputIntermedio").value = "";
  document.getElementById("addressInputWeather").value = "";
}

var weatherMarker;
var openWeatherMapApiKey = "YOUR_OPENWEATHERMAP_API_KEY";

var popup_tempo; 
var isMarkerBeingDragged = false;

document.getElementById("addWeatherPoint").addEventListener("click", function () {
  if (weatherMarker) weatherMarker.remove();

  var center = map.getCenter();

  weatherMarker = new mapboxgl.Marker({ color: "purple", draggable: true })
    .setLngLat(center)
    .addTo(map)
    .on("dragend", function () {
      fetchWeatherData(weatherMarker.getLngLat());
    });

  fetchWeatherData(center);
});

function fetchWeatherData(lngLat) {
  isMarkerBeingDragged = true;

  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lngLat.lat}&lon=${lngLat.lng}&appid=${openWeatherMapApiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      var temperature = data.main.temp - 273.15; 
      var feelsLike = data.main.feels_like - 273.15; 
      var tempMin = data.main.temp_min - 273.15;
      var tempMax = data.main.temp_max - 273.15; 
      var humidity = data.main.humidity; 
      var seaLevel = data.main.sea_level; 
      var windSpeed = data.wind.speed * 3.6; 
      var weatherIcon = data.weather[0].icon; 

      var weatherIconUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`;

      if (popup_tempo) {
        popup_tempo.remove();
      }

      popup_tempo = new mapboxgl.Popup({ offset: 25 })
        .setLngLat(lngLat)
        .setHTML(
          `<h6>Informações meteorológicas</h6>
          <img src="${weatherIconUrl}" alt="Ícone do tempo" width="100" height="100">
          <p>Temperatura: ${temperature.toFixed(2)} °C</p>
          <p>Sensação térmica: ${feelsLike.toFixed(2)} °C</p>
          <p>Temperatura mínima: ${tempMin.toFixed(2)} °C</p>
          <p>Temperatura máxima: ${tempMax.toFixed(2)} °C</p>
          <p>Humidade: ${humidity} %</p>
          <p>Pressão atmosférica: ${seaLevel} hPa</p>
          <p>Velocidade do vento: ${windSpeed.toFixed(2)} km/h</p>`
        )
        .addTo(map);
      isMarkerBeingDragged = false;
      popup_tempo.on("close", function () {
        if (weatherMarker && !isMarkerBeingDragged) {
          weatherMarker.remove();
        }
      });
    });
}

document.getElementById("addPointA").addEventListener("click", function () {

  if (markerA) markerA.remove();

  markerA = new mapboxgl.Marker({ color: "red", draggable: true })
    .setLngLat(map.getCenter())
    .addTo(map);

  var popupA;
  popupA = new mapboxgl.Popup({ offset: 25 })
    .setLngLat(map.getCenter())
    .setText('Ponto A')
    .addTo(map);

  markerA.setPopup(popupA);

  popupA.getElement().addEventListener('click', function () {
    if (markerA) {
      markerA.remove();
      markerA = null;
    }
  });
});

document.getElementById("addPointB").addEventListener("click", function () {

  if (markerB) markerB.remove();

  markerB = new mapboxgl.Marker({ color: "blue", draggable: true })
    .setLngLat(map.getCenter())
    .addTo(map);

  var popupB;
  popupB = new mapboxgl.Popup({ offset: 25 })
    .setLngLat(map.getCenter())
    .setText('Ponto B')
    .addTo(map);

  markerB.setPopup(popupB);

  popupB.getElement().addEventListener('click', function () {
    if (markerB) {
      markerB.remove();
      markerB = null;
    }
  });
});

document.getElementById("addPointIntermedio").addEventListener("click", function () {

  if (markerIntermedio) markerIntermedio.remove();

  markerIntermedio = new mapboxgl.Marker({ color: "orange", draggable: true })
    .setLngLat(map.getCenter())
    .addTo(map);

  var popupIntermedio;
  popupIntermedio = new mapboxgl.Popup({ offset: 25 })
    .setLngLat(map.getCenter())
    .setText('Ponto Intermédio')
    .addTo(map);

  markerIntermedio.setPopup(popupIntermedio);

  popupIntermedio.getElement().addEventListener('click', function () {
    if (markerIntermedio) {
      markerIntermedio.remove();
      markerIntermedio = null;
    }
  });

  calculateRoute();
});

var markerPI = null; 

function addToRoute(coordinates) {
  if (markerPI) markerPI.remove();

  markerPI = new mapboxgl.Marker({ color: 'green' })
    .setLngLat(coordinates)
    .addTo(map);

  var popupPI_escolhido;
  popupPI_escolhido = new mapboxgl.Popup({ offset: 25 })
    .setLngLat(coordinates)
    .setText('Ponto de interesse escolhido')
    .addTo(map);

  markerPI.setPopup(popupPI_escolhido);

  popupPI_escolhido.getElement().addEventListener('click', function () {
    if (markerPI) {
      markerPI.remove();
      markerPI = null;
    }
  });

  calculateRoute(); 
}


function addAutocompleteAndSearch(inputId, markerColor, map) {
  $(function () {
    $(`#${inputId}`).autocomplete({
      source: function (request, response) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(request.term)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true`;

        axios.get(url)
          .then(res => {
            const featuresWithinBounds = res.data.features.filter(feature => {
              const coords = feature.geometry.coordinates;
              const lngLat = mapboxgl.LngLat.convert(coords);
              return lngLat.lng >= -9.6 && lngLat.lng <= -8.45 && lngLat.lat >= 40.4 && lngLat.lat <= 41;
            });

            response(featuresWithinBounds.map(feature => ({
              label: feature.place_name,
              value: feature.place_name,
              feature: feature
            })));
          })
          .catch(err => {
            console.error(err);
            response([]);
          });
      },
      minLength: 2,
      select: function (event, ui) {
        const coords = ui.item.feature.geometry.coordinates;
        const description = ui.item.feature.place_name;

        map.flyTo({
          center: coords,
          zoom: 15
        });

        if (inputId === "addressInputA") {
          if (markerA) markerA.remove();
          markerA = new mapboxgl.Marker({ color: markerColor, draggable: true })
            .setLngLat(coords)
            .addTo(map);

          var popupA;
          popupA = new mapboxgl.Popup({ offset: 25 })
            .setLngLat(coords)
            .setText('Ponto A')
            .addTo(map);

          markerA.setPopup(popupA);
        } else if (inputId === "addressInputB") {
          if (markerB) markerB.remove();
          markerB = new mapboxgl.Marker({ color: markerColor, draggable: true })
            .setLngLat(coords)
            .addTo(map);

          var popupB;
          popupB = new mapboxgl.Popup({ offset: 25 })
            .setLngLat(coords)
            .setText('Ponto B')
            .addTo(map);

          markerB.setPopup(popupB);
        } else if (inputId === "addressInputIntermedio") {
          if (markerIntermedio) markerIntermedio.remove();
          markerIntermedio = new mapboxgl.Marker({ color: markerColor, draggable: true })
            .setLngLat(coords)
            .addTo(map);

          var popupIntermedio;
          popupIntermedio = new mapboxgl.Popup({ offset: 25 })
            .setLngLat(coords)
            .setText('Ponto Intermédio')
            .addTo(map);

          markerIntermedio.setPopup(popupIntermedio);
          calculateRoute();
        } else if (inputId === "addressInputWeather") {
          if (weatherMarker) weatherMarker.remove();
          weatherMarker = new mapboxgl.Marker({ color: markerColor, draggable: true })
            .setLngLat(coords)
            .addTo(map)
            .on("dragend", function () {
              fetchWeatherData(weatherMarker.getLngLat());
            });
          fetchWeatherData(weatherMarker.getLngLat());
        }
      }
    });
  });
}

addAutocompleteAndSearch("addressInputA", "red", map);

addAutocompleteAndSearch("addressInputB", "blue", map);

addAutocompleteAndSearch("addressInputIntermedio", "orange", map);

addAutocompleteAndSearch("addressInputWeather", "purple", map);

var route;
var lineIds = [];
var lineDistance;

function calculateRoute() {
  if (!markerA || !markerB) return;

  var pointA = markerA.getLngLat();
  var pointB = markerB.getLngLat();
  var pointAtual = markerAtual ? markerAtual.getLngLat() : null;
  var pointIntermedio = markerIntermedio ? markerIntermedio.getLngLat() : null; 
  var pointPI = markerPI ? markerPI.getLngLat() : null; 
  var selectedCategory = document.getElementById("selectedCategory").value; 

  var coordinates = `${pointA.lng},${pointA.lat}`;

  if (pointIntermedio) {
    coordinates += `;${pointIntermedio.lng},${pointIntermedio.lat}`;
  }

  if (pointPI) {
    coordinates += `;${pointPI.lng},${pointPI.lat}`;
  }

  if (pointAtual) {
    coordinates += `;${pointAtual.lng},${pointAtual.lat}`;
  }

  coordinates += `;${pointB.lng},${pointB.lat}`;

  var profile = document.getElementById('routingProfile').value;
  var language = 'pt';
  var apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?steps=true&geometries=geojson&language=${language}&access_token=${mapboxgl.accessToken}`;

  lineIds.forEach((lineId) => {
    if (map.getLayer(lineId)) {
      map.removeLayer(lineId);
      map.removeSource(lineId);
    }
  });
  lineIds = [];

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.routes || !data.routes[0] || !data.routes[0].legs || !data.routes[0].legs[0] || !data.routes[0].legs[0].steps) {
        console.warn("Não há direções disponíveis para esta rota.");
        return;
      }
      var route = data.routes[0].geometry;
      var distance = turf.length(route, { units: "kilometers" }) * 1000;

      var routeGeoJSON = {
        type: "Feature",
        properties: { distance: distance },
        geometry: route
      };

      if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }
      map.addSource("route", {
        type: "geojson",
        data: routeGeoJSON,
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#FFA500",
          "line-width": 8,
        },
      });

      var routeStart = route.coordinates[0];
      var routeEnd = route.coordinates[route.coordinates.length - 1];

      var unreachablePoints = [];
      if (routeStart[0] !== pointA.lng || routeStart[1] !== pointA.lat) {
        unreachablePoints.push(pointA);
      }
      if (routeEnd[0] !== pointB.lng || routeEnd[1] !== pointB.lat) {
        unreachablePoints.push(pointB);
      }

      unreachablePoints.forEach((unreachablePoint) => {
        var point = turf.point([unreachablePoint.lng, unreachablePoint.lat]);
        var nearestPoint = turf.nearestPointOnLine(route, point);
        var lineToNearestPoint = turf.lineString([
          [unreachablePoint.lng, unreachablePoint.lat],
          nearestPoint.geometry.coordinates,
        ]);

        var lineId =
          "line-to-nearest-point-" +
          unreachablePoint.lng +
          "-" +
          unreachablePoint.lat;

        var lineDistance =
          turf.length(lineToNearestPoint, { units: "kilometers" }) * 1000;

        map.addLayer({
          id: lineId,
          type: "line",
          source: {
            type: "geojson",
            data: lineToNearestPoint,
          },
          paint: {
            "line-color": "#ff0000",
            "line-width": 2,
          },
        });

        lineIds.push(lineId); 
      });

      animateAlongRoute(route);

      var currentPopup = null;

      function formatTripDuration(durationInMinutes) {
        if (durationInMinutes >= 60) {
          var hours = Math.floor(durationInMinutes / 60);
          var minutes = durationInMinutes % 60;
          return `${hours}h${minutes > 0 ? minutes + 'min' : ''}`;
        } else {
          return `${durationInMinutes} minutos`;
        }
      }

      function formatTripDistance(distanceInMeters) {
        if (distanceInMeters >= 1000) {
          var distanceInKm = (distanceInMeters / 1000).toFixed(1);
          return `${distanceInKm} km`;
        } else {
          return `${distanceInMeters} metros`;
        }
      }

      function createPopupHTMLRoute(tripDuration, tripDistance, directions) {
        var popupContent = `
                            <div class="route-popup">
                              <p><strong>Duração da viagem:</strong> ${tripDuration}</p>
                              <p><strong>Distância da viagem:</strong> ${tripDistance}</p>
                              <ol style="max-height: 300px; overflow-y: auto;">`;

        directions.forEach((step, index) => {
          popupContent += `<li>${step.maneuver.instruction}</li>`;
        });

        popupContent += `</ol></div>`;

        return popupContent;
      }

      function showRoutePopup(popupHTML, coordinates) {
        if (currentPopup) {
          currentPopup.remove();
        }

        currentPopup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25
        })
          .setLngLat(coordinates)
          .setHTML(popupHTML)
          .addTo(map);

        map.getCanvas().style.cursor = 'pointer';
      }

      map.on("mousemove", "route", function (e) {
        var tripDurationInMinutes = Math.round(data.routes[0].duration / 60);
        var tripDistanceInMeters = Math.round(data.routes[0].distance); 
        var directions = data.routes[0].legs[0].steps;

        var formattedTripDuration = formatTripDuration(tripDurationInMinutes);
        var formattedTripDistance = formatTripDistance(tripDistanceInMeters);

        var popupHTML = createPopupHTMLRoute(formattedTripDuration, formattedTripDistance, directions);

        var coordinates = e.lngLat;

        showRoutePopup(popupHTML, coordinates);
      });

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains('mapboxgl-popup-close-button')) {
          if (currentPopup) {
            currentPopup.remove();
            currentPopup = null; 
          }
        }
      });
      if (selectedCategory) {
        fetch(`https://gis4cloud.com/grupo4_ptas2024/bd.php?tabela=${selectedCategory}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Erro na requisição de pontos de interesse: ${response.status}`);
            }
            return response.json();
          })
          .then((pointsOfInterest) => {
            var nearestPointOfInterest = pointsOfInterest.features.reduce((nearestPoint, currentPoint) => {
              var distanceToRoute = turf.pointToLineDistance(currentPoint, route);
              if (!nearestPoint || distanceToRoute < nearestPoint.distanceToRoute) {
                return {
                  point: currentPoint,
                  distanceToRoute: distanceToRoute
                };
              } else {
                return nearestPoint;
              }
            }, null);

            if (nearestPointOfInterest) {
              coordinates = `${pointA.lng},${pointA.lat}`;
              if (pointIntermedio) {
                coordinates += `;${pointIntermedio.lng},${pointIntermedio.lat}`;
              }

              if (pointPI) {
                coordinates += `;${pointPI.lng},${pointPI.lat}`;
              }

              if (pointAtual) {
                coordinates += `;${pointAtual.lng},${pointAtual.lat}`;
              }

              coordinates += `;${nearestPointOfInterest.point.geometry.coordinates[0]},${nearestPointOfInterest.point.geometry.coordinates[1]};${pointB.lng},${pointB.lat}`;

              apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?steps=true&geometries=geojson&language=${language}&access_token=${mapboxgl.accessToken}`;

              fetch(apiUrl)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.status}`);
                  }
                  return response.json();
                })
                .then((data) => {
                  if (!data.routes || !data.routes[0] || !data.routes[0].legs || !data.routes[0].legs[0] || !data.routes[0].legs[0].steps) {
                    console.warn("Não há direções disponíveis para esta rota recalculada.");
                    return;
                  }

                  var newRoute = data.routes[0].geometry;

                  var distance = turf.length(newRoute, { units: "kilometers" }) * 1000;

                  var newRouteGeoJSON = {
                    type: "Feature",
                    properties: { distance: distance },
                    geometry: newRoute
                  };

                  if (map.getLayer("route")) {
                    map.removeLayer("route");
                    map.removeSource("route");
                  }
                  map.addSource("route", {
                    type: "geojson",
                    data: newRouteGeoJSON,
                  });
                  map.addLayer({
                    id: "route",
                    type: "line",
                    source: "route",
                    paint: {
                      "line-color": "#FFA500",
                      "line-width": 8,
                    },
                  });

                  animateAlongRoute(newRoute);

                  if (markerPI_maisProximo) {
                    markerPI_maisProximo.remove();
                  } else {
                    markerPI_maisProximo = new mapboxgl.Marker({
                      color: "black"
                    })
                      .setLngLat(nearestPointOfInterest.point.geometry.coordinates)
                      .addTo(map);

                    var popupMaisProximo;
                    popupMaisProximo = new mapboxgl.Popup({ offset: 25 })
                      .setLngLat(nearestPointOfInterest.point.geometry.coordinates)
                      .setText('Ponto da categoria de ponto de interesse mais próximo')
                      .addTo(map);

                    markerPI_maisProximo.setPopup(popupMaisProximo);

                    popupMaisProximo.getElement().addEventListener('click', function () {
                      if (markerPI_maisProximo) {
                        markerPI_maisProximo.remove();
                        markerPI_maisProximo = null;
                      }
                    });
                  }
                  var currentPopup = null;

                  function formatTripDuration(durationInMinutes) {
                    if (durationInMinutes >= 60) {
                      var hours = Math.floor(durationInMinutes / 60);
                      var minutes = durationInMinutes % 60;
                      return `${hours}h${minutes > 0 ? minutes + 'min' : ''}`;
                    } else {
                      return `${durationInMinutes} minutos`;
                    }
                  }

                  function formatTripDistance(distanceInMeters) {
                    if (distanceInMeters >= 1000) {
                      var distanceInKm = (distanceInMeters / 1000).toFixed(1);
                      return `${distanceInKm} km`;
                    } else {
                      return `${distanceInMeters} metros`;
                    }
                  }

                  function createPopupHTMLRoute(tripDuration, tripDistance, directions) {
                    var popupContent = `
                                        <div class="route-popup">
                                          <p><strong>Duração da viagem:</strong> ${tripDuration}</p>
                                          <p><strong>Distância da viagem:</strong> ${tripDistance}</p>
                                          <ol style="max-height: 300px; overflow-y: auto;">`;

                    directions.forEach((step, index) => {
                      popupContent += `<li>${step.maneuver.instruction}</li>`;
                    });

                    popupContent += `</ol></div>`;

                    return popupContent;
                  }

                  function showRoutePopup(popupHTML, coordinates) {
                    if (currentPopup) {
                      currentPopup.remove();
                    }

                    currentPopup = new mapboxgl.Popup({
                      closeButton: true,
                      closeOnClick: false,
                      offset: 25
                    })
                      .setLngLat(coordinates)
                      .setHTML(popupHTML)
                      .addTo(map);

                    map.getCanvas().style.cursor = 'pointer';
                  }

                  map.on("mousemove", "route", function (e) {
                    var tripDurationInMinutes = Math.round(data.routes[0].duration / 60);
                    var tripDistanceInMeters = Math.round(data.routes[0].distance);
                    var directions = data.routes[0].legs[0].steps; 

                    var formattedTripDuration = formatTripDuration(tripDurationInMinutes);
                    var formattedTripDistance = formatTripDistance(tripDistanceInMeters);

                    var popupHTML = createPopupHTMLRoute(formattedTripDuration, formattedTripDistance, directions);

                    var coordinates = e.lngLat;

                    showRoutePopup(popupHTML, coordinates);
                  });

                  document.addEventListener('click', function (event) {
                    if (event.target.classList.contains('mapboxgl-popup-close-button')) {
                      if (currentPopup) {
                        currentPopup.remove();
                        currentPopup = null;
                      }
                    }
                  });
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }

      document.getElementById("addPointIntermedio").style.display = "block";
      document.getElementById("addressInputIntermedio").style.display = "block";

      document.getElementById("selectedCategory").style.display = "block";
      document.getElementById("selectedCategoryLabel").style.display = "block";
    })
    .catch((error) => {
      console.error(error);
    });
}


function animateAlongRoute(route) {
  const lineDistance = turf.length(route, { units: "kilometers" });

  let steps = Math.round(lineDistance * 50);

  const minSteps = 100;
  steps = Math.max(steps, minSteps);

  const arc = [];

  for (let i = 0; i < lineDistance; i += lineDistance / steps) {
    const segment = turf.along(route, i, { units: "kilometers" });
    arc.push(segment.geometry.coordinates);
  }

  route.coordinates = arc;

  const point = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: route.coordinates[0],
        },
      },
    ],
  };

  let counter = 0;

  if (!map.getSource("point")) {
    map.addSource("point", {
      type: "geojson",
      data: point,
    });
  }

  loadSelectedIcon();

  function loadSelectedIcon() {
    const selectedProfile = document.getElementById("routingProfile").value;
    let imageUrl;

    switch (selectedProfile) {
      case "driving-traffic":
        imageUrl = "https://i.ibb.co/9GXBB5F/car.png";
        break;
      case "walking":
        imageUrl = "https://i.ibb.co/ydQW2Fk/gajo.png";
        break;
      case "cycling":
        imageUrl = "https://i.ibb.co/jLBLfF8/bike.png";
        break;
    }

    map.loadImage(imageUrl, function (error, image) {
      if (error) throw error;

      if (map.getLayer("point")) {
        map.removeLayer("point");
      }

      if (map.hasImage('icon')) {
        map.removeImage('icon');
      }

      map.addImage('icon', image);
      map.addLayer({
        'id': 'point',
        'source': 'point',
        'type': 'symbol',
        'layout': {
          'icon-image': 'icon',
          'icon-size': 0.5,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });
      document.getElementById("replay").style.display = "block";
    });
  }

  function animate() {
    const start = route.coordinates[counter >= steps ? counter - 1 : counter];
    const end = route.coordinates[counter >= steps ? counter : counter + 1];
    if (!start || !end) return;

    point.features[0].geometry.coordinates = route.coordinates[counter];

    point.features[0].properties.bearing = turf.bearing(
      turf.point(start),
      turf.point(end)
    );

    map.getSource("point").setData(point);

    if (counter < steps) {
      requestAnimationFrame(animate);
    }

    counter++;
  }

  animate();

  document.getElementById("replay").addEventListener("click", () => {
    counter = 0;
    animate();
  });

  document.getElementById("routingProfile").addEventListener("change", function () {
    const selectedValue = this.value;
    selectOption(this, "routingProfile", selectedValue);
  });
}

document
  .getElementById("calculateRouteButton")
  .addEventListener("click", calculateRoute);

document.querySelectorAll(".class-title").forEach((title) => {
  title.addEventListener("click", (event) => {
    event.target.parentNode.classList.toggle("active");
  });
});

function limparTudo() {
  limparIsocronas();

  if (markerA) markerA.remove();
  if (markerB) markerB.remove();
  if (markerIntermedio) markerIntermedio.remove();
  if (markerPI) markerPI.remove();
  if (markerAtual) markerAtual.remove();
  if (markerPI_maisProximo) markerPI_maisProximo.remove();

  if (map.getLayer("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  lineIds.forEach((lineId) => {
    if (map.getLayer(lineId)) {
      map.removeLayer(lineId);
      map.removeSource(lineId);
    }
  });
  lineIds = [];

  if (weatherMarker) weatherMarker.remove();

  if (map.getLayer("point")) {
    map.setLayoutProperty('point', 'visibility', 'none');
  }

  markerA = null;
  markerB = null;
  markerIntermedio = null;
  markerPI = null;
  markerAtual = null;
  markerPI_maisProximo = null;
  weatherMarker = null;
  popup = null;

  popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  document.getElementById("replay").style.display = "none";

  document.getElementById("addPointIntermedio").style.display = "none";
  document.getElementById("addressInputIntermedio").style.display = "none";

  document.getElementById("selectedCategory").style.display = "none";
  document.getElementById("selectedCategoryLabel").style.display = "none";
}

const recreateLayer = (tabela, sourceData) => {
  if (!map.getSource(tabela)) {
    map.addSource(tabela, {
      type: "geojson",
      data: sourceData,
    });

    map.addLayer({
      id: tabela,
      type: "symbol",
      source: tabela,
      layout: {
        "icon-image": tabela,
        "icon-size": 0.03,
        "icon-allow-overlap": true,
        visibility: "none",
      },
    });
  }
};

const refreshLayersAfterClear = () => {
  tabelas.forEach((tabela) => {
    recreateLayer(tabela, originalPointsData[tabela]);
  });
};
