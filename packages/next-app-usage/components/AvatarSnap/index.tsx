import * as React from "react";
import { isSnapInstalled } from "./utils";
import { QueryClientProvider, QueryClient } from "react-query";
import Uploader from "./Uploader";
import { AvatarRenderer } from "./AvatarRenderer";

/***
 * Initial Setup for Rendering Details of Snap
 */
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
/***
 * End of setup
 */

const AvatarSnap: React.FC = () => {
  const [mode, setMode] = React.useState<"VIEW" | "EDIT" | "UNINSTALLED">(
    "UNINSTALLED"
  );

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
      setMode("VIEW");
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
