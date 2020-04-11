import * as functions from 'firebase-functions';

import {SpotifyToken, getSpotifyToken, getSpotifyAuthCodeUrl} from "./SpotifyTokenManager"
import {ServiceType, ObjectType} from "./musicEnums"

import {AppleTrack, SpotifyTrack, UniversalTrack} from "./musicObjects"
import {SpotifyAlbum, AppleAlbum, UniversalAlbum} from "./musicObjects"
import {ApplePlaylist, SpotifyPlaylist, UniversalPlaylist, JsonUniversalPlaylist} from "./musicObjects"

import {fetchPlaylistFirestore, fetchAlbumFirestore, fetchTrackFirestore} from "./firestoreManager"
import {storeUniversalPlaylist} from "./firestoreManager"

import {getSpotifyTrack, getAppleTrack, getSpotifyAlbum, getAppleAlbum, getSpotifyPlaylist, getApplePlaylist} from "./apiManager"

import {spotifyTrackToUniversal, spotifyAlbumToUniversal, spotifyPlaylistToUniversal} from "./convertMusic"
import {appleTrackToUniversal, appleAlbumToUniversal, applePlaylistToUniversal} from "./convertMusic"

import {addPlaylistToLibrarySpotify} from "./libraryManager"
import { APPLE_TOKEN } from './credentials';
// import { app } from 'firebase-admin';
// import { user } from 'firebase-functions/lib/providers/auth';


const fetch = require('cross-fetch')
const cors = require('cors')({origin:true});

//TODO: Unique Errors for different cases  -  (Music Not Found Error)

//Misc Functions

export const getPreview_HTTPS = functions.https.onRequest((req, res)=> {
    return cors(req, res, () => {
        
        let serviceType = req.body.data.serviceType
        let objectType = req.body.data.objectType
        let id = req.body.data.id 
        getPreview(serviceType, objectType, id)
        .then((object:any)=>{
            res.status(200).send(object)
        })
        .catch((error:Error)=>{
            res.status(400).send(error)
        })

        // console.log(req.body)
        // console.log(serviceType, objectType, id)

        // if (serviceType == ServiceType.spotify) {
        //     getSpotifyToken()
        //     .then((spotifyToken:SpotifyToken) =>{
        //         if (objectType == ObjectType.playlist){
        //             getSpotifyPlaylist(id, spotifyToken)
        //             .then((spotifyPlaylist:SpotifyPlaylist) =>{
        //                 res.status(200).send(spotifyPlaylist)
        //             })
        //             .catch((error:Error) =>{
        //                 res.status(400).send(error)
        //             })
        //         } else if (objectType == ObjectType.album){
        //             getSpotifyAlbum(id, spotifyToken)
        //             .then((spotifyAlbum:SpotifyAlbum)=>{
        //                 res.status(200).send(spotifyAlbum)
        //             })
        //             .catch((error:Error) =>{
        //                 console.log(error)
        //                 res.status(400).send(error)
        //             })
        //         } else if (objectType == ObjectType.track){
        //             getSpotifyTrack(id, spotifyToken)
        //             .then((spotifyTrack:SpotifyTrack)=>{
        //                 res.status(200).send(spotifyTrack)
        //             })
        //             .catch((error:Error) =>{
        //                 res.status(400).send(error)
        //             })
        //         } else {
        //             res.status(400).send('Bad Info')
        //         }
        //     })
        //     .catch((error:Error) =>{
        //         res.status(400).send(error)
        //     })
            
        // } else if (serviceType == ServiceType.apple) {
        //     if (objectType == ObjectType.playlist){
        //         getApplePlaylist(id)
        //         .then((applePlaylist:ApplePlaylist) => {
        //             res.status(200).send(applePlaylist)
        //         })
        //         .catch((error:Error) =>{
        //             console.log(error)
        //             res.status(400).send(error)
        //         })
        //     } else if (objectType == ObjectType.album){
        //         getAppleAlbum(id)
        //         .then((appleAlbum:AppleAlbum) => {
        //             res.status(200).send(appleAlbum)
        //         })
        //         .catch((error:Error) =>{
        //             console.log(error)
        //             res.status(400).send(error)
        //         })
        //     } else if (objectType == ObjectType.track){
        //         getAppleTrack(id)
        //         .then((appleTrack:AppleTrack) => {
        //             res.status(200).send(appleTrack)
        //         })
        //         .catch((error:Error) =>{
        //             res.status(400).send(error)
        //         })
        //     } else {
        //         res.status(400).send('BAD INFO')
        //     }
        // }
    })  
});

