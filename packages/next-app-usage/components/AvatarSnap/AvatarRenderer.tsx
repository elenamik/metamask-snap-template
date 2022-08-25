import * as React from "react";
import { useQuery } from "react-query";
import { Loading } from "@web3uikit/core";
import { Edit } from "@web3uikit/icons";
import { snapId } from "./index";

export const AvatarRenderer: React.FC<{ handleEdit: () => void }> = ({
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
    return <Loading spinnerColor="black" text="Loading avatar" />;
  }
  return (
    <div className="flex flex-col">
      <img className="h-64 object-scale-down" src={avatar} />
      <div className="grid">
        <button className="justify-self-end">
          <Edit fontSize="20px" onClick={handleEdit} />
        </button>
      </div>
    </div>
  );
};
