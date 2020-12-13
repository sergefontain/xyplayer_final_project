import { ActionType } from "typesafe-actions"
import * as actions from "../actions"

export interface PlayerState {
    volValue: number
    currTime: number
}

export type PlayerAction = ActionType<typeof actions>