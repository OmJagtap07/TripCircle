import admin from 'firebase-admin';
import fs from 'fs';

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (e) {
  console.error("❌ ERROR: serviceAccountKey.json not found!");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateVisibility() {
  console.log("Starting Admin SDK migration: Setting default visibility: 'public' on legacy trips...");
  try {
    const tripsSnap = await db.collection('trips').get();
    let migratedCount = 0;
    
    const batch = db.batch();
    let batchCount = 0;

    for (const tripDoc of tripsSnap.docs) {
      const tripData = tripDoc.data();
      
      // Only set if absent
      if (!('visibility' in tripData)) {
        batch.update(tripDoc.ref, { visibility: 'public' });
        batchCount++;
        migratedCount++;
      }

      if (batchCount >= 400) {
        await batch.commit();
        batchCount = 0;
      }
    }
    
    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`✅ Migration complete! Successfully migrated ${migratedCount} trips.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateVisibility();
