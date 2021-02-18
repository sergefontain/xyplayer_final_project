import { createAction } from "typesafe-actions"
import { PlaylistsFind, Track } from "./main/types"
import { TrackResolver } from "../components/GetPlaylists"

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
export const setEmptyAuthStatus = createAction("auth/SET_EMPTY_AUTH_STATUS")()

// ./playerReducer
export const savingVolValue = createAction(
  "player/VOL_SAVING_SUCCEED"
)<number>()
export const savingCurrTime = createAction(
  "player/CURR_TIME_SAVING_SUCCEED"
)<number>()
export const setPlayingStatus = createAction("player/SET_PLAYING_STATUS")<
  string,
  | {
      i: number
      arr: Array<HTMLDivElement>
      buttons: TrackResolver["buttonsArr"]
      closeBtnRef: TrackResolver["closeBtnRef"]
      playBtn: HTMLButtonElement | undefined
    }
  | undefined
>()
export const setTracksArrToConstantPlay = createAction(
  "player/SET_TRACKS_TO_CONSTANT_PLAY"
)<Array<HTMLDivElement | null>>()
export const setTurnOnTracksPlay = createAction(
  "player/SET_TURN_ON_TRACKS_PLAY"
)<boolean>()
export const setShowPlaylistTracks = createAction(
  "player/SET_SHOW_PLAYLIST_TRACKS"
)<boolean>()
export const setPlayerCurrTime = createAction(
  "player/SET_CURRENT_TIME"
)<number>()
export const setTurnOnShufflePlay = createAction(
  "player/SET_TURN_ON_SHUFFLE_PLAY"
)<boolean>()
export const setPlayingMode = createAction("player/SET_PLAYING_MODE")<string>()
export const setAutoPlayingStatus = createAction(
  "player/SET_AUTO_PLAYING_STATUS"
)()

export const setTurnOffTracksPlay = createAction(
  "player/SET_TURN_OFF_TRACKS_PLAY"
)<boolean>()
export const setTurnOffShufflePlay = createAction(
  "player/SET_TURN_OFF_SHUFFLE_PLAY"
)<boolean>()
export const setPlayStateAction = createAction(
  "player/SET_TRACK_PLAY_STATE"
)<string>()
export const setInitializePlaySuccess = createAction(
  "player/SET_INITIALIZE_PLAY_SUCCESS"
)<boolean>()
export const setInitializeShuffleSuccess = createAction(
  "player/SET_INITIALIZE_SHUFFLE_SUCCESS"
)<boolean>()
export const getNewShuffleTracksPageArr = createAction(
  "player/GET_NEW_SHUFFLE_TRACKS_PAGE_ARR"
)<string>()
export const setNewShuffleTracksPageArr = createAction(
  "player/SET_NEW_SHUFFLE_TRACKS_PAGE_ARR"
)<Array<HTMLDivElement | null>>()
export const showAlert = createAction("player/SHOW_ALERT")<boolean>()
export const getCurrShuffleTracksPageArr = createAction("player/GET_CURRENT_TRACKS_PAGE_ARRAY")<boolean>()

// ./mainReducer
export const getPlaylistsReq = createAction("main/GET_PLAYLISTS_REQUEST")()
export const getTracksReq = createAction("main/GET_TRACKS_REQUEST")<string>()
export const getPlaylistsOk = createAction(
  "main/GET_PLAYLISTS_SUCCESS"
)<PlaylistsFind>()
export const getTracksOk = createAction("main/GET_TRACKS_SUCCESS")()
export const getPlaylistsTracksFail = createAction(
  "main/GET_PLAYLISTS_TRACKS_FAILURE"
)<string>()

export const prevPlaylistPage = createAction("main/PREV_PLAYLIST_PAGE")()
export const nextPlaylistPage = createAction("main/NEXT_PLAYLIST_PAGE")()
export const setPlaylistPage = createAction("main/SET_PLAYLIST_PAGE")<number>()

export const setPlaylistPageLength = createAction(
  "main/SET_PLAYLIST_LENGTH"
)<number>()
export const setSkippedPlaylistsData = createAction(
  "main/SET_SKIPPED_PLAYLIST_DATA"
)<number>()
export const setLimitOverloaded = createAction(
  "main/SET_LIMIT_OVERLOAD"
)<boolean>()

export const createPlaylistReq = createAction("main/CREATE_PLAYLIST")<{
  name: string
  description: string
}>()
export const createPlaylistSuccess = createAction(
  "main/PLAYLIST_CREATION_SUCCEED"
)()
export const createPlaylistFailure = createAction(
  "main/PLAYLIST_CREATION_FAILURE"
)()
export const setCreatePlaylistStatus = createAction(
  "main/SET_CREATE_PLAYLIST_STATUS"
)<boolean>()

export const deleteTrackReq = createAction("main/DELETE_TRACK")<string>()
export const deleteTrackSuccess = createAction("main/DELETE_TRACK_SUCCEED")()
export const deleteTrackFailure = createAction("main/DELETE_TRACK_FAILURE")()

export const getPlaylistOwnerId = createAction(
  "main/GET_PLAYLIST_OWNER_ID"
)<string>()
export const getUserId = createAction("main/GET_USER_ID")<string>()

export const createTracksArrayReq = createAction(
  "main/GET_UPLOADED_TRACKS"
)<any>()
export const createTracksArrayOk = createAction(
  "main/GET_UPLOADED_TRACKS_OK"
)<any>()
export const createTracksArrayFail = createAction(
  "main/GET_UPLOADED_TRACKS_FAIL"
)()

export const createUnsortedTracksArr = createAction(
  "main/SET_UNSORTED_TRACKS_ARR"
)<Track[]>()

export const setPlaylistBackendSortRule = createAction(
  "main/SET_PLAYLIST_SORT_RULE"
)<string>()

export const setTrackOrderToPlay = createAction(
  "main/SET_TRACK_ORDER_TO_PLAY"
)<string>()
export const setTrackPageLimitOverloaded = createAction(
  "main/SET_TRACK_LIMIT_OVERLOAD"
)<boolean>()

export const prevTrackPage = createAction("main/PREV_TRACK_PAGE")<number>()
export const nextTrackPage = createAction("main/NEXT_TRACK_PAGE")<number>()
export const setTrackPage = createAction("main/SET_TRACK_PAGE")<number>()

export const getPlaylistIdOld = createAction(
  "main/GET_PLAYLIST_ID_OLD"
)<string>()
export const setPlaylistsPendingStatus = createAction(
  "main/SET_PLAYLISTS_PENDING_STATUS"
)()
export const setTracksPendingStatus = createAction(
  "main/SET_TRACKS_PENDING_STATUS"
)()
export const setSearchQueryToSaga = createAction("main/SET_SEARCH_QUERY_TO_SAGA")<RegExp>()
export const updatePlaylistList = createAction("main/UPDATE_PLAYLIST_LIST")<string | null>()
export const setSearchStatus = createAction("main/SET_SEARCH_STATUS")<string>()
export const clearSearchLine = createAction("main/CLEAR_SEARCH_LINE")<boolean>()