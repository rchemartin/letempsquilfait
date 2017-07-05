$(document).ready(function(){



    // RESOLVE PROBLEMS EN IOS FOR CLICK TRIGGER

    detectIOSTouch = function() {
        var UA = navigator.userAgent,
            iOS = !!(UA.match(/iPad|iPhone/i));

        if (iOS) {
            $(document).on('touchstart', function (e) {
                // if (typeof jQuery(e.target).hasClass('ui-menu-item') !== 'undefined') {
                    e.target.click();
                // }
            });
        }
    }();


    // Detect mobile device / tablet device

    function detectmob() {
        if( navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)
        ){
            return true;
        }
        else {
            return false;
        }
    }


    // window.addEventListener('touchstart', function onFirstTouch() {
    //     // we only need to know once that a human touched the screen, so we can stop listening now
    //     window.removeEventListener('touchstart', onFirstTouch, false);
    // }, false);

    // window.addEventListener('mouseover', function onFirstHover() {
    //     window.USER_CAN_HOVER = true;
    //     window.removeEventListener('mouseover', onFirstHover, false);
    // }, false);

    // DATE

    var now = new Date();
    var annee   = now.getFullYear();
    var mois    = ('0'+(now.getMonth()+1)).slice(-2);
    var jour    = ('0'+now.getDate()   ).slice(-2);
    var heure   = ('0'+now.getHours()  ).slice(-2);
    var minute  = ('0'+now.getMinutes()).slice(-2);
    var seconde = ('0'+now.getSeconds()).slice(-2);




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

    // On mobile devices : touchstart / on desktop : click
    if(detectmob()) {
        Header.$btnResearch.on("touchstart", Header.toggleSearch);
        Header.$citySearch.on("keyup", function (e) {
            if (e.keyCode == 13) {
                Header.toggleSearch();
            }
        });
    }
    else {
        Header.$btnResearch.on("click", Header.toggleSearch);
        Header.$citySearch.on("keyup", function (e) {
            if (e.keyCode == 13) {
                Header.toggleSearch();
            }
        });
    }


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


    // Chargement par défaut sur Paris
    $.getJSON('http://api.openweathermap.org/data/2.5/weather?id=2968815&appid=bdeb2effcf49c57ba53b0bc4e7cc8d76&lang=fr', function(data) {
        setWeather(data)
    });

    var pos = {};

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
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {'lat' : position.coords.latitude, 'lon' : position.coords.longitude}
                $.getJSON('http://api.openweathermap.org/data/2.5/weather?lat='+pos['lat']+'&lon='+pos['lon']+'&appid=bdeb2effcf49c57ba53b0bc4e7cc8d76&lang=fr', function(data) {
                    setWeather(data)
                });
            }, erreurPosition);

        }


    } else {

        alert("La géolocalisation n'est pas disponible sur votre navigateur")

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

        for(var i=0; i<citiesArray.length; i++){
            var tmp = citiesArray[i]
            for(var j=i+1; j<citiesArray.length; j++){
                if(tmp['label'] == citiesArray[j]['label']){
                    citiesArray.splice(j, 1);
                }
            }
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
            open: function (event, ui) {
                var len = $('.ui-autocomplete > li').length;
                console.log(len)
            }
        })
    });

    // traitement clic bouton recherche / only on desktop
    if(!detectmob()) {
        $('#btn-research').click(function () {
            $('#city-search').data('ui-autocomplete')._trigger('select', 'autocompleteselect', {item: getFirst()});
        })
    }


    function setWeather(data){
        // bloc info
        var city = data['name']
        var desc = data['weather'][0]['description']
        var descId = data['weather'][0]['id']
        var temp = (data['main']['temp'] - 273.15)
        var temp_min = (data['main']['temp_min'] - 273.15)
        var temp_max = (data['main']['temp_max'] - 273.15)

        $('.city-h2').text(city)
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

        // Gradients

        //reset

        var resetGrad = function(weather){
            $(".bg-gradient").removeClass().addClass("bg-gradient grad-" + weather);
            $(".infos-pos").removeClass().addClass("infos-pos bloc-info grad-" + weather);
            $(".sun-hours").removeClass().addClass("sun-hours bloc-info grad-" + weather);
            $(".weather").removeClass().addClass("weather bloc-info grad-" + weather);
            $(".aside-right").removeClass().addClass("aside-right bloc-info grad-" + weather);
        }

        if((descId >= 500 && descId <= 531)
            || (descId >= 300 && descId <= 321)
            || (descId >= 200 && descId <= 232)) { //Rain
            resetGrad("rain");
        }
        else if(descId >= 600 && descId <= 622) { //Snow
            resetGrad("snow");
        }
        else if(descId == 731 || descId == 751 || descId == 762) { //Sand
            resetGrad("sunset");
        }
        else if(descId == 800) { //Clear Sky
            resetGrad("blueSky");
        }
        else if((descId >= 801 && descId <= 804)
            || descId == 701 || descId == 721
            || descId == 741 || descId == 761
            || descId == 771 || descId == 781
            || descId == 711){ //Clouds
            resetGrad("clouds");
        }
        else if(descId >= 900 && descId <= 906) { //Extreme
            resetGrad("clouds");
        }
        else if(descId >= 951 && descId <= 962) { //Additional
            resetGrad("clouds");
        }

        //SPECIALS


        if(descId == 800 && temp < 5){ //BlueSky & Cold
            resetGrad("cold");
        }

        if(descId == 800 && temp >= 28){ //Hot
            resetGrad("hot");
        }

        if(( heure+"h"+minute >= (sunrise_h-1)+"h"+sunrise_m ) && ( heure+"h"+minute <= sunrise_h+"h"+sunrise_m )
        || ( heure+"h"+minute >= (sunset_h-1)+"h"+sunset_m ) && ( heure+"h"+minute <= sunset_h+"h"+sunset_m )){ //Sunrise / Sunset
            resetGrad("sunset");
        }

        if(( heure+"h"+minute > sunset_h+"h"+sunset_m ) && ( heure+"h"+minute < (sunrise_h-1)+"h"+sunrise_m )) { //Night
            resetGrad("night");
        }

        if(jour+mois == "1407"){ //14 Juillet
            resetGrad("feteNationale");
        }

        if(jour+mois == "3110"){ //Halloween
            resetGrad("halloween");
        }

        if(jour+mois == "2512"){ //Christmas
            resetGrad("christmas");
        }
    }

    function setData(event, ui, data){
        // Ville consultée
        $('.city-h2').toggleClass('little-location');
        $('.city-h2').toggleClass('little-search');
        Header.toggleSearch();

        setWeather(data);
    }

});