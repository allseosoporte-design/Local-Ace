
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const SUPER_ADMIN_EMAIL = 'allseosoporte@gmail.com';

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Para la auto-asignación inicial, el usuario que llama debe ser el SUPER_ADMIN_EMAIL.
  // Para asignaciones posteriores, el usuario que llama debe tener ya el claim de superadmin.
  const isInitialSetup = context.auth.token.email === SUPER_ADMIN_EMAIL;
  const isAlreadySuperAdmin = context.auth.token.isSuperAdmin === true;

  if (!isInitialSetup && !isAlreadySuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes permisos para asignar roles de administrador.'
    );
  }

  const targetEmail = data.email;

  try {
    const user = await admin.auth().getUserByEmail(targetEmail);
    
    // Si el usuario ya tiene el claim, no hacemos nada para evitar trabajo innecesario.
    if (user.customClaims && user.customClaims.isSuperAdmin === true) {
        return { success: true, message: `${targetEmail} ya es superadministrador.` };
    }
    
    await admin.auth().setCustomUserClaims(user.uid, {
      isSuperAdmin: true
    });

    console.log(`✅ SuperAdmin role assigned to: ${targetEmail}`);
    
    return { 
      success: true,
      message: `${targetEmail} ahora es superadministrador.` 
    };
  } catch (err) {
    console.error('❌ Error asignando rol:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
