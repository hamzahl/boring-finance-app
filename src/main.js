import './styles.css';
import { startApplication } from './app/start-application.js';
import { createHouseSavingsFeature } from './features/house-savings/index.js';

startApplication({ features: [createHouseSavingsFeature()] });
