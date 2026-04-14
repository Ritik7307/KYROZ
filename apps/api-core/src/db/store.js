import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, "../../db.json");

const baseDb = {
  users: [],
  chatHistory: []
};

const ensureDbFile = () => {
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(baseDb, null, 2), "utf8");
  }
};

const readDb = () => {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return { ...baseDb };
  }
};

const writeDb = (db) => {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf8");
};

export const db = {
  getUserByEmail(email) {
    const state = readDb();
    return state.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
  },
  createUser(user) {
    const state = readDb();
    state.users.push(user);
    writeDb(state);
    return user;
  },
  saveChatMessage(message) {
    const state = readDb();
    state.chatHistory.push(message);
    writeDb(state);
  },
  listSopSessionsByUser(userId) {
    const state = readDb();
    return state.chatHistory.filter((item) => item.userId === userId);
  }
};
