import * as React from 'react'
import { isSnapInstalled } from './utils';
import { Loading } from '@web3uikit/core';

import {Edit, CrossCircle} from '@web3uikit/icons'
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
import {useEffect} from "react";
import {AddResult} from "ipfs-core-types/dist/src/root";



declare global {
    interface Window {
        ethereum: {
            isMetaMask: boolean;
            request: <T>(request: {method: string; params?: any[]}) => Promise<T>;
            on: (eventName: unknown, callback: unknown) => unknown;
        }
    }
}

const snapId = process.env.NEXT_PUBLIC_SNAP_ID ?? ''
if (snapId === ''){
    console.error('Please add snap ID in .env.local')
}

const AvatarSnap:React.FC = () => {

    const [uploading, setUploading] = React.useState(false)
    const [snapState, setSnapState] = React.useState<{
        isInstalled: boolean; avatar?: string
    }>({
        isInstalled: false,
    })
    console.log('STATE',snapState)
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
            const {imageUrl, wallet} = await window?.ethereum.request({
                method: 'wallet_invokeSnap',
                params:[
                    snapId,
                    {
                        method:'get_avatar'
                    }
                ]
            })
            console.log('img',imageUrl)
            console.log('WALLET IN REQ', wallet)
            setSnapState({...snapState, avatar: imageUrl })
        }

        if (snapState.isInstalled && !uploading){
            getAvatar()
        }
    }, [snapState, uploading])


    if(uploading){
        return <Uploader onClose={()=>setUploading(false)}/>
    }

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
    else if (!snapState.avatar){
        return <Loading spinnerColor="black" />
    } else {
        return   (
            <div>
            <img className="object-scale-down h-48" src={snapState.avatar}/>
                <div className='flex'>
                    <Edit fontSize='20px' onClick={()=>setUploading(true)}/>
                </div>

        </div>
        )
    }

}


export default AvatarSnap

const Uploader: React.FC<{onClose: ()=>void}> = ({onClose}) => {

    const uploadAvatar = (url:string) => {
        console.log('uploading to snap',url)
        return window?.ethereum.request({
            method: 'wallet_invokeSnap',
            params:[
                snapId,
                {
                    method:'set_avatar',
                    params: {
                        imageUrl: url}
                }

            ]
        })
    }

    const projectId = process.env.NEXT_PUBLIC_INFURA_ID
    const projectSecret = process.env.NEXT_PUBLIC_INFURA_API_KEY
    const authorization = "Basic " + btoa(projectId + ":" + projectSecret);
    const [ipfs, setIpfs] = React.useState<IPFSHTTPClient | undefined>()

    console.log('KEYS:',projectId,projectSecret)

    useEffect(()=>{
        try {
            const ipfsConn = create({
                url: "https://ipfs.infura.io:5001/api/v0",
                headers: {
                    authorization,
                },
            });
            setIpfs(ipfsConn)

        } catch (error) {
            console.error("Could not connect to IPFS", error);
        }
    },[])


    const handleIPFSSubmit = async (event: React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const files = (form[0] as HTMLInputElement).files;

        if (!files || files.length === 0) {
            return alert("No files selected");
        }

        const file = files[0];

        const result: AddResult = await (ipfs as IPFSHTTPClient).add(file);
        const imageUrl = `https://ipfs.infura.io/ipfs/${result.path}`
        console.log('uploaded to IPFS', imageUrl)
        const snapResult = await uploadAvatar(imageUrl)
        onClose()
        console.log('closing')
    }

    return <div>
        <p>Upload File using IPFS</p>
        {
            (ipfs) ?  <form onSubmit={handleIPFSSubmit}>
                <input name="file" type="file" />

                <button type="submit">Upload File</button>
            </form>:<div>
            Could not connect to IPFS at this time
            </div>
        }


        <CrossCircle onClick={onClose}/>
    </div>
}