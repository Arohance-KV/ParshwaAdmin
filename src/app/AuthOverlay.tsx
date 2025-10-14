import { Button } from '@nextui-org/react';
import { User, signInWithPopup } from 'firebase/auth';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { FaGoogle } from 'react-icons/fa6';
import { GoogleProvider, auth } from './firebase';

type Props = {
  setAuthedUser: React.Dispatch<React.SetStateAction<User | null>>;
  authedUser: User | null;
};

export const AuthOverlay: FC<Props> = ({ setAuthedUser, authedUser }) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (loggedInUser) => {
      if (loggedInUser) {
        const we = process.env.NEXT_PUBLIC_APP_WHITELISTS_EMAILS!.split(',');
        if (we.includes(loggedInUser.email!)) {
          setAuthedUser(loggedInUser);
        } else {
          setErr('Please whitelist your email!');
        }
      } else {
        setAuthedUser(null);
      }
    });

    return () => unsubscribe();
  }, [setAuthedUser]);

  const [err, setErr] = useState('');

  const handleAuth = useCallback(async () => {
    try {
      setErr('');
      const user = await signInWithPopup(auth, GoogleProvider);
      const we = process.env.NEXT_PUBLIC_APP_WHITELISTS_EMAILS!.split(',');
      if (we.includes(user.user.email!)) {
        setAuthedUser(user.user);
      } else {
        setErr('Please whitelist your email!');
      }
    } catch (e) {
      alert((e as Error).message);
      console.log('something went wrong!');
    }
  }, [setAuthedUser]);
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="grid place-content-center">
        <h1 className="text-xl">Admin Console | Parshwa</h1>
        {!authedUser && (
          <Button
            className="mt-5"
            endContent={<FaGoogle />}
            onClick={handleAuth}
          >
            Sign in with Google
          </Button>
        )}

        {err && <p className="text-red-400 mt-5">{err}</p>}
      </div>
    </div>
  );
};
