// import Layout from "../../components/Layout";
// import React, { useEffect, useMemo, useState } from "react";
// import apiClient from "../../services/apiClient";
// import { useLoader } from "../../context/LoaderContext";
// import { useAuth } from "../../context/AuthContext";
// // import * as XLSX from 'xlsx';

// const MONTHS = [
//     { label: "January", value: "JAN" },
//     { label: "February", value: "FEB" },
//     { label: "March", value: "MAR" },
//     { label: "April", value: "APR" },
//     { label: "May", value: "MAY" },
//     { label: "June", value: "JUN" },
//     { label: "July", value: "JUL" },
//     { label: "August", value: "AUG" },
//     { label: "September", value: "SEP" },
//     { label: "October", value: "OCT" },
//     { label: "November", value: "NOV" },
//     { label: "December", value: "DEC" },
// ];


// const AttendanceBadge = ({ status }) => {
//     if (status === "-") {
//         return <span className="badge bg-warning">-</span>;
//     }

//     return (
//         <span
//             className={`badge ${status === "P" ? "bg-success" : "bg-danger"
//                 }`}
//         >
//             {status}
//         </span>
//     );

// };

// const getAttendanceStatus = (status) => {
//     if (!status) return "-";

//     const value = status.toUpperCase();
//     if (value === "ABSENT") return "A";
//     if (value === "PRESENT") return "P";

//     return "-";
// };

// const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();

//     return `${day}/${month}/${year}`;
// };

// const getYears = () => {
//     const currentYear = new Date().getFullYear();
//     return [
//         currentYear,
//         currentYear - 1,
//         currentYear - 2,
//     ];
// };

// const currentDate = new Date();

// const currentMonth = currentDate.toLocaleString("en-US", {
//     month: "short"
// }).toUpperCase();

// const currentYear = currentDate.getFullYear();

// const GlobalLoader = () => (
//     <div className="global-loader-overlay">
//         <div className="loader-minimal">
//             <div className="loader-spinner"></div>
//             <div className="loader-text">Loading...</div>
//         </div>

//         <style>{`
//       .global-loader-overlay {
//         position: fixed;
//         top: 0;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         background: rgba(255, 255, 255, 0.85);
//         backdrop-filter: blur(4px);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         z-index: 9999;
//       }

//       .loader-minimal {
//         text-align: center;
//         background: white;
//         padding: 2rem 2.5rem;
//         border-radius: 20px;
//         box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
//         animation: fadeInScale 0.3s ease-out;
//       }

//       .loader-spinner {
//         width: 48px;
//         height: 48px;
//         border: 4px solid #f0f0f0;
//         border-top: 4px solid #1a73e8;
//         border-radius: 50%;
//         margin: 0 auto 1rem;
//         animation: spin 0.8s linear infinite;
//       }

//       .loader-text {
//         font-size: 1rem;
//         font-weight: 500;
//         color: #333;
//       }

//       @keyframes fadeInScale {
//         from {
//           opacity: 0;
//           transform: scale(0.95);
//         }
//         to {
//           opacity: 1;
//           transform: scale(1);
//         }
//       }

//       @keyframes spin {
//         to {
//           transform: rotate(360deg);
//         }
//       }
//     `}</style>
//     </div>
// );

// const AttendanceReport = () => {
//     const { setLoader } = useLoader();
//     const [loading, setLoading] = useState(false);
//     const { user } = useAuth();
//     const [filters, setFilters] = useState({
//         month: currentMonth,
//         year: currentYear,
//         shift: "1"
//     });

//     // const [tableHeader, setTableHeader] = useState([
//     //     "Sr. No.",
//     //     "Employee Name",
//     //     "Date",
//     //     "Shift"
//     // ])

//     const [attendanceReportData, setAttendanceReportData] = useState([]);
//     const [error, setError] = useState("");
//     const years = useMemo(() => getYears(), []);

//     const handleFilterChange = (e) => {
//         const { name, value } = e.target;
//         setFilters((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleClearFilters = () => {
//         setFilters({
//             month: currentMonth,
//             year: currentYear,
//             shift: "1"
//         });
//     };

