$(function(){

    $.getJSON("files/json/cities.json", function(json) {

        var citiesArray = [];

        for(var i=0; i<json.length; i++){
            citiesArray.push(json[i]["name"]);
        }

        $( "#city-search" ).autocomplete({
            source : citiesArray,
            minLength: 4,
            select: function(event, ui){
                console.log(ui.item);
            },
        })




    });

});