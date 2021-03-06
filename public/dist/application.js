'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mean';
	var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngMaterial', 'lumx', 'xeditable'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('articles');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('chat');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');

'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('employees');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('memos');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('settings');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Add the articles dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Articles',
			state: 'articles.list',
			icon: 'file-document',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'articles', {
			title: 'List Articles',
			state: 'articles.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'articles', {
			title: 'Create Articles',
			state: 'articles.create'
		});
	}
]);

'use strict';

// Setting up route
angular.module('articles').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('articles', {
			abstract: true,
			url: '/articles',
			template: '<ui-view/>'
		}).
		state('articles.list', {
			url: '',
			templateUrl: 'modules/articles/views/list-articles.client.view.html'
		}).
		state('articles.create', {
			url: '/create',
			templateUrl: 'modules/articles/views/create-article.client.view.html'
		}).
		state('articles.view', {
			url: '/:articleId',
			templateUrl: 'modules/articles/views/view-article.client.view.html'
		}).
		state('articles.edit', {
			url: '/:articleId/edit',
			templateUrl: 'modules/articles/views/edit-article.client.view.html'
		});
	}
]);

'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
	function($scope, $stateParams, $location, Authentication, Articles) {
		$scope.authentication = Authentication;

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);

				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('articles');
				});
			}
		};

		$scope.update = function() {
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
			});
		};
	}
]);

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('articles').factory('Articles', ['$resource',
	function($resource) {
		return $resource('api/articles/:articleId', {
			articleId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Configuring the Chat module
angular.module('chat').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', {
			title: 'Chat',
			state: 'chat',
			icon: 'message'
		});
	}
]);

'use strict';

// Configure the 'chat' module routes
angular.module('chat').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider.
		state('chat', {
			url: '/chat',
			templateUrl: 'modules/chat/views/chat.client.view.html'
		});
	}
]);

'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', 'Socket',
    function($scope, Socket) {
    	// Create a messages array
        $scope.messages = [];
        
        // Add an event listener to the 'chatMessage' event
        Socket.on('chatMessage', function(message) {
            $scope.messages.unshift(message);
        });
        
        // Create a controller method for sending messages
        $scope.sendMessage = function() {
        	// Create a new message object
            var message = {
                text: this.messageText
            };
            
            // Emit a 'chatMessage' message event
            Socket.emit('chatMessage', message);
            
            // Clear the message text
            this.messageText = '';
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            Socket.removeListener('chatMessage');
        });

    }
]); 

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/dashboard');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/dashboard',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);

'use strict';

var app = angular.module('core');

app.controller('HeaderController', ['$scope', '$state', '$mdSidenav', 'Authentication', 'Menus',  'LxNotificationService', 'LxDialogService',
  function($scope, $state, $mdSidenav, Authentication, Menus, LxNotificationService, LxDialogService) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.toggleRight = function() {
      $mdSidenav('right').toggle();
    };


    $scope.alert = function() {
      LxNotificationService.alert('Arawak', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sit amet urna quis nisi sodales semper pharetra eu augue.', 'Ok', function(answer) {
        // console.log(answer);
      });
    };

    $scope.opendDialog = function(dialogId) {
      LxDialogService.open(dialogId);
    };

    $scope.closingDialog = function() {
      LxNotificationService.info('Dialog closed!');
    };

  }
]);

app.controller('LeftCtrl', ["$scope", "$timeout", "$mdSidenav", "$log", function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('left').close()
      .then(function() {});
  };
}]);

app.controller('RightCtrl', ["$scope", "$timeout", "$mdSidenav", "$log", function($scope, $timeout, $mdSidenav, $log) {
  $scope.close = function() {
    $mdSidenav('right').close()
      .then(function() {});
  };
}]);

'use strict';

var app = angular.module('core');

