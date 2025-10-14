const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user.
  // This is a security check to ensure only authenticated users can trigger this.
  // In a real production app, you'd want to lock this down further,
  // e.g., only callable by other admins.
  if (!context.auth) {
     return { error: 'Authentication required to assign super admin role.' };
  }
  
  // Get user and add custom claim
  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().setCustomUserClaims(user.uid, {
      isSuperAdmin: true
    });
    return { message: `Success! ${data.email} has been made a super admin.` };
  } catch (err) {
    console.error(err);
    return { error: err.message };
  }
});
