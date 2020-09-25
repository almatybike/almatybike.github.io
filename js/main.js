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
            image: '/img/baseline_pedal_bike_black_18dp.png'
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
            image: '/img/baseline_local_parking_black_18dp.png'
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
    
    const URL = 'https://almatybike.kz/velostation';

    $.get( URL, function(data) {
            var ownerDocument = document.implementation.createHTMLDocument('virtual');
            const stations = $(data, ownerDocument).find('.table-stations tbody tr');

            stations.each(function() {
                    const station = $(this);
                    if (station.data('sales') === 1) {
                        map.geoObjects.add(getMarker(station, 'is_sales'));
                    } else if (station.data('inactive') === 1) {
                        map.geoObjects.add(getMarker(station, 'is_not_active'));
                    } else {
                        map.geoObjects.add(getMarker(station, 'ok', type));
                    }
                });
        }, 'html' )
            .fail( function() {
                console.log( 'url parsing error' )
            });
}

function getMarker(station, status, type) {

    const coordinates = [station.data('latitude'), station.data('longitude')];

    if (status === 'is_sales') {
        return new ymaps.Placemark(coordinates, {
            iconContent: '$',
            balloonContent: (station.find('.address').text())
        }, {
            preset: 'islands#circleIcon',
            iconColor: '#ff0000',
        });
    }

    if (status === 'is_not_active') {
        return new ymaps.Placemark(coordinates, {
            data: [
                {weight: parseInt(station.data('total-slots')), color: '#c4c5c5'},
            ],
            iconContent: '',
            balloonContent:
                `<p>Станция ${station.find('.code').text()}<br />${station.find('.name').contents().first().text()}</p>
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

        const avl_bikes = station.find('.avl-bikes').text();
        const free_slots = station.find('.free-slots').text();
        const total_slots = station.data('total-slots');

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

        return new ymaps.Placemark(coordinates, {
            data: data,
            iconContent: iconContent,
            balloonContent:
                `<p>Станция ${station.find('.code').text()}<br />${station.find('.name').contents().first().text()}</p>
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