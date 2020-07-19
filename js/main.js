ymaps.ready(init);

function init() {
    let map = new ymaps.Map("map", {
        center: [43.237658, 76.913277],
        controls: ['typeSelector', 'fullscreenControl', 'zoomControl'],
        zoom: 13
    });

    const stations = fetchStations();

    stations.then(stations => {
        stations.forEach(station => {
            if (station.is_deleted != 0) return;
            if (station.is_hidden != 0) return;
            if (station.is_sales === '1') {
                map.geoObjects.add(getMarker(station, 'is_sales'));
            } else if (station.is_not_active === "1") {
                map.geoObjects.add(getMarker(station, 'is_not_active'));
            } else {
                map.geoObjects.add(getMarker(station));
            }
        });
    });

    const geolocationButton = new ymaps.control.Button({
        data: {
            image: './images/baseline_near_me_black_18dp.png'
        },
        options: {
            size: 'small',
            selectOnClick: false
        }
    });
    geolocationButton.events.add('click', () => {
        ymaps.geolocation.get({
            provider: 'browser'
        }).then(result => {
            const point = result.geoObjects.get(0).geometry.getCoordinates();
            map.geoObjects.add(result.geoObjects)
            map.setCenter(point);
            map.setZoom(15);
        });
    }, err => {
        console.log('Ошибка: ' + err)
    });
    map.controls.add(geolocationButton);

}

function getMarker(station, status = 'ok') {
    if (status === 'is_sales') {
        return new ymaps.Placemark([43.239783, 76.927018], {}, {
            preset: 'islands#circleIcon',
            iconColor: '#3caa3c'
        });
    }

    if (status === 'is_not_active') {
        return new ymaps.Placemark([station.lat, station.lng], {
            data: [
                {weight: parseInt(station.total_slots), color: '#c4c5c5'},
            ],
            iconContent: ''
        }, {
            iconLayout: 'default#pieChart',
            iconPieChartRadius: 20,
            iconPieChartCoreRadius: 10,
            iconPieChartCoreFillStyle: '#ffffff',
            iconPieChartStrokeStyle: '',
            iconPieChartStrokeWidth: 0
        });
    }

    if (status === 'ok') {
        return new ymaps.Placemark([station.lat, station.lng], {
            data: [
                {weight: parseInt(station.avl_bikes), color: '#79b834'},
                {weight: parseInt(station.free_slots), color: '#3d4e5a'},
                {weight: parseInt(station.total_slots) - (parseInt(station.avl_bikes) + parseInt(station.free_slots)), color: '#c4c5c5'},
            ],
            iconContent: parseInt(station.avl_bikes)
        }, {
            iconLayout: 'default#pieChart',
            iconPieChartRadius: 20,
            iconPieChartCoreRadius: 10,
            iconPieChartCoreFillStyle: '#ffffff',
            iconPieChartStrokeStyle: '',
            iconPieChartStrokeWidth: 0
        });
    }
}

async function fetchStations() {
    const response = await fetch('https://almatybike.kz/api/stations/get', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    const stations = await response.json();
    return stations;
}