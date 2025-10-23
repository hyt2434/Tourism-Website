import { Link } from "react-router-dom";


import { Facebook, Linkedin, Youtube, Instagram } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-[1440px] mx-auto px-20 py-14">
        <div className="flex items-center justify-between">
          <div className="text-black">Viet Travel</div>

          <div className="flex items-center gap-11">


            <Link
              to="/"
              className=" text-black px-2 py-2 rounded-md "
            >
              Home
            </Link>


           <Link
              to="/tours"
              className=" text-black px-2 py-2 rounded-md "
            >
           Tour
            </Link>

            <a href="#" className="text-black">Social</a>
            <a href="#" className="text-black">Partner</a>
            <a href="#" className="text-black">About us</a>

            <button className="bg-black text-white px-6 py-3.5 rounded-lg shadow-sm">
              <Link
                to="/login"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Đăng ký / Đăng nhập
              </Link>

            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

