import "express";

declare global {
  namespace Express {
    interface Request {
      initData?: {
        id: string;
        username: string;
        photo_url?: string;
      };
    }
  }
}

declare module "backblaze-b2" {
  interface FileUploadResponse {
    fileUrl: string;
    fileName: string;
    size: number;
  }

  interface B2 {
    authorize(): Promise<any>;
    getBucket(options: { bucketName: string }): Promise<any>;
    getUploadUrl(options: { bucketId: string }): Promise<any>;
    uploadFile(options: {
      uploadUrl: string;
      uploadAuthToken: string;
      fileName: string;
      data: Buffer;
      mime: string;
    }): Promise<FileUploadResponse>;
  }

  const B2: new (config: { accountId: string; applicationKey: string }) => B2;
  export = B2;
}
