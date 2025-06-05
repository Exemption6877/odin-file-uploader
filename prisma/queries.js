const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getUsers() {
  try {
    return await prisma.user.findMany();
  } catch (err) {
    console.log(err);
  }
}

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

async function createUser(username, password) {
  try {
    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      throw new Error("User already exists");
    }

    return await prisma.user.create({
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

module.exports = { getUsers, getUserByName, createUser };