function getPreview (serviceType: string, objectType: string, id: string):any{
    return new Promise (function (resolve, reject) {
        // let serviceType = req.body.data.serviceType
        // let objectType = req.body.data.objectType
        // let id = req.body.data.id 

        // console.log(req.body)
        // console.log(serviceType, objectType, id)

        if (serviceType == ServiceType.spotify) {
            getSpotifyToken()
            .then((spotifyToken:SpotifyToken) =>{
                if (objectType == ObjectType.playlist){
                    getSpotifyPlaylist(id, spotifyToken)
                    .then((spotifyPlaylist:SpotifyPlaylist) =>{
                        resolve(spotifyPlaylist)
                        // res.status(200).send(spotifyPlaylist)
                    })
                    .catch((error:Error) =>{
                        reject(error)
                        // res.status(400).send(error)
                    })
                } else if (objectType == ObjectType.album){
                    getSpotifyAlbum(id, spotifyToken)
                    .then((spotifyAlbum:SpotifyAlbum)=>{
                        resolve(spotifyAlbum)
                        // res.status(200).send(spotifyAlbum)
                    })
                    .catch((error:Error) =>{
                        // console.log(error)
                        reject(error)
                        // res.status(400).send(error)
                    })
                } else if (objectType == ObjectType.track){
                    getSpotifyTrack(id, spotifyToken)
                    .then((spotifyTrack:SpotifyTrack)=>{
                        resolve(spotifyTrack)
                        // res.status(200).send(spotifyTrack)
                    })
                    .catch((error:Error) =>{
                        reject(error)
                        // res.status(400).send(error)
                    })
                } else {
                    reject()
                    // res.status(400).send('Bad Info')
                }
            })
            .catch((error:Error) =>{
                reject(error)
                // res.status(400).send(error)
            })
            
        } else if (serviceType == ServiceType.apple) {
            if (objectType == ObjectType.playlist){
                getApplePlaylist(id)
                .then((applePlaylist:ApplePlaylist) => {
                    resolve(applePlaylist)
                    // res.status(200).send(applePlaylist)
                })
                .catch((error:Error) =>{
                    // console.log(error)
                    reject(error)
                    // res.status(400).send(error)
                })
            } else if (objectType == ObjectType.album){
                getAppleAlbum(id)
                .then((appleAlbum:AppleAlbum) => {
                    resolve(appleAlbum)
                    // res.status(200).send(appleAlbum)
                })
                .catch((error:Error) =>{
                    reject(error)
                    // console.log(error)
                    // res.status(400).send(error)
                })
            } else if (objectType == ObjectType.track){
                getAppleTrack(id)
                .then((appleTrack:AppleTrack) => {
                    resolve(appleTrack)
                    // res.status(200).send(appleTrack)
                })
                .catch((error:Error) =>{
                    reject(error)
                    // res.status(400).send(error)
                })
            } else {
                reject()
                // res.status(400).send('BAD INFO')
            }
        }
    })
}

export const convertObject = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        let serviceType = req.body.serviceType
        let objectType = req.body.objectType
        let id = req.body.id 

        getSpotifyToken()
        .then((spotifyToken:SpotifyToken) =>{
            if (serviceType == ServiceType.spotify) {
                if (objectType == ObjectType.playlist){
                    spotifyPlaylistToUniversal(id, spotifyToken)
                    .then((universalPlaylist:UniversalPlaylist) =>{
                        storeUniversalPlaylist(universalPlaylist)
                        .then( (docId:any) => {
                            universalPlaylist.id = docId
                            res.status(200).send(universalPlaylist)
                        })
                        .catch((error:Error) =>{
                            res.status(400).send(error)
                        })
                    })
                    .catch((error:Error) =>{
                        console.log(error)
                        res.status(500).send(error)
                    })
                } else if (objectType == ObjectType.album){
                    spotifyAlbumToUniversal(id, spotifyToken)
                    .then((universalAlbum:UniversalAlbum)=>{
                        res.status(200).send(universalAlbum)
                    })
                    .catch((error:Error)=>{
                        console.log(error)
                        res.status(400).send(error)
                    })
                } else if (objectType == ObjectType.track){
                    spotifyTrackToUniversal(id, spotifyToken)
                    .then((universalTrack:UniversalTrack)=>{
                        res.status(200).send(universalTrack)
                    })
                    .catch((error:Error)=>{
                        console.log(error)
                        res.status(400).send(error)

                    })
                } else {
                    res.status(400).send('Bad Info')
                }  
            } else if (serviceType == ServiceType.apple) {
                if (objectType == ObjectType.playlist){
                    applePlaylistToUniversal(id, spotifyToken)
                    .then((universalPlaylist:UniversalPlaylist) =>{
                        storeUniversalPlaylist(universalPlaylist)
                        .then( (docId:any) => {
                            universalPlaylist.id = docId
                            res.status(200).send(universalPlaylist)
                        })
                        .catch((error:Error) =>{
                            res.status(400).send(error)
                        })
                    })
                    .catch((error:Error) =>{
                        res.status(400).send(error)
                    })
                } else if (objectType == ObjectType.album){
                    appleAlbumToUniversal(id, spotifyToken)
                    .then((universalAlbum:UniversalAlbum)=>{
                        res.status(200).send(universalAlbum)
                    })
                    .catch((error:Error)=>{
                        console.log(error)
                        res.status(400).send(error)
                    })
                } else if (objectType == ObjectType.track){
                    appleTrackToUniversal(id, spotifyToken)
                    .then((universalTrack:UniversalTrack)=>{
                        res.status(200).send(universalTrack)
                    })
                    .catch((error:Error)=>{
                        console.log(error)
                        res.status(400).send(error)

                    })
                } else {
                    res.status(502).send('Bad Info')
                }
            }
        })
        .catch((error:Error) =>{
            res.status(503).send(error)
        })
    })  
})

