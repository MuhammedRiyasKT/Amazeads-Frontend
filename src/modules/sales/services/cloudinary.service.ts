export async function uploadToCloudinary(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "amaze-test"); 

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/sqzthdpa/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  return await response.json();
}