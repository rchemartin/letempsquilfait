$(function(){

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
            response(results.slice(0, 10));//for getting 5 results
        },
            minLength: 4,
            autoFocus : true,
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
        $('#city-search').data('ui-autocomplete')._trigger('select', 'autocompleteselect', {item: getFirst()});
    })

    function setData(event, ui, data){
        // Ville consultée
        $('.little-location').text(ui.item.label)

        // bloc info
        var desc = data['weather'][0]['description']
        var temp = (data['main']['temp'] - 273.15)
        var temp_min = (data['main']['temp_min'] - 273.15)
        var temp_max = (data['main']['temp_max'] - 273.15)

        $('.weather-precisions').text(desc)
        $('.temperature').text(temp.toFixed(1)+' °C')
        $('.temperature_min').text(temp_min.toFixed(1)+' °C')
        $('.temperature_max').text(temp_max.toFixed(1)+' °C')

        // aside-left
        var lat = data['coord']['lat']
        var long = data['coord']['lon']
        var sunset = new Date(data['sys']['sunset']*1000);
        var sunrise = new Date(data['sys']['sunrise']*1000);

        $('.lat').text(lat)
        $('.long').text(long)
        $('.sunrise_data').text(sunrise.getHours()+' h '+sunrise.getMinutes())
        $('.sunset_data').text(sunset.getHours()+' h '+sunset.getMinutes())

        //aside-right
        var humidity = data['main']['humidity']
        var wind = (data['wind']['speed']*3.6)
        var pressure = Math.round(data['main']['pressure'])

        $('.humidity').text(humidity+' %')
        $('.wind_speed').text(wind.toFixed(1)+' km/h')
        $('.pressure_data').text(pressure+' hPa')

    }

    function setBackground{

    }
});