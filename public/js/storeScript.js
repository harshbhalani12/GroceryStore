var app = angular.module('groceryStore', ['ngRoute']);

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/',{
			template: '<p>Hi</p>',
			controller: 'mainController'
		})
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		.when('/register',{
			templateUrl: 'register.html',
			controller: 'authController'
		});
});

app.controller('mainController',function($scope,$rootScope,$http){
	$http.get('/api/isAuthenticated').then(function success(response){
		if(response.data.authenticated == true){
			console.log("User is authenticated!");
			$scope.authenticated = true;
		}
	});
	
	$scope.signout = function(){
			$http.get('auth/signout');
    	$scope.authenticated = false;
	}
});

app.controller('authController', function($scope, $http, $location, $rootScope,msgService){
  $scope.user = {email: '', password: ''};
	$scope.error_message = '';
  $scope.$watch(msgService.getSuccessMessage,function(message){
    $scope.success_message=message;
  });
  $scope.login = function(){
    $http.post('/auth/login', $scope.user).then(function success(response){
      if(response.data.state == true){
				$rootScope.current_user = response.data.email;
				$location.path('/');
      }
      else{
        $scope.error_message = response.data.message;
      }
		}, function error(error){
			$scope.error_message = error;
		});
  };

  $scope.register = function(){
		console.log("Inside register");
    $http.post('/auth/signup', $scope.user).then(function success(response){
			if(response.data.state == true){
				$rootScope.current_user = response.data.email;
				msgService.setSuccessMessage(response.data.message);
				$location.path('/login');
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

app.factory('msgService', function () {
	var msg='';
	return {
			setSuccessMessage: function(m) {
					msg=m;
			},
			getSuccessMessage: function() {
					return msg;
			}
	};
});