import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import parsedBrazilianReceipt from './output_example'
import parsedItalianReceipt from './output_example2'
import { getTotal } from '../src/utils'
import { CreateCompletionRequest } from 'openai/dist/api'

jest.mock('openai', () => {
  return {
    Configuration: jest.fn(),
    OpenAIApi: jest.fn().mockImplementation(() => {
      return {
        createCompletion: jest.fn().mockImplementation((options: unknown) => {
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

describe('#getTotal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when receiving a parsed italian receipt', () => {
    test('correctly returns the total amount', async () => {
      expect(await getTotal(parsedItalianReceipt)).toBe('R$ 12,03')
    })
  })

  describe('when receiving a parsed brazilian receipt', () => {
    test('correctly returns the total amount', async () => {
      expect(await getTotal(parsedBrazilianReceipt)).toBe('R$ 439,97')
    })
  })
})
