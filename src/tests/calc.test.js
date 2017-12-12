/* global describe it beforeEach inject _ expect moment */

describe('app: RPS simple calc', function () {
  beforeEach(module('hod.proving'))
  beforeEach(module('hod.calc'))

  describe('Calc', function () {
    var CS
    beforeEach(inject(function (CalcService) {
      CS = CalcService
    }))

    describe('getNew', function () {
      it('should return an object with basic settings', function () {
        var obj = CS.getNew()
        expect(typeof obj).toEqual('object')
        expect(_.has(obj, 'months')).toBeTruthy()
        expect(_.has(obj, 'applicationRaisedDate')).toBeTruthy()
        expect(_.has(obj, 'discretion')).toBeTruthy()
        expect(_.has(obj, 'offset')).toBeTruthy()
      })
    })

    describe('togglePayment', function () {
      var testObj = [
        { date: '2017-11-01', amount: '0.01' },
        { date: '2017-12-01', amount: '0.01' },
        { date: '2018-10-01', amount: '0.01' }
      ]

      it('should be able to add payments', function () {
        var payments = CS.togglePayment(testObj, '2018-01-01')
        expect(payments[2].date).toEqual('2018-01-01')
        expect(payments[2].amount).toEqual(0.01)
      })

      it('should be able to remove payments', function () {
        var payments = CS.togglePayment(testObj, '2017-11-01')
        expect(payments.length).toEqual(2)
      })
    })

    describe('partialPass', function () {
      var testObj = [{ date: '2015-01-15', amount: '0,01' }]
      it('should pass before the 2 year limit', function () {
        expect(CS.partialPass(testObj, '2017-01-14')).toBeTruthy()
        expect(CS.partialPass(testObj, '2016-01-14')).toBeTruthy()
        expect(CS.partialPass(testObj, '2015-12-12')).toBeTruthy()
      })
      it('should pass exactly 2 years from application raised date', function () {
        expect(CS.partialPass(testObj, '2017-01-15')).toBeTruthy()
      })
      it('should fail after the 2 year limit', function () {
        expect(CS.partialPass(testObj, '2017-01-16')).toBeFalsy()
        expect(CS.partialPass(testObj, '2018-01-14')).toBeFalsy()
        expect(CS.partialPass(testObj, '2017-02-14')).toBeFalsy()
      })
    })
  })
})
