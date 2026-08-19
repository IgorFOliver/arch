import { createMembershipSchema, updateMembershipSchema } from './schema';

const createMessages = {
  emailInvalid: 'Invalid email address.',
};

describe('createMembershipSchema', () => {
  const schema = createMembershipSchema(createMessages);

  it('accepts a valid payload', () => {
    const result = schema.safeParse({
      email: 'bob@example.com',
      role: 'USER',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email with the given message', () => {
    const result = schema.safeParse({ email: 'not-an-email', role: 'USER' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.emailInvalid);
  });

  it('rejects a role outside of the known set', () => {
    const result = schema.safeParse({
      email: 'bob@example.com',
      role: 'NOT_A_ROLE',
    });

    expect(result.success).toBe(false);
  });
});

describe('updateMembershipSchema', () => {
  const schema = updateMembershipSchema();

  it('accepts a valid payload', () => {
    const result = schema.safeParse({ role: 'ADMIN' });

    expect(result.success).toBe(true);
  });

  it('rejects a role outside of the known set', () => {
    const result = schema.safeParse({ role: 'NOT_A_ROLE' });

    expect(result.success).toBe(false);
  });
});
