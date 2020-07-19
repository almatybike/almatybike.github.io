ymaps.ready(init);

function init() {
    let map = new ymaps.Map("map", {
        center: [43.237658, 76.913277],
        controls: ['geolocationControl', 'typeSelector', 'zoomControl'],
        zoom: 13
    });

    checkBikeshare(map);

    const checkBikes = new ymaps.control.Button({
        data: {
            image: './images/baseline_pedal_bike_black_18dp.png'
        },
        options: {
            size: 'small',
            selectOnClick: false,
            floatIndex: 1
        }
    });
    checkBikes.events.add('click', () => {
        checkBikeshare(map);
    });
    map.controls.add(checkBikes);

    const checkDocks = new ymaps.control.Button({
        data: {
            image: './images/baseline_local_parking_black_18dp.png'
        },
        options: {
            size: 'small',
            selectOnClick: false,
            floatIndex: 0
        }
    });
    checkDocks.events.add('click', () => {
        checkBikeshare(map, 'docks');
    });
    map.controls.add(checkDocks);
}

function checkBikeshare(map, type = 'bikes') {
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
                map.geoObjects.add(getMarker(station, 'ok', type));
            }
        });
    });
}

function getMarker(station, status, type) {
    if (status === 'is_sales') {
        return new ymaps.Placemark([43.239783, 76.927018], {
            iconContent: '$',
            balloonContent:
                `<p>Дворец спорта и культуры имени Б. Шолака (пр. Абая, 44).<br />
                Вход со стороны ул. Байтурсынова, 4 пост.<br />
                <br /><br />
                С 10:00 до 18:00 ежедневно, без выходных.<br />
                Перерыв с 14:00 до 15:00.</p>`
        }, {
            preset: 'islands#circleIcon',
            iconColor: '#ff0000'
        });
    }

    if (status === 'is_not_active') {
        return new ymaps.Placemark([station.lat, station.lng], {
            data: [
                {weight: parseInt(station.total_slots), color: '#c4c5c5'},
            ],
            iconContent: '',
            balloonContent: 'Станция заболела'
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

        const avl_bikes = parseInt(station.avl_bikes);
        const free_slots = parseInt(station.free_slots);
        const total_slots = parseInt(station.total_slots);

        let data, iconContent;

        if (type === 'bikes') {
            data = [
                {weight: avl_bikes, color: '#79b834'},
                {weight: free_slots, color: '#3d4e5a'},
                {weight: total_slots - (avl_bikes + free_slots), color: '#c4c5c5'},
            ];
            iconContent = avl_bikes
        }

        if (type === 'docks') {
            data = [
                {weight: free_slots, color: '#3d4e5a'},
                {weight: avl_bikes, color: '#79b834'},
                {weight: total_slots - (avl_bikes + free_slots), color: '#c4c5c5'},
            ];
            iconContent = free_slots
        }

        return new ymaps.Placemark([station.lat, station.lng], {
            data: data,
            iconContent: iconContent,
            balloonContent:
                `<p>Доступно велосипедов: ${avl_bikes}</p>
                <p>Доступно слотов: ${free_slots}</p>
                <p>Всего слотов: ${total_slots}</p>`
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