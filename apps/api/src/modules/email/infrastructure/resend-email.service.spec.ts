import { expect } from '@jest/globals';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

// Imported after the mock so the constructor above is what actually runs.
import { ResendEmailService } from './resend-email.service';

describe('ResendEmailService', () => {
  let service: ResendEmailService;

  beforeEach(() => {
    sendMock.mockReset();
    process.env.RESEND_API_KEY = 'test-key';
    process.env.EMAIL_FROM = 'no-reply@example.com';
    service = new ResendEmailService();
  });

  it('forwards to Resend with the configured from address', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await service.send({
      to: 'user@example.com',
      subject: 'Reset your password',
      html: '<p>hi</p>',
      text: 'hi',
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: 'no-reply@example.com',
      to: 'user@example.com',
      subject: 'Reset your password',
      html: '<p>hi</p>',
      text: 'hi',
    });
  });

  it('throws when Resend reports an error, without exposing email content in the thrown error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: {
        message: 'invalid_from_address',
        statusCode: 422,
        name: 'validation_error',
      },
    });

    await expect(
      service.send({
        to: 'user@example.com',
        subject: 'Reset your password',
        html: '<p>super-secret-token-content</p>',
        text: 'super-secret-token-content',
      }),
    ).rejects.toThrow('Failed to send email.');
  });
});
