import { getType } from "typesafe-actions"
import * as actions from "../actions"
import { AuthAction, AuthState } from "./types"

const initialState: AuthState = {
  authStatus: "",
  isLogon: false,
  token: "",
  error: "",
}

const authReducer = (
  state: AuthState = initialState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case getType(actions.authSuccess):
      return {
        ...state,
        authStatus: "success",
        isLogon: true,
        token: action.payload,
        error: "",
      }
    case getType(actions.authFailure):
      return {
        ...state,
        authStatus: "failure",
        isLogon: false,
        error: action.payload,
        token: "",
      }
      case getType(actions.setEmptyAuthStatus):
      return {
        ...state,
        authStatus: "",
      }
    case getType(actions.logout):
      return {
        ...state,
        authStatus: "",
        isLogon: false,
        token: "",
        error: "",
      }
    default:
      return state
  }
}

export default authReducer
