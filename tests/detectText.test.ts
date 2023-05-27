import { jest, describe, expect, test } from '@jest/globals'
import mockBrazilianAdidasGoogleVision from './google_vision_mock1'
import mockItalianGoogleVision from './google_vision_mock2'
import { detectText } from '../src/utils'
import { CreateCompletionRequest } from 'openai'

const brazilianAdidasReceipt = './receipts/brazilian-adidas-receipt.jpg'
const italianReceipt = '..../receipts/italian_receipt.jpg'

jest.mock('@google-cloud/vision', () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => {
      return {
        textDetection: jest.fn().mockImplementation(async (receiptName) => {
          switch (receiptName) {
            case brazilianAdidasReceipt:
              return mockBrazilianAdidasGoogleVision
            case italianReceipt:
              return mockItalianGoogleVision
            default:
              return []
          }
        })
      }
    })
  }
})

jest.mock('openai', () => {
  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createCompletion: jest.fn().mockImplementation((options) => {
          const request = options as CreateCompletionRequest
          if (request.prompt?.includes('SUPERMERCATO U2')) {
            return {
              data: {
                choices: [{
                  text: 'R$ 12,03'
                }]
              }
            }
          }
          if (request.prompt?.includes('adidas')) {
            return {
              data: {
                choices: [{
                  text: 'R$ 439,97'
                }]
              }
            }
          }
          return {
            data: {
              choices: [{
                text: 'R$ NOT FOUND'
              }]
            }
          }
        })
      }
    })
  }
})

describe('#detectText', () => {
  describe('when you provide a brazilian receipt', () => {
    test('outputs the parsed data', async () => {
      expect(await detectText(brazilianAdidasReceipt)).toBe('R$ 439,97')
    })
  })

  describe('when you provide an italian receipt', () => {
    test('outputs the correct data', async () => {
      expect(await detectText(italianReceipt)).toBe('R$ 12,03')
    })
  })
})
