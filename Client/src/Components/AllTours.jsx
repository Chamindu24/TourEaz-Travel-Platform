import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const marketMapping = {
  1: "Indian Market",
  2: "Chinese Market",
  3: "Asian Markets",
  4: "Middle East Markets",
  5: "Russia and CIS Markets",
  6: "Rest of the World",
};

// Each key in foodCategoryMapping is 0,1,2 for your DB structure
const foodCategoryMapping = {
  0: "Half Board",
  1: "Full Board",
  2: "All Inclusive",
};

const AllTours = () => {
  const { user } = useContext(AuthContext);
  const [tours, setTours] = useState([]);
  const [editTour, setEditTour] = useState(null);

  // Local state for editing a single tour
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    person_count: "",
    nights: "", 
    nightsOptions: {},
    expiry_date: "",
    valid_from: "",
    valid_to: "",
    food_category: {
      0: [0, 0, false],
      1: [0, 0, false],
      2: [0, 0, false],
    },
    country: "",
    markets: [],
    tour_summary: "",
    oldPrice: "",
    inclusions: "",
    exclusions: "",
    facilities: "",
    tour_image: [],
    destination_images: [],
    activity_images: [],
    hotel_images: [],
    itinerary: {
      first_day: "",
      middle_days: {},
      last_day: "",
    },
    itineraryImages: {
      first_day: [],
      middle_days: {},
      last_day: [],
    },
    itineraryTitles: {
      first_day: "",
      middle_days: {},
      last_day: "",
    },
  });

  // nightsInput holds the user-entered (but not yet confirmed) nights count.
  const [nightsInput, setNightsInput] = useState("");

  const [newNightsOptions, setNewNightsOptions] = useState({});

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const endpoint = user?.role === 'admin' 
          ? '/tours' 
          : '/tours/my-tours';
        
        const { data } = await axios.get(endpoint, { withCredentials: true });
        setTours(data);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, []);

  // Helper to format dates (YYYY-MM-DD)
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleConfirmNights = () => {
    const newNights = parseInt(nightsInput, 10);
    if (isNaN(newNights) || newNights <= 0) {
      Swal.fire("Error", "Please enter a valid number of nights", "error");
      return;
    }

    // Get current maximum day number from existing middle_days keys.
    const middleDays = formData.itinerary.middle_days || {};
    const middleKeys = Object.keys(middleDays)
      .map((key) => parseInt(key.split("_")[1], 10))
      .filter((num) => !isNaN(num));
    const currentMax = middleKeys.length > 0 ? Math.max(...middleKeys) : 1;

    let newItinerary = { ...formData.itinerary };
    let newItineraryImages = { ...formData.itineraryImages };
    let newItineraryTitles = { ...formData.itineraryTitles };

    if (newNights > currentMax) {
      for (let i = currentMax + 1; i <= newNights; i++) {
        const key = `day_${i}`;
        newItinerary.middle_days[key] = "";
        newItineraryImages.middle_days[key] = [];
        newItineraryTitles.middle_days[key] = `Day ${i} Title`;
      }
    }
    // If newNights is lower than currentMax, we do not remove extra days (they remain in state).

    // Ensure pricing group for newNights exists.
    setFormData((prev) => ({
      ...prev,
      nights: nightsInput, // update confirmed base nights
      itinerary: newItinerary,
      itineraryImages: newItineraryImages,
      itineraryTitles: newItineraryTitles,
      nightsOptions: {
        ...prev.nightsOptions,
        [nightsInput]: prev.nightsOptions[nightsInput] || [],
      },
    }));
    console.log("Confirmed nights count:", nightsInput);
    console.log("New nights options:", formData.nightsOptions[nightsInput]);
    Swal.fire("Success", "Night count confirmed", "success");
  };

  const handleEditOpen = (tour) => {
    setEditTour(tour);
    const inclusionsString = Array.isArray(tour.inclusions) ? tour.inclusions.join("\n") : "";
    const exclusionsString = Array.isArray(tour.exclusions) ? tour.exclusions.join("\n") : "";
    const facilitiesString = Array.isArray(tour.facilities) ? tour.facilities.join("\n") : "";
    const fixFoodCategory = (arr) => {
      if (!Array.isArray(arr)) return [0, 0, false];
      const [val1, val2, val3] = arr;
      return [val1 || 0, val2 || 0, typeof val3 === "boolean" ? val3 : false];
    };
    const loadedFoodCategory = tour.food_category || {
      0: [0, 0, false],
      1: [0, 0, false],
      2: [0, 0, false],
    };
    const nightsObject = tour.nights || {};
    const baseNightsKey = Object.keys(nightsObject)[0] || "";
    setFormData({
      title: tour.title,
      price: tour.price,
      person_count: tour.person_count,
      nights: baseNightsKey,
      nightsOptions: nightsObject,
      expiry_date: formatDate(tour.expiry_date),
      valid_from: formatDate(tour.valid_from),
      valid_to: formatDate(tour.valid_to),
      food_category: {
        0: fixFoodCategory(loadedFoodCategory[0]),
        1: fixFoodCategory(loadedFoodCategory[1]),
        2: fixFoodCategory(loadedFoodCategory[2]),
      },
      country: tour.country,
      markets: tour.markets || [],
      tour_summary: tour.tour_summary || "",
      oldPrice: tour.oldPrice || "",
      inclusions: inclusionsString,
      exclusions: exclusionsString,
      facilities: facilitiesString,
      tour_image: Array.isArray(tour.tour_image) ? tour.tour_image : [tour.tour_image],
      destination_images: tour.destination_images || [],
      activity_images: tour.activity_images || [],
      hotel_images: tour.hotel_images || [],
      itinerary: {
        first_day: tour.itinerary?.first_day || "",
        middle_days: tour.itinerary?.middle_days || {},
        last_day: tour.itinerary?.last_day || "",
      },
      itineraryImages: {
        first_day: tour.itinerary_images?.first_day || [],
        middle_days: tour.itinerary_images?.middle_days || {},
        last_day: tour.itinerary_images?.last_day || [],
      },
      itineraryTitles: {
        first_day: tour.itinerary_titles?.first_day || "",
        middle_days: tour.itinerary_titles?.middle_days || {},
        last_day: tour.itinerary_titles?.last_day || "",
      },
    });
    setNightsInput(baseNightsKey);
    setNewNightsOptions({});
  };

  const handleEditClose = () => {
    setEditTour(null);
    setFormData({
      title: "",
      price: "",
      person_count: "",
      nights: "",
      nightsOptions: {},
      expiry_date: "",
      valid_from: "",
      valid_to: "",
      food_category: {
        0: [0, 0, false],
        1: [0, 0, false],
        2: [0, 0, false],
      },
      country: "",
      markets: [],
      tour_summary: "",
      oldPrice: "",
      inclusions: "",
      exclusions: "",
      facilities: "",
      tour_image: [],
      destination_images: [],
      activity_images: [],
      hotel_images: [],
      itinerary: { first_day: "", middle_days: {}, last_day: "" },
      itineraryImages: { first_day: [], middle_days: {}, last_day: [] },
      itineraryTitles: { first_day: "", middle_days: {}, last_day: "" },
    });
    setNightsInput("");
    setNewNightsOptions({});
  };

  const handleNightsInputChange = (e) => {
    setNightsInput(e.target.value);
  };

  // ============ General Handlers =============

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For markets (checkbox array)
  const handleMarketsChange = (e) => {
    const { checked, value } = e.target;
    const numericValue = Number(value);
    setFormData((prevData) => ({
      ...prevData,
      markets: checked
        ? [...prevData.markets, numericValue]
        : prevData.markets.filter((m) => m !== numericValue),
    }));
  };

  const handleFoodCategoryChange = (catKey, index, val) => {
    const parsedVal = parseInt(val, 10) || 0;
    setFormData((prev) => {
      const oldArray = prev.food_category[catKey] || [0, 0, false];
      const newArray = [...oldArray];
      newArray[index] = parsedVal;
      return { ...prev, food_category: { ...prev.food_category, [catKey]: newArray } };
    });
  };

  // NEW: For toggling the boolean in the food category.
  const handleFoodCategoryCheckboxChange = (catKey, checked) => {
    setFormData((prev) => {
      const oldArray = prev.food_category[catKey] || [0, 0, false];
      const newArray = [...oldArray];
      newArray[2] = checked;
      return { ...prev, food_category: { ...prev.food_category, [catKey]: newArray } };
    });
  };

  // ============ Nights Options Editing =============
  const removeNightsOption = (nightsKey, index) => {
    setFormData((prev) => ({
      ...prev,
      nightsOptions: {
        ...prev.nightsOptions,
        [nightsKey]: Array.isArray(prev.nightsOptions[nightsKey])
          ? prev.nightsOptions[nightsKey].filter((_, i) => i !== index)
          : [],
      },
    }));
  };

  // Delete an entire nights group.
  const handleDeleteNightsGroup = (nightsKey) => {
    setFormData((prev) => {
      const updatedOptions = { ...prev.nightsOptions };
      delete updatedOptions[nightsKey];
      const newBase = prev.nights === nightsKey ? "" : prev.nights;
      return {
        ...prev,
        nights: newBase,
        nightsOptions: updatedOptions,
      };
    });
  };

  // Remove Night Option Handler:
  // Removes the entire pricing group for a given night and, if it's the maximum,
  // removes extra itinerary middle days accordingly.
  const handleRemoveNight = (nightKey) => {
    // Get all night keys as numbers and sort them.
    const nightsKeys = Object.keys(formData.nightsOptions)
      .map(Number)
      .sort((a, b) => a - b);

    // If only one night option exists, do not allow removal.
    if (nightsKeys.length <= 1) {
      Swal.fire("Error", "At least one night option must remain.", "error");
      return;
    }

    const currentNight = parseInt(nightKey, 10);
    // Create a copy and remove the selected night group.
    let updatedNightsOptions = { ...formData.nightsOptions };
    delete updatedNightsOptions[nightKey];

    // Get remaining keys as numbers and determine the new maximum.
    const remainingKeys = Object.keys(updatedNightsOptions)
      .map(Number)
      .sort((a, b) => a - b);
    const newConfirmedNight = remainingKeys[remainingKeys.length - 1];

    // If the removed night is the maximum,
    // then remove the extra itinerary middle days.
    if (currentNight === Math.max(...nightsKeys)) {
      for (let i = newConfirmedNight + 1; i <= currentNight; i++) {
        const dayKey = `day_${i}`;
        if (formData.itinerary.middle_days) {
          delete formData.itinerary.middle_days[dayKey];
        }
        if (formData.itineraryImages.middle_days) {
          delete formData.itineraryImages.middle_days[dayKey];
        }
        if (formData.itineraryTitles.middle_days) {
          delete formData.itineraryTitles.middle_days[dayKey];
        }
      }

      setFormData((prev) => ({
        ...prev,
        nights: newConfirmedNight.toString(), // update confirmed night count
        nightsOptions: updatedNightsOptions,
        itinerary: { ...prev.itinerary },
        itineraryImages: { ...prev.itineraryImages },
        itineraryTitles: { ...prev.itineraryTitles },
      }));
    } else {
      // If the removed night is not the maximum, simply remove its pricing group.
      setFormData((prev) => ({
        ...prev,
        nights: prev.nights === nightKey ? newConfirmedNight.toString() : prev.nights,
        nightsOptions: updatedNightsOptions,
      }));
    }

    Swal.fire("Success", `Night option ${nightKey} removed.`, "success");
  };

  // Adds a new option to an existing nightsKey
  const addNightsOption = (nightsKey) => {
    const newOption = newNightsOptions[nightsKey];
    if (
      !newOption ||
      !newOption.option ||
      !newOption.add_price ||
      !newOption.old_add_price
    ) {
      Swal.fire("Error", "Please fill in all fields for the nights option.", "error");
      return;
    }

    setFormData((prev) => {
      const existingOptions = prev.nightsOptions[nightsKey];
      const currentArr = Array.isArray(existingOptions)
        ? existingOptions
        : Object.values(existingOptions || {});
      return {
        ...prev,
        nightsOptions: {
          ...prev.nightsOptions,
          [nightsKey]: [...currentArr, newOption],
        },
      };
    });

    // Clear local state for that nightsKey
    setNewNightsOptions((prev) => ({
      ...prev,
      [nightsKey]: { option: "", add_price: "", old_add_price: "" },
    }));
  };

  // ============ Itinerary Handlers =============
  const handleItineraryChange = (e, section, dayKey = null) => {
    const value = e.target.value;
    if (section === "middle_days" && dayKey) {
      setFormData((prev) => ({
        ...prev,
        itinerary: {
          ...prev.itinerary,
          middle_days: {
            ...prev.itinerary.middle_days,
            [dayKey]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        itinerary: {
          ...prev.itinerary,
          [section]: value,
        },
      }));
    }
  };

  const handleItineraryTitleChange = (e, section, dayKey = null) => {
    const value = e.target.value;
    if (section === "middle_days" && dayKey) {
      setFormData((prev) => ({
        ...prev,
        itineraryTitles: {
          ...prev.itineraryTitles,
          middle_days: {
            ...prev.itineraryTitles.middle_days,
            [dayKey]: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        itineraryTitles: {
          ...prev.itineraryTitles,
          [section]: value,
        },
      }));
    }
  };

  const handleImageUpload = async (e, key, section) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
        // 1) Generate a temporary blob URL for instant preview
        const loadingUrl = URL.createObjectURL(file);

        // 2) Put that blob URL in state so user sees immediate preview
        if (section === "middle_days" && key) {
            setFormData((prev) => ({
                ...prev,
                itineraryImages: {
                    ...prev.itineraryImages,
                    middle_days: {
                        ...prev.itineraryImages.middle_days,
                        [key]: [...(prev.itineraryImages.middle_days[key] || []), loadingUrl],
                    },
                },
            }));
        } else if (
            section === "tour_image" ||
            section === "destination_images" ||
            section === "activity_images" ||
            section === "hotel_images"
        ) {
            setFormData((prev) => ({
                ...prev,
                [section]: [...prev[section], loadingUrl],
            }));
        } else {
            // For first_day or last_day
            setFormData((prev) => ({
                ...prev,
                itineraryImages: {
                    ...prev.itineraryImages,
                    [key]: [...(prev.itineraryImages[key] || []), loadingUrl],
                },
            }));
        }

        // 3) Upload the file to imgbb
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("image", file);

            // Use axios
            const response = await axios.post(
                "https://api.imgbb.com/1/upload?key=4e08e03047ee0d48610586ad270e2b39",
                formDataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status !== 200) {
                throw new Error(`Failed to upload image. Status: ${response.status}`);
            }

            // Use the response data directly
            const data = response.data;
            const uploadedUrl = data.data.url;

            // 4) Replace the blob URL with the uploaded URL in state
            if (section === "middle_days" && key) {
                setFormData((prev) => ({
                    ...prev,
                    itineraryImages: {
                        ...prev.itineraryImages,
                        middle_days: {
                            ...prev.itineraryImages.middle_days,
                            [key]: prev.itineraryImages.middle_days[key].map((url) =>
                                url === loadingUrl ? uploadedUrl : url
                            ),
                        },
                    },
                }));
            } else if (
                section === "tour_image" ||
                section === "destination_images" ||
                section === "activity_images" ||
                section === "hotel_images"
            ) {
                setFormData((prev) => ({
                    ...prev,
                    [section]: prev[section].map((url) =>
                        url === loadingUrl ? uploadedUrl : url
                    ),
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    itineraryImages: {
                        ...prev.itineraryImages,
                        [key]: prev.itineraryImages[key].map((url) =>
                            url === loadingUrl ? uploadedUrl : url
                        ),
                    },
                }));
            }

        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }
};
  
  const handleRemoveImage = (key, index, section) => {
    if (section === "middle_days" && key) {
      setFormData((prev) => ({
        ...prev,
        itineraryImages: {
          ...prev.itineraryImages,
          middle_days: {
            ...prev.itineraryImages.middle_days,
            [key]: prev.itineraryImages.middle_days[key].filter((_, i) => i !== index),
          },
        },
      }));
    } else if (
      section === "tour_image" ||
      section === "destination_images" ||
      section === "activity_images" ||
      section === "hotel_images"
    ) {
      setFormData((prev) => ({
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index),
      }));
    } else {
      // first_day / last_day
      setFormData((prev) => ({
        ...prev,
        itineraryImages: {
          ...prev.itineraryImages,
          [key]: prev.itineraryImages[key].filter((_, i) => i !== index),
        },
      }));
    }
  };

  // Save (update) the tour.
  const handleSave = async () => {
    try {
      const priceInt = parseInt(formData.price, 10) || 0;
      const oldPriceInt = parseInt(formData.oldPrice, 10) || 0;
      const personCountInt = parseInt(formData.person_count, 10) || 0;
      const parsedFoodCategory = {};
      Object.keys(formData.food_category).forEach((catKey) => {
        const [val1, val2, boolVal] = formData.food_category[catKey];
        parsedFoodCategory[catKey] = [
          parseInt(val1, 10) || 0,
          parseInt(val2, 10) || 0,
          !!boolVal,
        ];
      });
      const parsedNightsOptions = {};
      Object.keys(formData.nightsOptions).forEach((nKey) => {
        parsedNightsOptions[nKey] = formData.nightsOptions[nKey].map((opt) => ({
          ...opt,
          add_price: parseInt(opt.add_price, 10) || 0,
          old_add_price: parseInt(opt.old_add_price, 10) || 0,
        }));
      });
      const payload = {
        title: formData.title,
        price: priceInt,
        baseNights: parseInt(formData.nights, 10) || 0,
        person_count: personCountInt,
        nights: parsedNightsOptions,
        expiry_date: formData.expiry_date,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        food_category: parsedFoodCategory,
        country: formData.country,
        markets: formData.markets,
        tour_summary: formData.tour_summary,
        tour_image: formData.tour_image[0] || "",
        destination_images: formData.destination_images,
        activity_images: formData.activity_images,
        hotel_images: formData.hotel_images,
        inclusions: formData.inclusions.split("\n"),
        exclusions: formData.exclusions.split("\n"),
        facilities: formData.facilities.split("\n"),
        itinerary: formData.itinerary,
        itinerary_images: formData.itineraryImages,
        itinerary_titles: formData.itineraryTitles,
        oldPrice: oldPriceInt,
      };

      const response = await axios.put(`/tours/${editTour._id}`, payload);
      if (response.status !== 200) throw new Error("Failed to update the tour.");
      Swal.fire("Success!", "Tour has been updated successfully.", "success");
      setTours((prevTours) =>
        prevTours.map((t) => (t._id === editTour._id ? response.data : t))
      );
      setEditTour(null);
    } catch (error) {
      console.error("Error updating tour:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation dialog before deleting
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
  
      // If user clicks 'Yes, delete it!'
      if (result.isConfirmed) {
        const response = await axios.delete(`/tours/${id}`);
        if (response.status === 200) {
          // Update the UI by filtering out the deleted tour
          setTours(tours.filter((tour) => tour._id !== id));
  
          // Show success message
          Swal.fire("Deleted!", "Tour has been deleted.", "success");
        } else {
          throw new Error("Failed to delete the tour.");
        }
      } else {
        
      }
    } catch (error) {
      console.error("Error deleting tour:", error);
  
      // Show error message
      Swal.fire("Error", error.message, "error");
    }
  };

  // Duplicate a tour.
  const handleDuplicate = async (tour) => {
    try {
      // Destructure _id out of the tour and keep the rest of the data.
      const { _id, ...duplicateData } = tour;
      // Send a POST request to create a new tour.
      const response = await axios.post("/tours", duplicateData);
      if (response.status === 201) {
        setTours([...tours, response.data]);
        Swal.fire("Success!", "Tour duplicated successfully.", "success");
      } else {
        throw new Error("Failed to duplicate tour.");
      }
    } catch (error) {
      console.error("Error duplicating tour:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="bg-white min-h-screen p-0 ">
      <h1 className="text-5xl font-bold text-center mb-8">
        {user?.role === 'admin' ? 'All Tours (Admin Panel)' : 'My Tours'}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div
          key={tour._id}
          className="bg-white border-2 border-black/15 rounded-lg shadow-lg overflow-hidden transition duration-300 transform hover:scale-105"
        >
          <img
            src={tour.tour_image}
            alt={tour.title}
            className="h-72 w-full object-cover"
          />
            <div className="p-4 text-center">
              <h3 className="text-xl font-semibold">{tour.title}</h3>
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  className="bg-blue-500 text-white w-full  px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => handleEditOpen(tour)}
                >
                  Edit
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleDuplicate(tour)}
                >
                  Duplicate
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleDelete(tour._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editTour && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="relative w-full max-w-4xl bg-white rounded-lg p-8 shadow-xl transform transition-all scale-100 mt-20">
            <button
              onClick={handleEditClose}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-800"
            >
              &times;
            </button>
            <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Edit Tour Details</h2>
            <div className="overflow-y-auto max-h-[60vh] space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Tour Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Price (USD)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-0">Old Price</label>
                <input
                  type="text"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Person Count */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Person Count</label>
                <input
                  type="number"
                  name="person_count"
                  value={formData.person_count}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-600">Valid From</label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Valid To</label>
                <input
                  type="date"
                  name="valid_to"
                  value={formData.valid_to}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Meal Category Pricing
                </label>
                {Object.entries(foodCategoryMapping).map(([key, label]) => (
                  <div key={key} className="border p-4 rounded-md my-2">
                    <h4 className="font-bold">{label}</h4>
                    <div className="flex space-x-4 mt-2">
                      <div>
                        <label className="block text-sm text-gray-500">Add Price (Per Night / Per Person)</label>
                        <input
                          type="number"
                          value={formData.food_category[key]?.[0] || ""}
                          onChange={(e) => handleFoodCategoryChange(key, 0, e.target.value)}
                          className="p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Old Add Price (Per Night / Per Night)</label>
                        <input
                          type="number"
                          value={formData.food_category[key]?.[1] || ""}
                          onChange={(e) => handleFoodCategoryChange(key, 1, e.target.value)}
                          className="p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      {/* Tour Availability Checkbox */}
                      <div className="flex items-center space-x-2 mt-4">
                        <input
                          type="checkbox"
                          checked={!!formData.food_category[key]?.[2]}
                          onChange={(e) => handleFoodCategoryCheckboxChange(key, e.target.checked)}
                        />
                        <label className="text-sm">Tour Available?</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              {/* Markets */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Markets</label>
                <div className="mt-1 p-2 w-full border border-gray-300 rounded-md">
                  {Object.entries(marketMapping).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.markets.includes(Number(key))}
                        onChange={handleMarketsChange}
                      />
                      <label>{value}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Tour Summary</label>
                <textarea
                  name="tour_summary"
                  value={formData.tour_summary}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Tour summary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Tour Image <span className="text-gray-500/40 text-sm"> (Size 1×1)</span></label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, "tour_image", "tour_image")}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2 mt-4">
                  {formData.tour_image.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Tour Image ${index}`}
                        className="w-48 h-48 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("tour_image", index, "tour_image")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-0">Destination Images <span className="text-gray-500/50 text-sm"> (Size 3×2)</span></label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleImageUpload(e, "destination_images", "destination_images")
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2 mt-4">
                  {formData.destination_images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Destination Image ${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("destination_images", index, "destination_images")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Activity Images <span className="text-gray-500/50 text-sm"> (Size 3×2)</span></label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, "activity_images", "activity_images")}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2 mt-4">
                  {formData.activity_images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Activity Image ${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("activity_images", index, "activity_images")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
                  
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-0">Hotel Images <span className="text-gray-500/50 text-sm"> (Size 3×2)</span></label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, "hotel_images", "hotel_images")}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2 mt-4">
                  {formData.hotel_images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Hotel Image ${index}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage("hotel_images", index, "hotel_images")}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Nights Input & Confirmation --- */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Number of Nights</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={nightsInput}
                    onChange={handleNightsInputChange}
                    className="mt-1 p-2 flex-grow border border-gray-300 rounded-md"
                    placeholder="Enter new night count"
                  />
                  <button
                    onClick={handleConfirmNights}
                    className="mt-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Confirm Nights
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Confirming will add new itinerary days (if higher) and create a pricing group.
                </p>
              </div>

              {/* --- Nights Options (Add-on Pricing) Section --- */}
              {formData.nights && (
                <div className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold mb-4">
                      Nights Options (Add-on Pricing) for {formData.nights} nights
                    </h3>
                    {Object.keys(formData.nightsOptions).length > 1 && (
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={() => handleRemoveNight(formData.nights)}
                      >
                        Remove Option ({formData.nights} nights)
                      </button>
                    )}
                  </div>
                  {(Array.isArray(formData.nightsOptions[formData.nights])
                    ? formData.nightsOptions[formData.nights]
                    : []
                  ).map((opt, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border-b">
                      <p>
                        {opt.option}
                        <br />
                        <span className="text-gray-500">
                          Add Price:{" "}
                          <span className="bg-gray-300/80 text-gray-600 p-1">
                            {opt.add_price}
                          </span>
                          , Old Add Price:{" "}
                          <span className="bg-gray-300/80 text-gray-600 p-1">
                            {opt.old_add_price}
                          </span>
                        </span>
                      </p>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => removeNightsOption(formData.nights, idx)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center space-x-2 mt-3">
                    <input
                      type="text"
                      placeholder="Option description"
                      value={newNightsOptions[formData.nights]?.option || ""}
                      onChange={(e) =>
                        setNewNightsOptions((prev) => ({
                          ...prev,
                          [formData.nights]: {
                            ...prev[formData.nights],
                            option: e.target.value,
                          },
                        }))
                      }
                      className="p-2 border border-gray-300 rounded w-1/3"
                    />
                    <input
                      type="number"
                      placeholder="Add Price"
                      value={newNightsOptions[formData.nights]?.add_price || ""}
                      onChange={(e) =>
                        setNewNightsOptions((prev) => ({
                          ...prev,
                          [formData.nights]: {
                            ...prev[formData.nights],
                            add_price: e.target.value,
                          },
                        }))
                      }
                      className="p-2 border border-gray-300 rounded w-1/4"
                    />
                    <input
                      type="number"
                      placeholder="Old Add Price"
                      value={newNightsOptions[formData.nights]?.old_add_price || ""}
                      onChange={(e) =>
                        setNewNightsOptions((prev) => ({
                          ...prev,
                          [formData.nights]: {
                            ...prev[formData.nights],
                            old_add_price: e.target.value,
                          },
                        }))
                      }
                      className="p-2 border border-gray-300 rounded w-1/4"
                    />
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => addNightsOption(formData.nights)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Facilities</label>
                <textarea
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Enter facilities, one per line"
                />
              </div>

              {/* Itinerary */}
              <div>
                <label className="block text-sm font-medium text-gray-600">Itinerary</label>
                <div className="space-y-6">
                  {/* Arrival Day */}
                  <div className="border p-4 rounded-md bg-blue-100">
                    <span className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                      Arrival Day
                    </span>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-3">Title</label>
                      <input
                        type="text"
                        value={formData.itineraryTitles.first_day}
                        onChange={(e) => handleItineraryTitleChange(e, "first_day")}
                        placeholder="Title for Arrival Day"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-1">Activities</label>
                      <textarea
                        rows="2"
                        placeholder="Activities for Arrival Day"
                        value={formData.itinerary.first_day}
                        onChange={(e) => handleItineraryChange(e, "first_day")}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-1">Images <span className="text-gray-500/50 text-sm"> (Size 3×2)</span></label>
                      <input
                        type="file"
                        onChange={(e) => handleImageUpload(e, "first_day", "first_day")}
                        multiple
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                      <div className="flex space-x-2 mt-4">
                        {formData.itineraryImages.first_day.map((image, index) => (
                          <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Arrival Day Image ${index}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage("first_day", index, "first_day")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Days */}
                  {Object.keys(formData.itinerary.middle_days || {})
                    .sort(
                      (a, b) =>
                        parseInt(a.split("_")[1], 10) - parseInt(b.split("_")[1], 10)
                    )
                    .map((dayKey) => (
                      <div key={dayKey} className="border p-4 rounded-md bg-blue-100 my-4">
                        <span className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                          {`Day ${dayKey.split("_")[1]}`}
                        </span>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mt-3">
                            Title
                          </label>
                          <input
                            type="text"
                            value={formData.itineraryTitles.middle_days[dayKey]}
                            onChange={(e) =>
                              handleItineraryTitleChange(e, "middle_days", dayKey)
                            }
                            placeholder={`Title for Day ${dayKey.split("_")[1]}`}
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mt-1">
                            Activities
                          </label>
                          <textarea
                            rows="2"
                            placeholder={`Activities for Day ${dayKey.split("_")[1]}`}
                            value={formData.itinerary.middle_days[dayKey]}
                            onChange={(e) =>
                              handleItineraryChange(e, "middle_days", dayKey)
                            }
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mt-1">
                            Images
                            <span className="text-gray-500/50 text-sm"> (Size 3×2)</span>
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleImageUpload(e, dayKey, "middle_days")}
                            multiple
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                          />
                          <div className="flex space-x-2 mt-4">
                            {formData.itineraryImages.middle_days[dayKey]?.map((image, idx) => (
                              <div key={idx} className="relative">
                                <img
                                  src={image}
                                  alt={`Day ${dayKey.split("_")[1]} Image ${idx}`}
                                  className="w-24 h-24 object-cover rounded"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(dayKey, idx, "middle_days")}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Departure Day */}
                  <div className="border p-4 rounded-md bg-blue-100">
                    <span className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                      Departure Day
                    </span>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-3">Title</label>
                      <input
                        type="text"
                        value={formData.itineraryTitles.last_day}
                        onChange={(e) => handleItineraryTitleChange(e, "last_day")}
                        placeholder="Title for Departure Day"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-1">
                        Activities
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Activities for Departure Day"
                        value={formData.itinerary.last_day}
                        onChange={(e) => handleItineraryChange(e, "last_day")}
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mt-1">Images <span className="text-gray-500/50 text-sm"> (Size 3×2)</span></label>
                      <input
                        type="file"
                        onChange={(e) => handleImageUpload(e, "last_day", "last_day")}
                        multiple
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      />
                      <div className="flex space-x-2 mt-4">
                        {formData.itineraryImages.last_day.map((image, index) => (
                          <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Departure Day Image ${index}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage("last_day", index, "last_day")}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        ))}
                      </div>    
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Inclusions</label>
                <textarea
                  name="inclusions"
                  value={formData.inclusions}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="List of inclusions and use ENTER key for each activity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Exclusions</label>
                <textarea
                  name="exclusions"
                  value={formData.exclusions}
                  onChange={handleInputChange}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="List of exclusions and use ENTER key for each activity"
                />
              </div>

              <div className="flex justify-center mt-5">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTours;
