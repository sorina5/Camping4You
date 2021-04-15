    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', 
        style: 'mapbox://styles/mapbox/streets-v11',
        center: campsite.geometry.coordinates, 
        zoom: 6 
    });

 new mapboxgl.Marker()
    .setLngLat(campsite.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset:25 })
            .setHTML(
                `<h5>${campsite.title}</h5><p>${campsite.location}</p>`
            )
    )
    .addTo(map)
