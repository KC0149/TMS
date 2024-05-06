const db = require("../config/database");
const ErrorHandler = require("../utils/errorHandler");

//blueprint of object
class User {
  constructor(userId, password, email, group, isActive) {
    this.userId = userId;
    this.password = password;
    this.email = email;
    this.group = group;
    this.isActive = isActive;
  }
  async save() {
    let sql = `INSERT INTO accounts(userId,password, email, \`group\`, isActive) 
        VALUES('${this.userId}','${this.password}','${this.email}', '${this.group}', '${this.isActive}')`;

    const [newUser, _] = await db.execute(sql);
    return newUser;
  }

  //To find all user
  static findAll() {
    let sql = `SELECT userId FROM accounts`;
    return db.execute(sql);
  }

  static async findOne(userId) {
    let sql = `SELECT userId FROM accounts WHERE userID = '${userId}'`;
    try {
      const [results] = await db.execute(sql);
      if (!results.length) {
        return new ErrorHandler("Invalid userId or Password", 401);
      }
      const user = results[0];
      return user;
    } catch (error) {
      throw new ErrorHandler("Database error", 500);
    }
  }
}
module.exports = User;
