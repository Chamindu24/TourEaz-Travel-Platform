import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space, Card, Divider, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

/**
 * Custom hook to detect device type (mobile, tablet, desktop).
 */
function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType({
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

const convertToUSD = (price, currency, rates) => {
  if (currency === 'USD') return price;
  const rate = rates[currency];
  if (!rate) return price;
  return price / rate;
};

/**
 * TourInquiries component: Fetches and displays inquiries in both
 * a table (desktop) and card (mobile/tablet) view. Allows confirming
 * pending inquiries, canceling pending/confirmed inquiries, reconfirming
 * cancelled inquiries, and deleting inquiries.
 */
const TourInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isMobile, isTablet } = useDeviceType();
  const isDesktop = !isMobile && !isTablet;
  const [exchangeRates, setExchangeRates] = useState({});

  const fetchExchangeRates = async () => {
    try {
      // Corrected URL (remove double /api/api/)
      const response = await axios.get('/api/exchange-rates', { withCredentials: false });
      setExchangeRates(response.data.rates || {});
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback to empty rates to prevent price conversion errors
      setExchangeRates({});
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchExchangeRates();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/inquiries', { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to fetch inquiries.');
      const data = response.data;

      const transformed = data
        .map((item) => ({
          ...item,
          _id: item._id?.$oid || item._id,
          travel_date: item.travel_date ? new Date(item.travel_date) : null,
          status: item.status || 'Pending', // Fallback status
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setInquiries(transformed);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      message.error(error.message || 'Failed to fetch inquiries.');
    } finally {
      setLoading(false);
    }
  };

  const confirmInquiry = async (id) => {
    try {
      const response = await axios.put(`/inquiries/${id}/confirm`, {}, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to confirm inquiry.');
      message.success('Inquiry confirmed successfully.');
      fetchInquiries();
    } catch (error) {
      console.error('Error confirming inquiry:', error);
      message.error(error.message || 'Failed to confirm inquiry.');
    }
  };

  const cancelInquiry = async (id) => {
    const confirmed = window.confirm('Are you sure you want to cancel this inquiry?');
    if (!confirmed) return;

    try {
      const response = await axios.put(`/inquiries/${id}/cancel`, {}, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to cancel inquiry.');
      message.success('Inquiry cancelled successfully.');
      fetchInquiries();
    } catch (error) {
      console.error('Error cancelling inquiry:', error);
      message.error(error.message || 'Failed to cancel inquiry.');
    }
  };

  const reconfirmInquiry = async (id) => {
    const confirmed = window.confirm('Are you sure you want to reconfirm this inquiry?');
    if (!confirmed) return;

    try {
      const response = await axios.put(`/inquiries/${id}/reconfirm`, {}, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to reconfirm inquiry.');
      message.success('Inquiry reconfirmed successfully.');
      fetchInquiries();
    } catch (error) {
      console.error('Error reconfirming inquiry:', error);
      message.error(error.message || 'Failed to reconfirm inquiry.');
    }
  };

  const deleteInquiry = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this inquiry?');
    if (!confirmed) return;

    try {
      const response = await axios.delete(`/inquiries/${id}`, { withCredentials: true });
      if (response.status !== 200) throw new Error('Failed to delete inquiry.');
      message.success('Inquiry deleted successfully.');
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      message.error(error.message || 'Failed to delete inquiry.');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const statusStyles = {
          Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
          Confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
          Cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
        };
        const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {status || 'Unknown'}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && (
            <Button
              type="primary"
              style={{ backgroundColor: 'green', borderColor: 'green' }}
              onClick={() => confirmInquiry(record._id)}
            >
              Confirm
            </Button>
          )}
          {(record.status === 'Pending' || record.status === 'Confirmed') && (
            <Button
              type="primary"
              style={{ backgroundColor: 'red', borderColor: 'red' }}
              onClick={() => cancelInquiry(record._id)}
            >
              Cancel
            </Button>
          )}
          {record.status === 'Cancelled' && (
            <Button
              type="primary"
              style={{ backgroundColor: 'blue', borderColor: 'blue' }}
              onClick={() => reconfirmInquiry(record._id)}
            >
              Reconfirm
            </Button>
          )}
          <Button
            icon={<DeleteOutlined />}
            style={{ border: '1px solid red', color: 'red' }}
            onClick={() => deleteInquiry(record._id)}
          />
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const formattedDate = record.travel_date
      ? record.travel_date.toLocaleDateString()
      : 'N/A';
    const finalPriceInUSD =
      record.final_price && record.currency !== 'USD'
        ? convertToUSD(record.final_price, record.currency, exchangeRates)
        : record.final_price;
    return (
      <div style={{ backgroundColor: '#fafafa', padding: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <p><strong>Phone Number:</strong> {record.phone_number || 'N/A'}</p>
            <p><strong>Travel Date:</strong> {formattedDate}</p>
            <p><strong>Traveller Count:</strong> {record.traveller_count || 'N/A'}</p>
            <p><strong>Message:</strong> {record.message || 'N/A'}</p>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <p><strong>Tour:</strong> {record.tour || 'N/A'}</p>
            <p><strong>Selected Nights:</strong> {record.selected_nights_key || 'N/A'} Nights</p>
            <p><strong>Option:</strong> {record.selected_nights_option || 'N/A'}</p>
            <p><strong>Food:</strong> {record.selected_food_category || 'N/A'}</p>
            <p>
              <strong>Final Price:</strong> USD{' '}
              {finalPriceInUSD !== undefined
                ? finalPriceInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0'}
            </p>
          </Col>
        </Row>
      </div>
    );
  };

  const renderMobileCards = () => {
    return (
      <>
        {inquiries.map((inquiry) => {
          const statusStyles = {
            Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            Confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
            Cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
          };
          const style = statusStyles[inquiry.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
          const formattedTravelDate = inquiry.travel_date
            ? inquiry.travel_date.toLocaleDateString()
            : 'N/A';
          const finalPriceInUSD =
            inquiry.final_price && inquiry.currency !== 'USD'
              ? convertToUSD(inquiry.final_price, inquiry.currency, exchangeRates)
              : inquiry.final_price;

          return (
            <Card
              key={inquiry._id}
              style={{ marginBottom: 16, backgroundColor: '#f0f0f0', paddingTop: 8 }}
              bodyStyle={{ padding: '0 24px 24px 24px' }}
              title={(
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>Name:</strong> {inquiry.name}
                  <strong>Email:</strong> {inquiry.email}
                  <strong>Phone:</strong> {inquiry.phone_number || 'N/A'}
                </div>
              )}
            >
              <Divider style={{ margin: '12px 0' }} />
              <p><strong>Status:</strong> <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>{inquiry.status || 'Unknown'}</span></p>
              <p><strong>Phone:</strong> {inquiry.phone_number || 'N/A'}</p>
              <p><strong>Travel Date:</strong> {formattedTravelDate}</p>
              <p><strong>Traveller Count:</strong> {inquiry.traveller_count || 'N/A'}</p>
              <p><strong>Message:</strong> {inquiry.message}</p>

              <Divider />
              <p><strong>Tour:</strong> {inquiry.tour || 'N/A'}</p>
              <p><strong>Nights:</strong> {inquiry.selected_nights_key || 'N/A'}</p>
              <p><strong>Option:</strong> {inquiry.selected_nights_option || 'N/A'}</p>
              <p><strong>Food:</strong> {inquiry.selected_food_category || 'N/A'}</p>
              <p>
                <strong>Final Price:</strong> USD{' '}
                {finalPriceInUSD !== undefined
                  ? finalPriceInUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '0'}
              </p>

              <Divider />
              <Space style={{ padding: '0 15%' }}>
                {inquiry.status === 'Pending' && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                    onClick={() => confirmInquiry(inquiry._id)}
                  >
                    Confirm
                  </Button>
                )}
                {(inquiry.status === 'Pending' || inquiry.status === 'Confirmed') && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: 'red', borderColor: 'red' }}
                    onClick={() => cancelInquiry(inquiry._id)}
                  >
                    Cancel
                  </Button>
                )}
                {inquiry.status === 'Cancelled' && (
                  <Button
                    type="primary"
                    style={{ backgroundColor: 'blue', borderColor: 'blue' }}
                    onClick={() => reconfirmInquiry(inquiry._id)}
                  >
                    Reconfirm
                  </Button>
                )}
                <Button
                  icon={<DeleteOutlined />}
                  style={{ border: '1px solid red', color: 'red' }}
                  onClick={() => deleteInquiry(inquiry._id)}
                />
              </Space>
            </Card>
          );
        })}
      </>
    );
  };

  return (
    <div>
      <Button
        
        className="inline-flex items-center px-4 py-2  border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 border-2 hover:border-teal-500 duration-300"
        onClick={fetchInquiries}
        disabled={loading}
        style={{ marginBottom: '20px' }}
      >
        {loading ? 'Reloading...' : 'Reload Inquiries'}
      </Button>

      {isDesktop ? (
        <Table
          dataSource={inquiries}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 6 }}
          expandable={{
            expandedRowRender: (record) => expandedRowRender(record),
            rowExpandable: (record) => true,
          }}
        />
      ) : (
        renderMobileCards()
      )}
    </div>
  );
};

export default TourInquiries;