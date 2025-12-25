import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

// Constants
import { Status } from "../../constants/statusEnum";

// API
import { fetchMachineId } from "../../features/license-verify/licenseVerifyApi";

interface LicenseVerifyState {
  machineId: string | null;
  licenseVerifyStatus: Status;
  licenseVerifyError: string | null;
}

const initialState: LicenseVerifyState = {
  machineId: null,
  licenseVerifyStatus: Status.IDLE,
  licenseVerifyError: null,
}

export const fetchMachineIdThunk = createAsyncThunk(
  "licenseVerify/fetchMachineId",
  async () => {
    const response = await fetchMachineId();
    return response;
  }
);

const licenseVerifySlice = createSlice({
  name: "licenseVerify",
  initialState,
  reducers: {
    setMachineId: (state, action: PayloadAction<string>) => {
      state.machineId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachineIdThunk.pending, (state) => {
        state.licenseVerifyStatus = Status.LOADING;
        state.licenseVerifyError = null;
      })
      .addCase(fetchMachineIdThunk.fulfilled, (state, action) => {
        state.licenseVerifyStatus = Status.SUCCEEDED;
        state.machineId = action.payload.machineId;
      })
      .addCase(fetchMachineIdThunk.rejected, (state, action) => {
        state.licenseVerifyStatus = Status.FAILED;
        state.licenseVerifyError = action.error.message || "Failed to fetch machine ID";
      });
  },
})

export const { setMachineId } = licenseVerifySlice.actions;
export default licenseVerifySlice.reducer;