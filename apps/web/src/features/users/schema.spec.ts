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
      role: 'USER',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({
      name: '',
      email: 'ada@example.com',
      password: 'a-strong-password',
      role: 'USER',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.nameRequired);
  });

  it('rejects an invalid email with the given message', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'not-an-email',
      password: 'a-strong-password',
      role: 'USER',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.emailInvalid);
  });

  it('rejects a password shorter than 8 characters with the given message', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'short',
      role: 'USER',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.passwordMin);
  });

  it('rejects a role outside of the known set', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'a-strong-password',
      role: 'NOT_A_ROLE',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateUserSchema', () => {
  const schema = updateUserSchema(updateMessages);

  it('accepts a valid payload without requiring a password', () => {
    const result = schema.safeParse({
      name: 'Ada Lovelace',
      role: 'ADMIN',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({ name: '', role: 'ADMIN' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(updateMessages.nameRequired);
  });
});
