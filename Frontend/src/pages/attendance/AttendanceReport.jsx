import Layout from "../../components/Layout";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { useLoader } from "../../context/LoaderContext";
// import * as XLSX from 'xlsx';

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

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};


const getYears = () => {
    const currentYear = new Date().getFullYear();

    return [
        currentYear,
        currentYear - 1,
        currentYear - 2,
    ];
};

const AttendanceReport = () => {
    const { setLoader } = useLoader();

    const [filters, setFilters] = useState({
        month: "ALL",
        year: "ALL",
        shift: "1"
    });

    const [tableHeader, setTableHeader] = useState([
        "Sr. No.",
        "Employee Name",
        "Date",
        "Shift"
    ])
    const [tableData, setTableData] = useState([]);
    const [attendanceReportData, setAttendanceReportData] = useState([]);
    const [error, setError] = useState("");

    const years = useMemo(() => getYears(), []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            month: "ALL",
            year: "ALL",
            shift: "1"
        });
    };

    const parseResult = (result) => {
        if (!result || typeof result !== "string") {
            return [];
        }

        return result
            .split("$")
            .filter(Boolean)
            .map((item) => {
                const parts = item.split("~");

                return {
                    username: parts[0] || "",
                    month: parts[1] || "",
                    year: parts[2] || "",
                    totalDays: Number(parts[3] || 0),
                    totalPresent: Number(parts[4] || 0),
                    totalAbsent: Number(parts[5] || 0),
                };
            });
    };

    const normalizeResponse = (response) => {
        const data = response?.data?.data ?? response?.data ?? [];

        // Existing API response format:
        // [{ RESULT: "username~month~year~totalDays~totalPresent~totalAbsent$..." }]
        if (Array.isArray(data)) {
            // const result = data?.[0]?.RESULT ?? data?.[0]?.result;

            if (typeof data === "string") {
                return parseResult(data);
            }
            // console.log("Data: ", data.map((item) => ({
            //     username: item.username ?? item.USERNAME ?? "",
            //     date: item.attendanceDate ?? "",
            //     firstPunchIn: item.punchInTime ?? "",
            //     firstPunchOut: item.punchOutTime ?? "",
            //     secondPunchIn: item.punchInTime2 ?? "",
            //     secondPunchOut: item.punchOutTime2 ?? ""
            // })));
            // Also support direct JSON rows if the API is changed later.
            return data.map((item) => ({
                username: item.username ?? item.USERNAME ?? "",
                date: item.attendanceDate ?? "",
                firstPunchIn: item.punchInTime ?? "",
                firstPunchOut: item.punchOutTime ?? "",
                secondPunchIn: item.punchInTime2 ?? "",
                secondPunchOut: item.punchOutTime2 ?? ""
            }));
        }

        if (typeof data === "string") {
            return parseResult(data);
        }

        return [];
    };

    const handleExportExcel = () => {
        if (!attendanceReportData.length) {
            return;
        }

        const exportData = attendanceReportData.map((item, index) => ({
            "Sr. No.": index + 1,
            "Employee Name": item.username || "-",
            "Date": formatDate(item.date) || "-",
            "1st Punch In": item.firstPunchIn || "-",
            "1st Punch Out": item.firstPunchOut || "-",
            "2nd Punch In": item.secondPunchIn || "-",
            "2nd Punch Out": item.secondPunchOut || "-",
        }));

        const workSheet = XLSX.utils.json_to_sheet(exportData);

        const workBook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workBook,
            workSheet,
            "Attendance Report"
        );

        XLSX.writeFile(
            workBook,
            `Attendance_Report_${filters.month}_${filters.year}.xlsx`
        );
    };

    const fetchAttendanceReportDetails = async () => {
        try {
            setError("");
            setLoader(true);

            const payload = {
                userId: "",
                month: filters.month,
                year: filters.year,
            };
            return;
            // console.log(payload);

            const response = await apiClient.post('/attendance/attendanceDailyDetails-web', payload);

            // console.log("Response: ", response);
            if (response?.success) {
                setAttendanceReportData(normalizeResponse(response));
            } else {
                setAttendanceReportData([]);
                setError(
                    response?.message ||
                    "Failed to fetch attendance monthly summary."
                );
            }
        } catch (error) {
            console.error("Attendance monthly summary error:", error);
            setAttendanceReportData([]);
            setError(
                error?.message ||
                "Failed to fetch attendance report details."
            );
        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        fetchAttendanceReportDetails();
    }, [filters.month, filters.year, filters.shift]);

    useEffect(() => {
        filters.shift === "1" ? setTableHeader([
            "Sr. No.",
            "Employee Name",
            "Date",
            "Shift"
        ]) : filters.shift === "2" ? setTableHeader([
            "Sr. No.",
            "Employee Name",
            "Date",
            "1st Shift",
            "2nd Shift"
        ]) : setTableHeader([
            "Sr. No.",
            "Employee Name",
            "Date",
            "1st Shift",
            "2nd Shift",
            "3rd Shift"
        ])
    }, [filters.shift]);

    return (
        <Layout>
            <div className="panel">
                <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="h5 mb-1 section-title">
                            <i className="bi bi-calendar-check me-2"></i>
                            Attendance Report Details
                        </h2>
                        <p className="text-muted mb-0">
                            View employee attendance details.
                        </p>
                    </div>

                    <div className="filter-bar d-flex align-items-end gap-3 flex-wrap">
                        <div className="filter-group">
                            <label htmlFor="month">Month</label>
                            <select
                                id="month"
                                name="month"
                                className="filter-select"
                                value={filters.month}
                                onChange={handleFilterChange}
                                style={{ width: "140px" }}
                            >
                                <option value="ALL">All Months</option>

                                {MONTHS.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="year">Year</label>
                            <select
                                id="year"
                                name="year"
                                className="filter-select"
                                value={filters.year}
                                onChange={handleFilterChange}
                                style={{ width: "120px" }}
                            >
                                <option value="ALL">All Years</option>

                                {years.map((year) => (
                                    <option key={year} value={String(year)}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="shift">Shift</label>
                            <select
                                name="shift"
                                id="shift"
                                className="filter-select"
                                value={filters.shift}
                                onChange={handleFilterChange}
                                style={{ width: "120px" }}
                            >
                                <option value="1">General</option>
                                <option value="2">Multiple</option>
                                <option value="3">Rotational</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <button
                                type="button"
                                className="btn-clear-filters"
                                onClick={handleClearFilters}
                            >
                                <i className="bi bi-x-lg me-1"></i>
                                Clear
                            </button>
                        </div>

                        <div className="filter-group">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleExportExcel}
                                disabled={!attendanceReportData.length}
                                title="Export to Excel"
                            >
                                <i className="bi bi-file-earmark-excel"></i>
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    {tableHeader.map(item => (
                                        <th scope="col">{item}</th>
                                    ))}
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AttendanceReport;