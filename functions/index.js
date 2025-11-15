
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Para el primer superadmin, no se necesita una verificación estricta,
  // ya que la lógica de creación en el cliente solo se activa para el email designado.
  // En un futuro, se podría añadir: if (context.auth?.token?.isSuperAdmin !== true) { ... }
  // para que solo un admin pueda crear a otros.

  // Get user and add custom claim
  try {
    const user = await admin.auth().getUserByEmail(data.email);
    await admin.auth().setCustomUserClaims(user.uid, {
      isSuperAdmin: true
    });
    return { message: `Success! ${data.email} has been made a super admin.` };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
