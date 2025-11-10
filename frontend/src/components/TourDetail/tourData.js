// Dữ liệu các tour du lịch
export const toursData = {
  "halong-hanoi": {
    id: "halong-hanoi",
    title: "Khám phá Việt Nam: Hà Nội & Vịnh Hạ Long",
    location: "Hà Nội & Vịnh Hạ Long, Việt Nam",
    rating: 4.8,
    reviewCount: 324,
    basePrice: 299,
    duration: "5 ngày 4 đêm",
    images: [
      "https://images.unsplash.com/photo-1668000018482-a02acf02b22a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxvbmclMjBiYXklMjB2aWV0bmFtfGVufDF8fHx8MTc2MTY5OTMwMnww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://bcp.cdnchinhphu.vn/344443456812359680/2025/5/31/hanoi-17486566616582033334984.jpg",
      "https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/qmgtdjekctlyucr8itqw/%C4%90%E1%BA%B7t%20tour%20%C4%91i%20V%E1%BB%8Bnh%20H%E1%BA%A1%20Long%20t%E1%BB%AB%20H%C3%A0%20N%E1%BB%99i.jpg",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
      "https://images.unsplash.com/photo-1555577653-094899dad05c?w=800",
      "https://images.unsplash.com/photo-1728468542081-43e31eddf2e8?w=800",
      "https://ik.imagekit.io/tvlk/blog/2022/10/dia-diem-du-lich-ha-noi-1.jpg?tr=dpr-2,w-675",
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800",
    ],
    tags: ["Du lịch văn hóa", "Thiên nhiên", "Ẩm thực", "Nhiếp ảnh"],
    description: {
      overview: "Bắt đầu cuộc hành trình khó quên qua những điểm đến mang tính biểu tượng nhất của Việt Nam. Chuyến phiêu lưu 5 ngày được thiết kế tỉ mỉ này kết hợp những con phố nhộn nhịp của Hà Nội với vẻ đẹp thanh bình của Vịnh Hạ Long, mang đến cho bạn sự pha trộn hoàn hảo giữa văn hóa, lịch sử và kỳ quan thiên nhiên.",
      detail: "Trải nghiệm nét quyến rũ của Phố Cổ Hà Nội, nơi những ngôi đền cổ kính đứng cạnh những khu chợ sôi động và những người bán hàng rong phục vụ một số món ăn ngon nhất thế giới. Sau đó, thoát khỏi khung cảnh kỳ diệu của Vịnh Hạ Long, nơi hàng nghìn hòn đảo đá vôi nhô lên từ làn nước màu ngọc lục bảo, tạo nên một trong những cảnh quan biển ngoạn mục nhất thế giới."
    },
    highlights: [
      "Du nhoàn trên Vịnh Hạ Long bằng thuyền buồm truyền thống",
      "Khám phá Phố Cổ Hà Nội và các di tích lịch sử",
      "Tham quan Văn Miếu Quốc Tử Giám - trường đại học đầu tiên của Việt Nam",
      "Thưởng thức ẩm thực Việt Nam chính gốc và tour ẩm thực đường phố",
      "Trải nghiệm biểu diễn Múa rối nước truyền thống",
      "Lưu trú tại các khách sạn boutique được tuyển chọn kỹ lưỡng",
    ],
    itinerary: [
      {
        day: 1,
        title: "Đến Hà Nội",
        description: "Chào mừng đến Việt Nam! Đưa đón về khách sạn và thưởng thức bữa tối chào mừng với các món ăn truyền thống Việt Nam."
      },
      {
        day: 2,
        title: "Tour Hà Nội",
        description: "Khám phá Phố Cổ, Văn Miếu và thưởng thức chương trình Múa rối nước truyền thống vào buổi tối."
      },
      {
        day: 3,
        title: "Du thuyền Vịnh Hạ Long",
        description: "Hành trình đến Vịnh Hạ Long và lên tàu du thuyền. Tham quan hang động, chèo kayak và ngắm hoàng hôn trên boong tàu."
      },
      {
        day: 4,
        title: "Vịnh Hạ Long & Trở về",
        description: "Tập Thái Cực Quyền buổi sáng trên boong tàu, tham quan làng chài nổi và trở về Hà Nội vào buổi chiều."
      },
      {
        day: 5,
        title: "Khởi hành",
        description: "Thời gian tự do mua sắm phút chót trước khi đưa ra sân bay."
      },
    ],
    included: [
      "4 đêm lưu trú",
      "Ăn sáng hàng ngày",
      "Hướng dẫn viên tiếng Anh chuyên nghiệp",
      "Tất cả phí tham quan",
      "Đưa đón sân bay",
      "Du thuyền Vịnh Hạ Long",
    ],
    excluded: [
      "Vé máy bay quốc tế",
      "Bảo hiểm du lịch",
      "Chi phí cá nhân",
      "Bữa trưa và tối (trừ khi ghi chú)",
      "Tiền tips",
      "Phí visa",
    ],
    hotel: {
      name: "Khách sạn Hanoi Pearl",
      address: "87 Mã Mây, Phố Cổ, Hà Nội",
      description: "Bạn sẽ lưu trú tại Khách sạn Hanoi Pearl, một khách sạn boutique 4 sao ở trung tâm Phố Cổ, chỉ cách vài bước chân đến Hồ Hoàn Kiếm và những nhà hàng tốt nhất thành phố.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863981044554!2d105.84117931533417!3d21.028510885995806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9bd9861ca1%3A0xe7887f7b72ca17a9!2sHanoi%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Nguyễn Minh Anh",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Trải nghiệm tuyệt vời! Tour được tổ chức hoàn hảo, hướng dẫn viên hiểu biết và thân thiện, Vịnh Hạ Long vượt xa mong đợi. Trải nghiệm ẩm thực ở Hà Nội là điểm nhấn!",
        helpful: 42
      },
      {
        name: "Trần Văn Hoàng",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Chuyến đi tuyệt vời nhất! Mọi thứ diễn ra suôn sẻ từ đầu đến cuối. Khách sạn đẹp, du thuyền tuyệt vời, và chúng tôi học được rất nhiều về văn hóa và lịch sử Việt Nam.",
        helpful: 28
      },
      {
        name: "Phạm Thu Hà",
        rating: 4,
        date: "Tháng 8, 2025",
        review: "Tour tuyệt vời với những địa điểm và trải nghiệm tuyệt vời. Chỉ có một lưu ý nhỏ là một số ngày cảm thấy hơi vội, nhưng nhìn chung rất khuyến khích tour này!",
        helpful: 15
      },
    ]
  },
  "danang-hoian": {
    id: "danang-hoian",
    title: "Miền Trung Huyền Bí: Đà Nẵng & Hội An",
    location: "Đà Nẵng & Hội An, Việt Nam",
    rating: 4.9,
    reviewCount: 256,
    basePrice: 349,
    duration: "4 ngày 3 đêm",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1080",
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1080",
      "https://cdn.tcdulichtphcm.vn/upload/3-2023/images/2023-03-14/1678795889-bana-hill-1657161996.jpg",
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1080",
      "https://res.klook.com/image/upload/v1651485064/blog/j6xwdirr0wdtfcwvqhkk.webp",
      "https://images.unsplash.com/photo-1587793258023-48fccfbd075f?w=1080",
      "https://ik.imagekit.io/tvlk/blog/2022/06/shutterstock_1096141979.jpg?tr=dpr-2,w-675",
      "https://top10danang.com/wp-content/uploads/2024/01/bai-tam-my-khe-da-nang.jpg",
    ],
    tags: ["Biển đảo", "Di sản văn hóa", "Nghỉ dưỡng", "Ẩm thực"],
    description: {
      overview: "Khám phá vẻ đẹp quyến rũ của miền Trung Việt Nam với tour 4 ngày tại Đà Nẵng và Hội An. Từ những bãi biển tuyệt đẹp của Đà Nẵng đến phố cổ Hội An được UNESCO công nhận, chuyến đi này mang đến sự kết hợp hoàn hảo giữa thư giãn và khám phá văn hóa.",
      detail: "Tận hưởng bãi biển Mỹ Khê tuyệt đẹp, khám phá Bà Nà Hills với cầu Vàng nổi tiếng, và đắm chìm trong không khí cổ kính của phố cổ Hội An với những ngôi nhà cổ, đèn lồng rực rỡ và ẩm thực đặc sắc. Đừng bỏ lỡ Thánh địa Mỹ Sơn - quần thể đền tháp Chăm Pa cổ kính."
    },
    highlights: [
      "Tham quan Bà Nà Hills và cầu Vàng nổi tiếng thế giới",
      "Khám phá phố cổ Hội An - Di sản văn hóa thế giới UNESCO",
      "Thư giãn tại bãi biển Mỹ Khê - một trong những bãi biển đẹp nhất thế giới",
      "Tham quan Thánh địa Mỹ Sơn - Quần thể đền tháp Chăm Pa",
      "Trải nghiệm làm đèn lồng truyền thống Hội An",
      "Thưởng thức đặc sản Cao Lầu, Mì Quảng và Bánh Bèo",
    ],
    itinerary: [
      {
        day: 1,
        title: "Đến Đà Nẵng",
        description: "Đón sân bay Đà Nẵng, check-in khách sạn. Buổi chiều tự do thư giãn tại bãi biển Mỹ Khê hoặc khám phá chợ Hàn."
      },
      {
        day: 2,
        title: "Tour Bà Nà Hills",
        description: "Tham quan Bà Nà Hills với cầu Vàng, làng Pháp, vườn hoa Le Jardin D'Amour và Fantasy Park. Chiêm ngưỡng toàn cảnh Đà Nẵng từ trên cao."
      },
      {
        day: 3,
        title: "Hội An & Mỹ Sơn",
        description: "Sáng tham quan Thánh địa Mỹ Sơn. Chiều khám phá phố cổ Hội An, chùa Cầu Nhật Bản, nhà cổ Tấn Ký. Tối ngắm đèn lồng và thả hoa đăng trên sông Hoài."
      },
      {
        day: 4,
        title: "Tự do & Khởi hành",
        description: "Buổi sáng tự do mua sắm quà lưu niệm tại Hội An hoặc nghỉ dưỡng tại resort. Đưa ra sân bay Đà Nẵng."
      },
    ],
    included: [
      "3 đêm lưu trú tại khách sạn 4 sao",
      "Ăn sáng buffet hàng ngày",
      "Vé cáp treo Bà Nà Hills",
      "Vé tham quan Mỹ Sơn và Hội An",
      "Hướng dẫn viên chuyên nghiệp",
      "Xe đưa đón theo chương trình",
    ],
    excluded: [
      "Vé máy bay",
      "Bữa trưa và tối",
      "Chi phí cá nhân",
      "Bảo hiểm du lịch",
      "Tiền tips cho HDV và tài xế",
    ],
    hotel: {
      name: "Brilliant Hotel Đà Nẵng",
      address: "220 Võ Nguyên Giáp, Phước Mỹ, Đà Nẵng",
      description: "Khách sạn 4 sao view biển Mỹ Khê, có hồ bơi ngoài trời, spa và nhà hàng phục vụ ẩm thực Việt - Âu. Chỉ 2 phút đi bộ đến biển.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.8984577594087!2d108.2420442!3d16.0716933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c2f81b8d45%3A0x7dafc58f2e1630fd!2sDa%20Nang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Lê Thị Mai",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Hội An đẹp tuyệt vời! Phố cổ về đêm với đèn lồng thật lãng mạn. Cầu Vàng ở Bà Nà cũng đẹp không tưởng. Hướng dẫn viên nhiệt tình, am hiểu.",
        helpful: 38
      },
      {
        name: "Hoàng Minh Tuấn",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Chuyến đi hoàn hảo! Bãi biển Mỹ Khê sạch đẹp, ăn uống ngon. Khách sạn view biển rất đẹp. Sẽ quay lại lần nữa!",
        helpful: 31
      },
      {
        name: "Ngô Văn Đức",
        rating: 5,
        date: "Tháng 8, 2025",
        review: "Thánh địa Mỹ Sơn rất ấn tượng với những tháp Chàm cổ kính. Hội An cũng xinh xắn với nhiều góc check-in đẹp. Tour rất đáng giá tiền!",
        helpful: 24
      },
    ]
  },
  "saigon-mekong": {
    id: "saigon-mekong",
    title: "Miền Nam Sôi Động: Sài Gòn & Đồng Bằng Sông Cửu Long",
    location: "TP. Hồ Chí Minh & Đồng bằng sông Cửu Long, Việt Nam",
    rating: 4.7,
    reviewCount: 189,
    basePrice: 279,
    duration: "4 ngày 3 đêm",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1080",
      "https://www.lottehotel.com/content/dam/lotte-hotel/lotte/saigon/accommodation/standard/deluxeroom/180712-52-2000-acc-saigon-hotel.jpg.thumb.768.768.jpg",
      "https://images.unsplash.com/photo-1626914366294-25e4a8c3e724?w=1080",
      "https://media.travelmedia.vn/destination/dstimgfw_339.jpg",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1080",
      "https://images.unsplash.com/photo-1598946485440-2d4077f8a46f?w=1080",
      "https://th.bing.com/th/id/R.d95de7f82fd8b21ab50ea51a58efd959?rik=DpyOhbIe00zCRA&riu=http%3a%2f%2fhoianexpress.com.vn%2fwp-content%2fuploads%2f2018%2f12%2fcho-noi-cai-rang-can-tho-1.jpg&ehk=vfBcKKXKl36GI8gn95yJDpwgNwHtxaGC%2fQH90XeZPxo%3d&risl=&pid=ImgRaw&r=0",
      "https://baoquangninh.vn/uploads/Image/2022/09/14/1132462baoquangninh-diadaocuchi-14092022.jpg",
    ],
    tags: ["Thành phố", "Văn hóa miền Nam", "Chợ nổi", "Ẩm thực"],
    description: {
      overview: "Trải nghiệm nhịp sống sôi động của Sài Gòn và khám phá vẻ đẹp bình dị của Đồng bằng sông Cửu Long trong tour 4 ngày. Từ những tòa nhà cao tầng hiện đại đến những kênh rạch yên bình, chuyến đi này cho bạn thấy hai mặt đối lập nhưng đều quyến rũ của miền Nam Việt Nam.",
      detail: "Khám phá Dinh Độc Lập, Nhà thờ Đức Bà, Bưu điện Trung tâm và địa đạo Củ Chi. Sau đó đến với miệt vườn sông nước, trải nghiệm chợ nổi Cái Răng, thăm vườn trái cây, thưởng thức đặc sản miền Tây và nghe đờn ca tài tử trên sông."
    },
    highlights: [
      "Tham quan địa đạo Củ Chi - Di tích lịch sử nổi tiếng",
      "Khám phá chợ nổi Cái Răng sôi động vào buổi sáng sớm",
      "Du thuyền trên sông Tiền và sông Hậu",
      "Thăm vườn trái cây và thưởng thức trái cây tươi ngon",
      "Trải nghiệm đờn ca tài tử trên thuyền",
      "Thưởng thức ẩm thực miền Tây: bánh xèo, cá lóc nướng, lẩu mắm",
    ],
    itinerary: [
      {
        day: 1,
        title: "Đến Sài Gòn - City Tour",
        description: "Đón sân bay Tân Sơn Nhất. Tham quan Dinh Độc Lập, Nhà thờ Đức Bà, Bưu điện Trung tâm. Tối dạo phố Bùi Viện hoặc chợ đêm Bến Thành."
      },
      {
        day: 2,
        title: "Địa đạo Củ Chi",
        description: "Khám phá hệ thống địa đạo Củ Chi dài 250km. Xem phim tài liệu, bò qua địa đạo, thử bắn súng AK. Chiều về Sài Gòn, tự do mua sắm."
      },
      {
        day: 3,
        title: "Cần Thơ - Chợ nổi Cái Răng",
        description: "Xuất phát sáng sớm đến Cần Thơ. Tham quan chợ nổi Cái Răng, thăm vườn trái cây, làng nghề bánh tráng. Chiều du thuyền sông Hậu nghe đờn ca tài tử."
      },
      {
        day: 4,
        title: "Mỹ Tho - Sài Gòn",
        description: "Tham quan chùa Vĩnh Tràng, đi thuyền thăm cù lao Thới Sơn, thưởng thức mật ong, kẹo dừa. Trở về Sài Gòn, đưa ra sân bay."
      },
    ],
    included: [
      "3 đêm khách sạn 3-4 sao",
      "Ăn sáng hàng ngày",
      "Xe ô tô máy lạnh đưa đón",
      "Vé tham quan địa đạo Củ Chi",
      "Thuyền tham quan chợ nổi và cù lao",
      "HDV tiếng Việt nhiệt tình",
    ],
    excluded: [
      "Vé máy bay",
      "Bữa trưa và tối",
      "Phí bắn súng tại Củ Chi",
      "Chi phí cá nhân",
      "Bảo hiểm",
    ],
    hotel: {
      name: "Liberty Central Saigon Riverside",
      address: "17 Tôn Đức Thắng, Q.1, TP. Hồ Chí Minh",
      description: "Khách sạn 4 sao view sông Sài Gòn, có rooftop bar, hồ bơi, gần Nhà hát Thành phố và phố đi bộ Nguyễn Huệ. Vị trí thuận tiện di chuyển.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3208689800504!2d106.7012123!3d10.7769256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc1%3A0xfd6b42f88b8b5b4!2sHo%20Chi%20Minh%20City%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Đinh Văn Khoa",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Chợ nổi Cái Răng thật sự ấn tượng! Sáng sớm đi thuyền trên sông, xung quanh toàn thuyền bán trái cây rau củ rất độc đáo. Địa đạo Củ Chi cũng rất hay!",
        helpful: 29
      },
      {
        name: "Vũ Thị Lan",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Tour miền Tây rất vui! Được ăn trái cây tươi ngon, nghe đờn ca tài tử trên thuyền, mọi người rất thân thiện. Ăn uống ngon miệng, giá cả hợp lý.",
        helpful: 22
      },
      {
        name: "Bùi Minh Đức",
        rating: 4,
        date: "Tháng 8, 2025",
        review: "Trải nghiệm tốt, đi được nhiều nơi. Sài Gòn nhộn nhịp, miền Tây yên bình. Nếu có thêm thời gian ở chợ nổi sẽ tuyệt vời hơn. Overall rất recommend!",
        helpful: 18
      },
    ]
  },
  "sapa-hagiang": {
    id: "sapa-hagiang",
    title: "Tây Bắc Hùng Vĩ: Sapa & Hà Giang",
    location: "Sapa & Hà Giang, Việt Nam",
    rating: 4.9,
    reviewCount: 312,
    basePrice: 399,
    duration: "6 ngày 5 đêm",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1080",
      "https://statics.vinpearl.com/du-lich-sapa-2_1631866527.jpg",
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=1080",
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1080",
      "https://ik.imagekit.io/tvlk/blog/2022/07/kinh-nghiem-du-lich-ha-giang-2.jpg?tr=dpr-2,w-675",
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1080",
      "https://dulichkhampha24.com/wp-content/uploads/2020/03/du-lich-ha-giang-11.jpg",
      "https://static.vinwonders.com/production/cot-co-lung-cu-1.jpg",
    ],
    tags: ["Núi non", "Ruộng bậc thang", "Văn hóa dân tộc", "Phượt"],
    description: {
      overview: "Chinh phục vẻ đẹp hùng vĩ của Tây Bắc Việt Nam với hành trình 6 ngày qua Sapa và Hà Giang. Từ những thửa ruộng bậc thang xanh mướt đến cung đường biên giới kỳ vĩ, tour này mang đến trải nghiệm khó quên về thiên nhiên và văn hóa các dân tộc Tây Bắc.",
      detail: "Khám phá thị trấn Sapa mờ sương với đỉnh Fansipan, bản Cát Cát, thác Bạc. Sau đó chinh phục cung đường hạnh phúc Hà Giang với đèo Mã Pì Lèng, cao nguyên đá Đồng Văn, cột cờ Lũng Cú. Trải nghiệm homestay, tìm hiểu văn hóa H'Mông, Tày, Dao."
    },
    highlights: [
      "Chinh phục đỉnh Fansipan - Nóc nhà Đông Dương bằng cáp treo",
      "Khám phá ruộng bậc thang Mù Cang Chải - Di sản quốc gia",
      "Chinh phục đèo Mã Pì Lèng - Một trong tứ đại đỉnh đèo",
      "Đến cột cờ Lũng Cú - Cực Bắc Việt Nam",
      "Trải nghiệm homestay tại bản dân tộc",
      "Thưởng thức đặc sản: thịt trâu gác bếp, rượu ngô, cơm lam",
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Sapa",
        description: "Khởi hành từ Hà Nội, đi qua Yên Bái, ngắm ruộng bậc thang Mù Cang Chải (mùa nước đổ). Chiều đến Sapa, dạo phố, chợ tình Sapa."
      },
      {
        day: 2,
        title: "Fansipan - Bản Cát Cát",
        description: "Chinh phục đỉnh Fansipan 3.143m bằng cáp treo. Chiều thăm bản Cát Cát, thác Bạc, tìm hiểu nghề dệt thổ cẩm của người H'Mông."
      },
      {
        day: 3,
        title: "Sapa - Hà Giang",
        description: "Khởi hành đến Hà Giang qua Lào Cai, Bắc Hà. Check-in khách sạn, tối tự do khám phá phố cổ Hà Giang."
      },
      {
        day: 4,
        title: "Quản Bạ - Yên Minh - Đồng Văn",
        description: "Đi qua cổng trời Quản Bạ, núi đôi Cô Tiên, cao nguyên đá Đồng Văn. Check-in homestay, tối giao lưu văn hóa."
      },
      {
        day: 5,
        title: "Lũng Cú - Mã Pì Lèng",
        description: "Đến cột cờ Lũng Cú - điểm cực Bắc. Chinh phục đèo Mã Pì Lèng hùng vĩ, ngắm sông Nho Quế xanh ngọc bích. Về Hà Giang."
      },
      {
        day: 6,
        title: "Hà Giang - Hà Nội",
        description: "Trở về Hà Nội, nghỉ dọc đường. Kết thúc hành trình đầy ấn tượng."
      },
    ],
    included: [
      "5 đêm khách sạn & homestay",
      "Ăn sáng hàng ngày",
      "Xe ô tô 16-29 chỗ máy lạnh",
      "Vé cáp treo Fansipan",
      "Phí tham quan theo chương trình",
      "HDV theo suốt tuyến",
    ],
    excluded: [
      "Vé máy bay/tàu",
      "Bữa trưa và tối",
      "Xe máy thuê tự phượt Hà Giang",
      "Chi phí cá nhân",
      "Bảo hiểm",
    ],
    hotel: {
      name: "Sapa Horizon Hotel & Homestay Hà Giang",
      address: "Sapa, Lào Cai & Hà Giang",
      description: "Khách sạn 3 sao tại trung tâm Sapa, view núi đẹp. Tại Hà Giang, nghỉ homestay tại bản dân tộc để trải nghiệm văn hóa bản địa.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3699.773421580819!2d103.8407439!3d22.3362744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd412a7b0e5d09%3A0x3508c5e6d36d9e6f!2sSapa%2C%20Lao%20Cai%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Phạm Tuấn Anh",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Cung đường Hà Giang đẹp xuất sắc! Đèo Mã Pì Lèng hiểm trở nhưng cảnh đẹp ngoạn mục. Fansipan cũng rất ấn tượng. Tour đáng đồng tiền bát gạo!",
        helpful: 45
      },
      {
        name: "Trương Thị Hương",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Homestay tại bản dân tộc rất thú vị, được trải nghiệm cuộc sống bản địa, ăn uống đơn giản nhưng ấm cúng. Ruộng bậc thang Mù Cang Chải đẹp mê hồn!",
        helpful: 37
      },
      {
        name: "Nguyễn Đức Long",
        rating: 5,
        date: "Tháng 8, 2025",
        review: "Tour phượt tuyệt vời! HDV nhiệt tình, lái xe an toàn. Cột cờ Lũng Cú, cao nguyên đá Đồng Văn đều rất ấn tượng. Sẽ giới thiệu bạn bè!",
        helpful: 33
      },
    ]
  },
  "phuquoc": {
    id: "phuquoc",
    title: "Thiên Đường Biển Đảo: Phú Quốc",
    location: "Phú Quốc, Kiên Giang, Việt Nam",
    rating: 4.8,
    reviewCount: 278,
    basePrice: 399,
    duration: "4 ngày 3 đêm",
    images: [
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1080",
      "https://static.vinwonders.com/production/bai-sao-phu-quoc-banner.jpg",
      "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1080",
      "https://statics.vinpearl.com/vinwonders-phu-quoc-2_1625911963.jpg",
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1080",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1080",
      "https://static.vinwonders.com/production/hon-thom-phu-quoc-1.jpg",
      "https://ik.imagekit.io/tvlk/blog/2023/01/kinh-nghiem-du-lich-phu-quoc-cover.jpg?tr=dpr-2,w-675",
    ],
    tags: ["Biển đảo", "Nghỉ dưỡng", "Lặn biển", "Resort cao cấp"],
    description: {
      overview: "Trải nghiệm thiên đường nhiệt đới tại đảo ngọc Phú Quốc với tour 4 ngày nghỉ dưỡng. Từ những bãi biển cát trắng tuyệt đẹp đến rừng nguyên sinh và làng chài bình dị, Phú Quốc mang đến sự kết hợp hoàn hảo giữa thiên nhiên hoang sơ và tiện nghi hiện đại.",
      detail: "Khám phá bãi Sao, bãi Dài - những bãi biển đẹp nhất Việt Nam. Tham quan VinWonders, Safari, chợ đêm Phú Quốc. Trải nghiệm lặn ngắm san hô, câu cá, xem hoàng hôn trên biển. Thưởng thức hải sản tươi ngon và ghẹ Hàm Ninh đặc sản."
    },
    highlights: [
      "Tham quan VinWonders Phú Quốc - Công viên chủ đề lớn nhất Việt Nam",
      "Vinpearl Safari - Vườn thú bán hoang dã đầu tiên tại Việt Nam",
      "Lặn biển ngắm san hô tại Nam đảo",
      "Bãi Sao - Bãi biển đẹp nhất Phú Quốc",
      "Khám phá làng chài Hàm Ninh, nhà thùng nước mắm",
      "Cable car Hòn Thơm - Cáp treo vượt biển dài nhất thế giới",
    ],
    itinerary: [
      {
        day: 1,
        title: "Đến Phú Quốc",
        description: "Đón sân bay Phú Quốc, check-in resort. Chiều tự do nghỉ ngơi, tắm biển. Tối dạo chợ đêm Phú Quốc, thưởng thức hải sản."
      },
      {
        day: 2,
        title: "VinWonders & Safari",
        description: "Cả ngày tham quan VinWonders Phú Quốc với các trò chơi hiện đại, Vinpearl Safari xem động vật hoang dã. Tối xem show nhạc nước tại VinWonders."
      },
      {
        day: 3,
        title: "Tour Nam đảo - Lặn biển",
        description: "Khám phá Nam đảo: Bãi Sao, Hòn Móng Tay, Hòn Mây Rút Trong. Lặn ngắm san hô, câu cá. Chiều cáp treo Hòn Thơm ngắm hoàng hôn."
      },
      {
        day: 4,
        title: "Làng chài & Khởi hành",
        description: "Sáng thăm làng chài Hàm Ninh, nhà thùng nước mắm truyền thống. Mua đặc sản Phú Quốc. Đưa ra sân bay."
      },
    ],
    included: [
      "3 đêm resort 4-5 sao gần biển",
      "Ăn sáng buffet hàng ngày",
      "Vé VinWonders + Safari (1 ngày)",
      "Tour Nam đảo + lặn biển",
      "Vé cáp treo Hòn Thơm",
      "Xe đưa đón theo chương trình",
    ],
    excluded: [
      "Vé máy bay",
      "Bữa trưa và tối",
      "Chi phí cá nhân",
      "Bảo hiểm",
      "Thuê thiết bị lặn chuyên nghiệp",
    ],
    hotel: {
      name: "Vinpearl Resort & Spa Phú Quốc",
      address: "Bãi Dài, Gành Dầu, Phú Quốc",
      description: "Resort 5 sao view biển Bãi Dài tuyệt đẹp, có bãi biển riêng, hồ bơi vô cực, spa cao cấp. Vị trí thuận tiện gần VinWonders và Safari.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3927.1!2d103.9668!3d10.2265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a78c62b49eda09%3A0x8aa79fbbdd72cdb!2sPhu%20Quoc%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Nguyễn Thị Hồng",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Phú Quốc đẹp như mơ! Biển xanh cát trắng, resort sang trọng. VinWonders rất vui, Safari cũng hay. Hải sản tươi ngon, giá hợp lý. Sẽ quay lại!",
        helpful: 52
      },
      {
        name: "Trần Minh Quang",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Chuyến đi tuyệt vời! Lặn biển ở Nam đảo thấy san hô rất đẹp. Cáp treo Hòn Thơm view đẹp xuất sắc. HDV nhiệt tình, lịch trình hợp lý.",
        helpful: 41
      },
      {
        name: "Lê Thị Thanh",
        rating: 5,
        date: "Tháng 8, 2025",
        review: "Phú Quốc xứng đáng là thiên đường nghỉ dưỡng! Bãi Sao đẹp như tranh vẽ. Chợ đêm sôi động, nhiều đồ ăn ngon. Resort 5 sao dịch vụ tốt!",
        helpful: 36
      },
    ]
  },
  "nhatrang": {
    id: "nhatrang",
    title: "Vịnh Biển Đẹp: Nha Trang",
    location: "Nha Trang, Khánh Hòa, Việt Nam",
    rating: 4.7,
    reviewCount: 295,
    basePrice: 249,
    duration: "3 ngày 2 đêm",
    images: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1080",
      "https://ik.imagekit.io/tvlk/blog/2022/11/kinh-nghiem-du-lich-nha-trang-1.jpg?tr=dpr-2,w-675",
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1080",
      "https://static.vinwonders.com/production/vinpearl-land-nha-trang-1.jpg",
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1080",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1080",
      "https://statics.vinpearl.com/thap-ba-ponagar-nha-trang-0_1633421963.jpg",
      "https://image.sggp.org.vn/w1000/Uploaded/2024/xbcnfqobxrcb/2022_05_03/z3400699776906-5af3fedb9f3e7f0d57ef8f7c2bff15c1-2592.jpg",
    ],
    tags: ["Biển đảo", "Lặn biển", "Du lịch sinh thái", "Vui chơi giải trí"],
    description: {
      overview: "Khám phá Nha Trang - Thành phố biển xinh đẹp của Việt Nam trong tour 3 ngày sôi động. Với bãi biển dài tuyệt đẹp, các đảo nhiệt đới và đời sống về đêm sôi động, Nha Trang là điểm đến lý tưởng cho cả gia đình và nhóm bạn trẻ.",
      detail: "Tham quan Vinpearl Land, tháp Bà Ponagar, viện hải dương học. Tour 4 đảo với lặn biển, nhảy dù, chèo kayak. Tắm bùn khoáng I-resort, tắm suối khoáng Tháp Bà. Tối thưởng thức hải sản tươi ngon và dạo phố biển Trần Phú."
    },
    highlights: [
      "Vinpearl Land - Công viên giải trí lớn nhất miền Trung",
      "Tour 4 đảo: Hòn Mun, Hòn Tằm, Hòn Một, Hòn Miễu",
      "Lặn biển ngắm san hô tại Hòn Mun",
      "Tắm bùn khoáng tại I-Resort",
      "Tham quan tháp Bà Ponagar, chùa Long Sơn",
      "Dạo biển Trần Phú và thưởng thức hải sản tươi ngon",
    ],
    itinerary: [
      {
        day: 1,
        title: "Đến Nha Trang - City Tour",
        description: "Đón sân bay Cam Ranh, check-in khách sạn. Chiều tham quan tháp Bà Ponagar, chùa Long Sơn. Tối dạo phố biển Trần Phú, ăn hải sản."
      },
      {
        day: 2,
        title: "Tour 4 đảo - Lặn biển",
        description: "Tour 4 đảo: Hòn Mun lặn biển ngắm san hô, Hòn Một tắm biển, Hòn Miễu xem bể cá, Hòn Tằm nghỉ ngơi. Tiệc trên thuyền với rượu vang và nhạc sống."
      },
      {
        day: 3,
        title: "Vinpearl Land & Khởi hành",
        description: "Sáng tắm bùn khoáng I-Resort. Chiều sang Vinpearl Land chơi các trò cảm giác mạnh, tắm biển. Tối đưa ra sân bay."
      },
    ],
    included: [
      "2 đêm khách sạn 3-4 sao gần biển",
      "Ăn sáng hàng ngày",
      "Tour 4 đảo + thiết bị lặn cơ bản",
      "Vé cáp treo + Vinpearl Land",
      "Xe đưa đón sân bay và theo tour",
      "HDV tiếng Việt",
    ],
    excluded: [
      "Vé máy bay",
      "Bữa trưa và tối",
      "Phí tắm bùn I-Resort",
      "Chi phí cá nhân",
      "Bảo hiểm",
    ],
    hotel: {
      name: "Havana Nha Trang Hotel",
      address: "38 Trần Phú, Nha Trang",
      description: "Khách sạn 4 sao ngay trung tâm phố biển Trần Phú, view biển đẹp, có hồ bơi rooftop, nhà hàng. Đi bộ ra biển chỉ 2 phút.",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.7!2d109.1967!3d12.2388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3170677811cc886f%3A0x5c4bbc0aa81edcb9!2sNha%20Trang%2C%20Vietnam!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
    },
    reviews: [
      {
        name: "Võ Minh Tuấn",
        rating: 5,
        date: "Tháng 10, 2025",
        review: "Nha Trang vui lắm! Tour 4 đảo rất hay, lặn thấy san hô đẹp. Vinpearl Land nhiều trò chơi kích thích. Hải sản ngon, giá cả hợp lý. Recommend!",
        helpful: 44
      },
      {
        name: "Phạm Thị Lan",
        rating: 5,
        date: "Tháng 9, 2025",
        review: "Chuyến đi tuyệt vời với gia đình! Biển đẹp sạch sẽ, trẻ em thích Vinpearl Land lắm. Tắm bùn I-Resort cũng rất thư giãn. Khách sạn tốt, view đẹp!",
        helpful: 38
      },
      {
        name: "Đặng Văn Hùng",
        rating: 4,
        date: "Tháng 8, 2025",
        review: "Tour ổn, đi được nhiều nơi trong 3 ngày. Lặn biển ở Hòn Mun thú vị. Tháp Bà cũng đẹp. Nha Trang về đêm sôi động. Giá tour hợp lý!",
        helpful: 31
      },
    ]
  },
};
