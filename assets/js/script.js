$(document).ready(function(){

    var Header = {
        $logo : $('.logo-ltqf'),
        $cityName : $('.city-name'),
        $btnResearch : $('#btn-research'),
        $ResearchContainer : $('.research'),
        $citySearch : $('#city-search'),

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
    })


    // Header.$btnResearch.on("touchend click",function(e){
    //     if(e.type == 'touchend'){
    //         $(this).off('touchend click');
    //         Header.toggleSearch();
    //     }
    // });

});