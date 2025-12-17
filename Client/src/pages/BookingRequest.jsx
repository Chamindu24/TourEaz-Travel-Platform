"use client"

import { useNavigate } from "react-router-dom"
import Footer from "../Components/Footer"
import { steps } from "./BookingRequest/utils/bookingUtils"
import { useBookingState } from "./BookingRequest/hooks/useBookingState"
import { useBookingData } from "./BookingRequest/hooks/useBookingData"
import { useBookingHandlers } from "./BookingRequest/hooks/useBookingHandlers"
import DatesGuestsStep from "./BookingRequest/components/DatesGuestsStep"
import ClientInfoStep from "./BookingRequest/components/ClientInfoStep"
import ReviewStep from "./BookingRequest/components/ReviewStep"
import ConfirmationStep from "./BookingRequest/components/ConfirmationStep"

const BookingRequest = ({ sidebarOpen }) => {
  const navigate = useNavigate()

  // Custom hooks
  const state = useBookingState()
  const {
    activeStep,
    setActiveStep,
    bookingData,
    setBookingData,
    errors,
    setErrors,
    loading,
    setLoading,
    loadingData,
    setLoadingData,
    hotel,
    setHotel,
    room,
    setRoom,
    showConfirmation,
    setShowConfirmation,
    offers,
    setOffers,
    selectedOffer,
    setSelectedOffer,
    autoAppliedOffers,
    setAutoAppliedOffers,
    mealPlans,
    setMealPlans,
    passengerDetails,
    setPassengerDetails,
    marketSurcharge,
    setMarketSurcharge,
    roomConfigs,
    setRoomConfigs,
    locationState
  } = state

  const {
    roomId,
    hotelId,
    roomName,
    hotelName,
    basePricePerNight,
    checkIn,
    checkOut,
    mealPlan,
    previousRoute,
    selectedNationality,
    market,
  } = locationState

  // Data fetching hook
  useBookingData({
    locationState,
    bookingData,
    setBookingData,
    setHotel,
    setRoom,
    setMealPlans,
    setLoadingData,
    setErrors,
    setOffers,
    setAutoAppliedOffers,
    setSelectedOffer,
    setMarketSurcharge,
    setPassengerDetails,
    room,
    market,
    basePricePerNight,
    hotelId,
    roomId,
    navigate,
    roomConfigs,
    setRoomConfigs
  })

  // Handlers hook
  const handlers = useBookingHandlers({
    activeStep,
    setActiveStep,
    bookingData,
    setBookingData,
    errors,
    setErrors,
    loading,
    setLoading,
    setShowConfirmation,
    passengerDetails,
    setPassengerDetails,
    selectedOffer,
    autoAppliedOffers,
    room,
    market,
    basePricePerNight,
    marketSurcharge,
    hotelId,
    roomId,
    navigate,
    roomConfigs,
    setRoomConfigs
  })

  const {
    handleNext,
    handleBack,
    validateStep,
    handlePassengerChange,
    handleChildPassengerChange,
    handleRoomConfigChange,
    handleChildAgeChange,
    handleChange,
    handleConfirmSubmit,
    handleSubmit
  } = handlers

  // --- DESKTOP LAYOUT ---
  const renderDesktopLayout = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} ml-0`}>
          <div className="container mx-auto  py-8 max-w-7xl overflow-x-hidden">
            {loadingData ? (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-3 text-gray-600 text-lg font-medium">Loading booking information...</p>
                </div>
              </div>
            ) : (
              <>
                {activeStep < 3 && (
                  <div className="relative  overflow-hidden mb-8 shadow-xl">
                    <img
                      src="https://www.bigworldsmallpockets.com/wp-content/uploads/2023/10/Sri-Lanka-5-Star-Hotel-Jetwing-Blue.jpg"
                      alt="Maldives"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A435C]/70 to-transparent flex flex-col justify-center px-10">
                      <h1 className="text-4xl font-bold text-white mb-2">Book Your Luxury Escape</h1>
                      <p className="text-lg text-gray-100 max-w-xl">
                        Complete your booking at <span className="relative inline-block text-yellow-200 blur-[0.2px] drop-shadow-[0_0_10px_rgba(253,224,71,0.9)] ">{hotelName}</span> for an unforgettable Maldives getaway
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg mb-8 p-8">
                  {activeStep < 3 && (
                    <div className="mb-10 overflow-x-auto scrollbar-hide">
                      <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                          <div key={step} className="flex flex-col items-center relative w-full">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold z-10 ${
                                activeStep >= index ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <p
                              className={`mt-2 text-sm font-medium ${activeStep >= index ? "text-teal-200" : "text-gray-500"}`}
                            >
                              {step}
                            </p>
                            {index < steps.length - 1 && (
                              <div
                                className={`absolute h-1 top-5 left-1/2 w-full ${activeStep > index ? "bg-[#0A435C]" : "bg-gray-200"}`}
                              ></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeStep === 0 && (
                    <DatesGuestsStep
                      hotel={hotel}
                      room={room}
                      bookingData={bookingData}
                      handleChange={handleChange}
                      handleChildAgeChange={handleChildAgeChange}
                      errors={errors}
                      offers={offers}
                      selectedOffer={selectedOffer}
                      setSelectedOffer={setSelectedOffer}
                      market={market}
                      marketSurcharge={marketSurcharge}
                      basePricePerNight={basePricePerNight}
                      hotelName={hotelName}
                      roomName={roomName}
                      roomConfigs={roomConfigs}
                      handleRoomConfigChange={handleRoomConfigChange}
                    />
                  )}

                  {activeStep === 1 && (
                    <ClientInfoStep
                      bookingData={bookingData}
                      handleChange={handleChange}
                      errors={errors}
                      passengerDetails={passengerDetails}
                      handlePassengerChange={handlePassengerChange}
                      handleChildPassengerChange={handleChildPassengerChange}
                      roomConfigs={roomConfigs}
                    />
                  )}

                  {activeStep === 2 && (
                    <ReviewStep
                      hotel={hotel}
                      room={room}
                      bookingData={bookingData}
                      hotelName={hotelName}
                      roomName={roomName}
                      market={market}
                      marketSurcharge={marketSurcharge}
                      basePricePerNight={basePricePerNight}
                      autoAppliedOffers={autoAppliedOffers}
                      selectedOffer={selectedOffer}
                    />
                  )}

                  {activeStep === 3 && (
                    <ConfirmationStep
                      bookingData={bookingData}
                      hotelName={hotelName}
                      navigate={navigate}
                    />
                  )}

                  {activeStep < 3 && (
                    <div className="flex justify-between mt-8">
                      {activeStep > 0 && (
                        <button
                          onClick={handleBack}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Back
                        </button>
                      )}
                      <button
                        onClick={activeStep === 2 ? handleConfirmSubmit : handleNext}
                        className="bg-teal-500 text-white px-6 py-2 rounded-md hover:bg-white hover:text-black border-2 hover:border-teal-500 hover:scale-105 duration-300 transition-colors ml-auto"
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : activeStep === 2 ? "Confirm Booking" : "Continue"}
                      </button>
                    </div>
                  )}
                </div>

                {showConfirmation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Booking</h3>
                      <p className="text-gray-600 text-sm mb-6">
                        Are you sure you want to submit this booking request for {hotelName} from{" "}
                        {new Date(bookingData.checkIn).toLocaleDateString()} to {new Date(bookingData.checkOut).toLocaleDateString()}?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setShowConfirmation(false)}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="bg-[#075375] text-white px-4 py-2 rounded-lg hover:bg-[#0A435C] transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Submitting..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )

  return (
    <>
      {renderDesktopLayout()}
    </>
  )
}

export default BookingRequest
