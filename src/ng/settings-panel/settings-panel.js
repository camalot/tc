/**
 * Displays the application's options pages
 *
 * @ngdoc directive
 * @restrict E
 */
angular.module('tc').directive('settingsPanel', function(settings) {
	function link(scope, element) {
		element.attr('layout', 'row');
		scope.m = {selected: 0};
		scope.settings = settings;
		scope.items = [
			{name: 'Highlights', html: '<highlights-options></highlights-options>'},
			{name: 'Notifications', html: '<notification-options></notification-options>'},
			{name: 'Chat', html: '<chat-options></chat-options>'}
		];
	}

	return {
		restrict: 'E',
		templateUrl: 'ng/settings-panel/settings-panel.html',
		link: link
	}
});