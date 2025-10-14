'use client';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaPlus } from 'react-icons/fa6';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { firestore, storage } from './firebase';
import { Product } from './types';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: 'transparent',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

type Props = {
  handleAddProducts: (p: Product) => void;
};

export const Uploader: FC<Props> = ({ handleAddProducts }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [imgs, setImgs] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<
    'uploading' | 'uploaded' | 'failed' | 'not-uploading' | 'paused'
  >('not-uploading');
  const [imgUrls, setImgUrls] = useState(['']);
  const [description, setDescription] = useState('');
  const [colorVariants, setColorVariants] = useState<string[]>([]);

  const handleUpload = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      setUploadStatus('uploading');
      try {
        if (!title) {
          throw new Error('Title is required!');
        }
        if (!imgs) {
          throw new Error('image is required!');
        }
        if (!brand) {
          throw new Error('brand is required!');
        }

        const downloadedUrls: string[] = [];
        for (const img of imgs) {
          const imageRef = ref(storage, `products/${img.name}`);
          const buffer = await img.arrayBuffer();
          const uploadResult = await uploadBytes(imageRef, buffer);
          const url = await getDownloadURL(uploadResult.ref);
          downloadedUrls.push(url);
        }
        setImgUrls(downloadedUrls);

        const r = await addDoc(collection(firestore, 'products'), {
          brand,
          colorVariants,
          description,
          title,
          imgRef: downloadedUrls,
          createdAt: Timestamp.now(),
        });

        console.log('created: #', r.id);
        setUploadStatus('uploaded');
        setTimeout(() => {
          handleAddProducts({
            brand,
            colorVariants,
            description,
            title,
            imgRef: downloadedUrls,
            id: r.id,
            createdAt: Timestamp.now(),
          });
          setUploadStatus('not-uploading');
          onClose();
        }, 2000);

        setTitle('');
        setBrand('');
        setImgs([]);
        setColorVariants([]);
        setDescription('');
      } catch (error) {
        setUploadStatus('failed');

        if (imgUrls) {
          try {
            for (const i of imgUrls) {
              await deleteObject(ref(storage, i));
            }
          } catch (cleanupError) {
            console.error('Failed to delete uploaded image:', cleanupError);
          }
        }

        setTimeout(() => {
          setUploadStatus('not-uploading');
        }, 1500);
        console.error(error);
      }
    },
    [
      title,
      imgs,
      brand,
      handleAddProducts,
      colorVariants,
      description,
      onClose,
      imgUrls,
    ]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    []
  );

  const handleBrandChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBrand(e.target.value);
    },
    []
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDescription(e.target.value);
    },
    []
  );

  const handleColorVariantChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const arr = e.target.value.split(',');
      setColorVariants(arr);
    },
    []
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setImgs(acceptedFiles);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    fileRejections,
  } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 5 });

  const style: any = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.name} className="text-xs">
      {file.name} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => {
    return (
      <li key={file.name} className="text-xs">
        {file.name} - {file.size} bytes
        <ul className="font-extrabold">
          {errors.map((e) => (
            <li key={e.code}>{e.message}</li>
          ))}
        </ul>
      </li>
    );
  });

  return (
    <>
      <Button isIconOnly onClick={onOpen}>
        <FaPlus />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add Product
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Title"
                  placeholder="Enter your title"
                  variant="bordered"
                  value={title}
                  onChange={handleTitleChange}
                />
                <Textarea
                  label="Description of the products"
                  variant="bordered"
                  value={description}
                  onChange={handleDescriptionChange}
                />
                <Input
                  label="Color Variants"
                  placeholder="separate your color value with ','"
                  variant="bordered"
                  value={colorVariants.join(',')}
                  onChange={handleColorVariantChange}
                />
                <Select
                  label="Select an brand"
                  variant="bordered"
                  selectedKeys={[brand]}
                  onChange={handleBrandChange}
                >
                  <SelectItem key="go-beyond" value="go-beyond">
                    go-beyond
                  </SelectItem>
                  <SelectItem key="su-57" value="su-57">
                    su-57
                  </SelectItem>
                  <SelectItem key="perfect-plus" value="perfect-plus">
                    perfect-plus
                  </SelectItem>
                </Select>
                <div {...getRootProps({ style })}>
                  <input {...getInputProps()} />
                  <p>
                    Drag &apos;n&apos; drop some files here, or click to select
                    files
                  </p>
                </div>
                <aside>
                  {!!acceptedFileItems.length && (
                    <div className="text-green-500">
                      <h4>files:</h4>
                      <ul>{acceptedFileItems}</ul>
                    </div>
                  )}
                  {!!fileRejectionItems.length && (
                    <div className="text-red-500">
                      <h4>Rejected files:</h4>
                      <ul>{fileRejectionItems}</ul>
                    </div>
                  )}
                </aside>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isDisabled={!imgs || !title || !brand}
                  color="primary"
                  onClick={handleUpload}
                >
                  {uploadStatus === 'failed' && 'Upload failed'}
                  {uploadStatus === 'not-uploading' && 'Upload!'}
                  {uploadStatus === 'paused' && 'upload paused!'}
                  {uploadStatus === 'uploaded' && 'uploaded!'}
                  {uploadStatus === 'uploading' && 'uploading!'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
