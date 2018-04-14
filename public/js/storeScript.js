var app = angular.module('groceryStore', ['ngRoute', 'ngResource']);

app.config(function($routeProvider) {
    $routeProvider
    //the timeline display
        .when('/', {
            templateUrl: 'products.html',
            controller: 'productCtrl'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'authController'
        })
        .when('/update_products', {
            templateUrl: 'update_products.html',
            controller: 'updateProductsCtrl'
        })
        .when('/manage_products', {
            templateUrl: 'manage_products.html',
            controller: 'manageProductsCtrl'
		})
		.otherwise({
			redirectTo: '/'
		});
});

app.controller('headerController', function($scope, $http, $resource, $location, authService) {
    var User = $resource('/api/user');
    User.get({}, function(user) {
        if (user.name) {
            $scope.authenticated = true;
            authService.setAuthenticated(true);
            if (user.admin) {
                $scope.admin = true;
                authService.setIsAdmin(true);
            }
        }
    });
    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });

    $scope.signout = function() {
        $http.post('/auth/signout').then(function success(response) {
            authService.reset();
            $scope.authenticated = false;
            $scope.admin = false;
            $location.path('/login');
        });
    };
});

app.controller('authController', function($scope, $http, $location, msgService, authService) {
    $scope.user = { email: '', password: '' };
    $scope.error_message = '';
    $scope.strength_message = '';
    $scope.$watch(msgService.getSuccessMessage, function(message) {
        $scope.success_message = message;
    });
    $scope.$watch(msgService.getErrorMessage, function(message) {
        $scope.error_message = message;
    });
    $scope.login = function() {
        $http.post('/auth/login', $scope.user).then(function success(response) {
            if (response.data.state == true) {
                authService.setAuthenticated(true);
                authService.setIsAdmin(response.data.isAdmin);
                msgService.reset();
                $location.path('/');
            } else {
                $scope.error_message = response.data.message;
            }
        }, function error(error) {
            $scope.error_message = error;
        });
    };

    $scope.register = function() {
        if ($scope.isValidForm()) {
            $http.post('/auth/signup', $scope.user).then(function success(response) {
                if (response.data.state == true) {
                    msgService.setSuccessMessage(response.data.message);
                    $location.path('/login');
                } else {
                    $scope.error_message = response.data.message;
                }
            }, function error(error) {
                $scope.error_message = error;
            });
        }
    };

    $scope.isValidForm = function() {
        return $scope.isValidEmail() && $scope.checkPwdStrength();
    };

    $scope.isValidEmail = function() {
        var email = $scope.user.email;
        if (!email.match(/^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9_\-\.]+\.[a-z]{3}/)) {
            $scope.email_invalid = "Email format: abc@pqr.xyz. Only alphanumeric characters,'-' and '_' are allowed, and only lowercase alphabetical characters are allowed in domain name.";
            return false;
        }
        return true;
    }

    $scope.checkPwdStrength = function() {
        $scope.strength_message = '';
        var pwd = $scope.user.password;
        if (pwd) {
            var strength = 0;
            if (pwd.length >= 10 && pwd.length <= 15) {
                strength++;
            } else {
                $scope.strength_message = "Password length should be between 10 and 15 characters.";
                return false;
            }
            if (pwd.match(/[a-z]+/)) {
                strength++;
            }
            if (pwd.match(/[A-Z]+/)) {
                strength++;
            }
            if (pwd.match(/\d+/)) {
                strength++;
            }
            if (pwd.match(/([!@#$%\^&*+=._-]+)/)) {
                strength++;
            }
            if (strength == 1) {
                $scope.strength_message = "Bad password. Please enter a stronger password. (Password must include " +
                    "at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
            } else if (strength == 2) {
                $scope.strength_message = "Medium password. Please enter a stronger password. (Password must include " +
                    "at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
            } else if (strength == 3) {
                $scope.strength_message = "Good password, but please enter a stronger password. (Password must include " +
                    "at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
            } else if (strength == 4) {
                $scope.strength_message = "Strong password, but please enter a stronger password. (Password must include " +
                    "at least 1 uppercase, 1 lowercase letter, 1 digit and 1 special character)";
                return false;
            } else {
                $scope.strength_message = "Excellent password! All conditions satisfied!";
                return true;
            }
            return false;
        }
    }
});

app.controller('manageProductsCtrl', function($scope, $resource, $location, authService) {

    var User = $resource('/api/user');
    User.get({}, function(user) {
        if (user.name) {
            $scope.authenticated = true;
            authService.setAuthenticated(true);
            if (user.admin) {
                $scope.admin = true;
                authService.setIsAdmin(true);
                $scope.data = {
                    operations: [
                        { id: '1', name: 'Add' },
                        { id: '2', name: 'Update' },
                        { id: '3', name: 'Delete' }
                    ],
                    categories: [
                        { id: '1', name: 'Category1' },
                        { id: '2', name: 'Category2' },
                        { id: '3', name: 'Category3' }
                    ]
                };
            } else {
                $location.path('/login');
            }
        } else {
            $location.path('/login');
        }
    });

    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });



});

