export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

/**
 * No provider (S3 / GCS / Azure Blob) is implemented yet — picking one is
 * an infrastructure decision for whoever builds the first feature that
 * actually uploads a file. This is the contract that implementation will
 * have to satisfy, so callers never depend on a specific SDK.
 */
export interface ObjectStorage {
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
