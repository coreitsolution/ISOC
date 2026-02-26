import pdfMake from "pdfmake/build/pdfmake";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Types
import { MultiDetectData } from "../../../features/search/SearchTypes";

// Utils
import { loadFont } from "../../../utils/commonFunction";

export const generateSearchResultPdfBlob = async (
  data: MultiDetectData[],
  t: (key: string) => string,
  i18n: any,
  fileUrl: string
): Promise<Blob> => {

  // Load Sarabun fonts
  const regularFontBase64 = await loadFont("/fonts/Sarabun-Regular.ttf");
  const boldFontBase64 = await loadFont("/fonts/Sarabun-Bold.ttf");
  const semiBoldFontBase64 = await loadFont("/fonts/Sarabun-SemiBold.ttf");

  pdfMake.vfs = {
    "Sarabun-Regular.ttf": regularFontBase64,
    "Sarabun-Bold.ttf": boldFontBase64,
    "Sarabun-SemiBold.ttf": semiBoldFontBase64,
  };

  pdfMake.fonts = {
    Sarabun: {
      normal: "Sarabun-Regular.ttf",
      bold: "Sarabun-Bold.ttf",
      bolditalics: "Sarabun-SemiBold.ttf",
    },
  };

  const content: any[] = [];

  // Header
  content.push({
    columns: [
      {
        image: await loadImageAsBase64("/project-logo/pdf-logo.png"),
        width: 80,
      },
      {
        text: t("pdf.search-multi-detect"),
        alignment: "center",
        fontSize: 16,
        bold: true,
        margin: [0, 20, 0, 0],
      },
    ],
    margin: [0, 0, 0, 20],
  });

  for (const item of data) {

    const image = item.image_url
      ? `${fileUrl}${item.image_url}`
      : "/images/no_image.png";

    const overviewImage = item.picture_url
      ? `${fileUrl}${item.picture_url}`
      : "/images/no_image.png";

    const imageBase64 = await loadImageAsBase64(image);
    const overviewBase64 = await loadImageAsBase64(overviewImage);

    const infoBlock: any[] = [];

    if (item.object_type === "human") {
      infoBlock.push({
        columns: [
          `${t("text.age")} : ${item.details.age} ${t("text.years")}`,
          `${t("text.gender")} : ${item.details.gender || "-"}`,
          `${t("text.emotion")} : ${item.details.emotion || "-"}`,
        ],
        margin: [5, 0, 0, 0],
      });

      infoBlock.push({
        columns: [
          `${t("text.glasses")} : ${item.details.glasses || "-"}`,
          `${t("text.beard")} : ${item.details.beard || "-"}`,
          `${t("text.mask")} : ${item.details.mask || "-"}`,
        ],
        margin: [5, 0, 0, 0],
      });

      infoBlock.push({
        columns: [
          `${t("text.bag")} : ${item.details.bag || "-"}`,
          `${t("text.bag-type")} : ${item.details.bag_type || "-"}`,
          `${t("text.hat")} : ${item.details.hat || "-"}`,
        ],
        margin: [5, 0, 0, 0],
      });

      infoBlock.push({
        columns: [
          `${t("text.coat")} : ${item.details.coat || "-"}`,
          `${t("text.coat-color")} : ${item.details.coat_color || "-"}`,
          `${t("text.trousers")} : ${item.details.trousers || "-"}`,
        ],
        margin: [5, 0, 0, 0],
      });
    } else {
      infoBlock.push({
        columns: [
          `${t("text.car-brand")} : ${item.details.car_brand || "-"}`,
          `${t("text.car-type")} : ${item.details.car_type || "-"}`,
          `${t("text.car-color")} : ${item.details.car_color || "-"}`,
        ],
        margin: [5, 0, 0, 0],
      });
    }

    content.push({
      margin: [0, 0, 0, 15],
      pageBreak: "avoid",
      table: {
        widths: [185, "*"],
        dontBreakRows: true,
        body: [
          [
            {
              columns: [
                { image: imageBase64, width: 90, height: 90, margin: [0, 5, 0, 5] },
                { image: overviewBase64, width: 90, height: 90, margin: [2, 5, 0, 5] },
              ],
            },
            {
              stack : [
                {
                  table: {
                    widths: ["*"],
                    dontBreakRows: true,
                    body: [
                      [
                        {
                          columns: [
                            {
                              text:
                                item.object_type === "human"
                                  ? t("text.human")
                                  : t("text.vehicle"),
                              bold: true,
                            },
                            {
                              text: i18n.language === "th" ? dayjs(item.capture_time).locale("th").format(
                                "DD/MM/BBBB HH:mm"
                              ) : dayjs(item.capture_time).format("DD/MM/YYYY HH:mm"),
                            },
                            {
                              text: `${t("text.checkpoint")} : ${
                                item.camera_name || "-"
                              }`,
                            },
                          ],
                          fillColor: "#E4E4E4",
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: (i: number, node: any) =>
                      i === node.table.body.length ? 1 : 0,
                    hLineColor: () => "#777777",
                    vLineWidth: () => 0,
                  },
                  margin: [0, 0, 0, 8],
                },
                ...infoBlock,
              ]
            }
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => "#777777",
        vLineColor: () => "#777777",
        paddingLeft: (i: number) => (i === 1 ? 0 : 4),
        paddingRight: (i: number) => (i === 1 ? 0 : 4),
        paddingTop: () => 0,
      },
    });
  };

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [20, 10, 20, 30],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    content,
    footer: (currentPage: number, pageCount: number) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: "right",
      margin: [0, 10, 40, 0],
    }),
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load image:", error);
    return "";
  }
}

export const downloadSearchResultPdf = async (
  data: MultiDetectData[],
  fileName: string,
  t: (key: string) => string,
  i18n: any,
  fileUrl: string
) => {
  const blob = await generateSearchResultPdfBlob(
    data,
    t,
    i18n,
    fileUrl
  );
  saveAs(blob, fileName);
};