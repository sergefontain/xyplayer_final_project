import { ActionType } from "typesafe-actions"
import * as actions from "../actions"

export type MainAction = ActionType<typeof actions>

export interface ID3 {
  title: string
  artist: string
  album: string
  year: string
  genre: string
  trackNumber: string
}

export interface Image {
  _id: string
  text: string
  url: string
  originalFileName: string
  userAvatar: User
  owner: User
}

export interface User {
  _id: string
  nick: string
  createdAt: string
  login: string
  avatar: Image
}

export interface Playlist {
  _id: string
  name: string
  owner: User
  tracks: Array<Track>
}
export interface Track {
  [x:string]: string | User | ID3 | Array<Playlist> | undefined | null
  originalFileName?: string | undefined | null
  _id: string
  url?: string | undefined | null
  owner: User
  id3?: ID3 | undefined
  playlists: Array<Playlist>
}

export interface PlaylistsFind {
  map: any
  length: number
  PlaylistFind?: Array<Playlist> | undefined
}

export interface TracksFind {
  TrackFind?: Array<Track> | undefined
  PlaylistFindOne?: Playlist | undefined
}

export interface MainState {
  playlists: PlaylistsFind
  error: string
  queryStatus: string
  pageLimitOverload: boolean
  currentPlaylistPage: number
  creationStatus: boolean
  preCreateError: string
  deleteTrackError: string
  deleteTrackStatus: string
  playlistOwnerId: string
  userId: string
  tracksArrToUpload: any
  tracksUploadStatus: string
  tracksArrToUploadReady: any
  unsortedTracksArr: Array<Track>
  playlistBackendSortRule: string
  trackOrderToPlay: string
  trackPageLimitOverload: boolean
  currentTrackPage: number
  playlistIdOld: string
  searchStatus: string
  clearStatus: boolean
}
