var bindingsecrets = require('zeus-applications-java/messages/bindingsecrets');
var ServiceEntries = require("kubernetes/apis/networking.istio.io/v1alpha3/ServiceEntries");
var Credentials = require("zeus-deployer/utils/Credentials");

function api(){
    let credentials = Credentials.getDefaultCredentials();
	this.serviceEntries = new ServiceEntries(credentials.server, credentials.token, "zeus");
}
api.prototype = api.prototype;
api.prototype.listServices = function(queryOptions){
    return this.serviceEntries.listAll(queryOptions);
}
api.prototype.getService = function(serviceName){
    return this.serviceEntries.get(serviceName);
}
api.prototype.createService = function(entity){
    return this.serviceEntries.create(entity);
}
api.prototype.updateService = function(name, entity){
    return this.serviceEntries.update(name, entity);
}
api.prototype.deleteService = function(name){
    return this.serviceEntries.delete(name);
}
api.prototype.listBindings = function(){
    return bindingsecrets.listBindingSecrets();
}

module.exports = api;
