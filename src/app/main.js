/* global angular moment */

var app = angular.module('hod.proving', [
  'ui.router',
  'ngAria',
  'hod.forms',
  'hod.calc',
  'hod.io'
])

app.constant('CONFIG', {
  api: ''// $('html').data('api')
})

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state({
    name: 'default',
    title: 'HOD',
    views: {
      'content': {
      }
    }
  })
}])

app.filter('ym', function () {
  return function (date) {
    return moment(date, 'YYYY-MM-DD').format('YYYY-MM')
  }
})

app.filter('ymd', function () {
  return function (date) {
    return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
  }
})
