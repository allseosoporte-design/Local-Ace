
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const SUPER_ADMIN_EMAIL = 'allseosoporte@gmail.com';

exports.addSuperAdminRole = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado para llamar esta función.'
    );
  }

  const requestingUserEmail = context.auth.token.email;
  const targetEmail = data.email;

  // Solo permitir si:
  // 1. El usuario solicitante es el super admin configurado
  // 2. O el usuario solicitante ya es super admin (para crear más admins en el futuro)
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
