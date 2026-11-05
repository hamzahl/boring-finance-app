import { createHouseSavingsController } from './application/house-savings-controller.js';
import { createHouseSavingsRepository } from './infrastructure/house-savings-repository.js';
import { createHouseSavingsView } from './presentation/house-savings-view.js';
export function createHouseSavingsFeature() {
  const view = createHouseSavingsView();
  const controller = createHouseSavingsController({ repository: createHouseSavingsRepository(), view });
  view.onInput(() => controller.preview());
  view.onSave((event) => { event.preventDefault(); controller.save().catch((error) => view.setStatus(error.message)); });
  return controller;
}