//     const getDaysInMonth = (month, year) => {
//         const monthMap = {
//             JAN: 0,
//             FEB: 1,
//             MAR: 2,
//             APR: 3,
//             MAY: 4,
//             JUN: 5,
//             JUL: 6,
//             AUG: 7,
//             SEP: 8,
//             OCT: 9,
//             NOV: 10,
//             DEC: 11,
//         };

//         const monthIndex = monthMap[month];

//         if (monthIndex === undefined || !year) {
//             return 31;
//         }

//         return new Date(year, monthIndex + 1, 0).getDate();
//     };

//     const daysInMonth = getDaysInMonth(filters.month, filters.year);

//     const dates = Array.from(
//         { length: daysInMonth },
//         (_, index) => index + 1
//     );

//     const handleExportExcel = () => {
//         if (!attendanceReportData.length) {
//             return;
//         }

//         const getDateKey = (date) =>
//             `${String(date).padStart(2, "0")}-${filters.month}`;

//         let exportData = [];

//         if (filters.shift === "2") {
//             // Multiple Shift
//             exportData = attendanceReportData.map(
//                 (employee, employeeIndex) => {
//                     const row = {
//                         "Sr. No.": employeeIndex + 1,
//                         "Employee Name":
//                             employee?.VAR_USER_USERNAME || "-",
//                     };

//                     dates.forEach((date) => {
//                         const dateKey = getDateKey(date);

//                         const attendance =
//                             employee?.[dateKey];

//                         const status =
//                             getAttendanceStatus(attendance);

//                         row[`${date} - 1st`] = status;
//                         row[`${date} - 2nd`] = status;
//                     });

//                     return row;
//                 }
//             );
//         } else {
//             // General / Rotational Shift
//             exportData = attendanceReportData.map(
//                 (employee, employeeIndex) => {
//                     const row = {
//                         "Sr. No.": employeeIndex + 1,
//                         "Employee Name":
//                             employee?.VAR_USER_USERNAME || "-",
//                     };

//                     dates.forEach((date) => {
//                         const dateKey = getDateKey(date);

//                         const attendance =
//                             employee?.[dateKey];

//                         row[String(date)] =
//                             getAttendanceStatus(attendance);
//                     });

//                     return row;
//                 }
//             );
//         }

//         const worksheet =
//             XLSX.utils.json_to_sheet(exportData);

//         const workbook = XLSX.utils.book_new();

//         XLSX.utils.book_append_sheet(
//             workbook,
//             worksheet,
//             "Attendance Report"
//         );

//         XLSX.writeFile(
//             workbook,
//             `Attendance_Report_${filters.month}_${filters.year}_Shift${filters.shift}.xlsx`
//         );
//     };

//     const fetchAttendanceReportDetails = async (
//         month,
//         year,
//         shift
//     ) => {
//         try {
//             setError("");
//             // setLoader(true);
//             setLoading(true);

//             const monthMap = {
//                 JAN: 1,
//                 FEB: 2,
//                 MAR: 3,
//                 APR: 4,
//                 MAY: 5,
//                 JUN: 6,
//                 JUL: 7,
//                 AUG: 8,
//                 SEP: 9,
//                 OCT: 10,
//                 NOV: 11,
//                 DEC: 12,
//             };

//             const payload = {
//                 userId: "151",
//                 month: monthMap[month],
//                 year: String(year),
//                 shiftId: Number(shift),
//             };

//             // console.log("API called:", payload);

//             const response = await apiClient.post(
//                 "/attendance/attendanceMonthlyRegister",
//                 payload
//             );

//             if (
//                 response?.data?.errorCode === 9999 &&
//                 Array.isArray(response?.data?.data)
//             ) {
//                 setAttendanceReportData(response.data.data);
//             } else {
//                 setAttendanceReportData([]);
//                 setError(
//                     response?.data?.message ||
//                     "No attendance data found."
//                 );
//             }
//         } catch (error) {
//             console.error(
//                 "Attendance report data error:",
//                 error
//             );

//             setAttendanceReportData([]);

//             setError(
//                 error?.message ||
//                 "Failed to fetch attendance report details."
//             );
//         } finally {
//             // setLoader(false);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (
//             filters.month === "ALL" ||
//             filters.year === "ALL"
//         ) {
//             return;
//         }

