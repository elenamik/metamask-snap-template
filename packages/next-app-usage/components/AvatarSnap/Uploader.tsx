import * as React from "react";
import { IPFSHTTPClient } from "ipfs-http-client";
import { AddResult } from "ipfs-core-types/dist/src/root";
import { CrossCircle, Edit } from "@web3uikit/icons";
import { snapId } from ".";
import { useIpfs } from "../../utils/ipfs";
import { Loading } from "@web3uikit/core";

const Uploader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = React.useState(false);

  const { ipfs } = useIpfs();

  const uploadToSnap = (url: string) => {
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

  const uploadToIpfs = async (file: File) => {
    return (ipfs as IPFSHTTPClient).add(file);
  };

  const handleIPFSSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const { files } = form[0] as HTMLInputElement;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }
    setLoading(true);
    const file = files[0];
    const uploadResult: AddResult = await uploadToIpfs(file);
    const imageUrl = `https://ipfs.infura.io/ipfs/${uploadResult.path}`;
    await uploadToSnap(imageUrl);
    onClose();
  };

  if (loading) {
    return <Loading spinnerColor="black" text="Uploading" />;
  }

  return (
    <div className="h-64 w-64">
      <p className="text-lg font-semibold">Upload File using IPFS</p>
      {ipfs ? (
        <form onSubmit={handleIPFSSubmit} className="flex flex-col pt-6">
          <input name="file" type="file" className="text-sm" />

          <button
            type="submit"
            className="mt-4 w-fit rounded-2xl border-2 border-teal-900 bg-teal-100 p-2 font-semibold text-teal-900"
          >
            Upload File
          </button>
        </form>
      ) : (
        <div>Could not connect to IPFS at this time</div>
      )}

      <div className="grid">
        <button className="justify-self-end">
          <CrossCircle fontSize="26px" onClick={onClose} />
        </button>
      </div>
    </div>
  );
};

export default Uploader;
