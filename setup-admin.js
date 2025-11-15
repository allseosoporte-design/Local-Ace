const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function assignSuperAdmin() {
  const email = 'allseosoporte@gmail.com';
  
  try {
    console.log('Buscando usuario...');
    const user = await admin.auth().getUserByEmail(email);
    
    console.log('Usuario encontrado:', user.uid);
    
    console.log('Asignando rol...');
    await admin.auth().setCustomUserClaims(user.uid, {
      isSuperAdmin: true
    });
    
    console.log('✅ ROL ASIGNADO EXITOSAMENTE');
    console.log('Cierra sesión y vuelve a entrar en la app');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  El usuario no existe.');
      console.log('Primero crea la cuenta en /admin/login');
    }
    
    process.exit(1);
  }
}

assignSuperAdmin();