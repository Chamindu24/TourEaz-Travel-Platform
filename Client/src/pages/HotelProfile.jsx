// Pages/HotelProfile.jsx
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { 
  FaBed, 
  FaPhone, 
  FaGlobe, 
  FaEnvelope, 
  FaWifi, 
  FaCar, 
  FaSwimmingPool, 
  FaDumbbell, 
  FaSpa, 
  FaUtensils, 
  FaCocktail, 
  FaConciergeBell, 
  FaShieldAlt,
  FaHeart,
  FaCalendarAlt,
  FaClock,
  FaImage
} from "react-icons/fa"
import { MdLocationOn, MdRestaurant, MdLocalBar, MdSpa, MdFitnessCenter, MdPool, MdLocalParking, MdRoomService } from "react-icons/md"
import { AiFillStar } from "react-icons/ai"
import { BiWifi, BiRestaurant } from "react-icons/bi"
import { IoIosCheckmarkCircle } from "react-icons/io"
import Footer from "../Components/Footer"
import RoomCard from "../Components/RoomCard"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineX } from "react-icons/hi"; // or any X icon


function HotelProfile() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const locationState = useLocation()
  const [hotelData, setHotelData] = useState(null)
  const [roomsData, setRoomsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuImageUrl, setMenuImageUrl] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [imageTransition, setImageTransition] = useState(false)
  const [usersData, setUsersData] = useState({})
  const [selectedImg, setSelectedImg] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: null,
    checkOut: null,
  })

  const datePickerRef = useRef(null)

  const previousRoute = locationState.state?.previousRoute || "/search"
  const selectedNationality = locationState.state?.nationality || ""

  // Icon mapping for amenities
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'wifi': <BiWifi className="w-4 h-4 text-lapis_lazuli" />,
      'pool': <FaSwimmingPool className="w-4 h-4 text-lapis_lazuli" />,
      'gym': <FaDumbbell className="w-4 h-4 text-lapis_lazuli" />,
      'spa': <FaSpa className="w-4 h-4 text-lapis_lazuli" />,
      'restaurant': <FaUtensils className="w-4 h-4 text-lapis_lazuli" />,
      'bar': <FaCocktail className="w-4 h-4 text-lapis_lazuli" />,
      'parking': <FaCar className="w-4 h-4 text-lapis_lazuli" />,
      'concierge': <FaConciergeBell className="w-4 h-4 text-lapis_lazuli" />,
      'security': <FaShieldAlt className="w-4 h-4 text-lapis_lazuli" />,
      'room service': <MdRoomService className="w-4 h-4 text-lapis_lazuli" />
    }
    
    const key = Object.keys(iconMap).find(k => 
      amenity.toLowerCase().includes(k)
    )
    
    return key ? iconMap[key] : <IoIosCheckmarkCircle className="w-4 h-4 text-lapis_lazuli" />
  }

  const getRoomPrice = (room, nationality, checkIn, checkOut) => {
    if (!room) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let price = 0;
    if (room.pricePeriods?.length > 0 && checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        // Sort periods by start date to get the most recent applicable period
        const applicablePeriods = room.pricePeriods
          .filter(period => {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);
            periodStart.setHours(0, 0, 0, 0);
            periodEnd.setHours(23, 59, 59, 999);
            
            return (
              periodStart <= checkOutDate &&
              periodEnd >= checkInDate &&
              periodEnd >= today &&
              periodStart <= periodEnd &&
              period.price != null
            );
          })
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        // Use the most recent applicable period price
        if (applicablePeriods.length > 0) {
          price = applicablePeriods[0].price;
        }
      }
    } // If no period price is found, return 0
    if (price === 0) {
      // No valid price period found - this is expected behavior
    }

    // Apply nationality surcharge if any
    const surcharge = room.prices?.find((p) => p.country === nationality)?.price || 0;
    
    return Number(price) + surcharge;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          axios.get(`/hotels/${hotelId}`),
          axios.get(`/rooms/hotel/${hotelId}`),
        ])
        setHotelData(hotelRes.data)
        const baseRooms = locationState.state?.filteredRooms || roomsRes.data
        const enrichedRooms = baseRooms.map((r) => ({
          ...r,
          basePrice: getRoomPrice(r, selectedNationality, bookingData.checkIn, bookingData.checkOut),
        }))
        setRoomsData(enrichedRooms)

        const checkIn = locationState.state?.checkIn || locationState.state?.checkInDate || ''
        const checkOut = locationState.state?.checkOut || locationState.state?.checkOutDate || locationState.state?.checkoutDate || ''
        
        // Debug logging for date values
        console.log("Date values from location state:", { 
          checkIn: checkIn ? new Date(checkIn).toISOString() : null, 
          checkOut: checkOut ? new Date(checkOut).toISOString() : null,
          rawCheckIn: locationState.state?.checkIn,
          rawCheckInDate: locationState.state?.checkInDate,
          rawCheckOut: locationState.state?.checkOut,
          rawCheckOutDate: locationState.state?.checkOutDate,
          rawCheckoutDate: locationState.state?.checkoutDate
        })

        let validCheckIn = null
        let validCheckOut = null

        if (checkIn) {
          const checkInDate = new Date(checkIn)
          if (!isNaN(checkInDate)) {
            validCheckIn = checkInDate
          } else {
            console.warn("Invalid check-in date format in location.state:", checkIn)
          }
        }

        if (checkOut) {
          const checkOutDate = new Date(checkOut)
          if (!isNaN(checkOutDate)) {
            validCheckOut = checkOutDate
          } else {
            console.warn("Invalid check-out date format in location.state:", checkOut)
          }
        }

        setBookingData({
          checkIn: validCheckIn,
          checkOut: validCheckOut,
        })
        console.log("Initialized dates:", { 
          checkIn: validCheckIn ? validCheckIn.toISOString() : null, 
          checkOut: validCheckOut ? validCheckOut.toISOString() : null 
        })
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Hotel not found")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [hotelId, selectedNationality])

  useEffect(() => {
    if (!hotelData?.reviews) return
    const missingIds = hotelData.reviews
      .map((r) => (typeof r.user === "string" ? r.user : null))
      .filter((id) => id && !usersData[id])
    if (missingIds.length === 0) return

    const fetchUsers = async () => {
      try {
        const results = await Promise.all(
          missingIds.map((id) =>
            axios
              .get(`/users/${id}`)
              .then((res) => ({ id, name: res.data.email }))
              .catch(() => null),
          ),
        )
        setUsersData(prev => {
          const newUsers = { ...prev }
          results.forEach((u) => {
            if (u) newUsers[u.id] = u.name
          })
          return newUsers
        })
      } catch (err) {
        console.error("Error fetching users:", err)
      }
    }
    fetchUsers()
  }, [hotelData?.reviews])

  const submitReview = async () => {
    try {
      const res = await axios.post(`/hotels/${hotelId}/reviews`, {
        rating: newRating,
        comment: newComment,
      })
      setHotelData((prev) => ({
        ...prev,
        reviews: [...prev.reviews, res.data],
      }))
      setNewRating(5)
      setNewComment("")
    } catch (err) {
      console.error("Error submitting review", err)
    }
  }

  const handleTabChange = (idx) => setActiveTab(idx)

  const handleRoomSelect = (roomId) => {
    // Allow room navigation without requiring date selection
    // If dates are selected, they'll be passed to the room profile

    const selectedRoom = roomsData.find((room) => room._id === roomId)
    if (!selectedRoom) {
      alert("Selected room not found.")
      console.log("Room selection aborted: Room not found", roomId)
      return
    }

    // Prepare navigation state with optional dates
    const navigationState = {
      hotelId,
      hotelName: hotelData.name,
      roomId,
      roomName: selectedRoom.name,
      basePricePerNight: selectedRoom.basePrice,
      mealPlan: selectedRoom.mealPlan || hotelData.mealPlans[0] || { planName: "All-Inclusive" },
      previousRoute,
      selectedNationality,
    }
    
    // Only add dates if they're valid
    if (bookingData.checkIn instanceof Date && !isNaN(bookingData.checkIn) && 
        bookingData.checkOut instanceof Date && !isNaN(bookingData.checkOut) &&
        bookingData.checkIn < bookingData.checkOut) {
      navigationState.checkIn = bookingData.checkIn.toISOString()
      navigationState.checkOut = bookingData.checkOut.toISOString()
    }

    console.log("Navigating to room details with state:", {
      hotelId: navigationState.hotelId,
      hotelName: navigationState.hotelName,
      roomId: navigationState.roomId,
      roomName: navigationState.roomName,
      basePricePerNight: navigationState.basePricePerNight,
      checkIn: navigationState.checkIn,
      checkOut: navigationState.checkOut,
      selectedNationality: navigationState.selectedNationality
    })

    navigate(`/hotels/${hotelId}/rooms/${roomId}`, {
      state: navigationState
    })
  }

  const handleViewMenu = (url) => {
    setMenuImageUrl(url)
    setMenuModalOpen(true)
  }

  const closeMenuModal = () => setMenuModalOpen(false)

  const handleImageSwap = (index) => {
    setMainImageIndex(index)
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-t-4 border-b-4 border-lapis_lazuli"></div>
      </div>
    )
  if (error || !hotelData)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 text-red-600 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold mb-2">{error || "Hotel Not Found"}</h3>
        </div>
      </div>
    )

  const tabItems = [ "Rooms", "Overview","Dining", "Gallery", "Reviews"]
  const {
    name,
    location,
    starRating,
    description,
    amenities,
    mealPlans,
    dinningOptions,
    gallery,
    contactDetails,
    reviews,
  } = hotelData

  return (
    <>
      <div className="min-h-screen bg-slate-50 mt-4  font-['Inter',sans-serif]">
        {/* Image Gallery Section */}
        <div className="container mx-auto mt-4 px-4 md:px-20 pb-12">
          <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl bg-black">
            
            {/* Main Image with Framer Motion Transition */}
            <div className="relative h-[600px] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={mainImageIndex}
                  src={gallery[mainImageIndex]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Luxury Gradient Overlay - darker at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating Info Badge */}
              <div className="absolute top-8 left-8 flex gap-3">
                <span className="glass-effect px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/80">
                  Featured Property
                </span>
              </div>

              {/* Bottom Text Content */}
              <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-5xl md:text-7xl font-serif text-white mb-2"
                >
                  {name}
                </motion.h1>
                
                <div className="flex gap-6 items-center text-white/80">
                  <div className="flex items-center gap-2">
                    <MdLocationOn size={32} className="text-teal-400" />
                    <span className="text-lg tracking-wide uppercase">{location}</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 font-bold">{starRating}</span>

                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <AiFillStar
                            key={index}
                            className={
                              index < Math.round(starRating)
                                ? "text-yellow-400"
                                : "text-yellow-400/30"
                            }
                          />
                        ))}
                      </div>

                      <span className="text-xs ml-2 opacity-60 text-white/80">
                        LUXURY STAY
                      </span>
                    </div>

                </div>
              </div>
            </div>

            {/* Thumbnail Navigation - Integrated Into the Card */}
            <div className="absolute right-8 bottom-8 flex gap-2 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleImageSwap(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-500 ${
                    mainImageIndex === idx ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          {/* Modern Tab Navigation */}
          <div className="sticky top-0 z-10 mb-4">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl  border border-slate-200">
              <div className="flex">
                {tabItems.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTabChange(idx)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300
                      ${
                        activeTab === idx
                          ? "bg-teal-500 text-white shadow-md"
                          : "text-slate-600 hover:bg-teal-50 hover:text-teal-600"
                      }
                      ${idx === 0 ? "rounded-l-2xl" : ""}
                      ${idx === tabItems.length - 1 ? "rounded-r-2xl" : ""}
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>


          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            {activeTab === 1 && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
                <div className="xl:col-span-2 space-y-8">
                  {/* About Section */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 tracking-tight">About This Hotel</h2>
                    <p className="text-slate-600 leading-relaxed text-base sm:text-lg">{description}</p>
                  </div>

                  {/* Amenities Section */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 tracking-tight">Amenities & Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-lapis_lazuli/20 hover:bg-lapis_lazuli/5 transition-all duration-200">
                          <div className="mr-3 p-2 bg-white rounded-lg shadow-sm">
                            {getAmenityIcon(amenity)}
                          </div>
                          <span className="font-medium text-slate-700 text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Meal Plans Card */}
                <div className="xl:sticky xl:top-32">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-center mb-2">
                        <div className="bg-lapis_lazuli/10 p-3 rounded-xl mr-4">
                          <FaUtensils className="w-5 h-5 text-lapis_lazuli" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">Meal Plans</h3>
                          <p className="text-slate-500 text-sm">Choose your dining experience</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {mealPlans.map((plan, i) => (
                        <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 hover:border-lapis_lazuli/20 hover:shadow-sm transition-all duration-200 group">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-slate-800 group-hover:text-lapis_lazuli transition-colors">
                              {plan.planName}
                            </h4>
                            <div className="text-right">
                              {plan.price === 0 ? (
                                <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium border border-emerald-200">
                                  Included
                                </span>
                              ) : (
                                <div className="text-slate-800">
                                  <span className="font-bold text-lg text-lapis_lazuli">${plan.price}</span>
                                  <span className="text-xs text-slate-500 block mt-0.5">per person/day</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-slate-600 text-sm leading-relaxed mb-4">{plan.description}</p>
                          
                          <div className="flex items-center space-x-3">
                            {plan.planName.toLowerCase().includes('breakfast') && (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                <span className="text-xs text-slate-500 font-medium">Breakfast</span>
                              </div>
                            )}
                            {plan.planName.toLowerCase().includes('lunch') && (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                <span className="text-xs text-slate-500 font-medium">Lunch</span>
                              </div>
                            )}
                            {plan.planName.toLowerCase().includes('dinner') && (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                <span className="text-xs text-slate-500 font-medium">Dinner</span>
                              </div>
                            )}
                            {plan.planName.toLowerCase().includes('all') && (
                              <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 bg-lapis_lazuli rounded-full"></div>
                                <span className="text-xs text-slate-500 font-medium">All Meals</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 0 && (
              <div className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-10">
                  {/* Left: Section Title */}
                  <div className="flex items-start">
                    <div className="bg-teal-500 p-4 rounded-2xl mr-5 shadow-lg">
                      <FaBed className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-serif text-slate-900 tracking-tight">
                        Available Rooms
                      </h2>
                      <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Updated moments ago — Best prices guaranteed
                      </p>
                    </div>
                  </div>

                  {/* Right: Stay Summary Badge */}
                  {roomsData.length > 0 && (
                    <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 pr-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-xl font-bold leading-none">{roomsData.length}</span>
                        <span className="text-[10px] uppercase font-bold tracking-tighter">Rooms</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Stay</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <span>{bookingData.checkIn?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span className="text-slate-300">—</span>
                          <span>{bookingData.checkOut?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roomsData.length > 0 ? (
                    roomsData.map((room) => (
                      <div key={room._id} className="transform transition-all duration-200">
                        <RoomCard 
                          room={{
                            ...room,
                            searchDates: {
                              checkIn: bookingData.checkIn,
                              checkOut: bookingData.checkOut
                            }
                          }} 
                          onSelect={handleRoomSelect} 
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200">
                      <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <FaBed className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">Ready to Find Your Room?</h3>
                      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                        Select your check-in and check-out dates to discover available rooms tailored to your perfect stay.
                      </p>
                      <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-slate-400">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-2" />
                          Choose Dates
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center">
                          <FaClock className="w-4 h-4 mr-2" />
                          Instant Results
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div>
<div className="relative mb-12 group">
  {/* Left: Main Content */}
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div className="flex items-start">
      {/* Refined Icon Treatment */}
      <div className="relative mr-6">
        <div className="absolute inset-0 bg-lapis_lazuli opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
          <FaUtensils className="w-6 h-6 text-lapis_lazuli" />
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-lapis_lazuli/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-lapis_lazuli">Gastronomy</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight leading-none">
          Dining Experiences
        </h2>
        <p className="text-slate-500 mt-3 text-lg font-light italic">
          From sunrise breakfasts to starlit gala dinners
        </p>
      </div>
    </div>

    {/* Right: Quick Stats/Tags (Professional sites love data-points) */}
    <div className="hidden lg:flex items-center gap-8 border-l border-slate-200 pl-8">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Cuisines</p>
        <p className="text-sm font-bold text-slate-800">Global & Local</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Atmosphere</p>
        <p className="text-sm font-bold text-slate-800">Fine Dining</p>
      </div>
    </div>
  </div>

  {/* Bottom: Subtle Decorative Line */}
  <div className="mt-8 h-px w-full bg-gradient-to-r from-lapis_lazuli/20 via-slate-200 to-transparent" />
</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dinningOptions.map((option, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                      <img
                        src={option.image || "/placeholder.svg"}
                        alt={option.optionName}
                        className="w-full h-64 md:h-72 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 text-white">
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">{option.optionName}</h3>
                          <p className="text-white/90 text-sm leading-relaxed mb-4 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                            {option.description}
                          </p>
                          <button
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 
                                     text-white rounded-lg px-5 py-2.5 transition-all duration-300 w-fit text-sm font-medium
                                     transform hover:scale-105 min-h-[44px] flex items-center"
                            onClick={() => handleViewMenu(option.menu)}
                          >
                            <FaImage className="w-4 h-4 mr-2" />
                            View Menu
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 3 && (
            <section className="py-24 bg-white text-slate-900 overflow-hidden">
                  <div className="container mx-auto px-6 md:px-20">
                    
                    {/* 1. Header: Minimalist Light Mode */}
                    <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 border-b border-slate-200 pb-8">
                      <div>
                        <h2 className="text-6xl md:text-8xl font-light tracking-tighter mb-4">
                          Atmosphere<span className="text-lapis_lazuli">.</span>
                        </h2>
                        <p className="text-slate-400 uppercase tracking-[0.5em] text-xs font-bold">
                          Visual Index // {gallery.length} Perspectives
                        </p>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed font-light italic">
                          A curated collection of light, space, and architectural intent.
                        </p>
                      </div>
                    </div>

                    {/* 2. The Liquid Grid */}
                    <div className="grid grid-cols-12 gap-3 md:gap-6 auto-rows-[12vw]">
                      {gallery.map((img, idx) => {
                        const spans = [
                          "col-span-8 row-span-4", "col-span-4 row-span-2", 
                          "col-span-4 row-span-2", "col-span-4 row-span-3", 
                          "col-span-5 row-span-3", "col-span-3 row-span-3",
                        ];
                        const spanClass = spans[idx % spans.length];

                        return (
                          <motion.div 
                            key={idx}
                            layoutId={`img-${idx}`} // Magic move transition
                            onClick={() => setSelectedImg({ img, idx })}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`${spanClass} relative group overflow-hidden cursor-zoom-in bg-slate-100 rounded-sm`}
                          >
                            <img 
                              src={img} 
                              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.2,1,0.3,1)] group-hover:scale-110 grayscale group-hover:grayscale-0"                              alt="Atmosphere" 
                            />

                              {/* The Interactive Mask (Reveal on Hover) */}
                              <div className="absolute inset-0 bg-lapis_lazuli/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col justify-end p-6">
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  whileHover={{ y: 0, opacity: 1 }}
                                  className="space-y-1"
                                >
                                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/70">Perspective</p>
                                  <h4 className="text-lg font-bold">0{idx + 1} // Detail View</h4>
                                </motion.div>
                              </div>

                            <div className="absolute bottom-4 right-4 z-10 text-[10px] font-mono text-slate-400 group-hover:opacity-0">
                              {idx.toString().padStart(2, '0')}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. LIGHTBOX PREVIEW */}
                  <AnimatePresence>
                    {selectedImg && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl p-4 md:p-12"
                        onClick={() => setSelectedImg(null)}
                      >
                        {/* Close Button */}
                        <button className="absolute top-8 right-8 text-slate-900 p-2 hover:rotate-90 transition-transform duration-300">
                          <HiOutlineX className="w-8 h-8" />
                        </button>

                        {/* Image Container */}
                        <motion.div 
                          layoutId={`img-${selectedImg.idx}`}
                          className="relative max-w-5xl w-full h-full flex flex-col justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img 
                            src={selectedImg.img} 
                            className="w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
                            alt="Preview"
                          />
                          
                          <div className="mt-8 flex justify-between items-end border-t border-slate-200 pt-6">
                            <div>
                              <h3 className="text-2xl font-serif italic">Atmosphere Perspective 0{selectedImg.idx + 1}</h3>
                              <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Interior Architectural Photography // 2024</p>
                            </div>
                            <button className="bg-lapis_lazuli text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors">
                              Enquire About Space
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
            )}

            {activeTab === 4 && (
              <div>
                <div className="flex items-center mb-8">
                  <div className="bg-teal-500/10 p-3 rounded-xl mr-4">
                    <FaHeart className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Guest Reviews</h2>
                    <p className="text-slate-500">Hear from our valued guests</p>
                  </div>
                </div>

                {/* Enhanced Overall Rating Section */}
                {reviews.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Overall Rating */}
                      <div className="text-center lg:text-left">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Overall Rating</h3>
                        <div className="flex flex-col items-center lg:items-start">
                          {(() => {
                            const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0)
                            const avgRating = totalRating / reviews.length
                            return (
                              <>
                                <div className="flex items-center mb-3">
                                  <span className="text-4xl sm:text-5xl font-bold text-lapis_lazuli mr-3">{avgRating.toFixed(1)}</span>
                                  <div>
                                    <div className="flex mb-1">
                                      {[...Array(5)].map((_, i) => (
                                        <AiFillStar
                                          key={i}
                                          className={`w-5 h-5 ${i < Math.round(avgRating) ? "text-yellow-400" : "text-slate-300"}`}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-slate-600 text-sm">
                                      from {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Right: Rating Distribution */}
                      <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-4">Rating Distribution</h4>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter(r => r.rating === star).length
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                              <div key={star} className="flex items-center text-sm">
                                <span className="w-8 text-slate-600 font-medium">{star}</span>
                                <AiFillStar className="w-4 h-4 text-yellow-400 mr-2" />
                                <div className="flex-1 bg-slate-200 rounded-full h-2 mr-3">
                                  <div 
                                    className="bg-lapis_lazuli rounded-full h-2 transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="w-8 text-slate-500 text-xs">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Review Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Share Your Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating:</label>
                      <div className="flex items-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="text-2xl focus:outline-none transition-all mr-1 min-h-[44px] hover:scale-110"
                          >
                            <AiFillStar
                              className={`${
                                star <= newRating ? "text-yellow-400" : "text-slate-300"
                              } hover:text-yellow-400 transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-slate-600 text-sm bg-slate-50 px-3 py-1 rounded-full">
                          {newRating} Star{newRating !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Review:</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your experience at this hotel..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-lapis_lazuli/20 focus:border-lapis_lazuli transition-colors resize-none"
                      />
                    </div>
                    <button
                      onClick={submitReview}
                      className="bg-teal-500 hover:bg-white text-white hover:text-black border-2 hover:border-teal-500 px-6 py-3 
                               rounded-md transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium min-h-[44px]
                               flex items-center transform hover:scale-105"
                    >
                      <FaHeart className="w-4 h-4 mr-2" />
                      Submit Review
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reviews.map((rev, i) => {
                    const userId = typeof rev.user === "string" ? rev.user : rev.user._id
                    const displayName = usersData[userId] || "Anonymous"
                    const initial = displayName.charAt(0).toUpperCase()
                    return (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-lapis_lazuli/10 text-lapis_lazuli rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3 text-sm">
                              {initial}
                            </div>
                            <div>
                              <strong className="text-slate-800 font-medium">{displayName}</strong>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, idx) => (
                                  <AiFillStar
                                    key={idx}
                                    className={`w-4 h-4 ${idx < rev.rating ? "text-yellow-400" : "text-slate-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-slate-400 text-xs bg-slate-50 px-2 py-1 rounded-full">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Enhanced Menu Modal */}
        {menuModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-4xl max-h-[90vh] w-full">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={closeMenuModal} 
                  className="bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 rounded-full p-2 shadow-lg transition-all duration-200 min-h-[44px] w-11 h-11 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-2">
                <img
                  src={menuImageUrl || "/placeholder.svg"}
                  alt="Menu"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>

     

      <style>{`
        .react-datepicker {
          font-family: 'Inter', sans-serif;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          width: 280px;
          z-index: 1000;
          background-color: white;
        }
        @media (min-width: 640px) {
          .react-datepicker {
            width: 300px;
          }
        }
        @media (min-width: 768px) {
          .react-datepicker {
            width: 320px;
          }
        }
        .react-datepicker__header {
          background-color: #005E84;
          color: white;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          padding: 1rem;
          border-bottom: none;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .react-datepicker__day-names {
          padding: 0 1rem;
        }
        .react-datepicker__month {
          padding: 0 1rem 1rem;
        }
        .react-datepicker__day {
          color: #475569;
          border-radius: 0.5rem;
          transition: all 0.2s;
          width: 36px;
          height: 36px;
          line-height: 36px;
          font-size: 0.875rem;
          margin: 0.125rem;
        }
        .react-datepicker__day:hover {
          background-color: #f1f5f9;
          color: #005E84;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--in-range,
        .react-datepicker__day--in-selecting-range {
          background-color: #e2e8f0;
          color: #005E84;
        }
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #005E84 !important;
          color: white !important;
        }
        .react-datepicker__day--range-start:hover,
        .react-datepicker__day--range-end:hover {
          background-color: #075985 !important;
        }
        .react-datepicker__day--outside-month {
          color: #cbd5e1;
        }
        .react-datepicker__day--disabled {
          color: #cbd5e1;
          cursor: not-allowed;
        }
        .react-datepicker__navigation-icon::before {
          border-color: white;
        }
        .react-datepicker__triangle {
          display: none;
        }
        .react-datepicker-popper {
          z-index: 1000;
        }
        .react-datepicker__month-container {
          width: 100%;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Masonry layout support */
        .columns-1 { columns: 1; }
        .columns-2 { columns: 2; }
        .columns-3 { columns: 3; }
        .columns-4 { columns: 4; }
        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>
    </>
  )
}

export default HotelProfile;