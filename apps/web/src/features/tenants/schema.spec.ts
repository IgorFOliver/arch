import { createTenantSchema, updateTenantSchema } from './schema';

const createMessages = {
  nameRequired: 'Name is required.',
  slugRequired: 'Slug is required.',
  slugInvalid: 'Slug must be lowercase, alphanumeric, and hyphen-separated.',
};

const updateMessages = {
  nameRequired: 'Name is required.',
};

describe('createTenantSchema', () => {
  const schema = createTenantSchema(createMessages);

  it('accepts a valid payload', () => {
    const result = schema.safeParse({
      name: 'Acme Furniture',
      slug: 'acme-furniture',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({ name: '', slug: 'acme-furniture' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.nameRequired);
  });

  it('rejects an empty slug with the given message', () => {
    const result = schema.safeParse({ name: 'Acme Furniture', slug: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.slugRequired);
  });

  it('rejects a slug with uppercase letters or spaces with the given message', () => {
    const result = schema.safeParse({
      name: 'Acme Furniture',
      slug: 'Acme Furniture',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(createMessages.slugInvalid);
  });
});

describe('updateTenantSchema', () => {
  const schema = updateTenantSchema(updateMessages);

  it('accepts a valid payload', () => {
    const result = schema.safeParse({ name: 'Acme Furniture Renamed' });

    expect(result.success).toBe(true);
  });

  it('rejects an empty name with the given message', () => {
    const result = schema.safeParse({ name: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(updateMessages.nameRequired);
  });
});
