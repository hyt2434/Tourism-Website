import React from "react";
import { Copy, Gift, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const discounts = [
  {
    id: 1,
    title: "Giảm đến 50.000 cho lần đặt vé máy bay đầu tiên.",
    description:
      "Áp dụng cho tất cả các lần đặt vé máy bay đầu tiên ứng dụng Traveloka.",
    code: "TVLBANNOI",
  },
  {
    id: 2,
    title: "Giảm đến 8% cho lần đặt phòng khách sạn đầu tiên.",
    description:
      "Áp dụng cho tất cả các lần đặt vé máy bay đầu tiên ứng dụng Traveloka.",
    code: "TVLBANNOI",
  },
  {
    id: 3,
    title: "Giảm đến 6% cho lần đặt vé tham quan/hoạt động đầu tiên.",
    description:
      "Áp dụng cho tất cả các lần đặt vé máy bay đầu tiên ứng dụng Traveloka.",
    code: "TVLBANNOI",
  },
];

export default function DiscountCodes() {
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="w-6 h-6 text-blue-700" />
        <h2 className="text-blue-700">Mã Ưu Đãi Tặng Bạn Mới</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm mb-2">{discount.title}</h3>
                <p className="text-xs text-gray-600">{discount.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3">
              <code className="text-sm text-blue-700">{discount.code}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyCode(discount.code)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
          <ChevronRight className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
}
