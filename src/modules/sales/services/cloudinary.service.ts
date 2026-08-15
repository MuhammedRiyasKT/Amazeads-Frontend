// export async function uploadToCloudinary(file: File) {
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append("upload_preset", "amaze-test"); 

//   const response = await fetch(
//     "https://api.cloudinary.com/v1_1/sqzthdpa/image/upload",
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Cloudinary upload failed");
//   }

//   return await response.json();
// }

export async function uploadToCloudinary(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error("Cloudinary error:", errorData);

    throw new Error("Cloudinary upload failed");
  }

  return await response.json();
}