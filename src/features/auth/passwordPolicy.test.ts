import { isPasswordValid, passwordStrength } from './passwordPolicy';

describe('política de senha', () => {
  it.each([
    ['Senha-forte-123!', true],
    ['Aa1!aaaa', true],
    ['curta1A!', true],
    ['Aa1!', false],
    ['semmaiuscula1!', false],
    ['SemNumero!!', false],
    ['SemSimbolo123', false],
    [`A1!${'a'.repeat(70)}`, false],
  ])('%s → %s', (password, valid) => {
    expect(isPasswordValid(password)).toBe(valid);
  });

  it('mede a força pelo número de regras atendidas', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('a')).toBe(0);
    expect(passwordStrength('A')).toBe(1);
    expect(passwordStrength('Aa1')).toBe(2);
    expect(passwordStrength('Senha-forte-123!')).toBe(4);
  });
});
