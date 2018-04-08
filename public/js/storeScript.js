var app = angular.module('groceryStore', ['ngRoute','ngResource','ngFileUpload']);

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
		})
		.when('/manage_products',{
			templateUrl: 'manage_products.html',
			controller: 'manageProductsCtrl'
		});
});

app.controller('mainController',function($scope,$http,authService){
	$scope.$watch(authService.getAuthenticated, function(auth){
		$scope.authenticated = auth;
	});

	$scope.$watch(authService.getIsAdmin,function(admin){
		$scope.admin = admin;
	});
	
	$scope.signout = function(){
			$http.post('/auth/signout').then(function success(response){
				authService.reset();
    			$scope.authenticated = false;
		});
	};
});

app.controller('authController', function($scope, $http, $location,msgService,authService){
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
					authService.setAuthenticated(true);
					authService.setIsAdmin(response.data.isAdmin);
					msgService.reset();
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

app.controller('manageProductsCtrl',function($scope,$resource){
	$scope.data = {
		operations:[
			{id:'1', name : 'Add'	},
			{id:'2', name : 'Update'},
			{id:'3', name : 'Delete'}
		],
		categories:[
			{id: '1', name: 'Category1'},
			{id: '2', name: 'Category2'},
			{id: '3', name: 'Category3'}
		]
	};
});

app.factory('msgService', function () {
	var successMsg='';
	var errorMsg='';
	return {
			setSuccessMessage: function(m) {
					successMsg=m;
			},
			getSuccessMessage: function() {
					return successMsg;
			},
			setErrorMessage: function(m){
				errorMsg=m;
			},
			getErrorMessage: function(){
				return errorMsg;
			},
			reset: function(){
				this.setSuccessMessage('');
				this.setErrorMessage('');
			}
	};
});

app.factory('authService',function(){
	var authenticated = false, isAdmin = false;
	return {
		setAuthenticated: function(auth){
			authenticated = auth;
		},
		getAuthenticated: function(){
			return authenticated;
		},
		setIsAdmin: function(admin){
			isAdmin = admin;
		},
		getIsAdmin: function(){
			return isAdmin;
		},
		reset: function(){
			this.setAuthenticated(false);
			this.setIsAdmin(false);
		}
	}
});