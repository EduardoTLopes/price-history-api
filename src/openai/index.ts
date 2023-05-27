import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY ?? ''
})
const openai = new OpenAIApi(configuration)

export async function readReceipt (data: unknown) {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `based on this JSON: ${JSON.stringify(data)} return the total value of the receipt in the following format: R$ 10,00. The response should contain only the currency and the value.`,
    temperature: 0,
    max_tokens: 10
  })
  return completion
}
