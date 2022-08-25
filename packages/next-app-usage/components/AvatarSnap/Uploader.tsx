import * as React from "react";
import { useMutation } from "react-query";
import { create, IPFSHTTPClient } from "ipfs-http-client";
import { useEffect } from "react";
import { AddResult } from "ipfs-core-types/dist/src/root";
import { CrossCircle } from "@web3uikit/icons";
import { snapId } from ".";

const Uploader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mutate: uploadToIPFS, isLoading } = useMutation({
    mutationFn: async () => {},
  });

  const uploadAvatar = (url: string) => {
    console.log("uploading to snap", url);
    return window?.ethereum.request({
      method: "wallet_invokeSnap",
      params: [
        snapId,
        {
          method: "set_avatar",
          params: { imageUrl: url },
        },
      ],
    });
  };

  const projectId = process.env.NEXT_PUBLIC_INFURA_ID;
  const projectSecret = process.env.NEXT_PUBLIC_INFURA_API_KEY;
  const authorization = `Basic ${btoa(`${projectId}:${projectSecret}`)}`;
  const [ipfs, setIpfs] = React.useState<IPFSHTTPClient | undefined>();

  useEffect(() => {
    try {
      const ipfsConn = create({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
          authorization,
        },
      });
      setIpfs(ipfsConn);
    } catch (error) {
      console.error("Could not connect to IPFS", error);
    }
  }, []);

  const handleIPFSSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const { files } = form[0] as HTMLInputElement;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];

    const result: AddResult = await (ipfs as IPFSHTTPClient).add(file);
    const imageUrl = `https://ipfs.infura.io/ipfs/${result.path}`;
    console.log("uploaded to IPFS", imageUrl);
    await uploadAvatar(imageUrl);
    onClose();
  };

  return (
    <div>
      <p>Upload File using IPFS</p>
      {ipfs ? (
        <form onSubmit={handleIPFSSubmit}>
          <input name="file" type="file" />

          <button type="submit">Upload File</button>
        </form>
      ) : (
        <div>Could not connect to IPFS at this time</div>
      )}

      <CrossCircle onClick={onClose} />
    </div>
  );
};

export default Uploader;
