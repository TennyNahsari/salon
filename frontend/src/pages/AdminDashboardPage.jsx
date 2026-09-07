import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import DashboardOverview from '../components/Admin/DashboardOverview';
import OutletManager from '../components/Admin/OutletManager';
import BookingManager from '../components/Admin/BookingManager';
import ManualBookingModal from '../components/Admin/ManualBookingModal';
import ServiceManager from '../components/Admin/ServiceManager';
import StaffManager from '../components/Admin/StaffManager';
import PaymentManager from '../components/Admin/PaymentManager';
import PaymentConfig from '../components/Admin/PaymentConfig';
import { getAllBookings, refreshBookings, getServices, getOutlets } from '../services/api';

export default function AdminDashboardPage({ onGoHome }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [outlets, setOutlets] = useState([]);
  const [outletFilter, setOutletFilter] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Manual booking modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  useEffect(() => {
    fetchBookingsData();
    fetchServicesData();
    fetchOutletsData();
  }, [statusFilter, dateFilter, outletFilter]);

  const fetchBookingsData = async () => {
    try {
      setLoadingBookings(true);
      const res = await getAllBookings(statusFilter, dateFilter, outletFilter);
      if (res.success) {
        setBookings(res.bookings);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchServicesData = async () => {
    try {
      setLoadingServices(true);
      const res = await getServices();
      if (res.success) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchOutletsData = async () => {
    try {
      const res = await getOutlets(false);
      if (res.success) {
        setOutlets(res.outlets);
      }
    } catch (err) {
      console.error('Error loading outlets:', err);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoadingBookings(true);
      const res = await refreshBookings(statusFilter, dateFilter, outletFilter);
      if (res.success) {
        setBookings(res.bookings);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error refreshing bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoHome={onGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl overflow-x-hidden">
        {activeTab === 'overview' && (
          <DashboardOverview
            stats={stats}
            onNavigateBookings={() => setActiveTab('bookings')}
          />
        )}

        {activeTab === 'outlets' && (
          <OutletManager />
        )}

        {activeTab === 'bookings' && (
          <BookingManager
            bookings={bookings}
            loading={loadingBookings}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            outletFilter={outletFilter}
            setOutletFilter={setOutletFilter}
            outlets={outlets}
            onRefresh={handleRefresh}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            services={services}
          />
        )}

        {activeTab === 'services' && (
          <ServiceManager
            services={services}
            loading={loadingServices}
            onRefresh={fetchServicesData}
            outlets={outlets}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManager services={services} outlets={outlets} />
        )}

        {activeTab === 'payments_module' && (
          <PaymentManager
            bookings={bookings}
            loading={loadingBookings}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentConfig />
        )}
      </main>

      {/* Manual Booking Modal */}
      <ManualBookingModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        services={services}
        outlets={outlets}
        onSaved={fetchBookingsData}
      />

    </div>
  );
}
