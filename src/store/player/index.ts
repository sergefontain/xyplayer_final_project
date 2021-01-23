import { getType } from "typesafe-actions"
import { PlayerAction, PlayerState } from "./types"
import * as actions from "../actions"

const initialState: PlayerState = {
  volValue: 0,
  playingStatus: "",
  playingTrackIndex: 0,
  playingTrackArr: [],
  turnOnTracksPlay: false,
  currTime: 0,
  turnOnShufflePlay: false,
  shuffleStartTrackOriginName: "",
  playState: "",
  playingMode: "",
  newArrRequest: "",
  alertStatus: false,
}

const playerReducer = (
  state: PlayerState = initialState,
  action: PlayerAction
): PlayerState => {
  switch (action.type) {
    case getType(actions.showAlert):
      return { ...state, alertStatus: action.payload }
    case getType(actions.getNewShuffleTracksPageArr):
      return { ...state, newArrRequest: action.payload }

    case getType(actions.savingVolValue):
      return { ...state, volValue: action.payload }
    case getType(actions.setPlayStateAction):
      return { ...state, playState: action.payload }
    case getType(actions.setTurnOnTracksPlay):
      return {
        ...state,
        turnOnTracksPlay: action.payload,
        playingStatus: "playing",
      }
    case getType(actions.setAutoPlayingStatus):
      return {
        ...state,
        playingStatus: "playing",
      }
    case getType(actions.setTurnOffTracksPlay):
      return {
        ...state,
        turnOnTracksPlay: !action.payload,
        playingStatus: "",
      }
    case getType(actions.setTurnOnShufflePlay):
      return {
        ...state,
        turnOnShufflePlay: action.payload,
        playingStatus: "playing",
      }
    case getType(actions.setTurnOffShufflePlay):
      return {
        ...state,
        turnOnShufflePlay: !action.payload,
        playingStatus: "",
      }
    // case getType(actions.setShuffleStartTrackOrigin):
    //   return { ...state, shuffleStartTrackOriginName: action.payload }
    case getType(actions.setPlayerCurrTime):
      return { ...state, currTime: action.payload }
    case getType(actions.setPlayingMode):
      return { ...state, playingMode: action.payload }
    case getType(actions.setPlayingStatus):
      return {
        ...state,
        playingStatus: action.payload,
        playingTrackIndex: action.meta !== undefined ? action.meta.i : 0,
        playingTrackArr: action.meta !== undefined ? action.meta.arr : [],
      }
    default:
      return state
  }
}

export default playerReducer
