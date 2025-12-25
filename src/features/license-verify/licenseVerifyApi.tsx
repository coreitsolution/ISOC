// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient"

import {
  MachineIdResponse,
} from "../types";

export const fetchMachineId = async (): Promise<MachineIdResponse> => {
  const { CENTER_API } = getUrls();
  return await fetchClient<MachineIdResponse>(combineURL(CENTER_API, "/checkpoints/machine-id"), {
    method: "GET",
  });
}