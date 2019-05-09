angular.module('ngRs', ['ngResource'])
.factory('httpRequestInterceptor', function () {
    return {
        request: function (config) {
            config.headers['X-Requested-With'] = 'Fetch';
            return config;
        }
    };
})
.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
}])
.service('ResourceSvcConfiguration', ['$log', function ($log) {
    return {
        cfg: {
            query: {
                method: 'GET',
                interceptor: {
                    response: function (res) {
                        var _count = res.headers('X-data-count');
                        if (_count !== undefined) {
                            _count = parseInt(_count, 10);
                            res.resource.$count = _count;
                        }
                        return res.resource;
                    }
                },
                isArray: true
            },
            save: {
                method: 'POST',
                params: { name: "" },
                isArray: false
            },
            update: {
                method: 'PUT'
            }
        }
    };
}])
.provider('Entity', function EntityProvider() {
    var config = this.config = {};
    this.$get = ['$resource', 'ResourceSvcConfiguration', function ($resource, ResourceSvcConfiguration) {
		var cfg = angular.copy(ResourceSvcConfiguration.cfg);
		cfg = angular.merge(cfg, config);
        return $resource(config.apiEndpoint + '/:name', { name: '@name' }, cfg);
    }];
})