//Firestore Functions

export const fetchPlaylist = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        fetchPlaylistFirestore(req.body.id)
        .then((docData: any) =>{
            res.status(200).send(docData)
        })
        .catch((error:Error) =>{
            res.status(400).send(error)
        })
    })
})

export const fetchTrack = functions.https.onRequest((req,res) =>{
    return cors(req, res, () => {
        fetchTrackFirestore(req.body.id)
        .then((docData: any) =>{
            res.status(200).send(docData)
        })
        .catch((error:Error) =>{
            res.status(400).send(error)
        })
    })
})

export const fetchAlbum = functions.https.onRequest((req,res) =>{
    return cors(req, res, () => {
        fetchAlbumFirestore(req.body.id)
        .then((docData: any) =>{
            res.status(200).send(docData)
        })
        .catch((error:Error) =>{
            res.status(400).send(error)
        })
    })
})

//Library Functions

//Spotify
export const getSpotifyAuthUrl = functions.https.onRequest((req, res) =>{
    return cors(req, res, () => {
        let url = getSpotifyAuthCodeUrl()
        res.status(200).send(url)
    })
})

//TODO: Something is wrong here with cors, come back to it
export const test = functions.https.onRequest((req, res) =>{
    return cors(req, res, () => {
        let authCode = req.body.authorizationCode
        let playlist = new JsonUniversalPlaylist(req.body.playlistData)
        addPlaylistToLibrarySpotify(authCode, playlist)
        .then(()=>{
            res.status(200).send()
        })
        .catch((error:Error) =>{
            console.log(error)
            res.status(400).send(error)
        })
    })
})

//Apple 

export const addPlaylistToApple = functions.https.onRequest((req, res) =>{
    return cors(req, res, () => {
        const url = 'https://api.music.apple.com/v1/me/library/playlists'
        let userToken = req.body.userToken
        let playlistData = req.body.playlistData
        var trackDataArray  = Array<any>()
        for (let track of playlistData.tracks){
            let trackData = {
                "id": track.appleId,
                "type":"songs"
            }
            trackDataArray.push(trackData)
        }
        let data = {
            "attributes":{
               "name":playlistData.name,
               "description":playlistData.description
            },
            "relationships":{
               "tracks":{
                  "data": trackDataArray
               }
            }
        }

        const options = {
            method: 'POST',
            headers: {
                'Music-User-Token': userToken,
                Authorization: `Bearer ${APPLE_TOKEN}`,
                "Content-Type": 'application/json',
            },
            body: JSON.stringify(data)
        };
    
        fetch(url, options)
        .then( (res:any) => res.JSON())
        .then( (data:any) => {
            console.log("return", data)
        })
        .catch((error:Error) => {
            console.log("error", error)
        })

    })
})

exports.getPreview = functions.https.onCall((data, context) => {
    let serviceType = data.serviceType
    let objectType = data.objectType
    let id = data.id 
    return new Promise(function(resolve, reject){
        getPreview(serviceType, objectType, id)
        .then((object:any)=>{
            resolve (JSON.stringify(object))
        })
        .catch((error:Error)=>{
            reject(error)
        })
    })
    // .then()
    // return {
    //     firstNumber: 1,
    //     secondNumber: 2,
    //     operator: '+',
    //     operationResult: 3 + 5,
    //   };
});