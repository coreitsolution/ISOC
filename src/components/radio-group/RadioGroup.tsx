import React from "react";

// Material UI
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export type RadioData = {
  label: string;
  value: number;
};

type RadioGroupComponentProps = {
  groupName: string;
  radioData: RadioData[];
  value: number;
  onChange: (value: number) => void;
  row?: boolean;
};

const RadioGroupComponent: React.FC<RadioGroupComponentProps> = ({
  groupName,
  radioData,
  value,
  onChange,
  row = true,
}) => {
  return (
    <FormControl>
      <div className="flex items-center gap-3">
        <FormLabel sx={{ color: "white" }}>
          {groupName}
        </FormLabel>

        <RadioGroup
          name={groupName}
          row={row}
          value={value.toString()}
          onChange={(e) => onChange(Number(e.target.value))}
        >
          {radioData.map((data) => (
            <FormControlLabel
              key={data.value}
              value={data.value.toString()}
              control={<Radio sx={{ color: "white" }} />}
              label={data.label}
            />
          ))}
        </RadioGroup>
      </div>
    </FormControl>
  );
};

export default RadioGroupComponent;