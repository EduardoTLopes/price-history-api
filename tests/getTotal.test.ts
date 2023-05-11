import { describe, expect, test } from '@jest/globals';

import parsedBrazilianReceipt from './output_example';
import parsedItalianReceipt from './output_example2';
import { getTotal } from '../src/utils';



describe('#getTotal', () => {
  describe('when receiving a parsed italian receipt', () => {
    test('correctly returns the total amount', async () => {

      expect(await getTotal(parsedItalianReceipt)).toEqual(12.03);
    });
  });
  describe('when receiving a parsed brazilian receipt', () => {
    test('correctly returns the total amount', async () => {

      expect(await getTotal(parsedBrazilianReceipt)).toEqual(439.97);
    });
  });
})
