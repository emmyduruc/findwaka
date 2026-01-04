import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LatLng } from '@findwaka/shared';

export function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const testShared: LatLng = { lat: 0, lng: 0 };

  return (
    <div className='bg-red-500 p-4'>
      <h1>FindWaka Web</h1>
      <p>Auth Status: <strong>{user ? `Signed In as ${user.email}` : "Signed Out"}</strong></p>
      <p>Shared Type Check: {JSON.stringify(testShared)}</p>
    </div>
  );
}

export default App;
