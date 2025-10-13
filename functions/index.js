const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Check if request is made by an existing super admin (for security)
  // This is a simplified check. In a real app, you'd want to verify
  // the caller's identity more robustly, perhaps by checking their own custom claims.
  // if (context.auth.token.isSuperAdmin !== true) {
  //   return { error: 'Only super admins can add other super admins.' };
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