app.controller('HomeController', ['$scope', 'Authentication', '$location',
	function($scope,  Authentication, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		if (!$scope.authentication.user) $location.path('/authentication/signin');


	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

    function() {
        // Define a set of default roles
        this.defaultRoles = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function(user) {
            if (user) {
                if (!!~this.roles.indexOf('*')) {
                    return true;
                } else {
                    for (var userRoleIndex in user.roles) {
                        for (var roleIndex in this.roles) {
                            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                                return true;
                            }
                        }
                    }
                }
            } else {
                return this.isPublic;
            }

            return false;
        };

        // Validate menu existance
        this.validateMenuExistance = function(menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exists');
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function(menuId, options) {
            options = options || {};

            // Create the new menu
            this.menus[menuId] = {
                isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? true : options.isPublic),
                roles: options.roles || this.defaultRoles,
                items: options.items || [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function(menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function(menuId, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Push new menu item
            this.menus[menuId].items.push({
                title: options.title || '',
                state: options.state || '',
                icon: options.icon || '',
                type: options.type || 'item',
                class: options.class,
                isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].isPublic : options.isPublic),
                roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].roles : options.roles),
                position: options.position || 0,
                items: [],
                shouldRender: shouldRender
            });

            // Add submenu items
            if (options.items) {
                for (var i in options.items) {
                	this.addSubMenuItem(menuId, options.link, options.items[i]);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function(menuId, parentItemState, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].state === parentItemState) {
                    // Push new submenu item
                    this.menus[menuId].items[itemIndex].items.push({
                        title: options.title || '',
                        state: options.state|| '',
                        isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : options.isPublic),
                        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
                        position: options.position || 0,
                        shouldRender: shouldRender
                    });
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function(menuId, menuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function(menuId, submenuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                    if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                        this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar', {
            isPublic: false
        });
    }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
    function(Authentication, $state, $timeout) {
    	// Connect to the Socket.io server only when authenticated
        if (Authentication.user) {
            this.socket = io();
        } else {
            $state.go('home');
        }

        // Wrap the Socket.io 'on' method
        this.on = function(eventName, callback) {
            if (this.socket) {
                this.socket.on(eventName, function(data) {
                    $timeout(function() {
                        callback(data);
                    });
                });
            }
        };

        // Wrap the Socket.io 'emit' method
        this.emit = function(eventName, data) {
            if (this.socket) {
                this.socket.emit(eventName, data);
            }
        };

        // Wrap the Socket.io 'removeListener' method
        this.removeListener = function(eventName) {
            if (this.socket) {
                this.socket.removeListener(eventName);
            }
        };
    }
]);

'use strict';

// Configuring the Employees module
var app = angular.module('employees');
app.run(['Menus',
	function(Menus) {
		// Add the Employees dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Directory',
			state: 'employees.list',
			icon: 'account-multiple',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'employees', {
			title: 'List Employees',
			state: 'employees.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'employees', {
			title: 'Create Employee',
			state: 'employees.create'
		});
	}
]);

app.run(["editableOptions", function(editableOptions) {
  editableOptions.theme = 'default';
}]);

'use strict';

//Setting up route
angular.module('employees').config(['$stateProvider',
	function($stateProvider) {
		// Employees state routing
		$stateProvider.
		state('employees', {
			abstract: true,
			url: '/employees',
			template: '<ui-view/>'
		}).
		state('employees.list', {
			url: '',
			templateUrl: 'modules/employees/views/list-employees.client.view.html'
		}).
		state('employees.create', {
			url: '/create',
			templateUrl: 'modules/employees/views/create-employee.client.view.html'
		}).
		state('employees.view', {
			url: '/:employeeId',
			templateUrl: 'modules/employees/views/view-employee.client.view.html'
		}).
		state('employees.edit', {
			url: '/:employeeId/edit',
			templateUrl: 'modules/employees/views/edit-employee.client.view.html'
		});
	}
]);
'use strict';

// Employees controller
var app = angular.module('employees');

app.controller('EmployeesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Employees',  'LxNotificationService', 'LxDialogService',
	function($scope, $stateParams, $location, Authentication, Employees, LxNotificationService, LxDialogService ) {
		$scope.authentication = Authentication;

		// Create new Employee
		$scope.create = function() {
			// Create new Employee object
			var employee = new Employees ({
				name: this.name

			});

			// Redirect after save
			employee.$save(function(response) {
				$location.path('employees/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Employee
		$scope.remove = function( employee ) {
			if ( employee ) { employee.$remove();

				for (var i in $scope.employees ) {
					if ($scope.employees [i] === employee ) {
						$scope.employees.splice(i, 1);
					}
				}
			} else {
				$scope.employee.$remove(function() {
					$location.path('employees');
				});
			}
		};

		// Update existing Employee
		$scope.update = function() {
			var employee = $scope.employee ;

			employee.$update(function() {
				$location.path('employees/' + employee._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Employees
		$scope.find = function() {
			$scope.employees = Employees.query();
		};

		// Find existing Employee
		$scope.findOne = function() {
			$scope.employee = Employees.get({
				employeeId: $stateParams.employeeId
			});
		};

		// Allow editing if user is administratio
		$scope.isAllowed = function(user) {
		  if (user) {
		    for (var userRoleIndex in user.roles) {

		      if (user.roles[userRoleIndex] === 'admin') {
		        return true;
		      }
		    }
		  }
		};

		$scope.alert = function() {
			LxNotificationService.alert('Arawak', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sit amet urna quis nisi sodales semper pharetra eu augue.', 'Ok', function(answer) {
				// console.log(answer);
			});
		};

		$scope.opendDialog = function(dialogId) {
			LxDialogService.open(dialogId);
		};


	}
]);

'use strict';

//Employees service used to communicate Employees REST endpoints
angular.module('employees').factory('Employees', ['$resource',
	function($resource) {
		return $resource('api/employees/:employeeId', { employeeId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Memos module
angular.module('memos').run(['Menus',
	function(Menus) {
		// Add the Memos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Memos',
			state: 'memos.list',
			icon: 'file-document',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'memos', {
			title: 'List Memos',
			state: 'memos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'memos', {
			title: 'Create Memo',
			state: 'memos.create'
		});
	}
]);

'use strict';

//Setting up route
angular.module('memos').config(['$stateProvider',
	function($stateProvider) {
		// Memos state routing
		$stateProvider.
		state('memos', {
			abstract: true,
			url: '/memos',
			template: '<ui-view/>'
		}).
		state('memos.list', {
			url: '',
			templateUrl: 'modules/memos/views/list-memos.client.view.html'
		}).
		state('memos.create', {
			url: '/create',
			templateUrl: 'modules/memos/views/create-memo.client.view.html'
		}).
		state('memos.view', {
			url: '/:memoId',
			templateUrl: 'modules/memos/views/view-memo.client.view.html'
		}).
		state('memos.edit', {
			url: '/:memoId/edit',
			templateUrl: 'modules/memos/views/edit-memo.client.view.html'
		});
	}
]);
'use strict';

// Memos controller
angular.module('memos').controller('MemosController', ['$scope', '$stateParams', '$location', 'Authentication', 'Memos',
	function($scope, $stateParams, $location, Authentication, Memos ) {
		$scope.authentication = Authentication;

		// Create new Memo
		$scope.create = function() {
			// Create new Memo object
			var memo = new Memos ({
				name: this.name
			});

			// Redirect after save
			memo.$save(function(response) {
				$location.path('memos/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Memo
		$scope.remove = function( memo ) {
			if ( memo ) { memo.$remove();

				for (var i in $scope.memos ) {
					if ($scope.memos [i] === memo ) {
						$scope.memos.splice(i, 1);
					}
				}
			} else {
				$scope.memo.$remove(function() {
					$location.path('memos');
				});
			}
		};

		// Update existing Memo
		$scope.update = function() {
			var memo = $scope.memo ;

			memo.$update(function() {
				$location.path('memos/' + memo._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Memos
		$scope.find = function() {
			$scope.memos = Memos.query();
		};

		// Find existing Memo
		$scope.findOne = function() {
			$scope.memo = Memos.get({ 
				memoId: $stateParams.memoId
			});
		};
	}
]);
'use strict';

//Memos service used to communicate Memos REST endpoints
angular.module('memos').factory('Memos', ['$resource',
	function($resource) {
		return $resource('api/memos/:memoId', { memoId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Configuring the Settings module
angular.module('settings').run(['Menus',
	function(Menus) {
		// Add the Settings dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Settings',
			state: 'settings',
			icon: 'settings',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'settings', {
			title: 'List Settings',
			state: 'settings.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'settings', {
			title: 'Create Setting',
			state: 'settings.create'
		});
	}
]);

'use strict';

//Setting up route
angular.module('settings').config(['$stateProvider',
	function($stateProvider) {
		// Settings state routing
		$stateProvider.
		state('settings', {
			abstract: true,
			url: '/settings',
			template: '<ui-view/>'
		}).
		state('settings.list', {
			url: '',
			templateUrl: 'modules/settings/views/list-settings.client.view.html'
		}).
		state('settings.create', {
			url: '/create',
			templateUrl: 'modules/settings/views/create-setting.client.view.html'
		}).
		state('settings.view', {
			url: '/:settingId',
			templateUrl: 'modules/settings/views/view-setting.client.view.html'
		}).
		state('settings.edit', {
			url: '/:settingId/edit',
			templateUrl: 'modules/settings/views/edit-setting.client.view.html'
		});
	}
]);
'use strict';

// Settings controller
angular.module('settings').controller('SettingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Settings',
	function($scope, $stateParams, $location, Authentication, Settings ) {
		$scope.authentication = Authentication;

		// Create new Setting
		$scope.create = function() {
			// Create new Setting object
			var setting = new Settings ({
				name: this.name
			});

			// Redirect after save
			setting.$save(function(response) {
				$location.path('settings/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Setting
		$scope.remove = function( setting ) {
			if ( setting ) { setting.$remove();

				for (var i in $scope.settings ) {
					if ($scope.settings [i] === setting ) {
						$scope.settings.splice(i, 1);
					}
				}
			} else {
				$scope.setting.$remove(function() {
					$location.path('settings');
				});
			}
		};

		// Update existing Setting
		$scope.update = function() {
			var setting = $scope.setting ;

			setting.$update(function() {
				$location.path('settings/' + setting._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Settings
		$scope.find = function() {
			$scope.settings = Settings.query();
		};

		// Find existing Setting
		$scope.findOne = function() {
			$scope.setting = Settings.get({ 
				settingId: $stateParams.settingId
			});
		};
	}
]);
'use strict';

//Settings service used to communicate Settings REST endpoints
angular.module('settings').factory('Settings', ['$resource',
	function($resource) {
		return $resource('api/settings/:settingId', { settingId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function ($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function ($q, $location, Authentication) {
				return {
					responseError: function (rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function ($stateProvider) {
		// Users state routing
		$stateProvider.
			state('settings.profile', {
				url: '/profile',
				templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
			}).
			state('settings.password', {
				url: '/password',
				templateUrl: 'modules/users/views/settings/change-password.client.view.html'
			}).
			state('settings.accounts', {
				url: '/accounts',
				templateUrl: 'modules/users/views/settings/manage-social-accounts.client.view.html'
			}).
			state('settings.picture', {
				url: '/picture',
				templateUrl: 'modules/users/views/settings/change-profile-picture.client.view.html'
			}).
			state('authentication', {
				abstract: true,
				url: '/authentication',
				templateUrl: 'modules/users/views/authentication/authentication.client.view.html'
			}).
			state('authentication.signup', {
				url: '/signup',
				templateUrl: 'modules/users/views/authentication/signup.client.view.html'
			}).
			state('authentication.signin', {
				url: '/signin',
				templateUrl: 'modules/users/views/authentication/signin.client.view.html'
			}).
			state('password', {
				abstract: true,
				url: '/password',
				template: '<ui-view/>'
			}).
			state('password.forgot', {
				url: '/forgot',
				templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
			}).
			state('password.reset', {
				abstract: true,
				url: '/reset',
				template: '<ui-view/>'
			}).
			state('password.reset.invalid', {
				url: '/invalid',
				templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
			}).
			state('password.reset.success', {
				url: '/success',
				templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
			}).
			state('password.reset.form', {
				url: '/:token',
				templateUrl: 'modules/users/views/password/reset-password.client.view.html'
			});
	}
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication','LxNotificationService',
	function($scope, $http, $location, Authentication, LxNotificationService) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/api/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;

			});
		};

		$scope.signin = function() {
			$http.post('/api/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;

				LxNotificationService.error(response.message);

				//TODO - notify to reset password if login fail after three attemps

			});
		};


		$scope.help = function() {
			LxNotificationService.confirm('Forget your password?', ' No worries! We can reset it for you.', { cancel:'Disagree', ok:'Agree' }, function(answer)
        {
            console.log(answer);

						if (answer === true) $location.path('/forgot');

        });


		};

	}
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/authentication/signin');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/api/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/authentication/signin');

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/api/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/api/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/api/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
	function ($scope, $timeout, $window, Authentication, FileUploader) {
		$scope.user = Authentication.user;
		$scope.imageURL = $scope.user.profileImageURL;

		// Create file uploader instance
		$scope.uploader = new FileUploader({
			url: 'api/users/picture'
		});

		// Set file uploader image filter
		$scope.uploader.filters.push({
			name: 'imageFilter',
			fn: function (item, options) {
				var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
				return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
			}
		});

		// Called after the user selected a new picture file
		$scope.uploader.onAfterAddingFile = function (fileItem) {
			if ($window.FileReader) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL(fileItem._file);

				fileReader.onload = function (fileReaderEvent) {
					$timeout(function () {
						$scope.imageURL = fileReaderEvent.target.result;
					}, 0);
				};
			}
		};

		// Called after the user has successfully uploaded a new picture
		$scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
			// Show success message
			$scope.success = true;

			// Populate user object
			$scope.user = Authentication.user = response;

			// Clear upload buttons
			$scope.cancelUpload();
		};

		// Called after the user has failed to uploaded a new picture
		$scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
			// Clear upload buttons
			$scope.cancelUpload();

			// Show error message
			$scope.error = response.message;
		};

		// Change user profile picture
		$scope.uploadProfilePicture = function () {
			// Clear messages
			$scope.success = $scope.error = null;

			// Start upload
			$scope.uploader.uploadAll();
		};

		// Cancel the upload process
		$scope.cancelUpload = function () {
			$scope.uploader.clearQueue();
			$scope.imageURL = $scope.user.profileImageURL;
		};
	}
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};
	}
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/api/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back to login
		if (!$scope.user) $location.path('/authentication/signin');
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
	function($window) {
		var auth = {
			user: $window.user
		};

		return auth;
	}
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('api/users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
