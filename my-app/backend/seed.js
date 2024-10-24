const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('./models/User');

const seedData = async () => {
  await connectDB();

  const users = [
    { email: 'asd@gmail.com', name: 'Abdullah Shibly', participated: false },
    { email: 'user2@example.com', name: 'asad Bruder', participated: false },
    { email: 'abdulhamidhijli@gmail.com', name: 'Abdul', participated: false },
    { email: 'user4@example.com', name: 'User Four', participated: false },
    { email: 'user5@example.com', name: 'User Five', participated: false },
  ];

  try {
    await User.insertMany(users);
    console.log('Beispieldaten erfolgreich hinzugefügt');
  } catch (error) {
    console.error('Fehler beim Hinzufügen der Beispieldaten:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();