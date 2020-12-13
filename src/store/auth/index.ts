import { getType } from "typesafe-actions"
import * as actions from "../actions"
import { AuthAction, AuthState } from "./types"

const initialState: AuthState = {
  isLogon: false,
  authStatus: "",
}

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case getType(actions.authSuccess):
      return { ...state, authStatus: "success", isLogon: true }
    case getType(actions.authFailure):
      return { ...state, authStatus: "failure", isLogon: false }
    default:
      return state
  }
}

export default authReducer