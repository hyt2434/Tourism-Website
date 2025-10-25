// Mock data for Admin Page
export const mockTours = [
  {
    id: 1,
    name: "Tour Hạ Long 2N1Đ",
    provider: "VietTravel Co.",
    status: "pending",
    price: "2,500,000đ",
    startDate: "2025-11-01",
  },
  {
    id: 2,
    name: "Tour Sapa 3N2Đ",
    provider: "Asia Travel",
    status: "approved",
    price: "3,800,000đ",
    startDate: "2025-11-05",
  },
  {
    id: 3,
    name: "Tour Phú Quốc 4N3Đ",
    provider: "Sea Paradise",
    status: "hidden",
    price: "5,200,000đ",
    startDate: "2025-11-10",
  },
];

export const mockAccommodations = [
  {
    id: 1,
    name: "Khách sạn Mường Thanh",
    location: "Hà Nội",
    status: "approved",
    rating: 4.5,
    rooms: 120,
  },
  {
    id: 2,
    name: "Resort Diamond Bay",
    location: "Nha Trang",
    status: "pending",
    rating: 5.0,
    rooms: 85,
  },
];

export const mockTransport = [
  {
    id: 1,
    name: "Xe Phương Trang",
    route: "Sài Gòn - Đà Lạt",
    status: "approved",
    type: "Limousine",
    seats: 24,
  },
  {
    id: 2,
    name: "Xe Hoàng Long",
    route: "Hà Nội - Hạ Long",
    status: "pending",
    type: "Ghế ngồi",
    seats: 45,
  },
];

export const mockPromotions = [
  {
    id: 1,
    code: "SUMMER2025",
    discount: "20%",
    uses: 145,
    maxUses: 500,
    status: "active",
    validUntil: "2025-12-31",
  },
  {
    id: 2,
    code: "NEWUSER",
    discount: "100,000đ",
    uses: 89,
    maxUses: 200,
    status: "active",
    validUntil: "2025-11-30",
  },
];

export const mockOrders = [
  {
    id: "ORD001",
    customer: "Nguyễn Văn A",
    service: "Tour Hạ Long 2N1Đ",
    amount: "2,500,000đ",
    status: "completed",
    date: "2025-10-20",
  },
  {
    id: "ORD002",
    customer: "Trần Thị B",
    service: "Tour Sapa 3N2Đ",
    amount: "3,800,000đ",
    status: "pending",
    date: "2025-10-23",
  },
  {
    id: "ORD003",
    customer: "Lê Văn C",
    service: "Tour Phú Quốc 4N3Đ",
    amount: "5,200,000đ",
    status: "refund_requested",
    date: "2025-10-22",
  },
];

export const mockSocialPosts = [
  {
    id: 1,
    user: "Minh Hoàng",
    content: "Hành trình tuyệt vời tại Hạ Long #HaLongTour",
    status: "pending",
    reports: 0,
    date: "2025-10-24",
  },
  {
    id: 2,
    user: "Thu Hà",
    content: "Sapa mùa này đẹp lắm! #SapaTour",
    status: "approved",
    reports: 0,
    date: "2025-10-23",
  },
  {
    id: 3,
    user: "Quốc Anh",
    content: "Phú Quốc thiên đường #PhuQuocResort",
    status: "pending",
    reports: 2,
    date: "2025-10-24",
  },
];

export const getStatusBadge = (status) => {
  const variants = {
    pending: { variant: "secondary", text: "Chờ duyệt" },
    approved: { variant: "default", text: "Đã duyệt" },
    hidden: { variant: "outline", text: "Đã ẩn" },
    active: { variant: "default", text: "Đang chạy" },
    completed: { variant: "default", text: "Hoàn thành" },
    refund_requested: { variant: "destructive", text: "Yêu cầu hoàn tiền" },
  };
  return variants[status] || variants.pending;
};
