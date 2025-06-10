const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// User Functions

async function getUserByName(username) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error("Credentials are not correct");
    }

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getUserById(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("Credentials are not correct");
    }

    return user;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function createUser(username, password) {
  try {
    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      throw new Error("User already exists");
    }

    await prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Folder Functions

async function addFolder(userId, title) {
  try {
    return await prisma.folders.create({
      data: {
        title: title,
        userId: userId,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getFoldersByUserId(userId) {
  try {
    return await prisma.folders.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getFolder(userId, foldername) {
  try {
    return await prisma.folders.findFirst({
      where: {
        userId: userId,
        title: foldername,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function renameFolder(userId, folderId, title) {
  try {
    return await prisma.folders.update({
      where: {
        userId: userId,
        id: folderId,
      },
      data: {
        title: title,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function deleteFolder(userId, folderId) {
  try {
    return await prisma.folders.delete({
      where: {
        userId: userId,
        id: folderId,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

// File Functions

async function addFile(name, type, size, path, userId, date, foldername) {
  try {
    const file = await prisma.files.create({
      data: {
        name: name,
        type: type,
        size: size,
        path: path,
        userId: userId,
        creationDate: date,
      },
    });
    if (foldername) {
      const folder = await prisma.folders.findFirst({
        where: {
          userId: userId,
          title: foldername,
        },
      });

      await prisma.files.update({
        where: {
          userId: userId,
          id: file.id,
        },
        data: {
          folderId: folder.id,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getFilesByUserId(userId) {
  try {
    return await prisma.files.findMany({
      where: {
        userId: userId,
        folderId: null,
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getFilesByFolder(userId, foldername) {
  try {
    return await prisma.files.findMany({
      where: {
        userId: userId,
        folder: {
          title: foldername,
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getFile(userId, fileId) {
  try {
    return await prisma.files.findFirst({
      where: {
        userId: userId,
        id: fileId,
      },
      include: {
        folder: {
          select: {
            title: true,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function renameFile(userId, fileId, name) {
  try {
    return await prisma.files.update({
      where: {
        id: fileId,
        userId: userId,
      },
      data: {
        name: name,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function deleteFile(userId, fileId) {
  try {
    return await prisma.files.delete({
      where: {
        id: fileId,
        userId: userId,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function addFiletoFolder(userId, folderId, fileId) {
  try {
    return await prisma.files.update({
      where: {
        userId: userId,
        id: fileId,
      },
      data: {
        folderId: folderId,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function addSharedFolder(userId, uuid, folderId, expDate) {
  try {
    return await prisma.sharedFolder.create({
      data: {
        uuid: uuid,
        folderId: folderId,
        userId: userId,
        expDate: expDate,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getSharedFolder(uuid) {
  try {
    return await prisma.sharedFolder.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        folder: {
          include: {
            files: true,
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getSharedFile(uuid, fileId) {
  try {
    return await prisma.sharedFolder.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        folder: {
          include: {
            files: {
              where: {
                id: fileId,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function deleteSharedFolder(uuid) {
  try {
    return await prisma.sharedFolder.delete({
      where: {
        uuid: uuid,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  // User
  getUserByName,
  getUserById,
  createUser,
  // Folder
  addFolder,
  getFoldersByUserId,
  getFolder,
  renameFolder,
  deleteFolder,
  // File
  addFile,
  getFilesByUserId,
  getFilesByFolder,
  getFile,
  renameFile,
  deleteFile,
  addFiletoFolder,
  // share
  addSharedFolder,
  getSharedFolder,
  getSharedFile,
  deleteSharedFolder,
};
