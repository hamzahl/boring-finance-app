import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDepositForecast, isLondonPostcode } from '../src/features/house-savings/domain/deposit-forecast.js';

const today = new Date('2026-11-05T12:00:00');
const values = { goal: 0, starling: 1000, savings: 0, htb: 0, lisa: 0 };
const target = { propertyPrice: 200000, depositPercentage: 10, postcode: 'SE1 1AA', schedules: {} };

test('recognises a London postcode', () => assert.equal(isLondonPostcode('SE1 1AA'), true));
test('estimates a date from scheduled savings', () => {
  const result = calculateDepositForecast(values, { ...target, schedules: { starling: { amount: 1000, cadence: 'monthly', nextDate: '2026-12-05' } } }, today);
  assert.equal(result.status, 'ready');
  assert.equal(result.target, 20000);
});
test('delays LISA readiness for the twelve month holding period', () => {
  const result = calculateDepositForecast({ ...values, lisa: 20000 }, { ...target, propertyPrice: 200000, depositPercentage: 5, lisaFirstPaymentDate: '2026-06-01' }, today);
  assert.equal(result.date, '2027-06-01');
});
test('credits an eligible LISA bonus six weeks after the contribution', () => {
  const result = calculateDepositForecast({ ...values, lisa: 9000 }, { ...target, propertyPrice: 200000, depositPercentage: 6.125, lisaFirstPaymentDate: '2025-01-01', schedules: { lisa: { amount: 1000, cadence: 'monthly', nextDate: '2026-11-06' } } }, today);
  assert.equal(result.date, '2026-12-18');
  assert.equal(result.lisaBonus, 250);
});
test('applies the LISA withdrawal charge above the property limit', () => {
  const result = calculateDepositForecast({ ...values, lisa: 10000 }, { ...target, propertyPrice: 500000, depositPercentage: 1, lisaFirstPaymentDate: '2025-01-01' }, today);
  assert.equal(result.status, 'ready');
  assert.equal(result.withdrawalCharge, 2000);
});
test('spreads the LISA £4k tax-year plan across monthly bonus eligibility', () => {
  const result = calculateDepositForecast({ ...values, lisa: 0 }, { ...target, propertyPrice: 200000, depositPercentage: 1, schedules: { lisa: { amount: 4000, cadence: 'annual-4000', nextDate: '2026-11-06' } } }, today);
  assert.equal(result.status, 'ready');
  assert.ok(result.lisaBonus > 0);
  assert.equal(result.htbBonus, 0);
});
test('reports an unreachable plan', () => assert.equal(calculateDepositForecast(values, target, today).status, 'unreachable'));
