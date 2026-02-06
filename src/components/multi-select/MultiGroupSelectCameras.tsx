import React from "react";
import {
  Autocomplete,
  TextField,
  Checkbox,
  Chip,
  ListSubheader,
  IconButton,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import PinGoogleMap from "../../assets/icons/pin_google-maps.png";
import { useTranslation } from "react-i18next";

export interface GroupedOption {
  value: string;
  label: string;
  group: "lpr" | "face";
}

interface MultiGroupSelectCamerasProps {
  options: GroupedOption[];
  selectedValues: GroupedOption[];
  onChange: (values: GroupedOption[]) => void;
  sx?: object;
  limitTags?: number;
  error?: boolean;
  placeHolder?: string;
  isLocationButton?: boolean;
  onIconClick?: () => void;
  disabled?: boolean;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const MultiGroupSelectCameras: React.FC<MultiGroupSelectCamerasProps> = ({
  options,
  selectedValues,
  onChange,
  sx,
  limitTags = 1,
  error = false,
  placeHolder,
  onIconClick,
  isLocationButton = false,
  disabled,
}) => {
  const { t } = useTranslation();

  const isGroupSelected = (group: string) => {
    const groupItems = options.filter((o) => o.group === group);
    const selectedInGroup = selectedValues.filter((s) => s.group === group);
    return groupItems.length > 0 && groupItems.length === selectedInGroup.length;
  };

  const handleToggleGroup = (group: string) => {
    const groupItems = options.filter((o) => o.group === group);
    const otherGroups = selectedValues.filter((s) => s.group !== group);

    if (isGroupSelected(group)) {
      onChange(otherGroups);
    } else {
      onChange([...otherGroups, ...groupItems]);
    }
  };

  const handleSelectionChange = (
    _: React.SyntheticEvent,
    newValue: GroupedOption[]
  ) => {
    if (newValue.length === 0) {
      onChange(options);
      return;
    }

    onChange(newValue);
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={selectedValues}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
      onChange={handleSelectionChange}
      sx={{
        borderRadius: "5px",
        backgroundColor: "white",
        "& .MuiInputBase-root": { 
          minHeight: "40px",
          maxHeight: "40px",
          padding: "2px 8px",
      },
        ...sx,
      }}
      renderGroup={(params) => {
        const groupLabel = params.group === "lpr" ? t("dropdown.lpr-all-text") : t("dropdown.face-all-text");
        const checked = isGroupSelected(params.group);

        return (
          <div key={params.key}>
            <ListSubheader
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                lineHeight: "48px",
                color: "black",
                fontWeight: "bold",
                backgroundColor: "#f9f9f9",
                fontSize: "16px",
              }}
              onClick={() => handleToggleGroup(params.group)}
            >
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                checked={checked}
                indeterminate={
                    selectedValues.some(s => s.group === params.group) && !checked
                }
                sx={{ mr: 1 }}
              />
              {groupLabel}
            </ListSubheader>
            {params.children}
          </div>
        );
      }}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.value} style={{ paddingLeft: "30px" }}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
            sx={{ mr: 1 }}
          />
          {option.label}
        </li>
      )}
      renderTags={(tagValue, getTagProps) => {
        const allTags: { label: string; value: string }[] = [];
        const individualTags: { label: string; value: string }[] = [];

        ["lpr", "face"].forEach((g) => {
          if (isGroupSelected(g)) {
            allTags.push({
              value: `${g}_all`,
              label: g === "lpr" ? t("dropdown.lpr-all-text") : t("dropdown.face-all-text"),
            });
          } else {
            individualTags.push(...tagValue.filter((v) => v.group === g));
          }
        });

        const displayTags = [...allTags, ...individualTags];
        const numTags = displayTags.length;
        const limitTag = limitTags;

        return (
          <>
            {displayTags.slice(0, limitTag).map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.value}
                label={option.label}
                style={{
                  backgroundColor: "rgba(26, 109, 223, 1)",
                  color: "white",
                  borderRadius: "4px",
                }}
              />
            ))}

            {numTags > limitTags && (
              <div className="absolute top-[5px] right-[70px]">{`+${numTags - limitTags}`}</div>
            )}
          </>
        );
      }}
      renderInput={(params) => (
        <div style={{ position: "relative", width: "100%" }}>
          <TextField
            {...params}
            error={error}
            placeholder={selectedValues.length === 0 ? placeHolder || t("placeholder.checkpoint-2") : ""}
          />
          {isLocationButton && (
            <IconButton
              onClick={onIconClick}
              sx={{ position: "absolute", right: "25px", top: "50%", transform: "translateY(-50%)" }}
            >
              <img src={PinGoogleMap} alt="map" className="w-[25px] h-[25px]" />
            </IconButton>
          )}
        </div>
      )}
    />
  );
};

export default MultiGroupSelectCameras;