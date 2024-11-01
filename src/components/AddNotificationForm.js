import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery'; // Import jQuery
import 'select2'; // Import Select2
import { CircleX, Save } from 'lucide-react';
import ReactQuill from 'react-quill'; // Import react-quill
import 'react-quill/dist/quill.snow.css'; // Import styles

const AddNotificationForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      fld_title: '',
      fld_description: '',
      fld_due_date: '',
      fld_userid: [],
      fld_adminid: "1", // You can change this to a dynamic value if necessary
    });
  
    const [serviceProviders, setServiceProviders] = useState([]);
    const selectRef = useRef(null); // Reference for the select element
    const [selectAll, setSelectAll] = useState(false);
  
    useEffect(() => {
      const fetchServiceProviders = async () => {
        try {
          const response = await fetch('https://serviceprovidersback.onrender.com/api/users/activeserviceproviders');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log('Fetched service providers:', data);
          setServiceProviders(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching service providers:', error);
          setServiceProviders([]); // Set to empty array on error
        }
      };
  
      fetchServiceProviders();
    }, []);
  
    // Initialize Select2 when the component mounts
    useEffect(() => {
      $(selectRef.current).select2({
        placeholder: "Select providers",
        allowClear: true,
      }).on('change', (e) => {
        setFormData((prevData) => ({
          ...prevData,
          fld_userid: Array.from(e.target.selectedOptions, option => option.value),
        }));
      });
  
      // Cleanup Select2
      return () => {
        $(selectRef.current).select2('destroy');
      };
    }, [serviceProviders]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const response = await fetch('https://serviceprovidersback.onrender.com/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        console.log('Notification created successfully');
        toast.success("Notification created successfully!");
        onClose();
      } else {
        console.error('Error creating notification');
        toast.error("Error creating notification!");
      }
    };
    const handleQuillChange = (value) => {
        setFormData((prevData) => ({
          ...prevData,
          fld_description: value, // Update the WYSIWYG content
        }));
      };
  
    const removeProvider = (providerId) => {
      setFormData((prevData) => {
        const updatedUserIds = prevData.fld_userid.filter(_id => _id.toString() !== providerId.toString());
        $(selectRef.current).val(updatedUserIds).trigger('change'); // Update Select2
        return {
          ...prevData,
          fld_userid: updatedUserIds,
        };
      });
    };
    const handleSelectAll = () => {
      if (!selectAll) {
        const allProviderIds = serviceProviders.map(provider => provider._id.toString());
        setFormData((prevData) => ({
          ...prevData,
          fld_userid: allProviderIds,
        }));
        $(selectRef.current).val(allProviderIds).trigger('change'); // Select all in Select2
      } else {
        setFormData((prevData) => ({
          ...prevData,
          fld_userid: [],
        }));
        $(selectRef.current).val([]).trigger('change'); // Deselect all in Select2
      }
      setSelectAll(!selectAll);
    };
  
    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="bg-sky-50 w-full h-full p-6 fixed top-0 right-0 z-50 overflow-y-auto shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white py-2 px-2 rounded-full"
        >
          <CircleX />
        </button>
        <h2 className="text-2xl font-bold mb-4">Add Notification</h2>
        <form onSubmit={handleSubmit} className='max-w-5xl mx-auto mt-2'>
          <div className='flex w-full justify-center'>
            <div className="mb-4 w-1/2 mx-1">
              <input type='hidden' value="1" name="fld_adminid" />
              <label className="block text-sm font-medium mb-1" htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="fld_title"
                value={formData.fld_title} // Updated
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
            <div className="mb-4 w-1/2 mx-1">
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="fld_due_date"
                value={formData.fld_due_date} // Updated
                min={new Date().toISOString().split("T")[0]} 
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
          </div>
          <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
          <ReactQuill
            id="description"
            value={formData.fld_description} // Use the WYSIWYG editor value
            onChange={handleQuillChange} // Handle change in the editor
            className="border border-gray-300 rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="form-checkbox"
            />
            <span className="ml-2">Select All Service Providers</span>
          </label>
        </div>
          {/* Dropdown for Service Providers */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="serviceProvider">
              Select Service Provider
            </label>
            <select
              id="serviceProvider"
              name="fld_userid" // Updated
              multiple
              ref={selectRef}
              className="border border-gray-300 rounded p-2 w-full"
              required
            >
              {serviceProviders.map((provider) => (
                <option key={provider.id} value={provider._id}>
                  {provider.fld_username}
                </option>
              ))}
            </select>
          </div>
          
          {/* Display selected service providers */}
          {formData.fld_userid.length > 0 && (
            <div className="mb-4 max-w-5xl mx-auto">
              <label className="text-sm font-medium my-3">Selected Service Providers</label>
              <div className="flex flex-wrap mb-2 p-2 bg-gray-50 rounded-xl shadow-md">
                {formData.fld_userid.map((providerId) => {
                  const provider = serviceProviders.find(p => p._id.toString() === providerId);
                  return (
                    provider ? (
                      <motion.div
                        key={provider._id}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center mr-2 mb-2 border border-gray-300 rounded-full bg-white p-2 shadow-sm hover:shadow-lg transition-shadow"
                      >
                        <img 
                          src={provider.fld_profile_image && provider.fld_profile_image !== "" 
                            ? 'https://serviceprovidersback.onrender.com/uploads/profileimg/' + provider.fld_profile_image 
                            : "https://i.pinimg.com/736x/cb/45/72/cb4572f19ab7505d552206ed5dfb3739.jpg"} 
                          alt={provider.fld_username || 'No Name'}
                          className="w-10 h-10 rounded-full border border-gray-200"
                        />
                        <span className="mx-2 text-gray-800 font-semibold">{provider.fld_username || 'No Name'}</span>
                        <button
                          type="button"
                          onClick={() => removeProvider(provider._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <CircleX />
                        </button>
                      </motion.div>
                    ) : (
                      <span key={providerId} className="mr-2 text-red-500">Provider with ID {providerId} not found.</span>
                    )
                  );
                })}
              </div>
            </div>
          )}
  
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-black text-white py-2 px-4 rounded flex"
            >
             <CircleX className='mr-2'/> Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded flex">
             <Save className='mr-2'/> Save
            </button>
          </div>
        </form>
        <ToastContainer />
      </motion.div>
    );
  };

  export default AddNotificationForm;