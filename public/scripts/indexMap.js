//set the map token
mapboxgl.accessToken = 'pk.eyJ1Ijoic29yaW5hMTEiLCJhIjoiY2tuYm1qMmV3MDV3bDJwbzd4bDl3N3h6dSJ9.zO_dTBZD96RdkR2c6DlP8w';

//creating the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-6.266155, 53.350140],
    zoom: 6
});

map.on('load', function () {
    // Add a new source from our GeoJSON data and // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campsites', {
        type: 'geojson',
        data: campsites,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });
 
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campsites',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#4CAF50',
                100,
                '#A5D6A7',
                750,
                '#66BB6A'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });
 
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campsites',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });
 
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campsites',
        filter: ['!', ['has', 'point_count']],
        paint: {
        'circle-color': '#4CAF50',
        'circle-radius': 8,
        'circle-stroke-width': 4,
        'circle-stroke-color': '#A5D6A7'
        }
    });
 
    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, {
layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campsites').getClusterExpansionZoom(
            clusterId,
            function (err, zoom) {
                if (err) return;
                    map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                }); 
            }
        );
    });
 
    // When a click event occurs on a feature in // the unclustered-point layer, open a popup at
    // the location of the feature, with // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
        const campLink = e.features[0].properties.link;
        const coordinates= e.features[0].geometry.coordinates.slice();
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(campLink)
            .addTo(map);
    });
 
    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});