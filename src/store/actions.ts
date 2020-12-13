import { createAction } from "typesafe-actions"

export const authSuccess = createAction("auth/SUCCESS")()

export const authFailure = createAction("auth/FAILURE")()

export const savingVolValue = createAction("player/VOL_SAVING_SUCCEED")<number>()
export const savingCurrTime = createAction("player/CURR_TIME_SAVING_SUCCEED")<number>()
