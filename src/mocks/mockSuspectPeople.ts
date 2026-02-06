import { SuspectPeople } from "../features/types";

export const mockSuspectPeople: SuspectPeople[] = [
  {
    id: 1,
    uid: "suspect-001",
    title_id: 1,
    firstname: "สมหมาย",
    lastname: "หมายสม",
    idcard_number: "1234567890123",
    address: "123 หมู่ 5 ต.บางเขน อ.เมือง",
    province_code: "10",
    district_code: "101",
    subdistrict_code: "10101",
    zipcode: "10210",
    image_url: "image.jpg",
    person_class_id: 1,
    dss_orgcode: "1",
    dss_person_id: "1",
    case_number: "CASE12345",
    arrest_warrant_date: "2025-01-01",
    arrest_warrant_expire_date: "2025-12-31",
    behavior: "ลักลอบขนสินค้าเถื่อน",
    case_owner_name: "พ.ต.อ. สมชาย จงรักษ์",
    case_owner_phone: "0812345678",
    images: [{
      "id": 1,
      "uid": "",
      "watchlist_uid": "suspect-001",
      "title": "example string",
      "image_url": "example string",
      "notes": "example string",
      "created_at": "2024-06-07T12:34:56",
      "updated_at": "2024-06-07T12:34:56"
    }],
    files: [
      {
        "id": 1,
        "watchlist_uid": "suspect-001",
        "title": "example string",
        "file_url": "example string",
        "notes": "example string",
        "created_at": "2024-06-07T12:34:56",
        "updated_at": "2024-06-07T12:34:56"
      },
    ],
    visible: true,
    active: true,
    deleted: true,
    notes: "",
    createdAt: "2025-01-01T08:00:00Z",
    updatedAt: "2025-01-01T08:00:00Z",
  },
];