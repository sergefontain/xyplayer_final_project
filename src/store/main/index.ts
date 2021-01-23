import { getType } from "typesafe-actions"
import * as actions from "../actions"
import { MainAction, MainState } from "./types"

const initialState: MainState = {
  playlists: [],
  error: "",
  queryStatus: "idle",
  pageLimitOverload: false,
  currentPlaylistPage: 0,
  creationStatus: false,
  preCreateError: "",
  deleteTrackError: "",
  deleteTrackStatus: "",
  playlistOwnerId: "",
  userId: "",
  tracksArrToUpload: [],
  tracksArrToUploadReady: [],
  tracksUploadStatus: "",
  unsortedTracksArr: [],
  playlistBackendSortRule: "1",
  trackOrderToPlay: "",
  trackPageLimitOverload: false,
  currentTrackPage: 0,
  playlistIdOld: "",
  searchStatus: "",
}

const mainReducer = (
  state: MainState = initialState,
  action: MainAction
): MainState => {
  switch (action.type) {
    case getType(actions.setSearchStatus):
      return {
        ...state,
        searchStatus: action.payload,
      }
    case getType(actions.getPlaylistIdOld):
      return {
        ...state,
        playlistIdOld: action.payload,
      }
    case getType(actions.setPlaylistBackendSortRule):
      return {
        ...state,
        playlistBackendSortRule: action.payload,
      }
    case getType(actions.setTrackOrderToPlay):
      return {
        ...state,
        trackOrderToPlay: action.payload,
      }
    case getType(actions.createUnsortedTracksArr):
      return {
        ...state,
        unsortedTracksArr: action.payload,
      }
    case getType(actions.getUserId):
      return {
        ...state,
        userId: action.payload,
      }
    case getType(actions.getPlaylistOwnerId):
      return {
        ...state,
        playlistOwnerId: action.payload,
      }
    case getType(actions.getPlaylistsReq):
      return {
        ...state,
        queryStatus: "playlists_pending",
      }
    case getType(actions.getTracksReq):
      return {
        ...state,
        queryStatus: "tracks_pending",
      }
    case getType(actions.getPlaylistsOk):
      return {
        ...state,
        error: "",
        playlists: action.payload,
        queryStatus: "playlists_succeed",
      }
    case getType(actions.getTracksOk):
      return {
        ...state,
        error: "",
        queryStatus: "tracks_succeed",
      }
    case getType(actions.getPlaylistsTracksFail):
      return {
        ...state,
        error: action.payload,
        queryStatus: "failure",
      }
    case getType(actions.setPlaylistsPendingStatus):
      return {
        ...state,
        queryStatus: "playlists_pending",
      }
    // case getType(actions.setTracksPendingStatus):
    //   return {
    //     ...state,
    //     queryStatus: "tracks_pending",
    //   }
    case getType(actions.setPlaylistPage):
      return {
        ...state,
        currentPlaylistPage: action.payload,
      }

    case getType(actions.prevPlaylistPage):
      return {
        ...state,
        currentPlaylistPage: state.currentPlaylistPage - 1,
      }
    case getType(actions.nextPlaylistPage):
      return {
        ...state,
        currentPlaylistPage: state.currentPlaylistPage + 1,
      }
    case getType(actions.setLimitOverloaded):
      return {
        ...state,
        pageLimitOverload: action.payload,
      }
    case getType(actions.setTrackPage):
      return {
        ...state,
        currentTrackPage: action.payload,
      }

    case getType(actions.prevTrackPage):
      return {
        ...state,
        currentTrackPage: state.currentTrackPage - 1,
      }
    case getType(actions.nextTrackPage):
      return {
        ...state,
        currentTrackPage: state.currentTrackPage + 1,
      }
    case getType(actions.setTrackPageLimitOverloaded):
      return {
        ...state,
        trackPageLimitOverload: action.payload,
      }
    case getType(actions.createPlaylistSuccess):
      return {
        ...state,
        creationStatus: true,
        preCreateError: "",
        currentPlaylistPage: 0,
      }
    case getType(actions.setCreatePlaylistStatus):
      return {
        ...state,
        creationStatus: action.payload,
      }
    case getType(actions.createPlaylistFailure):
      return {
        ...state,
        creationStatus: false,
        preCreateError: "creation_failed",
      }
    case getType(actions.deleteTrackSuccess):
      return {
        ...state,
        deleteTrackStatus: "ok",
      }
    case getType(actions.deleteTrackFailure):
      return {
        ...state,
        deleteTrackError: "fail",
      }
    case getType(actions.createTracksArrayOk):
      return {
        ...state,
        tracksArrToUploadReady: action.payload,
        tracksUploadStatus: "ok",
      }

    case getType(actions.createTracksArrayFail):
      return {
        ...state,
        tracksUploadStatus: "fail",
      }
    default:
      return state
  }
}

export default mainReducer
