import { FaBed, FaRulerCombined, FaUsers, FaShip, FaPlane, FaCar, FaPlaneDeparture } from "react-icons/fa"
import { calculateNights, getFinalPerNightPrice, formatDate } from "../utils/bookingUtils"

const DatesGuestsStep = ({
  hotel,
  room,
  bookingData,
  handleChange,
  handleChildAgeChange,
  errors,
  offers,
  selectedOffer,
  setSelectedOffer,
  market,
  marketSurcharge,
  basePricePerNight,
  hotelName,
  roomName,
  roomConfigs,
  handleRoomConfigChange
}) => {
  const nights = calculateNights(bookingData.checkIn, bookingData.checkOut)

  // Helper to get transport icon
  const getTransportIcon = (method) => {
    const lowerMethod = method.toLowerCase()
    if (lowerMethod.includes('boat') || lowerMethod.includes('ship')) return <FaShip className="text-[#005E84]" />
    if (lowerMethod.includes('plane') && !lowerMethod.includes('domestic')) return <FaPlane className="text-[#005E84]" />
    if (lowerMethod.includes('domestic flight')) return <FaPlaneDeparture className="text-[#005E84]" />
    return <FaCar className="text-[#005E84]" />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Dates & Guests</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-transform hover:scale-[1.02] group">
            <div className="relative h-80">
              <img
                src={hotel?.gallery[0] || "/placeholder.svg"}
                alt={hotelName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Darker overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{hotelName}</h3>
                <div className="flex items-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm text-white/90 ml-1 drop-shadow-md">{hotel?.location}</span>
                </div>
                <div className="flex items-baseline bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 w-fit border border-white/20">
                  <span className="text-3xl font-bold text-white drop-shadow-lg">${getFinalPerNightPrice(basePricePerNight, marketSurcharge)}</span>
                  <span className="text-sm text-white/90 ml-2">per night</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-5 mt-6 border border-[#B7C5C7]">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Highlights</h3>
            <span className="text-sm text-gray-700">{hotel?.descriptionShort}</span>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-md shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Dates and Guests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    {formatDate(bookingData.checkIn)}
                  </div>
                </div>
                {errors.checkIn && <p className="mt-1 text-xs text-red-600">{errors.checkIn}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    {formatDate(bookingData.checkOut)}
                  </div>
                </div>
                {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms</label>
                <select
                  name="rooms"
                  value={bookingData.rooms}
                  onChange={handleChange}
                  className="w-full px-3 py-2  border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm focus:outline-none border-2 "
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Per-Room Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Configuration</h3>
              {roomConfigs.map((config, roomIdx) => (
                <div key={roomIdx} className="bg-emerald-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Room {roomIdx + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                      <select
                        value={config.adults}
                        onChange={(e) => handleRoomConfigChange(roomIdx, 'adults', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm focus:outline-none "
                      >
                        {Array.from({ length: room?.maxOccupancy?.adults || 6 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Children</label>
                      <select
                        value={config.children}
                        onChange={(e) => handleRoomConfigChange(roomIdx, 'children', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm focus:outline-none "
                      >
                        {Array.from({ length: (room?.maxOccupancy?.children || 4) + 1 }, (_, i) => i).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {config.children > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children Ages <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {config.childrenAges.map((age, childIdx) => (
                          <select
                            key={childIdx}
                            value={age}
                            onChange={(e) => handleChildAgeChange(roomIdx, childIdx, e.target.value)}
                            className={`w-full px-3 py-2 border-2 ${
                              errors.childrenAges && age === 0 ? 'border-red-300' : 'border-gray-300'
                            } rounded-lg focus:ring-teal-500 focus:border-teal-500 text-sm focus:outline-none`}
                          >
                            <option value={0}>Select age</option>
                            {[...Array(18).keys()].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "year" : "years"}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                      {errors.childrenAges && (
                        <p className="mt-1 text-xs text-red-600">{errors.childrenAges}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Meal Plan</label>
              <div className="w-full h-10 px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm flex items-center">
                {bookingData.mealPlan} (+${bookingData.selectedMealPlan?.price || 0})
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Country (Market)</label>
              <div className="w-full h-10 px-3 py-2 border-2 border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm flex items-center">
                {market || 'Not selected'}
                {marketSurcharge > 0 && (
                  <span className="ml-2 text-[#075375]">(+${marketSurcharge} per night)</span>
                )}
              </div>
            </div>
            {room?.transportations && room.transportations.length > 0 && (
              <div className="mt-4">
                <label className="flex text-sm font-semibold text-black mb-2 items-center gap-2">
                  <svg className="w-5 h-5 text-[#005E84]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Transportation Options
                </label>
                <ul className="flex flex-wrap gap-2">
                  {room.transportations.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-2 bg-teal-50 border border-[#B7C5C7] text-teal-200 px-4 py-2 rounded-full text-xs shadow-sm hover:bg-[#B7C5C7] transition-all">
                      {getTransportIcon(t.method)}
                      <span className="font-medium capitalize">{t.type}: {t.method}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Only display 'Choose an Exclusive Offer' if hotelName exists and there are eligible offers */}
            {hotelName && hotel && hotel._id && (() => {
              const eligibleOffers = offers.filter(offer => {
                if (offer.discountType !== "exclusive") return false
                const hasHotels = Array.isArray(offer.applicableHotels) && offer.applicableHotels.length > 0
                const hasMarkets = Array.isArray(offer.discountValues) && offer.discountValues.length > 0
                if (!hasHotels && !hasMarkets) return false
                if (hasHotels && offer.applicableHotels.includes(hotel._id)) return true
                if (hasMarkets && market && offer.discountValues.some(v => v.market === market)) return true
                return false
              })
              if (eligibleOffers.length === 0) return null
              return (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Choose an Exclusive Offer</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {eligibleOffers.map((offer) => (
                      <div
                        key={offer._id}
                        onClick={() => setSelectedOffer(selectedOffer?._id === offer._id ? null : offer)}
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-colors
                          ${
                            selectedOffer?._id === offer._id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-300"
                          }
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="text-base font-medium text-gray-900">
                              {offer.description || (() => {
                                let marketValue = null
                                if (Array.isArray(offer.discountValues) && market) {
                                  const found = offer.discountValues.find(v => v.market === market)
                                  if (found) {
                                    marketValue = found.type === 'percentage' ? `${found.value}%` : `$${found.value}`
                                  }
                                }
                                return marketValue ? `Save ${marketValue}` : `Save $${offer.value}`
                              })()}
                            </h5>
                            {offer.conditions?.minBookings && (
                              <p className="text-sm text-gray-600">
                                Requires {offer.conditions.minBookings}+ bookings
                              </p>
                            )}
                          </div>
                          <span className="text-indigo-600 font-medium text-sm">
                            {(() => {
                              if (Array.isArray(offer.discountValues) && market) {
                                const found = offer.discountValues.find(v => v.market === market)
                                if (found) {
                                  if (found.type === 'percentage') {
                                    const base = getFinalPerNightPrice(basePricePerNight, marketSurcharge) * nights * bookingData.rooms + (bookingData.selectedMealPlan ? bookingData.selectedMealPlan.price * (bookingData.adults + bookingData.children) * nights : 0) + (marketSurcharge * nights * bookingData.rooms)
                                    return `-$${((base * found.value) / 100).toFixed(2)} (${found.value}%)`
                                  } else {
                                    // Fixed discount
                                    return `-$${found.value}`
                                  }
                                }
                              }
                              if (Array.isArray(offer.applicableHotels) && offer.applicableHotels.includes(hotel._id)) {
                                return `-$${offer.value}`
                              }
                              return '-'
                            })()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            {bookingData.checkIn && bookingData.checkOut && nights > 0 && (
              <div className="bg-gray-50 rounded-md p-6 border border-teal-900 mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Price Summary</h4>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">
                      {nights} night{nights !== 1 ? "s" : ""}
                    </span>{" "}
                    × {bookingData.rooms} room{bookingData.rooms !== 1 ? "s" : ""}
                  </div>
                  <div className="text-gray-800 text-sm">
                    ${Number(basePricePerNight) - Number(marketSurcharge)} per night
                  </div>
                </div>
                <div className="text-gray-800 text-sm text-right mb-3">
                  Room Total: {(Number(basePricePerNight) - Number(marketSurcharge)) * nights * bookingData.rooms}
                </div>
                {bookingData.selectedMealPlan && (
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-gray-600 text-sm">
                      {bookingData.mealPlan} ({bookingData.adults + bookingData.children} guest{bookingData.adults + bookingData.children !== 1 ? "s" : ""} × ${bookingData.selectedMealPlan.price}/night)
                    </div>
                    <div className="text-gray-800 text-sm">
                      ${bookingData.selectedMealPlan.price * (bookingData.adults + bookingData.children) * nights}
                    </div>
                  </div>
                )}
                {market && (
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-gray-600 text-sm">
                      {market} Market Surcharge ({nights} night{nights !== 1 ? 's' : ''} × ${marketSurcharge}/night)
                    </div>
                    <div className="text-gray-800 text-sm">
                      ${marketSurcharge * nights * bookingData.rooms}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-700 text-sm">All-inclusive package</span>
                  <span className="text-green-600 text-sm">Included</span>
                </div>
                {/* Add discount calculations here if needed */}
                <div className="border-t border-indigo-200 my-3"></div>
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg text-gray-800">Total</div>
                  <div className="font-bold text-xl text-indigo-600">${/* Calculate total */}</div>
                </div>
                <div className="mt-4 text-xs text-gray-800 bg-yellow-100/80 px-3 py-2 rounded-lg flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  This booking includes complimentary round-trip seaplane transfers, worth $450 per person.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatesGuestsStep
