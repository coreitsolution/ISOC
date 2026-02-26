// Types
import { UserGroup } from "../features/dropdown/dropdownTypes";

export const mockUserGroups: UserGroup[] = [
  {
    id: 1,
    group_name: "Admin Group",
    description: "Full access to all features",
    permissions: {
      center: {
        realtime: {
          select: true,
        },
        conditionSearch: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        suspectPersonManage: {
          select: true,
        },
        suspectPersonSearch: {
          select: true,
        },
        manageUser: {
          select: true,
        },
        setting: {
          select: true,
        },
        manageCheckpointCameras: {
          select: true,
        },
        settingFace: {
          select: true,
        },
        multiDetectSearch: {
          select: true,
        },
        multiRealtime: {
          select: true,
        },
      },
      checkpoint: {
        realtime: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        specialPlateSearch: {
          select: true,
        },
        setting: {
          select: true,
        },
      },
    },
    visible: true,
    active: true,
  },
  {
    id: 2,
    group_name: "Editor Group",
    description: "Can view and update content",
    permissions: {
      center: {
        realtime: {
          select: true,
        },
        conditionSearch: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        suspectPersonManage: {
          select: true,
        },
        suspectPersonSearch: {
          select: true,
        },
        manageUser: {
          select: true,
        },
        setting: {
          select: true,
        },
        manageCheckpointCameras: {
          select: true,
        },
        settingFace: {
          select: true,
        },
        multiDetectSearch: {
          select: true,
        },
        multiRealtime: {
          select: true,
        },
      },
      checkpoint: {
        realtime: {
          select: true,
        },
        setting: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        specialPlateSearch: {
          select: true,
        },
      },
    },
    visible: true,
    active: true,
  },
  {
    id: 3,
    group_name: "Viewer Group",
    description: "Read-only access",
    permissions: {
      center: {
        realtime: {
          select: true,
        },
        conditionSearch: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        suspectPersonManage: {
          select: true,
        },
        suspectPersonSearch: {
          select: true,
        },
        manageUser: {
          select: true,
        },
        setting: {
          select: true,
        },
        manageCheckpointCameras: {
          select: true,
        },
        settingFace: {
          select: true,
        },
        multiDetectSearch: {
          select: true,
        },
        multiRealtime: {
          select: true,
        },
      },
      checkpoint: {
        realtime: {
          select: true,
        },
        setting: {
          select: true,
        },
        specialPlateManage: {
          select: true,
        },
        specialPlateSearch: {
          select: true,
        },
      },
    },
    visible: false,
    active: false,
  }
];
