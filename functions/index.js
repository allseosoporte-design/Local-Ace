const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user.
  // We remove the check for existing super admin to allow the first one to be created.
  if (!context.auth) {
     return { error: 'Authentication required.' };
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
