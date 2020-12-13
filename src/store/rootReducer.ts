import { combineReducers } from "redux"
import {EmptyAction} from 'typesafe-actions'
import authReducer from "./auth"
import playerReducer from "./player"
import { PlayerAction } from "./player/types"

const rootReducer = combineReducers({
    auth: authReducer,
    play: playerReducer
})
  
  
export type RootState = ReturnType<typeof rootReducer>
export type RootAction = EmptyAction<string> | PlayerAction
  
export default rootReducer