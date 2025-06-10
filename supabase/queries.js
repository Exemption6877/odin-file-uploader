const supabase = require("./pool");

async function uploadFile(file) {
  const { data, error } = await supabase.storage
    .from("fileuploader")
    .upload(`uploads/${file.originalname}`, file);
  if (error) {
    console.log(error);
  } else {
    console.log("successfully uploaded");
  }
}

module.exports = {
  uploadFile,
};
