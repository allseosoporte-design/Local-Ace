
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const SUPER_ADMIN_EMAIL = 'allseosoporte@gmail.com';

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario que llama a la función esté autenticado.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado para llamar esta función.'
    );
  }

  const requestingUserEmail = context.auth.token.email;
  const targetEmail = data.email;

  // Permitir la ejecución si:
  // 1. El usuario que llama es el SUPER_ADMIN_EMAIL (para la auto-asignación inicial).
  // 2. O si el usuario que llama ya tiene el claim de `isSuperAdmin` (para asignar a otros).
  const isSuperAdminRequest = 
    requestingUserEmail === SUPER_ADMIN_EMAIL ||
    context.auth.token.isSuperAdmin === true;

  if (!isSuperAdminRequest) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'No tienes permisos para asignar roles de administrador.'
    );
  }

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
