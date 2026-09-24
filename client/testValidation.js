import { validateNwisData } from './src/services/dataValidationService.js';
const result = validateNwisData();
console.log(JSON.stringify(result, null, 2));
