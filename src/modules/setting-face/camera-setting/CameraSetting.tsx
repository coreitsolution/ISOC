import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useForm } from "react-hook-form";

// Material UI
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Icons
import { Save } from "lucide-react";

// Components
import TextBox from '../../../components/text-box/TextBox';

// i18n
import { useTranslation } from 'react-i18next';

// Types
import { 
  CameraFaceResponse,
  CameraFace,
} from "../../../features/types";

// Utils
import { fetchClient, combineURL } from "../../../utils/fetchClient";
import { PopupMessage } from '../../../utils/popupMessage';

// Config
import { getUrls } from '../../../config/runtimeConfig';

interface FormData {
  uid?: string;
  cameraName: string
  cameraNameDss: string
  latitude: string
  longitude: string
};

interface CameraSettingProps {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  selectedRow: CameraFace | null; 
}

const CameraSetting: React.FC<CameraSettingProps> = ({open, onClose, isEdit, selectedRow}) => {
  const { CENTER_API } = getUrls();
  
  // i18n
  const { t } = useTranslation();

  // State
  const [isSuperUser, setIsSuperUser] = useState(false);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const authData = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    cameraName: "",
    cameraNameDss: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        cameraName: selectedRow.channel_name || "",
        cameraNameDss: selectedRow.camera_name,
        latitude: selectedRow.latitude ? selectedRow.latitude.toString() : "",
        longitude: selectedRow.longitude ? selectedRow.longitude.toString() : "",
      })
      setValue("cameraName", selectedRow.channel_name || "");
      setValue("cameraNameDss", selectedRow.camera_name);
      setValue("latitude", selectedRow.latitude ? selectedRow.latitude.toString() : "");
      setValue("longitude", selectedRow.longitude ? selectedRow.longitude.toString() : "");

      const user_group = sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === authData.authData.userInfo?.user_group_id && userGroup.group_name.toLowerCase() === "super user");
      setIsSuperUser(user_group ? true : false);
    }
  }, [open, selectedRow])

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleCancelClick = () => {
    clearData();
    onClose();
  };

  const onSubmit = async (data: any) => {
    if (selectedRow) {
      updateCamera(data);
    } 
  }

  const updateCamera = async (data: any) => {
    try {
      if (!isDataChanged(data)) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      const body = JSON.stringify({
        uid: selectedRow?.uid,
        ...(
          data.cameraName !== selectedRow?.camera_name 
          && { channel_name: data.cameraName }
        ),
        ...(
          data.latitude !== selectedRow?.latitude
          && { latitude: data.latitude }
        ),
        ...(
          data.longitude !== selectedRow?.longitude
          && { longitude: data.longitude }
        ),
      })

      const response = await fetchClient<CameraFaceResponse>(combineURL(CENTER_API, "/base-cameras/update"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (response.success) {
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const isDataChanged = (data: any) => {
    const isDataChanged =
      data.cameraName !== selectedRow?.camera_name  ||
      data.latitude !== selectedRow?.latitude ||
      data.longitude !== selectedRow?.longitude

    return isDataChanged;
  }

  const clearData = () => {
    setFormData({
      cameraName: "",
      cameraNameDss: "",
      latitude: "",
      longitude: "",
    });
    setValue("cameraName", "");
    setValue("cameraNameDss", "");
    setValue("latitude", "");
    setValue("longitude", "");
    clearErrors();
  }

  return (
    <Dialog id='camera-setting' open={open} maxWidth="lg" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{isEdit ? t('screen.camera-setting.edit-title') : t('screen.camera-setting.add-title')}</Typography>
        </div>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='p-3 border-[#2B9BED] border'>
            <div className='flex flex-col gap-3'>
              {/* Camera Data */}
              <div className='grid grid-cols-2 gap-x-[50px] gap-y-3 mt-3'>
                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="camera-name"
                  label={t('component.camera-name')}
                  value={formData.cameraName}
                  onChange={(event) =>
                    handleTextChange("cameraName", event.target.value)
                  }
                  placeholder={t('placeholder.camera-name')}
                  register={register("cameraName", { 
                    required: false,
                  })}
                  error={!!errors.cameraName}
                />

                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="camera-name-from-dss"
                  label={t('component.camera-name-from-dss')}
                  value={formData.cameraNameDss}
                  onChange={(event) =>
                    handleTextChange("cameraNameDss", event.target.value)
                  }
                  placeholder={t('placeholder.camera-name-from-dss')}
                  register={register("cameraNameDss", { 
                    required: false,
                  })}
                  disabled={true}
                  error={!!errors.cameraNameDss}
                />

                <div className='col-start-1'>
                  <TextBox
                    id="latitude"
                    label={t('component.location-latitude')}
                    placeholder={t('placeholder.location-latitude')}
                    value={formData.latitude}
                    onChange={(event) =>
                      handleTextChange("latitude", event.target.value)
                    }
                    sx={{ marginTop: "10px", fontSize: "15px" }}
                    register={register("latitude", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.latitude}
                  />
                </div>

                <TextBox
                  id="longitude"
                  label={t('component.location-longitude')}
                  placeholder={t('placeholder.location-longitude')}
                  value={formData.longitude}
                  onChange={(event) =>
                    handleTextChange("longitude", event.target.value)
                  }
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  register={register("longitude", { 
                    required: isEdit && isSuperUser,
                  })}
                  error={!!errors.longitude}
                />
              </div>
            </div>
          </div>
          {/* Button Part */}
          <div className='flex justify-end w-full mt-5 gap-3'>
            <Button
              type='submit'
              variant="contained"
              className="primary-btn"
              startIcon={ <Save />}
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
            >
              {t('button.save')}
            </Button>

            <Button
              variant="text"
              className="cancel-btn"
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              onClick={handleCancelClick}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CameraSetting;