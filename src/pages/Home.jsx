import React, { useEffect, useState, useRef } from "react";
import useStore from "../store/useStore";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../index.css"

// Skeleton loader
function SkeletonLoader() {
  return (
    <div className="w-full h-60 md:h-80 rounded-lg bg-gray-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 
                      animate-[shimmer_1s_infinite] bg-[length:200%_100%]" />
    </div>
  );
}

export default function Home() {
  const backend_url = useStore((state) => state.backend_url);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetch(`${backend_url}/banner`)
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching banners:", err);
        setLoading(false);
      });
  }, [backend_url]);

//   const sliderWidthClass = "w-full md:w-[900px] lg:w-[1100px]";
    const sliderWidthClass = "w-full md:w-[840px] lg:w-[1040px]";



  return (
    <div className={`mt-4 ${sliderWidthClass} relative mx-auto`}>
      {loading ? (
        <SkeletonLoader />
      ) : banners.length === 0 ? (
        <p className="text-center text-gray-500">No banners available</p>
      ) : (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          speed={800}
          autoplay={{ delay: 1000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          className="h-60 md:h-80 rounded-lg shadow-lg home-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                  <h2 className="text-white text-lg md:text-2xl font-bold">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-white text-sm md:text-base mt-1">
                      {banner.description}
                    </p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Navigation buttons */}
          <button
            ref={prevRef}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md z-10"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-orange-500 text-lg md:text-xl" />
          </button>
          <button
            ref={nextRef}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow-md z-10"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-orange-500 text-lg md:text-xl" />
          </button>
        </Swiper>
      )}
    </div>
  );
}
