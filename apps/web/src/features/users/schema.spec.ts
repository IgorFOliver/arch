import { createUserSchema, updateUserSchema } from './schema';

const createMessages = {
  nameRequired: 'Name is required.',
  emailInvalid: 'Enter a valid email.',
  passwordMin: 'Password must be at least 8 characters.',
};

const updateMessages = {
  nameRequired: 'Name is required.',
};

describe('createUserSchema', () => {
  const schema = createUserSchema(createMessages);

  it('accepts a valid payload', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-strong-password',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({
      name: '',
      email: 'ada@example.com',
      password: 'a-strong-password',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.nameRequired);
  });

  it('rejects an invalid email with the given message', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'not-an-email',
      password: 'a-strong-password',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.emailInvalid);
  });

  it('rejects a password shorter than 8 characters with the given message', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.passwordMin);
  });
});

describe('updateUserSchema', () => {
  const schema = updateUserSchema(updateMessages);

  it('accepts a valid payload', () => {
    const result = schema.safeParse({ name: 'Ada Lovelace' });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(updateMessages.nameRequired);
  });
});
