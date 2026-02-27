import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../../constants/statusEnum";
import { RealTimeLprData, RealTimeFaceData, HumanDetection, VehicleDetection } from "../../features/types";

interface RealtimeDataState {
  realtimeData: (RealTimeLprData | RealTimeFaceData)[];
  multiRealtimeData: (HumanDetection | VehicleDetection)[];
  toastNotification: (RealTimeLprData | RealTimeFaceData)[];
  realtimeDataStatus: Status;
  realtimeDataError: string | null;
}

const initialState: RealtimeDataState = {
  realtimeData: [],
  multiRealtimeData: [],
  toastNotification: [],
  realtimeDataStatus: Status.IDLE,
  realtimeDataError: null,
}

const realtimeDataSlice = createSlice({
  name: "realtimeData",
  initialState,
  reducers: {
    upsertRealtimeData: (state, action: PayloadAction<RealTimeLprData | RealTimeFaceData>) => {
      const newItem = action.payload;
      
      const exists = state.realtimeData.some((d) => d.id === newItem.id);
      if (exists) return;

      state.realtimeData.unshift(newItem);

      const cameraItemsIndices = state.realtimeData
        .map((item, index) => (item.camera_uid === newItem.camera_uid ? index : -1))
        .filter((index) => index !== -1);

      if (cameraItemsIndices.length > 20) {
        const oldestIndexForThisCamera = cameraItemsIndices[cameraItemsIndices.length - 1];
        state.realtimeData.splice(oldestIndexForThisCamera, 1);
      }

      if (state.realtimeData.length > 1000) {
        state.realtimeData.pop();
      }
    },
    upsertMultiRealtimeData: (state, action: PayloadAction<HumanDetection | VehicleDetection>) => {
      const newItem = action.payload;
      
      const exists = state.multiRealtimeData.some((d) => d.id === newItem.id);
      if (exists) return;

      state.multiRealtimeData.unshift(newItem);

      const cameraItemsIndices = state.multiRealtimeData
        .map((item, index) => (item.channel_id === newItem.channel_id ? index : -1))
        .filter((index) => index !== -1);

      if (cameraItemsIndices.length > 20) {
        const oldestIndexForThisCamera = cameraItemsIndices[cameraItemsIndices.length - 1];
        state.multiRealtimeData.splice(oldestIndexForThisCamera, 1);
      }

      if (state.multiRealtimeData.length > 1000) {
        state.multiRealtimeData.pop();
      }
    },
    addToastMessage: (state, action: PayloadAction<RealTimeLprData | RealTimeFaceData>) => {
      const exists = state.toastNotification.some(t => t.id === action.payload.id);
      if (!exists) {
        state.toastNotification.push(action.payload);
      }
    },
    updateToastMessage: (state, action: PayloadAction<(RealTimeLprData | RealTimeFaceData)[]>) => {
      state.toastNotification = action.payload;
    },
  },
})

export const { upsertRealtimeData, addToastMessage, updateToastMessage, upsertMultiRealtimeData } = realtimeDataSlice.actions;
export default realtimeDataSlice.reducer;