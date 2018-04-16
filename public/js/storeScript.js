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
        .when('/cart', {
            templateUrl: 'cart.html',
            controller: 'cartCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

<<<<<<< HEAD

app.controller('headerController', function($scope, $http, $resource, $location, authService) {
=======
app.controller('headerController', function($scope, $http, $resource, $location, authService,cartService) {
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
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
            cartService.setProductQuantityDict({});
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

app.controller('updateProductsCtrl', function($scope, $rootScope, $filter,$resource, $location, authService) {
    // auto-filling details of the product
    $scope.productName = $rootScope.prod.productName;
    $scope.price = $filter('number')($rootScope.prod.productPrice,2);
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
                console.log($rootScope.prod);
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

    $scope.$watch("currentPage + numPerPage", function() {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;

        $scope.filteredTodos = $scope.todos.slice(begin, end);
    });

});

<<<<<<< HEAD
app.controller('productCtrl', function($scope, $rootScope, $resource, $location, authService, cartService, msgService, $http) {

    $scope.product = {};
    var productQuantityDict = {};

=======
app.controller('productCtrl', function($scope, $rootScope, $resource, $filter,$location, authService,cartService,msgService,$http) {

	$scope.product = {};
	var userProdQuantityDictMap = {};
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });
    $scope.$watch(msgService.getSuccessMessage, function(message) {
        $scope.success_message = message;
    });
    $scope.$watch(msgService.getErrorMessage, function(message) {
        $scope.error_message = message;
    });
    var User = $resource('/api/user');
<<<<<<< HEAD
    User.get({}, function(user) {
        if (user.userID) {
            authService.setUserID(user.userID);
            $scope.authenticated = true;
            authService.setAuthenticated(true);
            if (user.admin) {
                $scope.admin = true;
                authService.setIsAdmin(true);
            }
            var Cart = $resource('/api/cart/' + user.userID);
            Cart.query({}, function(cart) {
                if (cart && cart.length > 0) {
                    $scope.cart = cart;
                    cartService.setCart(cart[0].products);
                    for (var i = 0; i < cart[0].products.length; i++) {
                        productQuantityDict[cart[0].products[i]._id] = cart[0].products[i].quantity;
=======
    User.get({},function(user){
		if(user.userID){
			authService.setUserID(user.userID);
			$scope.authenticated = true;
			authService.setAuthenticated(true);
			if(user.admin){
				$scope.admin = true;
				authService.setIsAdmin(true);
            }
            var Cart = $resource('/api/cart/'+user.userID);
            Cart.query().$promise.then(function(cart) {
                if(cart && cart.length > 0){
                    $scope.cart = cart;
                    cartService.setCart(cart[0].products);
                    userProdQuantityDictMap[user.userID] = {};
                    for(var i = 0; i < cart[0].products.length; i++){
                        userProdQuantityDictMap[user.userID][cart[0].products[i]._id] = cart[0].products[i].quantity;
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
                    }
                    cartService.setProductQuantityDict(userProdQuantityDictMap);
                }
<<<<<<< HEAD

=======
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
            });

<<<<<<< HEAD
            var Products = $resource('/api/products');
            Products.query({}, function(products, err) {
                $scope.products = products;
                for (var product in $scope.products) {
                    if (productQuantityDict[$scope.products[product]._id]) {
                        $scope.products[product].cartQuantity = productQuantityDict[$scope.products[product]._id];
                    } else {
                        $scope.products[product].cartQuantity = 0;
                    }
                }
            });

        } else {
            $location.path('/login');
        }
    });
=======
			var Products = $resource('/api/products');
			Products.query().$promise.then(function(products){
                $scope.products = products;
				for(var product in $scope.products){
                    $scope.products[product].productPrice = $filter('number')($scope.products[product].productPrice,2);
                    userProdQuantityDictMap = cartService.getProductQuantityDict();
                    if(userProdQuantityDictMap[user.userID][$scope.products[product]._id]){
                        $scope.products[product].cartQuantity = userProdQuantityDictMap[user.userID][$scope.products[product]._id];
                    }
                    else{
                        $scope.products[product].cartQuantity = 0;
                    }
				}
			});
		}
		else{
			$location.path('/login');
		}
	});
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f

    $scope.updateProd = function(prod) {
        $location.path('/update_products');
        $rootScope.prod = prod;
        console.log(prod.productName);
    };

    $scope.deleteProd = function(prod) {
        console.log(prod);
        $http.delete('/api/products/' + prod).then(function(response) {});
        $location.path('/products');
<<<<<<< HEAD
    };

    $scope.addToCart = function(product) {

        if (!productQuantityDict[product._id] || productQuantityDict[product._id] == 0) {
            productQuantityDict[product._id] = 1;
            cartService.setProductQuantityDict(productQuantityDict);
            var prodObj = {
                _id: product._id,
                productName: product.productName,
                quantity: 1,
                price: product.productPrice
            };
            product.cartQuantity = 1;
            cartService.addToCart(prodObj);
            msgService.reset();
            console.log(cartService.getCart());
            $http.put('/api/cart', { 'products': cartService.getCart(), 'userID': authService.getUserID() }).then(function success(response) {
                console.log("Added to cart successfully");
            }, function error(err) {
                console.log("Error in adding to cart!");
            });
        } else {
            if (productQuantityDict[product._id] < product.stockQuantity) {
                productQuantityDict[product._id] += 1;
                cartService.setProductQuantityDict(productQuantityDict);
                cartService.increaseCartQuantity(product._id);
                var prodObj = {
                    _id: product._id,
                    productName: product.productName,
                    quantity: cartService.getCartQuantity(product._id),
                    price: product.productPrice
                };
=======
	};
	
	$scope.addToCart = function(product){
		var userID = authService.getUserID();
		if(!userProdQuantityDictMap[userID][product._id] || userProdQuantityDictMap[userID][product._id] == 0){
            userProdQuantityDictMap[userID][product._id] = 1;
            cartService.setProductQuantityDict(userProdQuantityDictMap);
			var prodObj = {
				_id: product._id,
				productName: product.productName,
				quantity: 1,
				price: product.productPrice
			};
			product.cartQuantity = 1;
			cartService.addToCart(prodObj);
            msgService.reset();
            console.log(cartService.getCart());
			$http.put('/api/cart',{'products':cartService.getCart(),'userID':authService.getUserID()}).then(function success(response){
				console.log("Added to cart successfully");
			},function error(err){
				console.log("Error in adding to cart!");
			});
		}
		else{
			if(userProdQuantityDictMap[userID][product._id] < product.stockQuantity){
                userProdQuantityDictMap[userID][product._id] += 1;
                cartService.setProductQuantityDict(userProdQuantityDictMap);
				cartService.increaseCartQuantity(product._id);
				var prodObj = {
					_id: product._id,
					productName: product.productName,
					quantity: cartService.getCartQuantity(product._id),
					price: product.productPrice
				};
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
                product.cartQuantity += 1;
                console.log(cartService.getCart());
                $http.put('/api/cart', { 'products': cartService.getCart(), 'userID': authService.getUserID() }).then(function success(response) {
                    console.log("Added to cart successfully");
                }, function error(err) {
                    console.log("Error in adding to cart!");
                });
                msgService.reset();
            } else {
                msgService.setErrorMessage("Cannot add any more items of this type to the cart!");
            }
        }
    }
<<<<<<< HEAD

    $scope.removeFromCart = function(product) {
        if (!productQuantityDict[product._id] || productQuantityDict[product._id] == 0) {
            msgService.setErrorMessage("Cannot remove item, item is not in cart!");
        } else {
            productQuantityDict[product._id] -= 1;
            cartService.setProductQuantityDict(productQuantityDict);
            if (productQuantityDict[product._id] == 0) {
=======
    
    $scope.removeFromCart = function(product){
        var userID = authService.getUserID();
        if(!userProdQuantityDictMap[userID] || userProdQuantityDictMap[userID][product._id] == 0){
            msgService.setErrorMessage("Cannot remove item, item is not in cart!");
        }
        else{
            userProdQuantityDictMap[userID][product._id] -= 1;
            cartService.setProductQuantityDict(userProdQuantityDictMap[userID]);
            if(userProdQuantityDictMap[userID][product._id] == 0){
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
                cartService.removeFromCart(product._id);
                product.cartQuantity = 0;
            } else {
                cartService.decreaseCartQuantity(product._id);
                product.cartQuantity -= 1;
            }
            console.log(cartService.getCart());
            $http.put('/api/cart', { 'products': cartService.getCart(), 'userID': authService.getUserID() }).then(function success(response) {
                console.log("Updated cart successfully");
            }, function error(err) {
                console.log("Error in updating cart");
            });
        }
    };

    $scope.goToCart = function() {
        console.log("Inside go to cart function");
        $location.path('/cart');
    };
});

<<<<<<< HEAD
app.controller('cartCtrl', function($scope, $resource, $location, authService, cartService) {
    $scope.cart = [];
=======
app.controller('cartCtrl',function($scope,$filter,$resource,$location,authService,cartService){
    $scope.cart = [],$scope.total = 0;
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
    $scope.$watch(authService.getAuthenticated, function(auth) {
        $scope.authenticated = auth;
    });

    $scope.$watch(authService.getIsAdmin, function(admin) {
        $scope.admin = admin;
    });

    var User = $resource('/api/user');
<<<<<<< HEAD
    User.get({}, function(user) {
        if (user.userID) {
            authService.setUserID(user.userID);
            $scope.authenticated = true;
            authService.setAuthenticated(true);
            if (user.admin) {
                $scope.admin = true;
                authService.setIsAdmin(true);
            }
            var Cart = $resource('/api/cart/' + user.userID);
            Cart.query({}, function(cart) {
                $scope.cart = cart;
                cartService.setCart(cart);
            });
        } else {
            $location.path('/login');
        }
=======
    User.get({},function(user){
		if(user.userID){
			authService.setUserID(user.userID);
			$scope.authenticated = true;
			authService.setAuthenticated(true);
			if(user.admin){
				$scope.admin = true;
				authService.setIsAdmin(true);
			}
			var Cart = $resource('/api/cart/'+user.userID);
			Cart.query({},function(cart){
				$scope.cart = cart;
                cartService.setCart(cart);
                for(var i = 0; i < cart[0].products.length; i++){
                    $scope.total += cart[0].products[i].quantity * cart[0].products[i].price;
                }
			});
		}
		else{
			$location.path('/login');
		}
>>>>>>> cdeaab65faed28adafe29b4b9d30680c971e581f
    });
    $scope.backToProducts = function() {
        $location.path('/');
    };

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

app.factory('authService', function() {
    var authenticated = false,
        isAdmin = false,
        userID;
    return {
        setAuthenticated: function(auth) {
            authenticated = auth;
        },
        getAuthenticated: function() {
            return authenticated;
        },
        setIsAdmin: function(admin) {
            isAdmin = admin;
        },
        getIsAdmin: function() {
            return isAdmin;
        },
        setUserID: function(userID) {
            this.userID = userID;
        },
        getUserID: function() {
            return this.userID;
        },
        reset: function() {
            this.setAuthenticated(false);
            this.setIsAdmin(false);
        }
    }
});

app.factory('cartService', function() {
    this.cart = [], this.prodQuantityDict = {};
    return {
        addToCart: function(product) {
            var alreadyInCart = false;
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i]._id == product._id) {
                    this.cart[i].quantity += 1;
                    alreadyInCart = true;
                    break;
                }
            }
            if (!alreadyInCart) {
                product.quantity = 1;
                this.cart.push(product);
            }
        },
        removeFromCart: function(productId) {
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i]._id == productId) {
                    this.cart.splice(i, 1);
                    break;
                }
            }
        },
        increaseCartQuantity: function(productId) {
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i]._id == productId) {
                    this.cart[i].quantity += 1;
                    break;
                }
            }
        },
        decreaseCartQuantity: function(productId) {
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i]._id == productId) {
                    if (this.cart[i].quantity == 1) {
                        this.cart.splice(i, 1);
                        break;
                    } else {
                        this.cart[i].quantity -= 1;
                        break;
                    }
                }
            }
        },
        getCart: function() {
            return this.cart;
        },
        getCartQuantity: function(productId) {
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i]._id == productId) {
                    return this.cart[i].quantity;
                }
            }
            return 0;
        },
        setCart: function(cart) {
            this.cart = cart;
        },
        setProductQuantityDict: function(dict) {
            this.prodQuantityDict = dict;
        },
        getProductQuantityDict: function() {
            return this.prodQuantityDict;
        }
    }
});