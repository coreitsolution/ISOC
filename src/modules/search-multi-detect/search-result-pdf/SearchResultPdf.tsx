import pdfMake from "pdfmake/build/pdfmake";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Types
import { MultiDetectData } from "../../../features/search/SearchTypes";

// Utils
import { loadFont, loadImageAsBase64 } from "../../../utils/commonFunction";

export const generateSearchResultPdfBlob = async (
  data: MultiDetectData[],
  t: (key: string) => string,
  i18n: any,
  fileUrl: string
): Promise<Blob> => {

  // Load Sarabun fonts
  const [reg, bold, semi] = await Promise.all([
    loadFont("/fonts/Sarabun-Regular.ttf"),
    loadFont("/fonts/Sarabun-Bold.ttf"),
    loadFont("/fonts/Sarabun-SemiBold.ttf")
  ]);

  pdfMake.vfs = { "Sarabun-R.ttf": reg, "Sarabun-B.ttf": bold, "Sarabun-S.ttf": semi };
  pdfMake.fonts = { Sarabun: { normal: "Sarabun-R.ttf", bold: "Sarabun-B.ttf", bolditalics: "Sarabun-S.ttf" }};

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

  const imageResults = await Promise.all(
    data.map(item => {
      const cleanFileUrl = fileUrl.endsWith('/') ? fileUrl.slice(0, -1) : fileUrl;
      const imageUrl = item.image_url ? `${cleanFileUrl}${item.image_url}` : "/images/no_image.png";
      const overviewUrl = item.picture_url ? `${cleanFileUrl}${item.picture_url}` : "/images/no_image.png";
      return Promise.all([loadImageAsBase64(imageUrl), loadImageAsBase64(overviewUrl)]);
    })
  );

  for (let i = 0; i < data.length; i++) {
    try {
      const item = data[i];
      const [imageBase64, overviewBase64] = imageResults[i];

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
                  {
                    image: imageBase64,
                    width: 90,
                    height: 90,
                    margin: [0, 5, 0, 5],
                  },
                  {
                    image: overviewBase64,
                    width: 90,
                    height: 90,
                    margin: [2, 5, 0, 5],
                  },
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
    }
    catch (err) {
      console.error("PDF item failed:", data[i].capture_time, err);
      continue;
    }
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
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      const timeout = setTimeout(() => reject(new Error("PDF generation timeout")), 180000);

      pdfDoc.getBlob((blob) => {
        clearTimeout(timeout);
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const downloadSearchResultPdf = async (
  data: MultiDetectData[],
  fileName: string,
  t: (key: string) => string,
  i18n: any,
  fileUrl: string
) => {
  try {
    const blob = await generateSearchResultPdfBlob(data, t, i18n, fileUrl);
    saveAs(blob, fileName);
  } 
  catch (err) {
    console.error("Download failed:", err);
  }
};