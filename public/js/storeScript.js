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

app.controller('mainController',function($scope,$http,authService){
	$scope.$watch(authService.getAuthenticated, function(auth){
		$scope.authenticated = auth;
	});
	
	$scope.signout = function(){
			$http.post('/auth/signout').then(function success(response){
				authService.setAuthenticated(false);
    			$scope.authenticated = false;
		});
	};
});

app.controller('authController', function($scope, $http, $location, $rootScope,msgService,authService){
	$scope.user = {email: '', password: ''};
	$scope.error_message = '';
	$scope.strength_message = '';
	$scope.$watch(msgService.getSuccessMessage,function(message){
		$scope.success_message=message;
	});
	$scope.$watch(msgService.getErrorMessage, function(message){
		$scope.error_message = message;
	});
    $scope.login = function(){
    	$http.post('/auth/login', $scope.user).then(function success(response){
				if(response.data.state == true){
					$rootScope.current_user = response.data.name;
					authService.setAuthenticated(true);
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
		if($scope.isValidForm()){
			$http.post('/auth/signup', $scope.user).then(function success(response){
				if(response.data.state == true){
					$rootScope.current_user = response.data.name;
					msgService.setSuccessMessage(response.data.message);
					$location.path('/login');
				}
				else{
					$scope.error_message = response.data.message;
				}
			}
			,function error(error){
				$scope.error_message = error;
			});
		}
	};
	
	$scope.isValidForm = function(){
		return $scope.isValidEmail() && $scope.checkPwdStrength();
	};

	$scope.isValidEmail = function(){
		var email = $scope.user.email;
		if(!email.match(/^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-z]{3}/)){
			$scope.email_invalid = "Email format: abc@pqr.xyz. Only alphanumeric characters,'-' and '_' are allowed, and only lowercase alphabetical characters are allowed in domain name.";
			return false;
		}
		return true;
	}

	$scope.checkPwdStrength = function(){
		$scope.strength_message = '';
		var pwd = $scope.user.password;
		if(pwd){
			var strength = 0;
			if(pwd.length >= 10 && pwd.length <= 15){
				strength ++;
			}
			else{
				$scope.strength_message = "Password length should be between 10 and 15 characters.";
				return false;
			}
			if(pwd.match(/[a-z]+/)){
				strength ++;
			}
			if(pwd.match(/[A-Z]+/)){
				strength ++;
			}
			if(pwd.match(/\d+/)){
				strength ++; 
			}
			if(pwd.match(/([!@#$%\^&*+=._-]+)/)){
				strength ++;
			}
			if(strength == 1){
				$scope.strength_message = "Bad password. Please enter a stronger password. (Password must include "
					+"at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
			}
			else if(strength == 2){
				$scope.strength_message = "Medium password. Please enter a stronger password. (Password must include "
				+"at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
			}
			else if(strength == 3){
				$scope.strength_message = "Good password, but please enter a stronger password. (Password must include "
				+"at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
			}
			else if(strength == 4){
				$scope.strength_message = "Strong password, but please enter a stronger password. (Password must include "
				+"at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
				return false;
			}
			else{
				$scope.strength_message = "Excellent password! All conditions satisfied!";
				return true;
			}
			return false;
		}
	}
});

app.factory('msgService', function () {
	var msg='';
	return {
			setSuccessMessage: function(m) {
					msg=m;
			},
			getSuccessMessage: function() {
					return msg;
			},
			setErrorMessage: function(m){
				msg=m;
			},
			getErrorMessage: function(){
				return msg;
			}
	};
});

app.factory('authService',function(){
	var authenticated = false;
	return {
		setAuthenticated: function(auth){
			authenticated = auth;
		},
		getAuthenticated: function(){
			return authenticated;
		}
	}
});