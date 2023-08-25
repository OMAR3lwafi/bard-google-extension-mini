import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: 'Always', desc: 'GoogleBard is queried on every search' },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'GoogleBard is queried when you manually click a button',
  },
}

export enum Theme {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

export const BASE_URL = 'https://bard.google.com'
export const Prompt = 'Provide some insights on the following search query: '
export const followupQuestionsPrompt = () => {
  return `After that suggest 3-4 follow-up questions as bullet points output for the above search query(You must use the following template: ### Follow-up Questions:).`
};

export interface SitePrompt {
  site: string
  prompt: string
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
  prompt: Prompt,
  promptOverrides: [] as SitePrompt[],
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
  BARD = 'bard',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.BARD]: GPT3ProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.BARD } = await Browser.storage.local.get('provider')
  const configKey = `provider:${ProviderType.BARD}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.BARD]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT3}`]: configs[ProviderType.GPT3],
  })
}
