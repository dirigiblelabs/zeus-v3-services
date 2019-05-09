var logging = require('log/v4/logging');
var logger = logging.getLogger('org.eclipse.dirigible.zeus.services');
var rs = require('http/v4/rs');
var k8s = require('zeus-services/k8s');
var apierrors = require("kubernetes/errors");
var ServiceEntries = require("kubernetes/apis/networking.istio.io/v1alpha3/ServiceEntries");
var Credentials = require("zeus-deployer/utils/Credentials");

var serviceEntries = function(){
    let credentials = Credentials.getDefaultCredentials();
	return new ServiceEntries(credentials.server, credentials.token, "zeus");
};

function fromResource(resource){
    let _e = {
        name: resource.metadata.name,
        createTime: resource.metadata.creationTimestamp,
        hosts: resource.spec.hosts,
        ports: resource.spec.ports
    };
    return _e;
}

function toResource(entity){
   let _e = {
        "apiVersion": "networking.istio.io/v1alpha3",
        "kind": "ServiceEntry",
        "metadata": {
            "name": entity.name,
            "namespace": "zeus",
        },
        "spec": {
            "location": "MESH_EXTERNAL",
            "resolution": "DNS",
            "hosts": entity.hosts,
            "ports": entity.ports
        }     
    };
    return _e;
}

function sendError(err, response){
    logger.error(err);
    if (err instanceof apierrors.FieldValueInvalidError){
        response.status = 422;
        response.println(JSON.stringify({
            reason: "Invalid",
            message: err.message
        }, null, 2));
        return;
    }
    if (err instanceof apierrors.NotFoundError){
        response.status = 404;
        response.println(JSON.stringify({
            reason: "NotFound"
        }, null, 2));
        return;
    }
    response.status = 500;
    response.println(JSON.stringify({
            reason: "InternalServerError",
            message: err.message
        }, null, 2));
}

rs.service()
	.resource('')
		.get(function(ctx, request, response) {
			let queryOptions = {};
			let parameters = request.getParameterNames();
			for (var i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
            let entities = [];
            let api = serviceEntries();
            try{
			    entities = api.list(queryOptions).map(fromResource);
                response.println(JSON.stringify(entities,null,2));
            } catch (err){
                sendError(err, response);
            }
            response.setHeader('X-data-count', entities.length);
		})
        .produces("application/json")
	.resource('count')
		.get(function(ctx, request) {
			let queryOptions = {};
			let parameters = request.getParameterNames();
			for (var i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
            let api = serviceEntries();
            try{
            	let entities = api.list(queryOptions);
                response.println(JSON.stringify({
                    "count": entities.legnth
                }, null, 2));   
            } catch (err){
                sendError(err, response);
            }
		})
        .produces("application/json")
	.resource('{name}')
		.get(function(ctx, request, response) {
			var name = ctx.pathParameters.name;
            let api = serviceEntries();
            try{
                let entity = api.get(name);
                let payloadObj = fromResource(entity);
                let payload = JSON.stringify(payloadObj,null,2);
                response.println(payload);
            } catch (err){
                 sendError(err, response);
            }
		})
        .produces("application/json")
	.resource('')
		.post(function(ctx, request, response) {
			let entity = request.getJSON();
            let resource = toResource(entity);
            let api = serviceEntries();
            try{
                api.apply(resource);
                response.setHeader('Content-Location', '/services/v3/js/zeus-services/api/services.js/' + resource.metadata.name);
                response.status = 201;
            } catch(err){
               sendError(err, response);
            }
		})
        .consumes("application/json")
	.resource('{name}')
		.put(function(ctx, request, response) {
            //let name = ctx.pathParameters.name;
			let entity = request.getJSON();
            let resource = toResource(entity);
            let api = serviceEntries();
             try{
                api.apply(resource);
                response.status = 201;
            } catch(err){
                sendError(err, response);
            }
		})
        .consumes("application/json")
	.resource('{name}')
		.delete(function(ctx, request, response) {
			let name = ctx.pathParameters.name;
            response.setStatus(204);
            let api = serviceEntries();
            try{
                api.delete(name);
            } catch (err){
                sendError(err, response);
            }
		})
.execute();