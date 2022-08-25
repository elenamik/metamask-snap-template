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
