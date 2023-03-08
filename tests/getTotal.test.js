//@ts-check
const { describe, expect, test } = require('@jest/globals');

const parsedBrazilianReceipt = require('./output_example')
const parsedItalianReceipt = require('./output_example2')

const utils = require("../utils");


describe('#getTotal', () => {
  describe('when receiving a parsed italian receipt', () => {
    test('correctly returns the total amount', async () => {

      expect(await utils.getTotal(parsedItalianReceipt)).toEqual(12.03);
    });
  });
  describe('when receiving a parsed brazilian receipt', () => {
    test('correctly returns the total amount', async () => {

      expect(await utils.getTotal(parsedBrazilianReceipt)).toEqual(439.97);
    });
  });
})