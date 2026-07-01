import admin from 'firebase-admin';
import fs from 'fs';

// To run this script, you need a serviceAccountKey.json from your Firebase Console.
// Go to Project Settings -> Service Accounts -> Generate New Private Key.
// Save it as serviceAccountKey.json in the project root.

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (e) {
  console.error("❌ ERROR: serviceAccountKey.json not found!");
  console.error("Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateMembers() {
  console.log("Starting Admin SDK migration: trips.members -> tripMembers collection...");
  try {
    const tripsSnap = await db.collection('trips').get();
    let migratedCount = 0;
    
    // We can use a batch, but since we are iterating, individual writes or chunked batches work.
    // Admin SDK has no rules restrictions, so this is fully safe and secure.
    const batch = db.batch();
    let batchCount = 0;

    for (const tripDoc of tripsSnap.docs) {
      const trip = tripDoc.data();
      const tripId = tripDoc.id;
      const members = trip.members || [];
      const creatorId = trip.creatorId;

      const allMembers = new Set(members);
      if (creatorId) allMembers.add(creatorId);

      for (const userId of allMembers) {
        const memberRef = db.collection('tripMembers').doc(`${tripId}_${userId}`);
        const role = userId === creatorId ? 'creator' : 'member';
        
        batch.set(memberRef, {
          tripId,
          userId,
          role,
          joinedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true }); // Idempotent
        
        batchCount++;
        migratedCount++;

        // Commit every 400 operations to stay under the 500 limit
        if (batchCount >= 400) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit any remaining writes
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Migration complete! Successfully migrated ${migratedCount} trip members.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateMembers();
