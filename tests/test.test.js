const {describe, expect, test} = require('@jest/globals');
const mockGoogleVision = require('./google_vision_mock1')
const mockGoogleVision = require('./google_vision_mock2')
const mockGoogleVision = require('./google_vision_mock3')
const expectedOutput = require('./output_example1')
const expectedOutput = require('./output_example2')
const expectedOutput = require('./output_example3')

jest.mock("@google-cloud/vision", () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => {
      return {
        textDetection: jest.fn().mockResolvedValueOnce(mockGoogleVision),
        // Add any other methods or properties you want to mock here
      };
    })
  };
});

const utils = require("../utils");

describe('#detectText', () => {
  describe('when you provide a brazilian receipt',() => {
    test('outputs the parsed data', async () => {
      expect(await utils.detectText()).toEqual(expectedOutput);
    });
  });

  describe('when you provide an italian receipt',() => {

    test('outputs the correct data ', async () => {
      expect(await utils.detectText()).toEqual(expectedOutput);
    });
  })
});

