import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const apps = getApps();
const adminApp = apps.length === 0 
  ? initializeApp({ projectId: firebaseConfig.projectId }) 
  : apps[0];

export const adminAuth = getAuth(adminApp);
export default adminApp;
