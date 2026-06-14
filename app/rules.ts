export let currentRules =
  'あなたは「くるいどり会話」のAIです。';

export const setRules = (newRules: string) => {
  currentRules = newRules;
};