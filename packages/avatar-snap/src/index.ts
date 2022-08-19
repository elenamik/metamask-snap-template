import {JsonRpcId, JsonRpcVersion} from "@metamask/types";

interface JsonRpcRequest<T, M> {
  jsonrpc: JsonRpcVersion;
  method: M,
  id: JsonRpcId;
  params?: T;
}

interface SnapState {
  image?: string,
  history: string[]
}

type SaveAvatarRequest = JsonRpcRequest<{imageURL:string}, 'set_avatar'>
type GetAvatarRequest = JsonRpcRequest<{imageURL:string}, 'get_avatar'>

async function saveState(newState: SnapState) {
  await wallet.request({
    'method': 'snap_manageState',
    params: ['update', { newState }]
  })
}


async function getState() {
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  if ( state === null ) return {};
  return state;
}



module.exports.onRpcRequest = async ({ request }: {
  origin: string;
  request: SaveAvatarRequest | GetAvatarRequest
}) => {
  const state = await getState();
  switch (request.method) {
    case 'set_avatar':
      const { imageURL } = request.params;
      // TODO: add mutex?
        const oldState = state()
        const newState = {
          imageURL,
          history: oldState.history.unshift(imageURL)
        }
        await saveState(newState)
      return 'OK';

    case 'get_avatar':
      return {imageUrl: state.imageUrl}

    default:
      throw new Error('Method not found.');
  }
};
