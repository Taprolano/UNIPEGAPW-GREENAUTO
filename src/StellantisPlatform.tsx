import React, {useState, useEffect, useMemo} from 'react';
import {
    Search,
    Download,
    BarChart3,
    FileText,
    Globe,
    AlertTriangle,
    GraduationCap,
    Factory,
    BarChart,
    Scale,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend} from 'recharts';

const API_BASE_URL = 'http://localhost:3001/api';

export default function GreenAutoPlatform() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState(2025);
    const [selectedReportYear, setSelectedReportYear] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const [data, setData] = useState({
        emissions: [],
        reports: [],
        companyStats: {},
        allYearStats: [] // Add this to store all years data
    });

    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiStatus, setApiStatus] = useState({status: 'connecting'});
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const handleReportDownload = (report) => {
        alert(`Download ${report.title}\n\nNote: This is a university project demo.\nNo actual files will be downloaded.\n\nReport Details:\n- Type: ${report.type || 'PDF'}\n- Size: ${report.size}\n- Category: ${report.category}`);
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [emissionsRes, reportsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/esg/emissions`),
                fetch(`${API_BASE_URL}/esg/reports`)
            ]);

            if (!emissionsRes.ok || !reportsRes.ok) {
                throw new Error(`HTTP error! emissions: ${emissionsRes.status}, reports: ${reportsRes.status}`);
            }

            let emissionsData, reportsData;

            try {
                emissionsData = await emissionsRes.json();
                reportsData = await reportsRes.json();
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                throw new Error('Failed to parse server response');
            }

            // Fetch all years stats for historical chart
            const allYearsStats = [];
            for (let year = 2020; year <= 2025; year++) {
                try {
                    const statsRes = await fetch(`${API_BASE_URL}/esg/company-stats/${year}`);
                    if (statsRes.ok) {
                        const statsData = await statsRes.json();
                        if (statsData.success) {
                            allYearsStats.push(statsData.data);
                        }
                    }
                } catch (error) {
                    console.warn(`Could not fetch stats for year ${year}:`, error);
                }
            }

            setData(prev => ({
                ...prev,
                emissions: emissionsData.data || [],
                reports: reportsData.data || [],
                allYearStats: allYearsStats
            }));

            setApiStatus({
                status: 'live',
                lastUpdated: new Date().toISOString(),
                source: 'GreenAuto ESG Data API'
            });

        } catch (error) {
            console.error('Error fetching ESG data:', error);
            setApiStatus({
                status: 'offline',
                error: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyStats = async (year) => {
        try {
            console.log(`Fetching company stats for year: ${year}`);

            const response = await fetch(`${API_BASE_URL}/esg/company-stats/${year}`);
            const result = await response.json();

            console.log('Full API response:', result);

            if (!result.success) {
                console.log(`No company stats available for ${year}: ${result.error}`);
                setData(prev => ({
                    ...prev,
                    companyStats: {}
                }));
                return;
            }

            console.log('Company stats data received:', result.data);

            setData(prev => ({
                ...prev,
                companyStats: result.data || {}
            }));


        } catch (error) {
            console.error('Error fetching company stats:', error);
        }
    };

    const fetchFilteredReports = async (search = '', year = 0, category = '') => {
        try {
            const params = new URLSearchParams();

            if (search.trim()) params.append('q', search.trim());
            if (year && year !== 0) params.append('year', year.toString());
            if (category.trim()) params.append('category', category.trim());

            const url = `${API_BASE_URL}/esg/reports/search?${params.toString()}`;
            const response = await fetch(url);
            const result = await response.json();

            setFilteredReports(result.data || []);
        } catch (error) {
            console.error('Error fetching filtered reports:', error);
            setFilteredReports([]);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchFilteredReports(searchQuery, selectedReportYear, selectedCategory);
        }
    }, [searchQuery, activeTab, selectedCategory, selectedReportYear]);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchCompanyStats(selectedYear);
    }, [selectedYear]);

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchFilteredReports(searchQuery, selectedReportYear, selectedCategory);
        }
    }, [activeTab, searchQuery, selectedReportYear, selectedCategory]);

    const Disclaimer = () => (
        showDisclaimer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
                    <div className="flex items-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-amber-500 mr-2"/>
                        <h3 className="text-lg font-bold text-gray-900">Project Disclaimer</h3>
                    </div>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center mb-2">
                                <GraduationCap className="h-5 w-5 text-blue-600 mr-2"/>
                                <h4 className="font-bold text-blue-900">University Project Work</h4>
                            </div>
                            <p>This platform was developed by Mauro Giambenedetti as part of a university project work.
                                Any inquiries please refer to mgiambenedetti@yahoo.com</p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                            <div className="flex items-center mb-2">
                                <Factory className="h-5 w-5 text-green-600 mr-2"/>
                                <h4 className="font-bold text-green-900">About GreenAuto S.p.A.</h4>
                            </div>
                            <p><strong>GreenAuto S.p.A.</strong> is a fictional Italian automotive company created for
                                educational purposes. The company profile, ESG data, and sustainability reports are
                                simulated for this academic project.</p>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
                            <div className="flex items-center mb-2">
                                <BarChart className="h-5 w-5 text-amber-600 mr-2"/>
                                <h4 className="font-bold text-amber-900">Data Sources</h4>
                            </div>
                            <p>For realistic demonstration purposes, this project utilizes publicly available ESG data
                                patterns and methodologies from <strong>Stellantis N.V.</strong> annual reports and
                                sustainability statements, adapted and modified for the fictional GreenAuto S.p.A.
                                context.</p>
                            <p className="mt-2"><strong>Source Attribution:</strong> Stellantis N.V. (2024). Annual
                                Report 2024. Available at: stellantis.com</p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                            <div className="flex items-center mb-2">
                                <Scale className="h-5 w-5 text-red-600 mr-2"/>
                                <h4 className="font-bold text-red-900">Legal Notice</h4>
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Not affiliated with any real automotive company</li>
                                <li>For educational purposes only - not for commercial use</li>
                                <li>No actual ESG reports are available for download</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setShowDisclaimer(false)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            I Understand - Continue to Platform
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    const Overview = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading ESG data...</p>
                    </div>
                </div>
            );
        }

        const stats = data.companyStats;

        console.log('Overview rendering with stats:', stats);
        console.log('Object.keys(stats).length:', Object.keys(stats).length);

        return (
            <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-md p-6 w-[1100px] max-w-full mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">ESG Performance {selectedYear}</h3>
                        {stats.isPreliminary && (
                            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                <AlertCircle className="h-4 w-4"/>
                                <span>Preliminary Data - {stats.dataMonth} 2025</span>
                            </div>
                        )}
                    </div>

                    {Object.keys(stats).length === 0 ? (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center">
                                <AlertCircle className="h-12 w-12 text-amber-400 mb-4"/>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Data Not Yet Available
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    ESG performance data for {selectedYear} is not yet available.
                                </p>
                                <p className="text-xs text-gray-500">
                                    This year's data may still be in preparation.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{stats.totalEmissions || '0'} Kt
                                    CO2e
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Total GHG Emissions</div>
                            </div>

                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.womenLeadership || '0'}%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Women in Leadership</div>
                            </div>

                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{stats.decarbElectricity || '0'}%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Renewable Energy</div>
                            </div>

                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">{stats.vehiclesRecalled || '0'}K
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Vehicles Recalled</div>
                            </div>
                        </div>
                    )}

                    {stats.isPreliminary && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0"/>
                                <div className="text-sm text-amber-800">
                                    <p className="font-medium">Preliminary 2025 Data</p>
                                    <p className="mt-1">These figures are preliminary estimates based on data through {stats.dataMonth} 2025. Final audited results will be available in March 2026.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {Object.keys(stats).length > 0 && data.allYearStats.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 w-[1100px] max-w-full mx-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">ESG Performance Trends (2020-2025)</h3>

                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data.allYearStats} margin={{top: 20, right: 30, left: 20, bottom: 60}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="year"
                                    tick={{fontSize: 12}}
                                    tickLine={true}
                                />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    tick={{fontSize: 12}}
                                    label={{ value: 'Emissions (Kt CO2e)', angle: -90, position: 'insideLeft' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{fontSize: 12}}
                                    label={{ value: 'Percentage (%)', angle: 90, position: 'insideRight' }}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        if (name === 'GHG Emissions') return [`${value} Kt CO2e`, name];
                                        if (name === 'Vehicle Recalls') return [`${value} K units`, name];
                                        return [`${value}%`, name];
                                    }}
                                    labelFormatter={(year) => `Year: ${year}`}
                                />
                                <Legend
                                    wrapperStyle={{paddingTop: '20px'}}
                                />

                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="totalEmissions"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    name="GHG Emissions"
                                    dot={{fill: '#ef4444', strokeWidth: 2, r: 4}}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="womenLeadership"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    name="Women in Leadership"
                                    dot={{fill: '#3b82f6', strokeWidth: 2, r: 4}}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="decarbElectricity"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Renewable Energy"
                                    dot={{fill: '#10b981', strokeWidth: 2, r: 4}}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="vehiclesRecalled"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    name="Vehicle Recalls"
                                    dot={{fill: '#f59e0b', strokeWidth: 2, r: 4}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 w-[1100px] max-w-full mx-auto">
                    <div className="flex items-center mb-4">
                        <FileText className="h-5 w-5 text-gray-600 mr-2"/>
                        <h3 className="text-lg font-semibold text-gray-900">Featured Report {selectedYear}</h3>
                    </div>

                    {(() => {
                        const featuredReport = data.reports.find(report =>
                            report.year === selectedYear &&
                            (report.category === 'Annual Report' || report.title.toLowerCase().includes('annual'))
                        );

                        if (featuredReport) {
                            return (
                                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <FileText className="h-10 w-10 text-blue-500"/>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {featuredReport.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {featuredReport.description || `Complete sustainability report including environmental impact, social responsibility, and governance metrics for ${selectedYear}`}
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1"/>
                                                        <span>{featuredReport.date}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <BarChart className="h-4 w-4 mr-1"/>
                                                        <span>{featuredReport.size}</span>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {featuredReport.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                onClick={() => handleReportDownload(featuredReport)}
                                            >
                                                <Download className="h-4 w-4 mr-2"/>
                                                Download {featuredReport.type || 'PDF'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4"/>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                                            Report Not Found
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            No annual report available for {selectedYear}. The report may still be in preparation or not yet published.
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Check back later or contact our ESG team for more information.
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                    })()}
                </div>
            </div>
        );
    };

    const ReportsSection = useMemo(() => {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 w-[1100px] max-w-full mx-auto">
                    <div className="flex flex-col space-y-4 lg:space-y-0 mb-6">
                        <div className="w-full">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400"/>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Search reports... (e.g., 'emissions 2024', 'diversity')"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex flex-col sm:flex-row pt-2 sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="report-year" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Year:
                                    </label>
                                    <select
                                        id="report-year"
                                        value={selectedReportYear}
                                        onChange={(e) => {
                                            const year = Number(e.target.value);
                                            setSelectedReportYear(year);
                                            fetchFilteredReports(searchQuery, year, selectedCategory);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value={0}>All Years</option>
                                        <option value={2025}>2025</option>
                                        <option value={2024}>2024</option>
                                        <option value={2023}>2023</option>
                                        <option value={2022}>2022</option>
                                        <option value={2021}>2021</option>
                                        <option value={2020}>2020</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="report-category" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Category:
                                    </label>
                                    <select
                                        id="report-category"
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            const category = e.target.value;
                                            setSelectedCategory(category);
                                            fetchFilteredReports(searchQuery, selectedReportYear, category);
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="Annual Report">Annual Report</option>
                                        <option value="Environmental">Environmental</option>
                                        <option value="Social">Social</option>
                                        <option value="Governance">Governance</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="ESRS Compliance">ESRS Compliance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div
                                    className={`w-2 h-2 rounded-full ${apiStatus.status === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span
                                    className="text-gray-600">API {apiStatus.status === 'live' ? 'Connected' : 'Connecting...'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mb-4">
                        <FileText className="h-5 w-5 text-gray-600 mr-2"/>
                        <h3 className="text-lg font-semibold text-gray-900">ESG Reports</h3>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading reports...</p>
                        </div>
                    ) : filteredReports.length > 0 ? (
                        <div className="space-y-4">
                            {filteredReports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex items-center space-x-4">
                                        <FileText className="h-8 w-8 text-gray-400"/>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{report.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1"/>
                                                    <span>{report.date}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <BarChart className="h-4 w-4 mr-1"/>
                                                    <span>{report.size}</span>
                                                </div>
                                                {report.year && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {report.year}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {report.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            onClick={() => handleReportDownload(report)}
                                        >
                                            <Download className="h-4 w-4 mr-1"/>
                                            {report.type}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="flex flex-col items-center">
                                <AlertCircle className="h-12 w-12 text-gray-400 mb-4"/>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h4>
                                <p className="text-sm text-gray-600">
                                    {searchQuery
                                        ? `No reports found matching "${searchQuery}"`
                                        : 'No reports available for the selected criteria'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [searchQuery, filteredReports, loading, apiStatus, selectedReportYear, selectedCategory]);

    return (
        <>
            <Disclaimer/>

            <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-white shadow-sm">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-8 w-8 text-green-600"/>
                                    <h1 className="text-2xl font-bold text-gray-900">GreenAuto S.p.A.</h1>
                                </div>
                                <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                                <h2 className="hidden md:block text-lg text-gray-600">ESG Sustainability Reports</h2>
                            </div>
                        </div>
                    </div>
                </header>

                <nav className="bg-green-600 text-white">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-8 py-4">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    activeTab === 'overview' ? 'bg-green-700' : 'hover:bg-green-500'
                                }`}
                            >
                                <BarChart3 className="inline h-4 w-4 mr-1"/>
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    activeTab === 'reports' ? 'bg-green-700' : 'hover:bg-green-500'
                                }`}
                            >
                                <FileText className="inline h-4 w-4 mr-1"/>
                                Reports
                            </button>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === 'overview' && (
                        <div className="mb-8 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="year" className="text-sm font-medium text-gray-700">
                                    Report Year:
                                </label>
                                <select
                                    id="year"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                                >
                                    <option value={2025}>2025</option>
                                    <option value={2024}>2024</option>
                                    <option value={2023}>2023</option>
                                    <option value={2022}>2022</option>
                                    <option value={2021}>2021</option>
                                    <option value={2020}>2020</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${apiStatus.status === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="text-gray-600">Live Data {apiStatus.status === 'live' ? 'Connected' : 'Syncing...'}</span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && <Overview/>}
                    {activeTab === 'reports' && ReportsSection}
                </main>

                <footer className="bg-gray-800 text-white py-8 mt-auto">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-sm">&copy; 2024 GreenAuto S.p.A. (Fictional Company)</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
