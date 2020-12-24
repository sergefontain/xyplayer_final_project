import { createAction } from "typesafe-actions"
import { PlaylistsFind, TracksFind } from "./main/types"

interface Credentials {
  login: string
  password: string
}

// ./authReducer
export const authRequest = createAction("auth/LOGIN_REQUEST")<Credentials>()
export const authSuccess = createAction("auth/SUCCESS")<string>()
export const authFailure = createAction("auth/FAILURE")<string>()
export const logout = createAction("auth/LOGOUT")()
export const regRequest = createAction("auth/REGISTRATION")<Credentials>()

// ./playerReducer
export const savingVolValue = createAction(
  "player/VOL_SAVING_SUCCEED"
)<number>()
export const savingCurrTime = createAction(
  "player/CURR_TIME_SAVING_SUCCEED"
)<number>()

// ./mainReducer
export const getPlaylistsReq = createAction("main/GET_PLAYLISTS_REQUEST")()
export const getTracksReq = createAction("main/GET_TRACKS_REQUEST")<string>()
export const getPlaylistsOk = createAction(
  "main/GET_PLAYLISTS_SUCCESS"
)<PlaylistsFind>()
export const getTracksOk = createAction("main/GET_TRACKS_SUCCESS")<TracksFind>()
export const getPlaylistsTracksFail = createAction(
  "main/GET_PLAYLISTS_TRACKS_FAILURE"
)<string>()

export const prevPlaylistPage = createAction(
  "main/PREV_PLAYLIST_PAGE"
)<string>()
export const nextPlaylistPage = createAction(
  "main/NEXT_PLAYLIST_PAGE"
)<string>()
export const setPlaylistPageLength = createAction(
  "main/SET_PLAYLIST_LENGTH"
)<number>()
export const setSkippedPlaylistsData = createAction(
  "main/SET_SKIPPED_PLAYLIST_DATA"
)<number>()
export const setPageLimit = createAction("main/SET_PAGE_LIMIT")<number>()
export const setLimitOverloaded = createAction(
  "main/SET_LIMIT_OVERLOAD"
)<boolean>()

export const preCreatePlaylist = createAction("main/GET_TRACKS_ID")<
  Array<any>
>()

export const createPlaylistReq = createAction("main/CREATE_PLAYLIST")<Object>()
export const createPlaylistSuccess = createAction(
  "main/PLAYLIST_CREATION_SUCCEED"
)()
export const createPlaylistFailure = createAction(
  "main/PLAYLIST_CREATION_FAILURE"
)<string>()


export const deleteTrackReq = createAction("main/DELETE_TRACK")<string>()
export const deleteTrackSuccess = createAction(
  "main/DELETE_TRACK_SUCCEED"
)()
export const deleteTrackFailure = createAction(
  "main/DELETE_TRACK_FAILURE"
)()
export const getPlaylistOwnerId = createAction("main/GET_PLAYLIST_OWNER_ID")<string>()
export const getUserId = createAction("main/GET_USER_ID")<string>()