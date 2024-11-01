import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery'; // Import jQuery
import WorkoffView from '../components/WorkoffView';
import ConfirmationModal from '../components/ConfirmationModal'; 
import { RefreshCw } from 'lucide-react';
import { RevolvingDot } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

const ManageWorkoffs = () => {
  DataTable.use(DT);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewWorkoffData, setViewWorkoffData] = useState(null);
  const [workoffs, setWorkoffs] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // New state to track when both data are loaded

  const navigate = useNavigate();
    useEffect(() => {
        if (sessionStorage.getItem("adminType") != "SUPERADMIN") {
            navigate("/dashboard"); // Redirect to homepage if not SUPERADMIN
        }
    }, [navigate]);

  const handleAddWorkoffClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
 
  // Function to fetch service providers
  const fetchServiceProviders = async () => {
    try {
      const response = await fetch('https://serviceprovidersback.onrender.com/api/users/serviceproviders'); // API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setServiceProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      setServiceProviders([]); // Empty array on error
    }
  };

  // Function to fetch work-offs from the API
  const fetchWorkoffs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://serviceprovidersback.onrender.com/api/workoffs/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setWorkoffs(data);
    } catch (error) {
      console.error('Error fetching work-offs:', error);
      setWorkoffs([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch workoffs and service providers when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchWorkoffs(), fetchServiceProviders()]); 
      setDataLoaded(true); // Set to true once both workoffs and serviceProviders are loaded
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: 'User',
      data: 'fld_service_provider_id',
      width: "90px",
      render: (data) => {
        const provider = serviceProviders.find(provider => provider._id == data); // Match by ID
        return `<div style="width: 100%; font-size: 13px;">${provider ? provider.fld_name : 'Unknown Provider'}</div>`; // Display name or fallback to 'Unknown Provider'
      },
    },
    {
      title: 'Start Date',
      data: 'fld_start_date',
      width: "100px",
      render: (data) => `<div style="width: 100%; font-size: 13px;">${new Date(data).toLocaleDateString()}</div>`, // Format date
    },
    {
      title: 'End Date',
      data: 'fld_end_date',
      width: "100px",
      render: (data) => `<div style="width: 100%; font-size: 13px;">${new Date(data).toLocaleDateString()}</div>`,
    },
    {
      title: 'Duration',
      data: 'fld_duration',
      width: "80px",
      render: (data) => `<div style="width: 100%; font-size: 13px;">${data}</div>`,
    },
    {
      title: 'Reason',
      data: 'fld_reason',
      render: (data) => (
        `<div style="width: 100%; font-size: 13px;">${data.length > 80 ? `${data.substring(0, 80)}...` : data}</div>` // Trim reason if too long
      ),
    },
    {
      title: 'Added On',
      data: 'fld_addedon',
      width: "100px",
      render: (data, type) => {
        if (type === 'display') {
          return data ? new Date(data).toLocaleDateString('en-US') : 'No Date'; 
        }
        return data ? new Date(data).getTime() : 0; 
      },
    },
    {
      title: 'Actions',
      width: "100px",
      render: (data, type, row) => (
        `<div style="width: 100%; font-size: 13px;">
           <button class="view-btn" data-id="${row._id}">View</button>
         </div>`
      ),
    },
  ];

  const handleViewWorkoffClick = (id) => {
    const workoff = workoffs.find((w) => w._id === id);
    if (workoff) {
      setViewWorkoffData(workoff);
      setIsViewOpen(true);
    }
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setViewWorkoffData(null);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Workoffs</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={fetchWorkoffs}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mr-2"
        >
          Refresh <RefreshCw className='ml-2' />
        </button>
      </div>

      <AnimatePresence>
        <WorkoffView 
          isOpen={isViewOpen} 
          workoffData={viewWorkoffData} 
          serviceProviders={serviceProviders} 
          onClose={handleCloseView} 
        />
      </AnimatePresence>

      <div className="mt-4">
        {loading || !dataLoaded ? (
          <div className="flex justify-center mt-10 max-w-4xl">
            <RevolvingDot
              visible={true}
              height="50"
              width="50"
              color="#3b82f6" 
              ariaLabel="revolving-dot-loading"
            />
          </div>
        ) : (
          <DataTable
            data={workoffs}
            columns={columns}
            options={{
              searching: true,
              paging: true,
              ordering: true,
              order: [[5, 'desc']],
              responsive: true,
              createdRow: (row, data) => {
                $(row).on('click', (e) => {
                  const button = e.target;
                  if (button.classList.contains('view-btn')) {
                    const id = button.getAttribute('data-id');
                    handleViewWorkoffClick(id);
                  }
                });
              },
            }}
            className="display bg-white rounded-lg shadow-sm z-1"
          />
        )}
      </div>
    </div>
  );
};

export default ManageWorkoffs;
