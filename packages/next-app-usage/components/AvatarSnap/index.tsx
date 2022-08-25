import * as React from "react";
import { Loading } from "@web3uikit/core";

import { Edit, CrossCircle } from "@web3uikit/icons";
import { create, IPFSHTTPClient } from "ipfs-http-client";
import { useEffect } from "react";
import { AddResult } from "ipfs-core-types/dist/src/root";
import { isSnapInstalled } from "./utils";
import {
  QueryClientProvider,
  useMutation,
  useQuery,
  QueryClient,
} from "react-query";
import Uploader from "./Uploader";

declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean;
      request: <T>(request: { method: string; params?: any[] }) => Promise<T>;
      on: (eventName: unknown, callback: unknown) => unknown;
    };
  }
}

export const snapId = process.env.NEXT_PUBLIC_SNAP_ID ?? "";
if (snapId === "") {
  console.error("Please add snap ID in .env.local");
}

const AvatarSnap: React.FC = () => {
  const [mode, setMode] = React.useState<"VIEW" | "EDIT" | "UNINSTALLED">(
    "UNINSTALLED"
  );

  const [snapState, setSnapState] = React.useState<{
    isInstalled: boolean;
  }>({
    isInstalled: false,
  });

  const installSnap = async (snapId: string) => {
    try {
      await window?.ethereum?.request({
        method: "wallet_enable",
        params: [
          {
            [`wallet_snap_${snapId}`]: {},
          },
        ],
      });
      setSnapState({ ...snapState, isInstalled: true });
    } catch (err) {
      console.error("Failed to install snap, please try again");
    }
  };

  React.useEffect(() => {
    const checkInstalled = async () => {
      const result = await isSnapInstalled(snapId);
      if (result) {
        setMode("VIEW");
      }
    };
    if (window.ethereum) {
      checkInstalled();
    }
  }, []);

  if (mode === "UNINSTALLED") {
    return (
      <div>
        Not installed. Click here to install
        <button
          onClick={() => {
            installSnap(snapId);
          }}
        >
          Install Snap
        </button>
      </div>
    );
  } else if (mode === "EDIT") {
    return <Uploader onClose={() => setMode("VIEW")} />;
  }
  return (
    <AvatarRenderer
      handleEdit={() => {
        setMode("EDIT");
      }}
    />
  );
};

export const Wrapped = () => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AvatarSnap />
    </QueryClientProvider>
  );
};

export default Wrapped;

const AvatarRenderer: React.FC<{ handleEdit: () => void }> = ({
  handleEdit,
}) => {
  const { data: avatar, isLoading } = useQuery({
    queryFn: async () => {
      const { imageUrl } = await window.ethereum.request({
        method: "wallet_invokeSnap",
        params: [
          snapId,
          {
            method: "get_avatar",
          },
        ],
      });
      return imageUrl;
    },
  });

  if (isLoading) {
    return <Loading spinnerColor="black" />;
  }
  return (
    <div>
      <img className="h-48 object-scale-down" src={avatar} />
      <div className="flex">
        <Edit fontSize="20px" onClick={handleEdit} />
      </div>
    </div>
  );
};
