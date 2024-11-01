import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt'; // Import DataTables
import $ from 'jquery'; // Import jQuery
import { RevolvingDot } from 'react-loader-spinner';
import { ArrowLeftCircle, RefreshCw,ArrowUpCircle  } from 'lucide-react';


const UserWorkSummary = () => {
    DataTable.use(DT); // Initialize DataTables

    const { id } = useParams(); // Get the user ID from the URL
    const navigate = useNavigate(); // Initialize navigate for routing
    const [workSummaries, setWorkSummaries] = useState([]);
    const [projects, setProjects] = useState([]); // Store all projects
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // Store user data
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(true);
    
    useEffect(() => {
        if (sessionStorage.getItem("adminType") != "SUPERADMIN") {
            navigate("/dashboard"); // Redirect to homepage if not SUPERADMIN
        }
    }, [navigate]);


    const fetchProjects = async () => {
        try {
            const response = await fetch('https://serviceprovidersback.onrender.com/api/projects');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const projectData = await response.json();
            setProjects(projectData); // Store all projects
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        }finally {
            setProjectsLoading(false); // Stop loading projects
        }
    };
    // Fetch all projects
    useEffect(() => {
        

        fetchProjects();
    }, []);

    // Fetch user by ID
    const fetchUser = async () => {
        try {
            const response = await fetch(`https://serviceprovidersback.onrender.com/api/users/find/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const userData = await response.json();
            setUser(userData); // Set the user data
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null); // Set user to null on error
        }
    };
    useEffect(() => {
        fetchUser();
    }, [id]);

    // Fetch the work summaries by user ID
    const fetchWorkSummaries = async () => {
        setLoading(true); // Start loading
        try {
            const response = await fetch(`https://serviceprovidersback.onrender.com/api/worksummaries/user/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let data = await response.json();
            setWorkSummaries(Array.isArray(data) ? data : []); // Set the work summaries
        } catch (error) {
            console.error('Error fetching work summaries:', error);
            setWorkSummaries([]); // Set to empty array on error
        } finally {
            setLoading(false); // Stop loading
        }
    };
    useEffect(() => {

        fetchWorkSummaries();
    }, [id]);

   
    const handleScroll = () => {
        const scrollPosition = window.scrollY; // Get current scroll position
        const windowHeight = window.innerHeight; // Get window height
        setShowScrollTop(scrollPosition > windowHeight); // Show button if scrolled down past window height
    };

    // Attach scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll); // Cleanup the event listener
        };
    }, []);


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    // Define columns for the DataTable
    const columns = [
        {
            title: 'Project Title',
            data: 'fld_projectid',
            render: (data) => {
                const project = projects.find((proj) => proj._id == data);
                const title = project ? project.fld_title : 'Unknown Project'; 
                return title ? title : 'No Title'; 
            },
        },
        {
            title: 'Description',
            data: 'fld_description',
            render: (data) => {
                return data ? data : 'No Description'; // Display 'No Description' if description is not present
            },
        },
        {
            title: 'Status',
            data: 'status',
            width:"100px",
            render: (data) => {
                return data ? data : 'No Status'; // Display 'No Status' if status is not present
            },
        },
        {
            title: 'Date Added',
            data: 'fld_addedon',
            width:"110px",
            render: (data, type) => {
                // Render the date for display and sorting
                if (type === 'display') {
                    return data ? new Date(data).toLocaleDateString('en-US') : 'No Date'; // Format date for display or show 'No Date'
                }
                return data ? new Date(data).getTime() : 0; // Use timestamp for sorting or return 0 if no date
            },
        },
    ];


    // Function to handle refresh
    const handleRefresh = () => {
        // Re-fetch user and work summaries
        fetchUser();
        fetchProjects()
        fetchWorkSummaries();
    };

    return (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)} // Go back to the previous page
                    className="bg-red-500 text-white flex px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                >
                    <ArrowLeftCircle className='mr-2' /> Back
                </button>
                <button
                    onClick={handleRefresh}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mr-2"
                >
                    Refresh <RefreshCw className='ml-2' />
                </button>
            </div>
            {showScrollTop && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button
                        onClick={scrollToTop}
                        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                    >
                        <ArrowUpCircle className="w-6 h-6" />
                    </button>
                </div>
            )}

            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                {user ? (
                    <>
                        <img
                            src={user.fld_profile_image && user.fld_profile_image !== ""
                                ? 'https://serviceprovidersback.onrender.com/uploads/profileimg/' + user.fld_profile_image
                                : "https://i.pinimg.com/736x/cb/45/72/cb4572f19ab7505d552206ed5dfb3739.jpg"}
                            alt={user.fld_username || 'No Name'}
                            className="w-10 h-10 rounded-full border border-gray-200 mr-2" // Added margin to separate image and text
                        />
                        {user.fld_name}
                    </>
                ) : 'Loading...'}
            </h1>

            {loading || projectsLoading ? (
                <div className="flex justify-center mt-10">
                    <RevolvingDot
                        visible={true}
                        height="50"
                        width="50"
                        color="#3b82f6" // Tailwind blue-600
                        ariaLabel="revolving-dot-loading"
                    />
                </div>
            ) : (
                <DataTable
                    data={workSummaries}
                    columns={columns}
                    options={{
                        searching: true,
                        paging: true,
                        ordering: true,
                        order: [[3, 'desc']], // Sort by the 4th column (fld_addedon) in descending order
                        responsive: true,
                        className: 'display bg-white rounded-lg shadow-sm',
                    }}
                    className="display"
                />
            )}
        </div>
    );
};

export default UserWorkSummary;