//         fetchAttendanceReportDetails(
//             filters.month,
//             filters.year,
//             filters.shift
//         );
//     }, [
//         filters.month,
//         filters.year,
//         filters.shift,
//     ]);

//     const tableHeader = useMemo(() => {
//         if (filters.shift === "2") {
//             return [
//                 "Sr. No.",
//                 "Employee Name",
//                 "Date",
//                 "1st Shift",
//                 "2nd Shift",
//             ];
//         }

//         if (
//             filters.shift === "1" ||
//             filters.shift === "3"
//         ) {
//             return [
//                 "Sr. No.",
//                 "Employee Name",
//                 ...Array.from(
//                     { length: daysInMonth },
//                     (_, index) => String(index + 1)
//                 ),
//             ];
//         }

//         return [];
//     }, [
//         filters.shift,
//         daysInMonth,
//     ]);

//     return (

//         <Layout>
//             <div className="panel">
//                 <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
//                     <div>
//                         <h2 className="h5 mb-1 section-title">
//                             <i className="bi bi-calendar-check me-2"></i>
//                             Attendance Report Details
//                         </h2>
//                         <p className="text-muted mb-0">
//                             View employee attendance details.
//                         </p>

//                     </div>

//                     <div className="filter-bar d-flex align-items-end gap-3 flex-wrap">
//                         <div className="filter-group">
//                             <label htmlFor="month">Month</label>
//                             <select
//                                 id="month"
//                                 name="month"
//                                 className="filter-select"
//                                 value={filters.month}
//                                 onChange={handleFilterChange}
//                                 style={{ width: "140px" }}
//                             >
//                                 <option value="ALL">All Months</option>
//                                 {MONTHS.map((month) => (
//                                     <option key={month.value} value={month.value}>
//                                         {month.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div className="filter-group">
//                             <label htmlFor="year">Year</label>
//                             <select
//                                 id="year"
//                                 name="year"
//                                 className="filter-select"
//                                 value={filters.year}
//                                 onChange={handleFilterChange}
//                                 style={{ width: "120px" }}
//                             >

//                                 <option value="ALL">All Years</option>

//                                 {years.map((year) => (
//                                     <option key={year} value={String(year)}>
//                                         {year}
//                                     </option>
//                                 ))}

//                             </select>

//                         </div>

//                         <div className="filter-group">

//                             <label htmlFor="shift">Shift</label>

//                             <select
//                                 name="shift"
//                                 id="shift"
//                                 className="filter-select"
//                                 value={filters.shift}
//                                 onChange={handleFilterChange}
//                                 style={{ width: "120px" }}
//                             >
//                                 <option value="1">General</option>
//                                 <option value="2">Multiple</option>
//                                 <option value="3">Rotational</option>
//                             </select>

//                         </div>

//                         <div className="filter-group">
//                             <button
//                                 type="button"
//                                 className="btn-clear-filters"
//                                 onClick={handleClearFilters}
//                             >
//                                 <i className="bi bi-x-lg me-1"></i>
//                                 Clear
//                             </button>
//                         </div>

//                         <div className="filter-group">
//                             <button
//                                 type="button"
//                                 className="btn btn-success"
//                                 onClick={handleExportExcel}
//                                 disabled={!attendanceReportData.length}
//                                 title="Export to Excel"
//                             >
//                                 <i className="bi bi-file-earmark-excel"></i>
//                             </button>
//                         </div>

//                     </div>

//                     {error && (
//                         <div className="alert alert-danger mt-3">
//                             {error}
//                         </div>
//                     )}

//                     {loading && <GlobalLoader />}

//                     <div
//                         className="table-responsive mt-3"
//                         style={{
//                             height: "500px",
//                             overflow: "auto",
//                         }}
//                     >
//                         <table className="table align-middle mb-0">
//                             <thead>
//                                 {filters.shift === "2" ? (
//                                     <>
//                                         {/* First Header Row */}
//                                         <tr>
//                                             <th rowSpan={2} className="text-center">
//                                                 Sr. No.
//                                             </th>

//                                             <th rowSpan={2} className="text-center">
//                                                 Employee Name
//                                             </th>

//                                             {dates.map((date) => (
//                                                 <th
//                                                     key={date}
//                                                     colSpan={2}
//                                                     className="text-center"
//                                                 >
//                                                     {date}
//                                                 </th>
//                                             ))}
//                                         </tr>

