/*
 * Copyright (c) 2017 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 * Contributors:
 * SAP - initial API and implementation
 */

// TODO
// var k8s = require('zeus-services/k8s');
// var api = new k8s();

exports.getTile = function(relativePath) {
	return {
		'name': 'Backing Services',
		'group': 'Explore',
		'icon': 'th-large',
		'location': relativePath + 'services/v3/web/zeus-applications/ui/Explore/index.html',
		// 'count':  api.listBindings().length,
		'order': '100'
	};
};