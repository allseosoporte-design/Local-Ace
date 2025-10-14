const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user.
  // We are temporarily commenting this out to allow an existing user to gain the claim.
  // if (!context.auth) {
  //    return { error: 'Authentication required to assign super admin role.' };
  // }
  
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
