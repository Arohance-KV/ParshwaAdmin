'use client';

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from '@nextui-org/react';
import { Uploader } from './Uploader';
import { useCallback, useEffect, useState } from 'react';
import { deleteProduct, fetchAllProducts } from './utils';
import { Product } from './types';
import { FaTrash } from 'react-icons/fa6';
import { auth } from './firebase';
import { User, signOut } from 'firebase/auth';
import { AuthOverlay } from './AuthOverlay';

export default function Home() {
  const [data, setData] = useState<Product[]>([]);
  const [deletionStatus, setDeletionStatus] = useState<'in-progress' | 'none'>(
    'none'
  );

  const [authedUser, setAuthedUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (loggedInUser) => {
      if (loggedInUser) {
        const we = process.env.NEXT_PUBLIC_APP_WHITELISTS_EMAILS!.split(',');
        if (we.includes(loggedInUser.email!)) {
          setAuthedUser(loggedInUser);
        }
      } else {
        setAuthedUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAllProducts().then((d) => setData(d.products));
  }, []);

  const handleDeleteItem = useCallback(
    async (id: string) => {
      try {
        setDeletionStatus('in-progress');
        await deleteProduct(id);
        setData(data.filter((d) => d.id !== id));
        setDeletionStatus('none');
      } catch (error) {
        console.error(error);
        setDeletionStatus('none');
      }
    },
    [data]
  );

  const handleAddProducts = useCallback(
    (p: Product) => {
      setData([p, ...data]);
    },
    [data]
  );

  if (!authedUser) {
    return (
      <AuthOverlay setAuthedUser={setAuthedUser} authedUser={authedUser} />
    );
  }

  return (
    <main className="container">
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">Admin | Parshwa</p>
        </NavbarBrand>

        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={authedUser.displayName!}
                size="sm"
                src={authedUser.photoURL!}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{authedUser.email!}</p>
              </DropdownItem>
              <DropdownItem key="settings">My Settings</DropdownItem>
              <DropdownItem key="team_settings">Team Settings</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onClick={async () => await signOut(auth)}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <div className="max-w-5xl mx-6 sm:mx-auto my-10">
        <div className="flex justify-between">
          <h1 className="text-2xl mb-6">Stats</h1>
          <Uploader handleAddProducts={handleAddProducts} />
        </div>
        <div className="flex my-2 gap-2">
          <Card>
            <CardBody>
              <p>{data.length} PRODUCTS</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Divider className="max-w-5xl mx-auto" />

      <div className="max-w-5xl mx-6 sm:mx-auto my-10">
        <h2 className="text-2xl mb-6">Products</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {data.map((p) => (
            <div
              className="flex-1 flex flex-col items-start justify-start gap-[12px] min-w-[109px] group transition-all hover:shadow-2xl hover:rounded-none rounded-lg cursor-pointer group"
              key={p.id}
            >
              <div className="self-stretch flex flex-col items-start justify-start overflow-hidden group-hover:rounded-none rounded-xl">
                <img
                  className="w-full relative group-hover:rounded-none rounded-xl overflow-hidden shrink-0 object-cover group-hover:scale-105 transition-all"
                  loading="eager"
                  alt={p.title}
                  src={p.imgRef[0]}
                />
              </div>
              <div className="relative pt-3 pb-5 px-3 flex justify-between items-center w-11/12 font-manrope">
                <div className="flex flex-col">
                  <span className="text-md font-semibold">{p.title}</span>
                  <span className="text-sm border border-solid p-1 rounded-lg">
                    {p.brand}
                  </span>
                </div>
                <Button
                  isIconOnly
                  onClick={(e) => handleDeleteItem(p.id)}
                  isDisabled={deletionStatus === 'in-progress'}
                  isLoading={deletionStatus == 'in-progress'}
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
