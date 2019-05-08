var rs = require('http/v4/rs');
var k8s = require('zeus-services/k8s');

rs.service()
	.resource('')
		.get(function(ctx, request, response) {
			var queryOptions = {};
			var parameters = request.getParameterNames();
			for (var i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
            let entities = [];
            let api = new k8s();
            try{
			    entities = api.listServices(queryOptions).map(function(entity){
                    return {
                        name: entity.metadata.name,
                        hosts: entity.spec.hosts.join(","),
                        ports: entity.spec.ports.map(function(port){
                            return port.protocol+":"+port.number;
                        }).join(",")
                    }
                });
                response.println(JSON.stringify(entities,null,2));
            } catch (err){
                response.setStatus(500);
                response.println('Internal server error: '+ err);
            }
            response.setHeader('X-data-count', entities.length);
		})
        .produces("application/json")
	.resource('count')
		.get(function(ctx, request) {
			var queryOptions = {};
			var parameters = request.getParameterNames();
			for (var i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
            let api = new k8s();
			var entities = api.listServices(queryOptions);
            response.println(JSON.stringify({
                "count": entities.legnth
            }, null, 2));
		})
        .produces("application/json")
	.resource('{id}')
		.get(function(ctx, request, response) {
			var id = ctx.pathParameters.id;
            try{
                let api = new k8s();
                let entity = api.getService(id);
                response.println(JSON.stringify(entity,null,2));
            } catch (err){
                response.status = 500;
                if (err instanceof k8s.serviceEntries.NotFoundError){
                    response.status = 404;
                    response.println("Not found");
                }
                response.println("Internal server error: "+ err);
            }
		})
        .produces("application/json")
	.resource('')
		.post(function(ctx, request, response) {
			var entity = request.getJSON();
            let api = new k8s();
			entity = api.create(entity);
			response.setHeader('Content-Location', '/services/v3/js/zeus-services/api/services.js/' + entity.metadata.name);
			response.status = 201;
		})
        .consumes("application/json")
	.resource('{id}')
		.put(function(ctx, request, response) {
            var id = ctx.pathParameters.id;
			var entity = request.getJSON();
            let api = new k8s();
			api.update(id, entity);
		})
        .consumes("application/json")
	.resource('{id}')
		.delete(function(ctx, request, response) {
			var id = ctx.pathParameters.id;
            response.setStatus(204);
            try{
                let api = new k8s();
                api.delete(id);
            } catch (err){
                 response.status = 500;
                if (err instanceof k8s.serviceEntries.NotFoundError){
                    response.status = 404;
                    response.println("Not found");
                }
                response.println("Internal server error: "+ err);
            }
		})
.execute();