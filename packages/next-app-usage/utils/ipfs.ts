import { create, IPFSHTTPClient } from "ipfs-http-client";

export const useIpfs = () => {
  const projectId = process.env.NEXT_PUBLIC_INFURA_ID;
  const projectSecret = process.env.NEXT_PUBLIC_INFURA_API_KEY;
  const authorization = `Basic ${btoa(`${projectId}:${projectSecret}`)}`;

  let ipfsConn: IPFSHTTPClient | undefined;
  try {
    ipfsConn = create({
      url: "https://ipfs.infura.io:5001/api/v0",
      headers: {
        authorization,
      },
    });
  } catch (error) {
    ipfsConn = undefined;
    console.error("Could not connect to IPFS", error);
  }
  return { ipfs: ipfsConn };
};
