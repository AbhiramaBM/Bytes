import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../hooks/useAuth';

export const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isAuthenticated } = useAuth();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 relative overflow-hidden">
                {isAuthenticated && (
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                )}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto 
                        ${isAuthenticated && isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}
                >
                    <div className="min-h-[calc(100vh-64px)] flex flex-col">
                        <div className="flex-1 p-4 md:p-8">
                            <div className="max-w-7xl mx-auto animate-fadeIn">
                                {children}
                            </div>
                        </div>
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
