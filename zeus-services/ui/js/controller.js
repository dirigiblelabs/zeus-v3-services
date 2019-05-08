angular.module('page', ['ideUiCore', 'ngRsData', 'ui.bootstrap'])
.config(["messageHubProvider", function(messageHubProvider) {
	messageHubProvider.evtNamePrefix = 'zeus.Explore.Services';
}])    
.factory('$messageHub', ['messageHub', function (messageHub) {
    return {
        onEntityRefresh: function (callback) {
            messageHub.on('refresh', callback);
        },
        messageEntityModified: function () {
            messageHub.send('modified');
        }
    };
}])
.config(["EntityProvider", function(entityProvider) {
  entityProvider.config.apiEndpoint = '../../../../../../../../services/v3/js/zeus-services/api/services.js';
}])
.controller('PageController', ['Entity', '$messageHub', function (Entity, $messageHub) {

    this.dataPage = 1;
    this.dataCount = 0;
    this.dataOffset = 0;
    this.dataLimit = 10;

	this.getPages = function () {
        return new Array(this.dataPages);
    };

    this.nextPage = function () {
        if (this.dataPage < this.dataPages) {
            this.loadPage(this.dataPage + 1);
        }
    };

    this.previousPage = function () {
        if (this.dataPage > 1) {
            this.loadPage(this.dataPage - 1);
        }
    };

    this.loadPage = function () {
        return Entity.query({
		            $limit: this.dataLimit,
		            $offset: (this.dataPage - 1) * this.dataLimit
		        }).$promise
		        .then(function (data) {
	                this.dataCount = data.$count;
	                this.dataPages = Math.ceil(this.dataCount / this.dataLimit);
	                this.data = data.map(function(entity){
                        entity.host = entity.hosts;
                        entity.portProto = entity.ports.split(":")[0];
                        entity.portNumber = entity.ports.split(":")[1];
                        return entity;
                    });
	            }.bind(this))
	            .catch(function (err) {
	               if (err.data){
		            	console.error(err.data);
		            }
		            console.error(err);
	            });
    };

    this.openNewDialog = function (entity) {
        this.actionType = entity?'update':'new';
        this.entity = entity || {};
        toggleEntityModal();
    };

    this.openDeleteDialog = function (entity) { 
        this.actionType = 'delete';
        this.entity = entity;
        toggleEntityModal();
    };

    this.close = function () {
//        this.loadPage(this.dataPage);
		delete this.entity;
        toggleEntityModal();
    };
	
	var entityAction = function(action){
        if (entity.portNumber && entity.portProto){
            entity.ports = [{
                name: entity.portProto.toLowerCase(),
                "number": entity.portNumber,
                "protocol": entity.portProto
            }]
            if (entity.host){
                entity.hosts = [entity.host];
            }
        }
		return Entity[action]({id: this.entity.id}, this.entity).$promise
			 	.then(function () {
		            this.loadPage(this.dataPage);
		            $messageHub.messageEntityModified();
		            toggleEntityModal();
		        }.bind(this))
		        .catch(function (err) {
		        	if (err.data && err.data.details){
		            	console.error(err.data.details);
		            }
		            console.error(err);
		        });
	}.bind(this);

    this.create = function () {
		return entityAction('save');
    };

    this.update = function () {
    	return entityAction('update');
    };

    this.delete = function () {
    	return entityAction('delete');
    };
    
    this.parseDate = function(dateString){
    	return Date.parse(dateString);
    };
    
    $messageHub.onEntityRefresh(this.loadPage);

    var toggleEntityModal = function() {
        $('#entityModal').modal('toggle');//FIXME: dom control from angular controller - not good. use directive or a module that does that.
        this.errors = '';
    }.bind(this);
    
    this.loadPage(this.dataPage);
}]);