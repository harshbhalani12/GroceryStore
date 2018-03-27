var app = angular.module('groceryStore', ['ngRoute']).run(function($http,$rootScope) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});


app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'index.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		});
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {email: '', password: ''};
	$scope.error_message = '';
	$scope.success_message = '';
	console.log("Inside authController");
  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(response){
      if(data.state == true){
        $rootScope.authenticated = true;
        $rootScope.current_user = response.data.email;
				$location.path('/');
      }
      else{
        $scope.error_message = response.data.message;
      }
    });
  };

  $scope.register = function(){
		console.log("Inside register");
    $http.post('/auth/signup', $scope.user).then(function success(response){
			if(response.data.state == true){
        $rootScope.authenticated = true;
				$rootScope.current_user = response.data.email;
				$scope.success_message = response.data.message;
			}
      else{
        $scope.error_message = response.data.message;
			}
		}
		, function error(error){
				$scope.error_message = error;
		});
  };
});