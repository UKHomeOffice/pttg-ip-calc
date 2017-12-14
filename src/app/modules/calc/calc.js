/* global angular moment _ */

var calcModule = angular.module('hod.calc', [])
var fmt = 'YYYY-MM-DD'

// var padLen = function (str, len) {
//   while (str.length < len) {
//     str += ' '
//   }
//   return str
// }

calcModule.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  // define a route for the question re student type
  $stateProvider.state({
    name: 'calcSimple',
    url: '/',
    title: 'calc',
    parent: 'default',
    views: {
      'content@': {
        templateUrl: 'modules/calc/templates/calc.html',
        controller: 'CalcCtrl'
      }
    }
  })
}])

calcModule.controller('CalcCtrl', ['$scope', '$state', '$document', 'CalcService', function ($scope, $state, $document, CalcService) {
  $scope.threshold = CalcService.getThreshold(0)
  $scope.controls = {
    date: null,
    amount: null,
    employer: null,
    dependants: 0
  }
  $scope.applicationRaisedDateDisplay = '2017-12-10'
  $scope.days = CalcService.getDays($scope.applicationRaisedDateDisplay)
  $scope.employers = ['Apple', 'Banana', 'Orange', 'Pear']

  $scope.clicked = function (m, e) {
    var sel = m.selected
    if (!e.shiftKey) {
      _.each($scope.days, function (mon) {
        mon.applicant.selected = false
        mon.partner.selected = false
      })
    }
    m.selected = !sel
    $scope.updateControls()
  }

  $scope.updateControls = function () {
    var selected = CalcService.findSelected($scope.days)
    var first = _.first(selected)
    if (first) {
      $scope.controls.date = first.date.date()
      $scope.controls.amount = first.amount
      $scope.controls.employer = first.employer
    }
  }

  $scope.selectAll = function (what, onOff) {
    // console.log('selectAll', what, onOff)
    _.each($scope.days, function (m) {
      if (what === 'applicants') {
        m.applicant.selected = onOff
      }
      if (what === 'partners') {
        m.partner.selected = onOff
      }
    })
    $scope.updateControls()
    $scope.$applyAsync()
  }

  $scope.updateSummary = function () {
    $scope.focus = null
    $scope.summary = CalcService.getSummary($scope.days)
    $scope.summaryTable = []
    $scope.summaryTable.push({
      category: 'A',
      ref: 'a',
      label: 'Applicant\'s income in first 6 months meets or exceeds the threshold with single employer',
      result: (CalcService.categoryASolo($scope.summary, $scope.controls.dependants))
    })

    $scope.focusOn = function (what) {
      $scope.focus = what
      $scope.$applyAsync()
    }

    $scope.summaryTable.push({
      category: 'A',
      ref: 'ac',
      label: 'Combined income in first 6 months meets or exceeds the threshold with single employer each',
      result: (CalcService.categoryACombined($scope.summary, $scope.controls.dependants))
    })

    $scope.summaryTable.push({
      category: 'B',
      ref: 'b',
      label: 'Applicant\'s income in 12 month period meets or exceeds the threshold with multiple employers',
      result: (CalcService.categoryBSolo($scope.summary, $scope.controls.dependants))
    })

    $scope.summaryTable.push({
      category: 'B',
      ref: 'bc',
      label: 'Combined income in 12 month period meets or exceeds the threshold with multiple employers',
      result: (CalcService.categoryBCombined($scope.summary, $scope.controls.dependants))
    })
  }

  $scope.controlsChanged = function (what) {
    var selected = CalcService.findSelected($scope.days)

    _.each(selected, function (s) {
      switch (what) {
        case 'day':
          var endOfMonth = s.date.clone().endOf('month').date()
          var d = Number($scope.controls.date)
          if (d >= 1) {
            s.date.date(Math.min(d, endOfMonth))
          }
          break

        case 'amount':
          s.amount = Number($scope.controls.amount)
          break

        case 'employer':
          s.employer = $scope.controls.employer
          break
      }
    })

    $scope.updateSummary()
  }

  $scope.dependantsChanged = function () {
    $scope.threshold = CalcService.getThreshold($scope.controls.dependants)
    $scope.updateSummary()
  }

  $scope.updateControls()
  $scope.updateSummary()
}])

calcModule.directive('plusMinus', [function () {
  return {
    restrict: 'E',
    scope: {
      value: '='
    },
    templateUrl: 'modules/calc/templates/plusminus.html',
    compile: function (element, attrs) {
      if (!attrs.inc) {
        attrs.inc = 1
      }
      attrs.inc = Number(attrs.inc)
      return function ($scope, element, attrs, formCtrl) {
        $scope.changed = function (dir) {
          if (attrs.type === 'date') {
            var firstInMonth = $scope.value.clone().startOf('month')
            var lastOfMonth = $scope.value.clone().endOf('month')
            var newValue
            if (dir > 0) {
              newValue = $scope.value.clone().add(Math.abs(dir), 'day')
            } else {
              newValue = $scope.value.clone().subtract(Math.abs(dir), 'day')
            }

            if (newValue.isBetween(firstInMonth, lastOfMonth, 'day', '[]')) {
              $scope.value = newValue
            }
          } else {
            $scope.value = Math.max(0, Number($scope.value) + (dir * attrs.inc))
          }
        }
      }
    }
  }
}])
