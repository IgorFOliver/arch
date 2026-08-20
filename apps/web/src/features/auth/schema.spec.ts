import {
  createForgotPasswordSchema,
  createResetPasswordSchema,
} from './schema';

describe('createForgotPasswordSchema', () => {
  const messages = { emailInvalid: 'Invalid email address.' };
  const schema = createForgotPasswordSchema(messages);

  it('accepts a valid email', () => {
    expect(schema.safeParse({ email: 'ada@example.com' }).success).toBe(true);
  });

  it('rejects an invalid email with the given message', () => {
    const result = schema.safeParse({ email: 'not-an-email' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(messages.emailInvalid);
  });
});

describe('createResetPasswordSchema', () => {
  const messages = {
    passwordMin: 'Password must be at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
  };
  const schema = createResetPasswordSchema(messages);

  it('accepts matching passwords of sufficient length', () => {
    const result = schema.safeParse({
      password: 'a-strong-password',
      confirmPassword: 'a-strong-password',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = schema.safeParse({
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (issue) => issue.message === messages.passwordMin,
      ),
    ).toBe(true);
  });

  it('rejects mismatched passwords, attributing the error to confirmPassword', () => {
    const result = schema.safeParse({
      password: 'a-strong-password',
      confirmPassword: 'a-different-password',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(messages.passwordMismatch);
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
