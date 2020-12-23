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
  originalFileName: string
  _id: string
  url: string
  owner: User
  id3: ID3
  playlists: Array<Playlist>
}

export interface PlaylistsFind {
  length: number
  PlaylistFind: Array<Playlist>
}

export interface TracksFind {
  TrackFind: Array<Track>
  PlaylistFindOne: Playlist
}

export interface MainState {
  playlists: PlaylistsFind | null
  error: string
  queryStatus: string
  tracks: TracksFind | null
  playlistPage: number
  pageLimitOverload: boolean
  currentPlaylistPage: string
  formData: Object
  creationStatus: boolean
  preCreateError: string
}
