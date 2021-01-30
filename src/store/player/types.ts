import { ActionType } from "typesafe-actions"
import * as actions from "../actions"

export interface PlayerState {
  volValue: number
  playingStatus: string
  playingTrackIndex: number
  playingTrackArr: Array<HTMLDivElement>
  turnOnTracksPlay: boolean
  currTime: number
  turnOnShufflePlay: boolean
  shuffleStartTrackOriginName: string | null
  playState: string
  playingMode: string
  newArrRequest: string
  currArrRequest: boolean
  alertStatus: boolean
}

export type PlayerAction = ActionType<typeof actions>
