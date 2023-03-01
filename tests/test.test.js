//@ts-check
const { describe, expect, test } = require('@jest/globals');
const mockBrazilianAdidasGoogleVision = require('./google_vision_mock1')
const mockItalianGoogleVision = require('./google_vision_mock2')
// const mockGoogleVision3 = require('./google_vision_mock3')
const expectedOutput = require('./output_example')
// const expectedOutput = require('./output_example2')
// const expectedOutput = require('./output_example3')
const utils = require("../utils");


const brazilianAdidasReceipt = './receipts/brazilian-adidas-receipt.jpg'
const italianReceipt = '..../receipts/italian_receipt.jpg'

jest.mock("@google-cloud/vision", () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => {
      return {
        textDetection: jest.fn().mockResolvedValue((receiptName) => {
          switch (receiptName) {
            case brazilianAdidasReceipt:
              return mockBrazilianAdidasGoogleVision
            case italianReceipt:
              return mockItalianGoogleVision
          }
        }),
      };
    })
  };
});


describe('#detectText', () => {
  describe('when you provide a brazilian receipt', () => {
    test('outputs the parsed data', async () => {

      expect(await utils.detectText(brazilianAdidasReceipt)).toEqual(expectedOutput);
    });
  });

  describe('when you provide an italian receipt', () => {

    test('outputs the correct data ', async () => {

      expect(await utils.detectText(italianReceipt)).toEqual(expectedOutput);
    });
  })
});

