var k8s = require('zeus-services/k8s');
var response = require('http/v4/response');

var api = new k8s();
var data = api.listServices();
response.println(JSON.stringify(data,null,2));
console.info(JSON.stringify(data,null,2));
