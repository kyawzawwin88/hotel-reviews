'use strict';

/**
 * @ngdoc function
 * @name HotelReview.controller:HomeController
 * @description
 * # HomeController
 */
angular.module('HotelReview')
    .controller('HomeController', ['$ionicPlatform', '$scope', '_', 'APP_CONFIG', '$ionicPopover', '$log', 'GPlace', '$cordovaGeolocation', '$ionicPopup', function($ionicPlatform, $scope, _, APP_CONFIG, $ionicPopover, $log, GPlace, $cordovaGeolocation, $ionicPopup) {
        
        var ctrl = this;
        var originalHotels = [];
        this.nextPageToken = false;
        this.hotels = false;
        this.title = APP_CONFIG.TITLE;
        this.filter = {
            name: '',
            rating: 0,
            minprice: 0
        };
        this.sort = false;
        this.moreHotelCanBeLoaded = true;

        var isLoadingInProgress = false;
        this.filterSortHotels = function(){
            if(!originalHotels || originalHotels.length < 1) {
                return false;
            }

            var filteredHotels = angular.copy(originalHotels);

            if(ctrl.filter.name){
                filteredHotels = _.filter(filteredHotels, function(hotel){
                    return hotel.name.toLowerCase().indexOf(ctrl.filter.name.toLowerCase()) > -1;
                });
            }
            if(ctrl.filter.rating){
                filteredHotels = _.filter(filteredHotels, function(hotel){
                    $log.debug(ctrl.filter.rating + ' === ' + hotel.rating + ' === ' + hotel.name);
                    return hotel.rating && typeof(hotel.rating) != 'undefined' && hotel.rating >= ctrl.filter.rating;
                });
            }
            if(ctrl.filter.minprice){
                filteredHotels = _.filter(filteredHotels, function(hotel){
                    return hotel.price >= ctrl.filter.minprice;
                });
            }

            if(ctrl.sort){
                if(ctrl.sort === 1){
                    filteredHotels = _.sortBy(filteredHotels, 'price');
                }else if(ctrl.sort === 2){
                    filteredHotels = _.sortBy(filteredHotels, 'price').reverse();
                }else if(ctrl.sort === 3){
                    filteredHotels = _.sortBy(filteredHotels, 'rating').reverse();
                }
            }

            ctrl.hotels = filteredHotels;
        };
        // default to bugis
        var lat,
            lng;
        this.loadHotels = function(){
            if(!lat || !lng){
                return $log.debug('There is no lat and lng');
            }
            if(isLoadingInProgress){
                $log.debug('Loading in progress...');
                return;
            }
            $log.debug('Loading hotels ' + lat + ' - ' + lng + ' - ' + ctrl.nextPageToken);
            isLoadingInProgress = true;
            GPlace
              .findNearByHotels(lat, lng, 600, ctrl.nextPageToken)
              .then(function(data) {
                if(data && data.hotels && data.hotels.length > 0){
                    originalHotels = originalHotels.concat(data.hotels);
                    ctrl.nextPageToken = data.nextPageToken;
                }
                
                if(!data.hotels || data.hotels.length < 20){
                    ctrl.moreHotelCanBeLoaded = false;
                }
                ctrl.filterSortHotels();               
                isLoadingInProgress = false;
                $scope.$broadcast('scroll.infiniteScrollComplete');
              }, function(err) {
                $log.error(err);
                if(typeof(err) != 'undefined'){
                    $ionicPopup.show({
                      'template': '<p>'+ err +'</p>',
                      'title': 'Error',
                      buttons: [
                        { text: 'Ok' }
                      ]
                    });
                } 
                ctrl.hotels = [];
                ctrl.moreHotelCanBeLoaded = false;
                isLoadingInProgress = false;
                $scope.$broadcast('scroll.infiniteScrollComplete');
              });
            // originalHotels = [{price:90,discount:10,original_price:100,geometry:{location:{lat:1.2982839,lng:103.8548987}},icon:"https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png",id:"b905db6d461ef95b4cefd9f040525c363a55414e",name:"InterContinental Singapore",photos:[{height:960,html_attributions:["<a href='https://maps.google.com/maps/contrib/118421376990775149240/photos'>Kenathan WONG</a>"],photo_reference:"CoQBcwAAAF0x4nlTThUk6d4gtDW1phWPLfq7aTjf7xw8agpw5Iybu4hWY72uWNz3LG_Zh5liZ30eKJZdxHxbItUU_yC8J4GZiGfVgJQgkPX1399jXg_vumD4jfNN7YBIsWZP4qeupkqARZHV0EDe7eHxZEIyrw_mV_mw7T9ysUk8-YDt-DgqEhAcnz5jj3JFvH3BbE_xjh4CGhSIEAOHEtGp8htkCCKXK_7PCkcugg",width:1280}],place_id:"ChIJZRZ9yroZ2jER4R3Hm0_9Phs",rating:4.3,reference:"CnRtAAAAaVeqrj6JtgeftPobSBHRPZcBmtvTCtJ65TvHdio-wZs0Z8BJEZ7zSNdV-P5_i8laGAGxWQzmLCpjATHMuqcIRFqrAlkyZ7N-Q9Gbrr-8NT6upiZI7obGG-Iwl8vIqMimBPBKdlV_eD0iyssYJxxeMxIQ__9JDDatrxFdKQZtjNQaWBoUAc7g3tVJ2o1BYas5AqPgY4zRwE8",scope:"GOOGLE",types:["lodging","point_of_interest","establishment"],vicinity:"80 Middle Road, Singapore"},{price:225,discount:10,original_price:250,geometry:{location:{lat:1.295939,lng:103.852714}},icon:"https://maps.gstatic.com/mapfiles/place_api/icons/lodging-71.png",id:"763985adc56150d3a04a828725b5850f54663b5d",name:"Carlton Hotel",photos:[{height:1000,html_attributions:["<a href='https://maps.google.com/maps/contrib/110693543847355349422/photos'>Carlton Hotel</a>"],photo_reference:"CoQBcwAAAFcil1dXDmTkV4hgj_PWDKbgSdhjKzJ0F34H9UyWpCnojTKfVqQJX78e5eFGoXAc6VNUuj9O2xLz2T1jHgl4YLkVITxvGzroykGkLfULhnUlQFMZWLn2nZzokc3-m2XeVys22JYCHfPdA6ls87wJMcD4zLBg5C1Rbrzw5D7W99_-EhBwiEWgh2T8LR1q0DYg60EHGhQH5JqbZeKoc0POO-vl2ebNFv783Q",width:1500}],place_id:"ChIJoeV2WKQZ2jERvqFd1_XG4jg",rating:4.2,reference:"CmRgAAAA7jLOGuxzXg18NbbX9g7DMIPUPsOLnO6FFEpTagzXcT7dOUu2AUXxz2FS1MrXp9kbe06D6ZHOT898jvkLkG8ib_UUsnPvOXGItA5M7m-iq6mPrAg8xX5VQicB8GTSfTT7EhAG6Lx0WRzTh6B-Utd2ZbweGhTkSQEW8H876PKzb1iimtDD6qQmVA",scope:"GOOGLE",types:["lodging","point_of_interest","establishment"],vicinity:"76 Bras Basah Road"}];
        };
        $ionicPlatform.ready(function() {
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    $log.debug(position.coords);
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    // $ionicPopup.show({
                    //     'template': '<p>Your location is ' + lat +' - ' + lng + ' </p>',
                    //     'title': 'Current Geolocation',
                    //     buttons: [
                    //         { text: 'Ok' }
                    //     ]
                    // });
                    ctrl.loadHotels();
                }, function(err) {
                    $log.debug(err);
                  // cannot get geolocation, use bugis as default
                    $ionicPopup.show({
                        'template': '<p>Cannot get location. Bugis place is default</p>',
                        'title': 'Geolocation Error',
                        buttons: [
                            { text: 'Ok' }
                        ]
                    });
                    // default to bugis
                    lat = 1.2995212;
                    lng = 103.8535033;
                    ctrl.loadHotels();
                });
        });


        $ionicPopover.fromTemplateUrl('filter-popover.html', {
            scope: $scope,
            animation: 'slide-in-down'
        }).then(function(popover) {
            $log.debug('Filter popover has opened');
            $log.debug(popover);

            ctrl.filterPopover = popover;
        });

        $ionicPopover.fromTemplateUrl('sort-popover.html', {
            scope: $scope,
            animation: 'slide-in-down'
        }).then(function(popover) {
            ctrl.sortPopover = popover;
        });

        this.showFilter = function(e){
            this.filterPopover.show(e);
        };
        this.showSort = function(e){
            this.sortPopover.show(e);
        };
        this.cancelFilter = function(){
            this.filterPopover.hide();
        };
        this.applyFilter = function(){
            ctrl.filterSortHotels();
            this.filterPopover.hide();
        };
        this.setFilterRating = function(rating) {
            if(this.filter.rating === rating){
                this.filter.rating = 0;
            }
            else{
                this.filter.rating = rating;
            }
        };
        this.applySort = function(sortby){
            this.sort = sortby;
            ctrl.filterSortHotels();
            this.sortPopover.hide();
        };

        $scope.$on('$destroy', function() {
          ctrl.sortPopover.remove();
          ctrl.filterPopover.remove();
        });
    }]);
