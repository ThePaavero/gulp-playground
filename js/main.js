(function() {
	var App = require('./app/app');
	var ConsolePolyfill = require('./consolePolyfill');

	$(function() {
		var app = new App();
		app.init();

		window.globalAppInstance = app;
	});
}());