//                                         {/* Second Header Row */}
//                                         <tr>
//                                             {dates.map((date) => (
//                                                 <React.Fragment key={date}>
//                                                     <th className="text-center">
//                                                         1st
//                                                     </th>

//                                                     <th className="text-center">
//                                                         2nd
//                                                     </th>
//                                                 </React.Fragment>
//                                             ))}
//                                         </tr>
//                                     </>
//                                 ) : (
//                                     <tr>
//                                         {tableHeader.map((item, index) => (
//                                             <th
//                                                 key={index}
//                                                 scope="col"
//                                                 className="text-center"
//                                             >
//                                                 {item}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 )}
//                             </thead>

//                             <tbody>
//                                 {attendanceReportData.map(
//                                     (employee, employeeIndex) => (
//                                         <tr key={employee.EMP_ID}>
//                                             <td className="text-center">
//                                                 {employeeIndex + 1}
//                                             </td>

//                                             <td>
//                                                 {employee.VAR_USER_USERNAME}
//                                             </td>

//                                             {filters.shift === "2"
//                                                 ? dates.map((date) => {
//                                                     const dateKey = `${String(
//                                                         date
//                                                     ).padStart(
//                                                         2,
//                                                         "0"
//                                                     )}-${filters.month}`;

//                                                     const attendance =
//                                                         employee[dateKey];

//                                                     const status =
//                                                         getAttendanceStatus(
//                                                             attendance
//                                                         );

//                                                     return (
//                                                         <React.Fragment
//                                                             key={date}
//                                                         >
//                                                             <td className="text-center">
//                                                                 <AttendanceBadge
//                                                                     status={
//                                                                         status
//                                                                     }
//                                                                 />
//                                                             </td>

//                                                             <td className="text-center">
//                                                                 <AttendanceBadge
//                                                                     status={
//                                                                         status
//                                                                     }
//                                                                 />
//                                                             </td>
//                                                         </React.Fragment>
//                                                     );
//                                                 })
//                                                 : dates.map((date) => {
//                                                     const dateKey = `${String(
//                                                         date
//                                                     ).padStart(
//                                                         2,
//                                                         "0"
//                                                     )}-${filters.month}`;

//                                                     const attendance =
//                                                         employee[dateKey];

//                                                     const status =
//                                                         getAttendanceStatus(
//                                                             attendance
//                                                         );

//                                                     return (
//                                                         <td
//                                                             key={date}
//                                                             className="text-center"
//                                                         >
//                                                             <AttendanceBadge
//                                                                 status={
//                                                                     status
//                                                                 }
//                                                             />
//                                                         </td>
//                                                     );
//                                                 })}
//                                         </tr>
//                                     )
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     )
// }

// export default AttendanceReport;

