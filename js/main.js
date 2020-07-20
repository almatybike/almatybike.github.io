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
            image: '/images/baseline_pedal_bike_black_18dp.png'
        },
        options: {
            size: 'small',
            floatIndex: 1,
            selectOnClick: false
        }
    });
    checkBikes.select();
    map.controls.add(checkBikes);

    const checkDocks = new ymaps.control.Button({
        data: {
            image: '/images/baseline_local_parking_black_18dp.png'
        },
        options: {
            size: 'small',
            floatIndex: 0,
            selectOnClick: false
        }
    });
    map.controls.add(checkDocks);

    checkBikes.events.add('click', (e) => {
        checkBikes.select();
        map.geoObjects.removeAll();
        checkDocks.deselect();
        checkBikeshare(map);
    });
    checkDocks.events.add('click', () => {
        checkDocks.select();
        map.geoObjects.removeAll();
        checkBikes.deselect();
        checkBikeshare(map, 'docks');
    });
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
                `<p>Отдел продаж</p>
                <p>Проспект Абая, 44<br />
                Спортивно-культурный комплекс им. Балуана Шолака<br />
                Вход со стороны ул. Байтурсынова, 4 пост.</p>
                <p>С 10:00 до 18:00 ежедневно, без выходных.<br />
                Перерыв с 14:00 до 15:00.</p>`
        }, {
            preset: 'islands#circleIcon',
            iconColor: '#ff0000',
        });
    }

    if (status === 'is_not_active') {
        return new ymaps.Placemark([station.lat, station.lng], {
            data: [
                {weight: parseInt(station.total_slots), color: '#c4c5c5'},
            ],
            iconContent: '',
            balloonContent:
                `<p>Станция ${station.code}<br />${station.name_ru}</p>
                <p>Станция заболела</p>`
        }, {
            iconLayout: 'default#pieChart',
            iconPieChartRadius: 20,
            iconPieChartCoreRadius: 10,
            iconPieChartCoreFillStyle: '#ffffff',
            iconPieChartStrokeStyle: '',
            iconPieChartStrokeWidth: 0,
            zIndex: -5
        });
    }

    if (status === 'ok') {

        const avl_bikes = parseInt(station.avl_bikes);
        const free_slots = parseInt(station.free_slots);
        const total_slots = parseInt(station.total_slots);

        let data = [];
        let iconContent = '';

        if (type === 'bikes') {
            if (total_slots > 10) {
                for (let i = 0; i < Math.round((avl_bikes * 10) / total_slots); i++) {
                    data.push({weight: 1, color: '#79b834'})
                }
                for (let i = 0; i < Math.round((free_slots * 10) / total_slots); i++) {
                    data.push({weight: 1, color: '#3d4e5a'})
                }
                for (let i = 0; i < Math.round((total_slots - (avl_bikes + free_slots)) / total_slots); i++) {
                    data.push({weight: 1, color: '#c4c5c5'})
                }
            } else {
                for (let i = 0; i < avl_bikes; i++) {
                    data.push({weight: 1, color: '#79b834'})
                }
                for (let i = 0; i < free_slots; i++) {
                    data.push({weight: 1, color: '#3d4e5a'})
                }
                for (let i = 0; i < (total_slots - (avl_bikes + free_slots)); i++) {
                    data.push({weight: 1, color: '#c4c5c5'})
                }
            }
            iconContent = avl_bikes
        }

        if (type === 'docks') {
            if (total_slots > 10) {
                for (let i = 0; i < Math.round((free_slots * 10) / total_slots); i++) {
                    data.push({weight: 1, color: '#79b834'})
                }
                for (let i = 0; i < Math.round((avl_bikes * 10) / total_slots); i++) {
                    data.push({weight: 1, color: '#3d4e5a'})
                }
                for (let i = 0; i < Math.round((total_slots - (avl_bikes + free_slots)) / total_slots); i++) {
                    data.push({weight: 1, color: '#c4c5c5'})
                }
            } else {
                for (let i = 0; i < free_slots; i++) {
                    data.push({weight: 1, color: '#79b834'})
                }
                for (let i = 0; i < avl_bikes; i++) {
                    data.push({weight: 1, color: '#3d4e5a'})
                }
                for (let i = 0; i < (total_slots - (avl_bikes + free_slots)); i++) {
                    data.push({weight: 1, color: '#c4c5c5'})
                }
            }
            iconContent = free_slots
        }

        return new ymaps.Placemark([station.lat, station.lng], {
            data: data,
            iconContent: iconContent,
            balloonContent:
                `<p>Станция ${station.code}<br />${station.name_ru}</p>
                <p>Доступно велосипедов: ${avl_bikes}<br />
                Доступно слотов: ${free_slots}<br />
                Всего слотов: ${total_slots}</p>`
        }, {
            iconLayout: 'default#pieChart',
            iconPieChartRadius: 20,
            iconPieChartCoreRadius: 10,
            iconPieChartCoreFillStyle: '#ffffff',
            iconPieChartStrokeStyle: '#3d4e5a',
            iconPieChartStrokeWidth: 1
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