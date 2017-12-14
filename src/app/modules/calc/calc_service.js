/* global angular _ moment */

var calcModule = angular.module('hod.calc')
var fmt = 'YYYY-MM-DD'

calcModule.factory('CalcService', ['IOService', function (IOService) {
  var me = this

  this.baseThreshold = 18600
  this.firstDependant = 3800
  this.moreDependants = 2400

  this.getThreshold = function (nDependants) {
    var t = me.baseThreshold
    if (nDependants === 1) {
      return t + me.firstDependant
    } else if (nDependants > 1) {
      return t + me.firstDependant + ((nDependants - 1) * me.moreDependants)
    }
    return t
  }

  this.getDays = function (dateStr) {
    var endDate = moment(dateStr, fmt)
    // var startDate = endDate.clone().subtract(13, 'month')
    var days = []
    for (var i = 0; i <= 13; i++) {
      var m = endDate.clone().subtract(i, 'month').startOf('month')
      days.push({
        applicant: {
          cat: (i <= 5) ? 'A' : (i <= 11) ? 'B' : '',
          employer: 'Apple',
          amount: 1550,
          date: m.clone()
        },
        partner: {
          cat: (i <= 5) ? 'A' : (i <= 11) ? 'B' : '',
          employer: 'Apple',
          amount: 1550,
          date: m.clone()
        }
      })
    }

    return days
  }

  this.findSelected = function (months) {
    return me.findSelectedApplicants(months).concat(me.findSelectedPartners(months))
  }

  this.findSelectedApplicants = function (months) {
    var selected = []
    _.each(months, function (m) {
      if (m.applicant.selected) {
        selected.push(m.applicant)
      }
    })
    return selected
  }

  this.findSelectedPartners = function (months) {
    var selected = []
    _.each(months, function (m) {
      if (m.partner.selected) {
        selected.push(m.partner)
      }
    })
    return selected
  }

  this.getSummary = function (months) {
    var summary = {
      applicant: {
        recent: {
          amount: 0,
          employers: []
        },
        later: {
          amount: 0,
          employers: []
        }
      },
      partner: {
        recent: {
          amount: 0,
          employers: []
        },
        later: {
          amount: 0,
          employers: []
        }
      }
    }
    _.each(months, function (m, i) {
      if (i >= 12) return
      if (m.applicant.amount) {
        var alias = (i <= 5) ? summary.applicant.recent : summary.applicant.later
        alias.amount += m.applicant.amount
        alias.employers.push(m.applicant.employer)
      }

      if (m.partner.amount) {
        alias = (i <= 5) ? summary.partner.recent : summary.partner.later
        alias.amount += m.partner.amount
        alias.employers.push(m.partner.employer)
      }
    })

    summary.applicant.recent.employers = _.uniq(summary.applicant.recent.employers)
    summary.applicant.later.employers = _.uniq(summary.applicant.later.employers)
    summary.partner.recent.employers = _.uniq(summary.partner.recent.employers)
    summary.partner.later.employers = _.uniq(summary.partner.later.employers)

    return summary
  }

  this.categoryASolo = function (summary, nDependants) {
    var t = me.getThreshold(nDependants)
    var thresholdMet = (summary.applicant.recent.amount >= (t / 2))
    var singleEmployer = (summary.applicant.recent.employers.length === 1)
    return thresholdMet && singleEmployer
  }

  this.categoryACombined = function (summary, nDependants) {
    var t = me.getThreshold(nDependants)
    var thresholdMet = (summary.applicant.recent.amount + summary.partner.recent.amount >= (t / 2))
    var singleEmployer = (summary.applicant.recent.employers.length === 1 && summary.partner.recent.employers.length === 1)
    return thresholdMet && singleEmployer
  }

  this.categoryBSolo = function (summary, nDependants) {
    var t = me.getThreshold(nDependants)
    // var thresholdMet1 = (summary.applicant.recent.amount >= (t / 2))
    var thresholdMet2 = (summary.applicant.recent.amount + summary.applicant.later.amount >= t)
    return thresholdMet2
  }

  this.categoryBCombined = function (summary, nDependants) {
    var t = me.getThreshold(nDependants)
    // var thresholdMet1 = (summary.applicant.recent.amount + summary.partner.recent.amount >= (t / 2))
    var thresholdMet2 = (
      summary.applicant.recent.amount +
      summary.applicant.later.amount +
      summary.partner.recent.amount +
      summary.partner.later.amount >=
      t)
    return thresholdMet2
  }

  return this
}])
