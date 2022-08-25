import {JsonRpcId, JsonRpcVersion} from "@metamask/types";

export interface SnapState {
  image?: string,
}

export interface JsonRpcRequest<T, M> {
  jsonrpc: JsonRpcVersion;
  method: M,
  id: JsonRpcId;
  params?: T;
}

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3033/3033222.png"
const defaultState: SnapState = {
  image: defaultAvatar,
}

async function saveState(newState: SnapState) {
  await wallet.request({
    'method': 'snap_manageState',
    params: ['update', { ...newState }]
  })
}

async function getState(): Promise<SnapState> {
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if ( state === null ) {
    return defaultState
  };
  return state;
}

type SaveAvatarRequest = JsonRpcRequest<{imageUrl:string}, 'set_avatar'>
type GetAvatarRequest = JsonRpcRequest<{}, 'get_avatar'>

module.exports.onRpcRequest = async ({ request }: {
  origin: string;
  request: SaveAvatarRequest | GetAvatarRequest
}) => {
  const state: SnapState = await getState();
  switch (request.method) {
    case 'set_avatar':
          const { imageUrl } = request.params;
          const newState: SnapState = {
            image: imageUrl
          }
          await saveState(newState)
          return {
            newState,
            request,
          }

    case 'get_avatar':
      return {imageUrl: state.image}

    default:
      throw new Error('Method not found.');
  }
};
