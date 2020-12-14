import { ActionType } from "typesafe-actions"
import * as actions from "../actions"

export interface PlayerState {
    volValue: number
}

export type PlayerAction = ActionType<typeof actions>