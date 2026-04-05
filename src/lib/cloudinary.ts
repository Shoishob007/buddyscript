import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Configure Cloudinary before uploading media.`,
    );
  }
  return value;
}

function configureCloudinary() {
  if (isConfigured) {
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  isConfigured = true;
  return cloudinary;
}

export async function uploadPostImage(
  fileBuffer: Buffer,
  publicId: string,
): Promise<string> {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "buddyscript/posts";
  const cloudinaryClient = configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
}
