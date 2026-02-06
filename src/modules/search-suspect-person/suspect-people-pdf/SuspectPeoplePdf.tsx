import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

// Types
import {
  SuspectPersonSearch
} from "../../../features/search/SearchTypes"

// Utils
import {
  reformatString,
  getImageFormat,
  loadFont,
  getPersonTypeColor
} from "../../../utils/commonFunction"

export const generateSearchResultPdfBlob = async (
  data: SuspectPersonSearch[],
  t: (key: string) => string,
  i18n: any,
) => {

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  try {
    const regularFontBase64 = await loadFont("/fonts/Sarabun-Regular.ttf");
    const boldFontBase64 = await loadFont("/fonts/Sarabun-Bold.ttf");
    const semiBoldFontBase64 = await loadFont("/fonts/Sarabun-SemiBold.ttf");

    doc.addFileToVFS("Sarabun-Regular.ttf", regularFontBase64);
    doc.addFileToVFS("Sarabun-Bold.ttf", boldFontBase64);
    doc.addFileToVFS("Sarabun-SemiBold.ttf", semiBoldFontBase64);

    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
    doc.addFont("Sarabun-SemiBold.ttf", "Sarabun", "semi-bold");

    doc.setFont("Sarabun", "normal");
  } catch (error) {
    console.warn("Failed to load Thai fonts, using default:", error);
  }

  // Page Header
  const addHeader = (pageNum: number, totalPages: number) => {
    doc.addImage("/project-logo/pdf-logo.png", "JPEG", 8, 3, 18, 15);
    doc.setFont("Sarabun", "semi-bold");
    doc.setTextColor("#2A2C2E");
    doc.setFontSize(12);
    doc.text(`${pageNum}/${totalPages}`, pageWidth - 5, 8, { align: "right" });
    doc.setFont("Sarabun", "semi-bold");
    doc.setFontSize(15);
    doc.text(t("pdf.suspect-people"), pageWidth / 2, 25, { align: "center" });
  };

  const itemsPerPage = 4;

  const totalItems = data.reduce(
    (sum, parent) => sum + (parent.dss_data?.length ?? 0),
    0
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  let y = 35;
  let currentPage = 1;
  addHeader(currentPage, totalPages);

  let renderedCount = 0;

  data.forEach((parent) => {
    const sortedChildren = [...parent.dss_data].sort(
      (a, b) => Number(b.captureTime) * 1000 - Number(a.captureTime) * 1000
    );

    sortedChildren.forEach((child) => {
      const remarkText = parent.behavior || "-";
      const remarkList = doc.setFont("Sarabun", "normal").setFontSize(12).splitTextToSize(remarkText, 130);
      
      const plusY = remarkList.length > 5 ? remarkList.length - 5 : 0;

      // Box outline
      doc.setDrawColor("#777777");
      doc.rect(5, y - 5, pageWidth - 10, (plusY * 6) + 58);

      // Box outline (Images)
      doc.setDrawColor("#777777");
      const imageBoxWidth = 35;
      doc.rect(5, y - 5, imageBoxWidth, (plusY * 6) + 58);

      // Images
      const detectImage = child.faceBase64 ? child.faceBase64 : "/images/no_image.png";
      const personImage = child.pictureBase64 ? child.pictureBase64 : "/images/no_image.png";
      const imageX = 10;
      const imageY = y - 3 + (plusY * 4);
      const imageWidth = 24;
      const imageHeight = 24;

      doc.addImage(detectImage, getImageFormat(detectImage), imageX, imageY, imageWidth, imageHeight);
      doc.addImage(personImage, getImageFormat(personImage), imageX, imageY + imageHeight + 0.5, imageWidth, imageHeight);

      // Matched Percent - centered under image
      doc.setFontSize(10);
      doc.setFont("Sarabun", "normal");
      const text = `${t('text.percentage-match')} : ${child.similarity ? `${child.similarity} %`: "-"}`;

      // Calculate center X of image box
      const percentTextX = 5 + imageBoxWidth / 2; 
      const percentTextY = imageY + 0.5 + (imageHeight * 2) + 4;

      doc.text(text, percentTextX, percentTextY, { align: "center" });

      // Box outline rectangle
      doc.setFillColor("#C5C8CB");
      doc.rect(40, y - 5, 165, 12, "F");

      // Box outline
      doc.setDrawColor("#777777");
      doc.rect(40, y - 5, 165, 12);

      // Status
      doc.setFontSize(12);
      doc.setFont("Sarabun", "bold");

      const { backgroundColor } = getPersonTypeColor(parent.person_class ?? "");

      // Rectangle properties
      const rectX = 44;
      const rectY = y - 3.5;
      const rectWidth = 28;
      const rectHeight = 8;

      doc.setFillColor(backgroundColor);
      doc.setTextColor("#000000");

      // Draw filled rectangle
      doc.roundedRect(rectX, rectY, rectWidth, rectHeight, 1, 1, "F");

      // value of the text
      const label = parent.person_class
        ? reformatString(parent.person_class)
        : t('text.normal');

      // measure text width
      const textWidth = doc.getTextWidth(label);

      const textX = rectX + (rectWidth - textWidth) / 2;
      const textY = rectY + (rectHeight / 2) + 1.5;

      // draw centered text
      doc.text(label, textX, textY);

      doc.setTextColor("#4A4A4A");
      doc.setFont("Sarabun", "normal");
      doc.text(dayjs.unix(Number(child.captureTime)).format("DD/MM/YYYY HH:mm"), 90, y + 2);
      doc.text(`${t('text.checkpoint')} : ${child.baseCamera?.camera_name || "-"}`, pageWidth - 70, y + 2);

      // Suspect Person info
      doc.setFont("Sarabun", "bold");
      doc.text(`${parent.title_name}${parent.firstname} ${parent.lastname}`, (pageWidth / 2) - 62, y + 16);
      // Owner info
      doc.setFont("Sarabun", "normal");
      doc.text(`${t('text.owner-name-2')} : ${parent.case_owner_name} ${parent.case_owner_phone}`, (pageWidth / 2) - 5, y + 16);
      // Behavior
      remarkList.forEach((line: string, idx: number) => {
        const prefix = idx === 0 ? `${t("text.behavior")} : ` : "";
        doc.text(prefix + line, idx === 0 ? (pageWidth / 2) - 62 : i18n.language === "th" ? (pageWidth / 2) - 40 : (pageWidth / 2) - 42, y + 24 + idx * 6);
      });
      
      y += (plusY * 6) + 60;

      renderedCount++;
      // Page break
      if (y > 270 && renderedCount < totalItems) {
        doc.addPage();
        currentPage++;
        y = 40;
        addHeader(currentPage, totalPages);
      }
    })
  });

  return doc.output("blob");
};

export const downloadSearchResultPdf = async (
  data: SuspectPersonSearch[],
  fileName: string,
  t: (key: string) => string,
  i18n: any,
) => {
  const blob = await generateSearchResultPdfBlob(data, t, i18n);
  saveAs(blob, fileName);
};