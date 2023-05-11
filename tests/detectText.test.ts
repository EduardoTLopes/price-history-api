import { jest, describe, expect, test } from '@jest/globals';
import mockBrazilianAdidasGoogleVision from './google_vision_mock1';
import mockItalianGoogleVision from './google_vision_mock2';

import expectedOutput from './output_example';
import expectedOutput2 from './output_example2';




const brazilianAdidasReceipt = './receipts/brazilian-adidas-receipt.jpg'
const italianReceipt = '..../receipts/italian_receipt.jpg'

jest.mock("@google-cloud/vision", () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => {
      return {
        textDetection: jest.fn().mockImplementation(async (receiptName): Promise<unknown[]> => {
          switch (receiptName) {
            case brazilianAdidasReceipt:
              return mockBrazilianAdidasGoogleVision
            case italianReceipt:
              return mockItalianGoogleVision
            default:
              return []
          }
        }),
      };
    })
  };
});

import { detectText } from '../src/utils';

describe('#detectText', () => {
  describe('when you provide a brazilian receipt', () => {
    test('outputs the parsed data', async () => {

      expect(await detectText(brazilianAdidasReceipt)).toEqual(expectedOutput);
    });
  });

  describe('when you provide an italian receipt', () => {

    test('outputs the correct data ', async () => {

      expect(await detectText(italianReceipt)).toEqual(expectedOutput2);
    });
  })
});

