import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Map as LeafletMap } from "leaflet";

// Material UI
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

// Types
import {
  Camera,
  CameraResponse,
  CameraFace,
  CameraFaceResponse,
} from "../../features/types";
import {
  Districts,
  SubDistricts,
  DistrictsResponse,
  SubDistrictsResponse,
} from "../../features/dropdown/dropdownTypes";

// Components
import AutoComplete from "../../components/auto-complete/AutoComplete";
import MultiSelect from "../../components/multi-select/MultiSelect";
import MultiGroupSelectCameras, {
  GroupedOption,
} from "../../components/multi-select/MultiGroupSelectCameras";
import BaseMap from "../../components/base-map/BaseMap";
import Loading from "../../components/loading/Loading";

// Icons
import { MousePointerClick } from "lucide-react";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// Config
import { getUrls } from "../../config/runtimeConfig";

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";

// i18n
import { useTranslation } from "react-i18next";

interface FormData {
  province_code: string;
  district_code: string;
}

interface SearchAllCamerasProps {
  open: boolean;
  selectedCameras: (cameraSelected: GroupedOption[]) => void;
  onClose: () => void;
}

const SearchAllCameras: React.FC<SearchAllCamerasProps> = ({
  open,
  onClose,
  selectedCameras,
}) => {
  const { CENTER_API } = getUrls();
  const { t, i18n } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Dropdown options
  const [provincesOptions, setProvincesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [districtsOptions, setDistrictsOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [subDistrictsOptions, setSubDistrictsOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // Camera
  const [cameraList, setCameraList] = useState<(Camera | CameraFace)[]>([]);
  const [camerasOption, setCamerasOption] = useState<GroupedOption[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<
    GroupedOption[]
  >([]);

  // Other data
  const [districtsList, setDistrictsList] = useState<Districts[]>([]);
  const [subDistrictsList, setSubDistrictsList] = useState<SubDistricts[]>([]);
  const [selectedSubDistrictObjects, setSelectedSubDistrictObjects] = useState<
    { value: any; label: string }[]
  >([]);

  const [formData, setFormData] = useState<FormData>({
    province_code: "",
    district_code: "",
  });

  const { searchCameras, clearSearchPlaces, isSearching } =
    useMapSearch(map);

  useEffect(() => {
    return () => clearData();
  }, []);

  useEffect(() => {
    if (open) {
      setDistrictsOptions([{ label: t('dropdown.all'), value: "0" }]);
      setSubDistrictsOptions([{ label: t('dropdown.all'), value: "0" }]);
      setSelectedSubDistrictObjects([{ label: t('dropdown.all'), value: "0" }]);
    }
  }, [i18n.language, open, i18n.isInitialized])

  useEffect(() => {
    if (sliceDropdown.provinces?.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.province_code,
      }));
      setProvincesOptions(options);
    }
  }, [sliceDropdown.provinces, i18n.language]);

  useEffect(() => {
    if (districtsList.length) {
      setDistrictsOptions(
        districtsList.map((row) => ({
          label: i18n.language === "th" ? row.name_th : row.name_en,
          value: row.district_code,
        }))
      );
    }
  }, [districtsList, i18n.language]);

  useEffect(() => {
    if (subDistrictsList.length) {
      setSubDistrictsOptions(
        subDistrictsList.map((row) => ({
          label: row.name_th,
          value: row.subdistrict_code,
        }))
      );
    }
  }, [subDistrictsList]);

  useEffect(() => {
    if (!formData.province_code) return;

    fetchClient<DistrictsResponse>(
      combineURL(CENTER_API, "/districts/get"),
      {
        method: "GET",
        queryParams: {
          filter: `province_code=${formData.province_code}`,
          limit: "100",
        },
      }
    ).then((res) => {
      if (res.success) setDistrictsList(res.data);
    });
  }, [formData.province_code]);

  useEffect(() => {
    if (!formData.district_code) return;

    fetchClient<SubDistrictsResponse>(
      combineURL(CENTER_API, "/subdistricts/get"),
      {
        method: "GET",
        queryParams: {
          filter: `province_code=${formData.province_code},district_code=${formData.district_code}`,
          limit: "100",
        },
      }
    ).then((res) => {
      if (res.success) setSubDistrictsList(res.data);
    });
  }, [formData.district_code]);

  useEffect(() => {
    const valueList = selectedSubDistrictObjects.map((sd) => sd.value);

    const filters: string[] = [];
    if (valueList.length > 0) {
      filters.push(`subdistrict_code=${valueList.join("|")}`);
    }
    if (formData.province_code) {
      filters.push(`province_code=${formData.province_code}`);
    }
    if (formData.district_code) {
      filters.push(`district_code=${formData.district_code}`);
    }

    fetchClient<CameraResponse | CameraFaceResponse>(
      combineURL(CENTER_API, "/cameras/get"),
      {
        method: "GET",
        queryParams: {
          filter: `${filters.join(",")},deleted=false`,
          limit: "1000",
          orderBy: "id.asc",
        },
      }
    ).then((res) => {
      if (res.success) {
        const updated = res.data.map((row) => ({
          ...row,
          group: "lpr" as const,
        }));
        setCameraList((prev) => [...prev, ...updated])
      };
    });

    fetchClient<CameraResponse | CameraFaceResponse>(
      combineURL(CENTER_API, "/base-cameras/get"),
      {
        method: "GET",
        queryParams: {
          filter: `${filters.join(",")},active=true`,
          limit: "1000",
          orderBy: "id.asc",
        },
      }
    ).then((res) => {
      if (res.success) {
        const updated = res.data.map((row) => ({
          ...row,
          mjpeg_stream_url: row.live_stream_url,
          group: "face",
        })) as any;
        setCameraList((prev) => [...prev, ...updated])
      };
    });
  }, [selectedSubDistrictObjects, formData]);

  useEffect(() => {
    if (!cameraList.length) {
      setCamerasOption([]);
      return;
    }

    const options: GroupedOption[] = [
      ...cameraList
        .filter(c => c.group === "lpr")
        .map(c => ({
          value: c.uid,
          label: c.camera_name,
          group: "lpr" as const,
        })),
      ...cameraList
        .filter(c => c.group === "face")
        .map(c => ({
          value: c.uid,
          label: c.camera_name,
          group: "face" as const,
        })),
    ];

    setCamerasOption(options);
  }, [cameraList, i18n.language]);

  useEffect(() => {
    if (camerasOption.length) {
      setSelectedCameraObjects(camerasOption);
    }
  }, [camerasOption]);

  useEffect(() => {
    if (!selectedCameraObjects.length) {
      clearSearchPlaces();
      return;
    }

    const selectedUids = selectedCameraObjects.map((o) => o.value);

    const filtered = cameraList.filter((c) =>
      selectedUids.includes(c.uid)
    );

    const latLng = filtered.map((point) => ({
      location: `${point.latitude}, ${point.longitude}`,
      name: point.camera_name,
    }));

    searchCameras(latLng, "#DD2025", true);
  }, [selectedCameraObjects]);


  useEffect(() => {
    if (isSearching) setIsLoading(true);
    else setTimeout(() => setIsLoading(false), 300);
  }, [isSearching]);

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance);
  }, []);

  const handleProvinceChange = (
    _: React.SyntheticEvent,
    value: { value: any } | null
  ) => {
    setFormData({
      province_code: value?.value || "",
      district_code: "",
    });
    setSubDistrictsList([]);
  };

  const handleDistrictChange = (
    _: React.SyntheticEvent,
    value: { value: any } | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      district_code: value?.value || "",
    }));
    setSubDistrictsList([]);
  };

  const onChangeSubDistrict = (ids: string[]) => {
    const selected = subDistrictsOptions.filter((sd) =>
      ids.includes(sd.value)
    );
    setSelectedSubDistrictObjects(selected);
  };

  const handleCameraChange = (selected: GroupedOption[]) => {
    setSelectedCameraObjects(selected);
  };

  const clearData = () => {
    setFormData({ province_code: "", district_code: "" });
    setSelectedSubDistrictObjects([]);
    setSelectedCameraObjects([]);
    clearSearchPlaces();
    setDistrictsList([]);
    setSubDistrictsList([]);
  };

  const handleSelectClick = () => {
    selectedCameras(selectedCameraObjects);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth="xl" fullWidth>
      <DialogTitle className="bg-black">
        <Typography variant="h5" color="white" className="font-bold">
          {t("screen.search-camera.title")}
        </Typography>
      </DialogTitle>

      <DialogContent className="bg-black">
        {isLoading && <Loading />}

        <div className="grid grid-cols-[20%_20%_auto] gap-x-[100px] gap-y-5 pt-2">
          <AutoComplete
            id="province-select"
            value={formData.province_code}
            onChange={handleProvinceChange}
            options={provincesOptions}
            label={t("component.province")}
            placeholder={t("placeholder.province")}
          />

          <AutoComplete
            id="district-select"
            value={formData.district_code}
            onChange={handleDistrictChange}
            options={districtsOptions}
            label={t("component.district")}
            placeholder={t("placeholder.district")}
            disabled={!formData.province_code}
          />

          <div className="flex flex-col">
            <Typography color="white">
              {t("component.sub-district")}
            </Typography>
            <MultiSelect
              selectedValues={selectedSubDistrictObjects}
              options={subDistrictsOptions}
              onChange={onChangeSubDistrict}
              disabled={!formData.district_code}
            />
          </div>

          <div className="flex flex-col col-span-3 gap-1">
            <Typography color="white">
              {t("component.checkpoint-2")}
            </Typography>
            <MultiGroupSelectCameras
              options={camerasOption}
              selectedValues={selectedCameraObjects}
              onChange={handleCameraChange}
              limitTags={5}
            />
          </div>
        </div>

        <div className="relative h-[55vh] w-full mt-5 border border-[#2B9BED]">
          <BaseMap onMapLoad={handleMapLoad} zoomControl currentLocation />
        </div>

        <div className="flex justify-end gap-x-4 mt-5">
          <Button
            variant="contained"
            startIcon={<MousePointerClick />}
            onClick={handleSelectClick}
          >
            {t("button.choose")}
          </Button>
          <Button variant="outlined" onClick={onClose}>
            {t("button.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchAllCameras;