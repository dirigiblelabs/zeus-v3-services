angular.module('page', ['ideUiCore', 'ngRs', 'ui.bootstrap'])
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
	                this.data = data;
	            }.bind(this))
	            .catch(function (err) {
	               if (err.data){
		            	console.error(err.data);
		            }
		            console.error(err);
	            });
    };

    this.formatHosts = function(hosts){
        return hosts.join(',');
    };

    this.formatPorts = function(ports){
        return ports.map(function(port){
            return port.protocol + ":" + port.number;
        })
        .join(',');
    };

    this.openNewDialog = function (entity) {
        this.actionType = entity?'update':'new';
        this.entity = entity || {
            hosts: [],
            ports: []
        };
        this.port = {};
        this.host;
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
        this.port = {};
        this.host = "";
        let args = [this.entity];
        if(action === 'update'){
            args.unshift({name: this.entity.name});
        }
		return Entity[action].apply(this, args).$promise
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

    this.addHost = function(){
        if(this.host){
            this.entity.hosts.push(this.host);
        }
        this.host = "";        
    };

    this.removeHost = function(host){
       this.entity.hosts = this.entity.hosts.filter((item) => item !== host);
    };

    this.addPort =  function(){
        this.entity.ports.push({
            "protocol": this.port.protocol.toUpperCase(),
            "number": this.port.number,
        });
        this.port.protocol = "";
        delete this.port.number;
    };

    this.removePort =  function(port){
        this.entity.ports = this.entity.ports.filter((item) => {
           item.protocol !== port.protocol && item.number!== port.number
       });
    };

    this.canSubmit = function(){
        return this.entity && this.entity.name && this.entity.hosts.length && this.entity.ports.length;
    };

    $messageHub.onEntityRefresh(this.loadPage);

    var toggleEntityModal = function() {
        $('#entityModal').modal('toggle');//FIXME: dom control from angular controller - not good. use directive or a module that does that.
        this.errors = '';
    }.bind(this);
    
    this.loadPage(this.dataPage);
}]);