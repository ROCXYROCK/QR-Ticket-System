const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/qrscanner', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB verbunden');
  } catch (err) {
    console.error('Fehler beim Verbinden mit MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;