app.controller('updateProductsCtrl', function($scope, $rootScope, $resource, $location, authService) {
    // auto-filling details of the product
    $scope.productName = $rootScope.prod.productName;
    $scope.price = $rootScope.prod.productPrice;
    $scope.quantity = $rootScope.prod.stockQuantity;

    $scope.id = {
        id: $rootScope.prod._id,
        img: $rootScope.prod.productImage,
        category: $rootScope.prod.productCategory
    }

    var User = $resource('/api/user');
    User.get({}, function(user) {
        if (user.name) {
            $scope.authenticated = true;
            authService.setAuthenticated(true);
            if (user.admin) {
                $scope.admin = true;
                authService.setIsAdmin(true);
                $scope.categories = [
					{ id: '1', name: 'Category1' },
					{ id: '2', name: 'Category2' },
					{ id: '3', name: 'Category3' }
				];
				console.log($rootScope.prod.productCategory);
                $scope.productCategory = $rootScope.prod.productCategory;
            } else {
                $location.path('/login');
            }
        } else {
            $location.path('/login');
        }
    });

    //console.log($resource);

    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });

});

app.controller('productCtrl', function($scope, $rootScope, $resource, $location, authService, $http) {

	$scope.product = {};
	var productQuantityDict = {};

    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });
    var User = $resource('/api/user');
    User.get({},function(user){
		if(user.userID){
			authService.setUserID(user.userID);
			$scope.authenticated = true;
			authService.setAuthenticated(true);
			if(user.admin){
				$scope.admin = true;
				authService.setIsAdmin(true);
			}
			var Products = $resource('/api/products');
			Products.query({},function(products,err){
				$scope.products = products;
			});
			var Cart = $resource('/api/cart/'+user.userID);
			Cart.query({},function(cart){
				$scope.cart = cart;
				for(var i = 0; i < cart.length; i++){
					for(var product in $scope.products){
						productQuantityDict[product.productName] = 0;
						if(cart[i].productId == product.productId){
							console.log("In cart: productID "+cart[i].productId);
							continue;
						}
					}
				}
			});
		}
		else{
			$location.path('/login');
		}
	});

    $scope.updateProd = function(prod) {
        $location.path('/update_products');
        $rootScope.prod = prod;
        console.log(prod.productName);
    };

    $scope.deleteProd = function(prod) {
        console.log(prod);
        $http.delete('/api/products/' + prod).then(function(response) {});
        $location.path('/products');
	};
	
	$scope.addToCart = function(product){
		if(cartService.getCart().length == 0){
			productQuantityDict[product.productName] += 1;
			cartService.addToCart(product);
			var productObj = {
				productName: product.productName,
				quantity: cartService.getCartQuantity(product._id),
				price: product.productPrice
			};
			productsArr = [productObj];
			$http.post('/api/cart/',{'products':productsArr}).then(function success(response){
				console.log("Posted cart");
			},function error(response){
				console.log("Error");
			});
		}
		else{
			if(productQuantityDict[product.productName] == product.stockQuantity){
				console.log("Cannot add more items of this type!");
			}
			else{
				cartService.increaseCartQuantity(product._id);
				productQuantityDict[product.productName] += 1;
				var cart = cartService.getCart();
				var productObj = {
					productName: product.productName,
					quantity: cartService.getCartQuantity(product._id),	
					price: product.productPrice
				};
				
				$http.put('/api/cart/'+authService.getUserID(),{'products':cart}).then(function success(response){
					console.log("Updated cart");
				},function error(response){
					console.log("Error");
				});
			}
		}
	}
});

app.factory('msgService', function() {
    var successMsg = '';
    var errorMsg = '';
    return {
        setSuccessMessage: function(m) {
            successMsg = m;
        },
        getSuccessMessage: function() {
            return successMsg;
        },
        setErrorMessage: function(m) {
            errorMsg = m;
        },
        getErrorMessage: function() {
            return errorMsg;
        },
        reset: function() {
            this.setSuccessMessage('');
            this.setErrorMessage('');
        }
    };
});

app.factory('authService',function(){
	var authenticated = false, isAdmin = false,userID;
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
		setUserID: function(userID){
			this.userID = userID;
		},
		getUserID: function(){
			return this.userID;
		},
		reset: function(){
			this.setAuthenticated(false);
			this.setIsAdmin(false);
		}
	}
});

app.factory('cartService',function(){
	var cart=[];
	return{
		addToCart: function(product){
			var alreadyInCart = false;
			for(var i = 0; i < cart.length; i++){
				if(cart[i]._id == product._id){
					cart[i].quantity += 1;
					alreadyInCart = true;
					break;
				}
			}
			if(!alreadyInCart){	
				product.quantity = 1;
				cart.push(product);
			}
		},
		removeFromCart: function(productId){
			for(var i = 0; i < cart.length; i++){
				if(cart[i]._id == productId){
					cart.splice(i,1);
					break;
				}
			}
		},
		increaseCartQuantity: function(productId){
			for(var i = 0; i < cart.length; i++){
				if(cart[i]._id == productId){
					cart[i].quantity += 1;
					break;
				}
			}
		},
		decreaseCartQuantity: function(productId){
			for(var i = 0; i < cart.length; i++){
				if(cart[i]._id == productId){
					if(cart[i].quantity == 1){
						cart.splice(i,1);
						break;
					}
					else{
						cart[i].quantity -= 1;
						break;
					}
				}
			}
		},
		getCart: function(){
			return cart;
		},
		getCartQuantity: function(productId){
			for(var i = 0; i < cart.length; i++){
				if(cart[i]._id == productId){
					return cart[i].quantity;
				}
			}
			return 0;
		}
	}
});