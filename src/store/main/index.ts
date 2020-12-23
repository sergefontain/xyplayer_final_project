import { getType } from "typesafe-actions"
import * as actions from "../actions"
import { MainAction, MainState } from "./types"

const initialState: MainState = {
  playlists: null,
  error: "",
  queryStatus: "idle",
  tracks: null,
  playlistPage: 0,
  pageLimitOverload: false,
  currentPlaylistPage: "1",
  formData: {},
  creationStatus: false,
  preCreateError: "",
}

const mainReducer = (
  state: MainState = initialState,
  action: MainAction
): MainState => {
  switch (action.type) {
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
        tracks: action.payload,
      }
    case getType(actions.getPlaylistsTracksFail):
      return {
        ...state,
        error: action.payload,
        queryStatus: "failure",
      }
    case getType(actions.prevPlaylistPage):
      return {
        ...state,
        currentPlaylistPage: action.payload,
      }
    case getType(actions.nextPlaylistPage):
      return {
        ...state,
        currentPlaylistPage: action.payload,
      }
    case getType(actions.setLimitOverloaded):
      return {
        ...state,
        pageLimitOverload: action.payload,
      }
      case getType(actions.createPlaylistSuccess):
      return {
        ...state,
        creationStatus: true,
        preCreateError: "",
      }
      case getType(actions.createPlaylistFailure):
      return {
        ...state,
        creationStatus: false,
        preCreateError: action.payload,
      }
    case getType(actions.createPlaylistReq):
      return {
        ...state,
        formData: action.payload,
      }
    default:
      return state
  }
}

export default mainReducer
