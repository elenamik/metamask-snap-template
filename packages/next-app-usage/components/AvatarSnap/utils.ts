export type GetSnapsResponse = {
  [k: string]: {
    permissionName?: string;
    id?: string;
    version?: string;
    initialPermissions?: { [k: string]: unknown };
  };
};

export async function getWalletSnaps(): Promise<GetSnapsResponse> {
  return await window?.ethereum?.request({
    method: "wallet_getSnaps",
  });
}

export async function isSnapInstalled(
  snapOrigin: string,
  version?: string
): Promise<boolean> {
  console.log("all wallet snaps", await getWalletSnaps());
  try {
    return !!Object.values(await getWalletSnaps()).find(
      (permission) =>
        permission.id === snapOrigin &&
        (!version || permission.version === version)
    );
  } catch (e) {
    console.log("Failed to obtain installed snaps", e);
    return false;
  }
}
