const supabase = require("./pool");

async function uploadFile(file) {
  const path = `uploads/${file.originalname}`;
  const { error } = await supabase.storage
    .from("fileuploader")
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Upload failed:", error);
    throw error;
  }

  return { path };
}

async function getUrl(filepath) {
  const { data } = supabase.storage.from("fileuploader").getPublicUrl(filepath);

  return data.publicUrl;
}

async function deleteFile(relativePath) {
  await supabase.storage.from("fileuploader").remove([relativePath]);
}

module.exports = {
  uploadFile,
  getUrl,
  deleteFile,
};
