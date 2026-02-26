import React from 'react'

// Material UI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type OutlinedContainerProps = {
  title: string;
  borderColor?: string;
  color?: string;
  children?: React.ReactNode;
  height?: number | string;
}

const OutlinedContainer: React.FC<OutlinedContainerProps> = ({
  title,
  borderColor = "#2B9BED",
  color = "white",
  children,
  height = 203,
}) => {
  return (
    <Box
      component="fieldset"
      sx={{
        border: `1px dashed ${borderColor}`,
        borderRadius: 2,
        px: 2,
        py: 1,
        color: color,
        minHeight: 100,
        height: height,
        overflowY: "auto",
      }}
    >
      <Typography
        component="legend"
        sx={{
          px: 1,
          fontSize: 14,
          color: color,
        }}
      >
        {title}
      </Typography>
      
      {children}
    </Box>
  )
}

export default OutlinedContainer;