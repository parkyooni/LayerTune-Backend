const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
  } catch (error) {
    console.error(`에러: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
