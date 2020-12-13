import { getType } from "typesafe-actions"
import { PlayerAction, PlayerState } from "./types"
import * as actions from "../actions"

const initialState: PlayerState = {
  volValue: 0,
  currTime: 0
}

const playerReducer = (
  state: PlayerState = initialState,
  action: PlayerAction
): PlayerState => {
  switch (action.type) {
    case getType(actions.savingVolValue):
      return { ...state, volValue: action.payload }
      case getType(actions.savingCurrTime):
      return { ...state, currTime: action.payload }
    default:
      return state
  }
}

export default playerReducer