import Layout from "../../components/Layout";
import React, { useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import * as XLSX from "xlsx";

const MONTHS = [
    { label: "January", value: "JAN" },
    { label: "February", value: "FEB" },
    { label: "March", value: "MAR" },
    { label: "April", value: "APR" },
    { label: "May", value: "MAY" },
    { label: "June", value: "JUN" },
    { label: "July", value: "JUL" },
    { label: "August", value: "AUG" },
    { label: "September", value: "SEP" },
    { label: "October", value: "OCT" },
    { label: "November", value: "NOV" },
    { label: "December", value: "DEC" },
];

const getYears = () => {
    const currentYear = new Date().getFullYear();

    return [
        currentYear,
        currentYear - 1,
        currentYear - 2,
    ];
};

const currentDate = new Date();

const currentMonth = currentDate
    .toLocaleString("en-US", {
        month: "short",
    })
    .toUpperCase();

const currentYear = currentDate.getFullYear();


// ---------------------------------------------------------
// Attendance Badge
// ---------------------------------------------------------
const AttendanceBadge = ({ status }) => {
    if (status === "-") {
        return (
            <span className="badge bg-warning text-dark">
                -
            </span>
        );
    }

    return (
        <span
            className={`badge ${
                status === "P"
                    ? "bg-success"
                    : status === "A"
                        ? "bg-danger"
                        : "bg-secondary"
            }`}
        >
            {status}
        </span>
    );
};


// ---------------------------------------------------------
// Convert API attendance status
// PR -> P
// AB -> A
// ---------------------------------------------------------
const getAttendanceStatus = (status) => {
    if (!status) {
        return "-";
    }

    const value = String(status).trim().toUpperCase();

    if (value === "PR" || value === "PRESENT") {
        return "P";
    }

    if (value === "AB" || value === "ABSENT") {
        return "A";
    }

    return "-";
};


// ---------------------------------------------------------
// Global Loader
// ---------------------------------------------------------
const GlobalLoader = () => (
    <div className="global-loader-overlay">
        <div className="loader-minimal">
            <div className="loader-spinner"></div>

            <div className="loader-text">
                Loading...
            </div>
        </div>

        <style>{`
            .global-loader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }

            .loader-minimal {
                text-align: center;
                background: white;
                padding: 2rem 2.5rem;
                border-radius: 20px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
                animation: fadeInScale 0.3s ease-out;
            }

            .loader-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f0f0f0;
                border-top: 4px solid #1a73e8;
                border-radius: 50%;
                margin: 0 auto 1rem;
                animation: spin 0.8s linear infinite;
            }

            .loader-text {
                font-size: 1rem;
                font-weight: 500;
                color: #333;
            }

            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }

                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }
        `}</style>
    </div>
);


const AttendanceReport = () => {
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        month: currentMonth,
        year: currentYear,
        shift: "1",
    });

    const [attendanceReportData, setAttendanceReportData] = useState([]);

    const [error, setError] = useState("");

    const years = useMemo(() => getYears(), []);


    // ---------------------------------------------------------
    // Filter Change
    // ---------------------------------------------------------
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // ---------------------------------------------------------
    // Clear Filters
    // ---------------------------------------------------------
    const handleClearFilters = () => {
        setFilters({
            month: currentMonth,
            year: currentYear,
            shift: "1",
        });

        setAttendanceReportData([]);
        setError("");
    };


    // ---------------------------------------------------------
    // Get number of days in selected month
    // ---------------------------------------------------------
    const getDaysInMonth = (month, year) => {
        const monthMap = {
            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11,
        };

        const monthIndex = monthMap[month];

        if (monthIndex === undefined || !year) {
            return 31;
        }

        return new Date(
            Number(year),
            monthIndex + 1,
            0
        ).getDate();
    };


    const daysInMonth = getDaysInMonth(
        filters.month,
        filters.year
    );


    const dates = Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
    );


    // ---------------------------------------------------------
    // API Call
    // ---------------------------------------------------------
    const fetchAttendanceReportDetails = async (
        month,
        year,
        shift
    ) => {
        try {
            setError("");
            setLoading(true);

            const monthMap = {
                JAN: 1,
                FEB: 2,
                MAR: 3,
                APR: 4,
                MAY: 5,
                JUN: 6,
                JUL: 7,
                AUG: 8,
                SEP: 9,
                OCT: 10,
                NOV: 11,
                DEC: 12,
            };

            const payload = {
                userId: "151",
                month: monthMap[month],
                year: String(year),
                shiftId: Number(shift),
            };

            console.log(
                "Attendance API Payload:",
                payload
            );

            const response = await apiClient.post(
                "/attendance/attendanceMonthlyRegister",
                payload
            );

            console.log(
                "Attendance API Response:",
                response?.data
            );


            /*
                Actual API structure:

                {
                    success: true,
                    message: "success",
                    data: {
                        data: [
                            {
                                EMP_ID: "...",
                                VAR_USER_USERNAME: "...",
                                "01-SEP": "AB",
                                "02-SEP": "PR"
                            }
                        ],
                        errorCode: 9999,
                        message: "Success"
                    }
                }

                Therefore employee array is:

                response.data.data.data
            */

            const employeeData =
                response?.data?.data?.data;


            if (
                response?.data?.success === true &&
                response?.data?.data?.errorCode === 9999 &&
                Array.isArray(employeeData)
            ) {
                setAttendanceReportData(employeeData);

                if (employeeData.length === 0) {
                    setError(
                        "No attendance data found."
                    );
                }
            } else {
                setAttendanceReportData([]);

                setError(
                    response?.data?.data?.message ||
                    response?.data?.message ||
                    "No attendance data found."
                );
            }

        } catch (error) {
            console.error(
                "Attendance report data error:",
                error
            );

            setAttendanceReportData([]);

            setError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to fetch attendance report details."
            );
        } finally {
            setLoading(false);
        }
    };


    // ---------------------------------------------------------
    // Search
    // API is called ONLY when Search is clicked
    // ---------------------------------------------------------
    const handleSearch = () => {
        if (
            filters.month === "ALL" ||
            filters.year === "ALL"
        ) {
            setError(
                "Please select Month and Year."
            );

            return;
        }

        setAttendanceReportData([]);

        fetchAttendanceReportDetails(
            filters.month,
            filters.year,
            filters.shift
        );
    };


    // ---------------------------------------------------------
    // Get date key
    // Example:
    // 1 + SEP => 01-SEP
    // ---------------------------------------------------------
    const getDateKey = (date) => {
        return `${String(date).padStart(2, "0")}-${filters.month}`;
    };


    // ---------------------------------------------------------
    // Get attendance for General / Rotational
    // ---------------------------------------------------------
    const getSingleShiftStatus = (
        employee,
        date
    ) => {
        const dateKey = getDateKey(date);

        return getAttendanceStatus(
            employee?.[dateKey]
        );
    };


    // ---------------------------------------------------------
    // Get attendance for Multiple Shift
    //
    // API:
    // "PR/AB"
    //
    // Result:
    // 1st Shift = P
    // 2nd Shift = A
    // ---------------------------------------------------------
    const getMultipleShiftStatus = (
        employee,
        date
    ) => {
        const dateKey = getDateKey(date);

        const attendance =
            employee?.[dateKey];

        if (!attendance) {
            return {
                first: "-",
                second: "-",
            };
        }

        const values = String(
            attendance
        ).split("/");

        return {
            first: getAttendanceStatus(
                values[0]
            ),
            second: getAttendanceStatus(
                values[1]
            ),
        };
    };


    // ---------------------------------------------------------
    // Table Header
    // ---------------------------------------------------------
    const tableHeader = useMemo(() => {
        if (
            filters.shift === "1" ||
            filters.shift === "3"
        ) {
            return [
                "Sr. No.",
                "Employee Name",
                ...Array.from(
                    {
                        length: daysInMonth,
                    },
                    (_, index) =>
                        String(index + 1)
                ),
            ];
        }

        return [];
    }, [
        filters.shift,
        daysInMonth,
    ]);


    // ---------------------------------------------------------
    // Export Excel
    // ---------------------------------------------------------
    const handleExportExcel = () => {
        if (!attendanceReportData.length) {
            return;
        }

        let exportData = [];


        // -----------------------------------------------------
        // Shift 2
        // -----------------------------------------------------
        if (filters.shift === "2") {

            exportData =
                attendanceReportData.map(
                    (
                        employee,
                        employeeIndex
                    ) => {

                        const row = {
                            "Sr. No.":
                                employeeIndex + 1,

                            "Employee Name":
                                employee?.VAR_USER_USERNAME ||
                                "-",
                        };


                        dates.forEach(
                            (date) => {

                                const dateKey =
                                    getDateKey(
                                        date
                                    );

                                const attendance =
                                    employee?.[
                                        dateKey
                                    ];


                                const values =
                                    String(
                                        attendance ||
                                        "-"
                                    ).split("/");


                                const firstStatus =
                                    getAttendanceStatus(
                                        values[0]
                                    );

                                const secondStatus =
                                    getAttendanceStatus(
                                        values[1]
                                    );


                                row[
                                    `${date} - 1st`
                                ] =
                                    firstStatus;

                                row[
                                    `${date} - 2nd`
                                ] =
                                    secondStatus;
                            }
                        );


                        return row;
                    }
                );

        }

        // -----------------------------------------------------
        // Shift 1 / Shift 3
        // -----------------------------------------------------
        else {

            exportData =
                attendanceReportData.map(
                    (
                        employee,
                        employeeIndex
                    ) => {

                        const row = {
                            "Sr. No.":
                                employeeIndex + 1,

                            "Employee Name":
                                employee?.VAR_USER_USERNAME ||
                                "-",
                        };


                        dates.forEach(
                            (date) => {

                                const dateKey =
                                    getDateKey(
                                        date
                                    );

                                row[
                                    String(date)
                                ] =
                                    getAttendanceStatus(
                                        employee?.[
                                            dateKey
                                        ]
                                    );
                            }
                        );


                        return row;
                    }
                );
        }


        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Attendance Report"
        );


        XLSX.writeFile(
            workbook,
            `Attendance_Report_${filters.month}_${filters.year}_Shift${filters.shift}.xlsx`
        );
    };


    return (
        <Layout>

            <div className="panel">

                <div className="panel-header">

                    {/* ------------------------------------------------ */}
                    {/* Header */}
                    {/* ------------------------------------------------ */}

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

                        <div>

                            <h2 className="h5 mb-1 section-title">

                                <i className="bi bi-calendar-check me-2"></i>

                                Attendance Report Details

                            </h2>

                            <p className="text-muted mb-0">

                                View employee attendance details.

                            </p>

                        </div>


                        {/* ------------------------------------------------ */}
                        {/* Filters */}
                        {/* ------------------------------------------------ */}

                        <div className="filter-bar d-flex align-items-end gap-3 flex-wrap">


                            {/* Month */}

                            <div className="filter-group">

                                <label htmlFor="month">
                                    Month
                                </label>

                                <select
                                    id="month"
                                    name="month"
                                    className="filter-select"
                                    value={
                                        filters.month
                                    }
                                    onChange={
                                        handleFilterChange
                                    }
                                    style={{
                                        width: "140px",
                                    }}
                                >

                                    <option value="ALL">
                                        All Months
                                    </option>

                                    {MONTHS.map(
                                        (month) => (
                                            <option
                                                key={
                                                    month.value
                                                }
                                                value={
                                                    month.value
                                                }
                                            >
                                                {
                                                    month.label
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Year */}

                            <div className="filter-group">

                                <label htmlFor="year">
                                    Year
                                </label>

                                <select
                                    id="year"
                                    name="year"
                                    className="filter-select"
                                    value={
                                        filters.year
                                    }
                                    onChange={
                                        handleFilterChange
                                    }
                                    style={{
                                        width: "120px",
                                    }}
                                >

                                    <option value="ALL">
                                        All Years
                                    </option>

                                    {years.map(
                                        (year) => (
                                            <option
                                                key={
                                                    year
                                                }
                                                value={
                                                    String(
                                                        year
                                                    )
                                                }
                                            >
                                                {year}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Shift */}

                            <div className="filter-group">

                                <label htmlFor="shift">
                                    Shift
                                </label>

                                <select
                                    name="shift"
                                    id="shift"
                                    className="filter-select"
                                    value={
                                        filters.shift
                                    }
                                    onChange={
                                        handleFilterChange
                                    }
                                    style={{
                                        width: "120px",
                                    }}
                                >

                                    <option value="1">
                                        General
                                    </option>

                                    <option value="2">
                                        Multiple
                                    </option>

                                    <option value="3">
                                        Rotational
                                    </option>

                                </select>

                            </div>


                            {/* Search */}

                            <div className="filter-group">

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={
                                        handleSearch
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    <i className="bi bi-search me-1"></i>

                                    Search

                                </button>

                            </div>


                            {/* Clear */}

                            <div className="filter-group">

                                <button
                                    type="button"
                                    className="btn-clear-filters"
                                    onClick={
                                        handleClearFilters
                                    }
                                >

                                    <i className="bi bi-x-lg me-1"></i>

                                    Clear

                                </button>

                            </div>


                            {/* Excel */}

                            <div className="filter-group">

                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={
                                        handleExportExcel
                                    }
                                    disabled={
                                        !attendanceReportData.length
                                    }
                                    title="Export to Excel"
                                >

                                    <i className="bi bi-file-earmark-excel"></i>

                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ------------------------------------------------ */}
                    {/* Error */}
                    {/* ------------------------------------------------ */}

                    {error && (
                        <div className="alert alert-danger mt-3">
                            {error}
                        </div>
                    )}


                    {/* ------------------------------------------------ */}
                    {/* Loader */}
                    {/* ------------------------------------------------ */}

                    {loading && <GlobalLoader />}


                    {/* ------------------------------------------------ */}
                    {/* Table */}
                    {/* ------------------------------------------------ */}

                    <div
                        className="table-responsive mt-3"
                        style={{
                            height: "500px",
                            overflow: "auto",
                        }}
                    >

                        <table className="table align-middle mb-0">

                            <thead>

                                {/* ================================================= */}
                                {/* MULTIPLE SHIFT */}
                                {/* ================================================= */}

                                {filters.shift === "2" ? (

                                    <>

                                        {/* First Header Row */}

                                        <tr>

                                            <th
                                                rowSpan={2}
                                                className="text-center"
                                            >
                                                Sr. No.
                                            </th>

                                            <th
                                                rowSpan={2}
                                                className="text-center"
                                            >
                                                Employee Name
                                            </th>


                                            {dates.map(
                                                (date) => (
                                                    <th
                                                        key={
                                                            date
                                                        }
                                                        colSpan={
                                                            2
                                                        }
                                                        className="text-center"
                                                    >
                                                        {date}
                                                    </th>
                                                )
                                            )}

                                        </tr>


                                        {/* Second Header Row */}

                                        <tr>

                                            {dates.map(
                                                (date) => (
                                                    <React.Fragment
                                                        key={
                                                            date
                                                        }
                                                    >

                                                        <th className="text-center">
                                                            1st
                                                        </th>

                                                        <th className="text-center">
                                                            2nd
                                                        </th>

                                                    </React.Fragment>
                                                )
                                            )}

                                        </tr>

                                    </>

                                ) : (

                                    /* ================================================= */
                                    /* GENERAL / ROTATIONAL SHIFT */
                                    /* ================================================= */

                                    <tr>

                                        {tableHeader.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <th
                                                    key={
                                                        index
                                                    }
                                                    scope="col"
                                                    className="text-center"
                                                >
                                                    {item}
                                                </th>

                                            )
                                        )}

                                    </tr>

                                )}

                            </thead>


                            <tbody>

                                {attendanceReportData.map(
                                    (
                                        employee,
                                        employeeIndex
                                    ) => (

                                        <tr
                                            key={
                                                employee.EMP_ID ||
                                                employeeIndex
                                            }
                                        >

                                            {/* Sr No */}

                                            <td className="text-center">

                                                {
                                                    employeeIndex +
                                                    1
                                                }

                                            </td>


                                            {/* Employee Name */}

                                            <td>

                                                {
                                                    employee.VAR_USER_USERNAME ||
                                                    "-"
                                                }

                                            </td>


                                            {/* ================================================= */}
                                            {/* MULTIPLE SHIFT */}
                                            {/* ================================================= */}

                                            {filters.shift === "2"

                                                ? dates.map(
                                                    (
                                                        date
                                                    ) => {

                                                        const {
                                                            first,
                                                            second,
                                                        } =
                                                            getMultipleShiftStatus(
                                                                employee,
                                                                date
                                                            );


                                                        return (

                                                            <React.Fragment
                                                                key={
                                                                    date
                                                                }
                                                            >

                                                                {/* 1st Shift */}

                                                                <td className="text-center">

                                                                    <AttendanceBadge
                                                                        status={
                                                                            first
                                                                        }
                                                                    />

                                                                </td>


                                                                {/* 2nd Shift */}

                                                                <td className="text-center">

                                                                    <AttendanceBadge
                                                                        status={
                                                                            second
                                                                        }
                                                                    />

                                                                </td>

                                                            </React.Fragment>

                                                        );

                                                    }
                                                )

                                                : (

                                                    /* ================================================= */
                                                    /* GENERAL / ROTATIONAL SHIFT */
                                                    /* ================================================= */

                                                    dates.map(
                                                        (
                                                            date
                                                        ) => {

                                                            const status =
                                                                getSingleShiftStatus(
                                                                    employee,
                                                                    date
                                                                );


                                                            return (

                                                                <td
                                                                    key={
                                                                        date
                                                                    }
                                                                    className="text-center"
                                                                >

                                                                    <AttendanceBadge
                                                                        status={
                                                                            status
                                                                        }
                                                                    />

                                                                </td>

                                                            );

                                                        }
                                                    )

                                                )}

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </Layout>
    );
};

export default AttendanceReport;    