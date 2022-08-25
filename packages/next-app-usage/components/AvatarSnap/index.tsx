import * as React from 'react'
import { isSnapInstalled } from './utils';
import { Loading } from '@web3uikit/core';


declare global {
    interface Window {
        ethereum: {
            isMetaMask: boolean;
            request: <T>(request: {method: string; params?: any[]}) => Promise<T>;
            on: (eventName: unknown, callback: unknown) => unknown;
        }
    }
}

export const snapId = 'local:http://localhost:8086'

const Index:React.FC = () => {

    const [uploading, setUploading] = React.useState(false)
    const [snapState, setSnapState] = React.useState<{
        isInstalled: boolean; avatar?: string
    }>({
        isInstalled: false,
    })
    console.log(snapState)

    const installSnap  = async (snapId:string )=> {
        try {
            await window?.ethereum?.request({
                method: "wallet_enable",
                params: [
                    {
                        [`wallet_snap_${snapId}`]: {},
                    },
                ],
            });
            setSnapState({...snapState, isInstalled: true })
        } catch (err) {
            console.error('Failed to install snap, please try again')
        }
    }

    React.useEffect(()=>{
        const checkInstalled = async ()=>{
            const result = await isSnapInstalled(snapId)
            if (result){
                setSnapState({...snapState, isInstalled: result })
            }
        }
        if (window.ethereum){
            checkInstalled()
        }
    }, [])

    React.useEffect(()=>{
        const getAvatar = async () => {
            const {imageUrl} = await window?.ethereum.request({
                method: 'wallet_invokeSnap',
                params:[
                    snapId,
                    {
                        method:'get_avatar'
                    }
                ]
            })
            setSnapState({...snapState, avatar: imageUrl })
        }

        if (snapState.isInstalled && !snapState.avatar){
            getAvatar()
        }
    }, [snapState.isInstalled])

    if (!snapState.isInstalled){
        return <div>
            Not installed. Click here to install
            <button onClick={()=>{
                installSnap(snapId)}
            }>
                Install Snap
            </button>
        </div>
    }
    else if (snapState.isInstalled && !snapState.avatar){
        return <Loading />
    } else {
        return   ( <div>
            <img src={snapState.avatar}/>
        </div>)
    }

}

export default Index