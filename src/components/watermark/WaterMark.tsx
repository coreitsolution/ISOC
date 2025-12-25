import React from "react";
import "./Watermark.css";

// Icons
import { TriangleAlert } from "lucide-react";

interface WatermarkProps {
  text: string;
}

const Watermark: React.FC<WatermarkProps> = ({ text }) => {
  return (
    <div className="app-watermark">
      <div className="flex justify-center items-center gap-1">
        <TriangleAlert color="white" className="w-6 h-6 opacity-[0.35]"/>
        {text}
      </div>
    </div>
  );
};

export default Watermark;