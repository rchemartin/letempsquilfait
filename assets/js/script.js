$(document).ready(function(){

    var Header = {
        $logo : $('.logo-ltqf'),
        $cityName : $('.city-name'),
        $btnResearch : $('#btn-research'),
        $ResearchContainer : $('.research'),
        $citySearch : $('#city-search'),
        $searchComplete : $('.ui-menu-item'),

        //functions
        toggleSearch : function(){
            Header.$logo.toggleClass('rs-move');
            Header.$cityName.toggleClass('rs-move');
            Header.$ResearchContainer.toggleClass('rs-opened');
            Header.$citySearch.blur();
            Header.$citySearch.val('');
        },
    };

    Header.$btnResearch.on("click", Header.toggleSearch);
    Header.$citySearch.on("keyup", function(e){
        if(e.keyCode == 13){
            Header.toggleSearch();
        }
    });


    // Header.$btnResearch.on("touchend click",function(e){
    //     if(e.type == 'touchend'){
    //         $(this).off('touchend click');
    //         Header.toggleSearch();
    //     }
    // });



    //           //
    //           //
    //           //
    // SEARCH JS //
    //           //
    //           //
    //           //

    var pos = {};
    function userPosition(position) {
        pos = {'lat' : position.coords.latitude, 'lon' : position.coords.longitude}
    }
    function erreurPosition(error) {
        var info = "Erreur lors de la géolocalisation : ";
        switch (error.code) {
            case error.TIMEOUT:
                info += "Timeout !";
                break;
            case error.PERMISSION_DENIED:
                info += "Vous n’avez pas donné la permission";
                break;
            case error.POSITION_UNAVAILABLE:
                info += "La position n’a pu être déterminée";
                break;
            case error.UNKNOWN_ERROR:
                info += "Erreur inconnue";
                break;
        }
        console.log(info)
    }

    if(navigator.geolocation) {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(userPosition, erreurPosition);

            $.getJSON('http://api.openweathermap.org/data/2.5/weather??lat='+pos['lat']+'&lon='+pos['lon']+'&appid=bdeb2effcf49c57ba53b0bc4e7cc8d76&lang=fr', function(data) {
                setWeather(data)
            });
        }


    } else {

        alert("La géolocalisation n'est pas disponible")

    }

    var city = []

    function setFirst(firstCity){
        city = firstCity;
    }
    function getFirst(){
        return city;
    }

    $.getJSON("files/json/cities.json", function(json) {

        var citiesArray = [];

        for(var i=0; i<json.length; i++){
            citiesArray.push({'label' : json[i]['name'], 'value' : json[i]['_id'] });
        }


        $( "#city-search" ).autocomplete({
            source: function(req, response) {
                var results = $.ui.autocomplete.filter(citiesArray, req.term);
                setFirst(results[0]);
                response(results.slice(0, 4));//for getting 5 results
            },
            minLength: 4,
            focus: function(event, ui) {
                event.preventDefault();
                $(this).val(ui.item.label);
            },
            select: function(event, ui) {

                event.preventDefault();
                $("#city-search").val(ui.item.label);

                $.getJSON('http://api.openweathermap.org/data/2.5/weather?id='+ui.item.value+'&appid=bdeb2effcf49c57ba53b0bc4e7cc8d76&lang=fr', function(data) {
                    setData(event, ui, data)
                });
            },
        })
    });

    // traitement clic bouton recherche
    $('#btn-research').click(function(){
        console.log($('#city-search').val())
        $('#city-search').data('ui-autocomplete')._trigger('select', 'autocompleteselect', {item: getFirst()});
    })


    function setWeather(data){
        // bloc info
        var desc = data['weather'][0]['description']
        var temp = (data['main']['temp'] - 273.15)
        var temp_min = (data['main']['temp_min'] - 273.15)
        var temp_max = (data['main']['temp_max'] - 273.15)

        $('.weather-precisions').text(desc.charAt(0).toUpperCase() + desc.substring(1).toLowerCase())
        $('.temperature').text(temp.toFixed(1)+' °C')
        $('.temperature_min').text(temp_min.toFixed(1)+' °C')
        $('.temperature_max').text(temp_max.toFixed(1)+' °C')

        // aside-left
        var lat = data['coord']['lat']
        var long = data['coord']['lon']
        var sunset = new Date(data['sys']['sunset']*1000);
        var sunset_h = (sunset.getHours()>9)? sunset.getHours() : "0"+sunset.getHours();
        var sunset_m = (sunset.getMinutes()>9)? sunset.getMinutes() : "0"+sunset.getMinutes();
        var sunrise = new Date(data['sys']['sunrise']*1000);
        var sunrise_h = (sunrise.getHours()>9)? sunrise.getHours() : "0"+sunrise.getHours();
        var sunrise_m = (sunrise.getMinutes()>9)? sunrise.getMinutes() : "0"+sunrise.getMinutes();

        $('.lat').text(lat)
        $('.long').text(long)
        $('.sunset_data').text(sunset_h+' h '+sunset_m)
        $('.sunrise_data').text(sunrise_h+' h '+sunrise_m)

        //aside-right
        var humidity = data['main']['humidity']
        var wind = (data['wind']['speed']*3.6)
        var pressure = Math.round(data['main']['pressure'])

        $('.humidity').text(humidity+' %')
        $('.wind_speed').text(wind.toFixed(1)+' km/h')
        $('.pressure_data').text(pressure+' hPa')

    }
    function setData(event, ui, data){
        // Ville consultée
        $('.city-h2').text(ui.item.label)
        $('.city-h2').toggleClass('little-location');
        $('.city-h2').toggleClass('little-search');
        Header.toggleSearch();

        setWeather(data);
    }


});