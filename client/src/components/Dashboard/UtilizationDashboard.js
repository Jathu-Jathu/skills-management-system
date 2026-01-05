import React, { useState, useEffect } from 'react';
import { personnelAPI, projectsAPI } from '../../services/apiEndpoints';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { 
  FaCalendarAlt, 
  FaUserClock, 
  FaChartPie,
  FaCalendarCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UtilizationDashboard = () => {
  const [personnel, setPersonnel] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week' or 'month'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personnelRes, projectsRes] = await Promise.all([
        personnelAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setPersonnel(personnelRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Mock utilization data (in real app, this would come from backend)
  const calculateUtilization = () => {
    const mockUtilization = personnel.map(person => {
      // Simulate random allocation for demo
      const allocatedProjects = projects.filter(() => Math.random() > 0.5);
      const totalDays = timeRange === 'week' ? 7 : 30;
      const allocatedDays = Math.floor(Math.random() * totalDays);
      const utilizationPercentage = Math.round((allocatedDays / totalDays) * 100);
      
      return {
        ...person,
        allocatedProjects: allocatedProjects.slice(0, 2), // Max 2 projects for demo
        allocatedDays,
        totalDays,
        utilizationPercentage,
        status: utilizationPercentage > 80 ? 'overloaded' : 
                utilizationPercentage > 60 ? 'optimal' : 'underutilized'
      };
    });

    return mockUtilization.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'overloaded': return '#ef476f';
      case 'optimal': return '#06d6a0';
      case 'underutilized': return '#ffd166';
      default: return '#118ab2';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'overloaded': return <FaExclamationTriangle />;
      case 'optimal': return <FaCalendarCheck />;
      case 'underutilized': return <FaUserClock />;
      default: return null;
    }
  };

  const chartData = {
    labels: personnel.map(p => p.name.split(' ')[0]), // First names only
    datasets: [
      {
        label: 'Utilization %',
        data: calculateUtilization().map(p => p.utilizationPercentage),
        backgroundColor: calculateUtilization().map(p => getStatusColor(p.status)),
        borderColor: calculateUtilization().map(p => getStatusColor(p.status)),
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Personnel Utilization (%)',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={fetchData} />;

  const utilizationData = calculateUtilization();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2><FaChartPie /> Personnel Utilization Dashboard</h2>
        <div className="dashboard-controls">
          <div className="time-range-selector">
            <button
              className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Weekly
            </button>
            <button
              className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Monthly
            </button>
          </div>
          <button className="btn btn-secondary" onClick={fetchData}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{personnel.length}</h3>
          <p>Total Personnel</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => p.status === 'Active').length}</h3>
          <p>Active Projects</p>
        </div>
        <div className="stat-card">
          <h3>
            {Math.round(
              utilizationData.reduce((acc, p) => acc + p.utilizationPercentage, 0) / 
              utilizationData.length
            )}%
          </h3>
          <p>Avg Utilization</p>
        </div>
        <div className="stat-card">
          <h3>
            {utilizationData.filter(p => p.status === 'overloaded').length}
          </h3>
          <p>Overloaded Staff</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="chart-legend">
          <h4>Legend:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#06d6a0' }}></span>
              <span>Optimal (60-80%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffd166' }}></span>
              <span>Underutilized (&lt;60%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ef476f' }}></span>
              <span>Overloaded (&gt;80%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="utilization-table">
        <h3>Detailed Utilization Report</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Allocated Days</th>
                <th>Utilization %</th>
                <th>Status</th>
                <th>Allocated Projects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilizationData.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="person-info">
                      <div className="avatar">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <strong>{person.name}</strong>
                        <small>{person.role}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {person.allocatedDays} / {person.totalDays} days
                  </td>
                  <td>
                    <div className="utilization-bar">
                      <div 
                        className="utilization-fill"
                        style={{
                          width: `${person.utilizationPercentage}%`,
                          backgroundColor: getStatusColor(person.status)
                        }}
                      ></div>
                      <span className="utilization-text">
                        {person.utilizationPercentage}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${person.status}`}>
                      {getStatusIcon(person.status)}
                      {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="allocated-projects">
                      {person.allocatedProjects.map((project, index) => (
                        <span key={index} className="project-tag">
                          {project.name}
                        </span>
                      ))}
                      {person.allocatedProjects.length === 0 && (
                        <span className="no-projects">No projects</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary">
                        Adjust Allocation
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-insights">
        <h3>Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Overloaded Staff</h4>
            <p>
              {utilizationData.filter(p => p.status === 'overloaded').length} team members 
              are overloaded. Consider redistributing workload.
            </p>
          </div>
          <div className="insight-card">
            <h4>Underutilized Staff</h4>
            <p>
              {utilizationData.filter(p => p.status === 'underutilized').length} team members 
              have capacity for additional projects.
            </p>
          </div>
          <div className="insight-card">
            <h4>Optimal Allocation</h4>
            <p>
              {utilizationData.filter(p => p.status === 'optimal').length} team members 
              are optimally allocated. Maintain this balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilizationDashboard;