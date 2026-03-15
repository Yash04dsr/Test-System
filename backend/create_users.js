const admin = require('firebase-admin');
const serviceAccount = require('./test-app-d22b2-firebase-adminsdk-fbsvc-2a93c0c4ec.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const users = [
  {
    email: 'admin@evalsys.com',
    password: 'password123',
    name: 'Main Admin',
    role: 'admin'
  },
  {
    email: 'student1@test.com',
    password: 'password123',
    name: 'Alex Student',
    role: 'student'
  },
  {
    email: 'student2@test.com',
    password: 'password123',
    name: 'Sarah Learner',
    role: 'student'
  },
  {
    email: 'student3@test.com',
    password: 'password123',
    name: 'John Doe',
    role: 'student'
  }
];

async function createUsers() {
  for (const user of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.name,
      });

      console.log(`Successfully created Auth user: ${userRecord.uid}`);

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        name: user.name,
        role: user.role,
        email: user.email
      });

      console.log(`Successfully created Firestore doc for: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`User already exists for email: ${user.email}`);
        
        // Let's get the user and make sure firestore document exists
        try {
          const userRecord = await auth.getUserByEmail(user.email);
          await db.collection('users').doc(userRecord.uid).set({
            name: user.name,
            role: user.role,
            email: user.email
          }, { merge: true });
          console.log(`Updated Firestore doc for existing user: ${user.email}`);
        } catch (e) {
          console.log(`Error updating firestore for existing user ${user.email}`, e.message);
        }
      } else {
        console.error(`Error creating user ${user.email}:`, error.message);
      }
    }
  }
  
  console.log("Finished user creation script.");
  process.exit(0);
}

createUsers();
