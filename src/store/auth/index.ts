import { getType } from "typesafe-actions"
import * as actions from "../actions"
import { AuthAction, AuthState } from "./types"

const initialState: AuthState = {
  isLogon: false,
  authStatus: "",
  error: "",
  token: "",
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
        error: "",
        token: action.payload,
      }
    case getType(actions.authFailure):
      return {
        ...state,
        authStatus: "failure",
        isLogon: false,
        error: action.payload,
        token: "",
      }
    case getType(actions.logout):
      return {
        ...state,
        token: "",
        isLogon: false,
        authStatus: "failure",
        error: "",
      }
    default:
      return state
  }
}

export default authReducer
