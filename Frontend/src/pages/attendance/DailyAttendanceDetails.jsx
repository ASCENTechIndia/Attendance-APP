import Layout from "../../components/Layout";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { useLoader } from "../../context/LoaderContext";

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

const DailyAttendanceDetails = () => {
    const { setLoader } = useLoader();

    const [filters, setFilters] = useState({
        month: "ALL",
        year: "ALL",
    });

    const [dailyAttendanceData, setDailyAttendanceData] = useState([]);
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

    const fetchDailyAttendanceDetails = async () => {
        try {
            setError("");
            setLoader(true);

            const payload = {
                userId: "",
                month: filters.month,
                year: filters.year,
            };

            // console.log(payload);

            const response = await apiClient.post('/attendance/attendanceDailyDetails-web', payload);

            // console.log("Response: ", response);
            if (response?.success) {
                setDailyAttendanceData(normalizeResponse(response));
            } else {
                setDailyAttendanceData([]);
                setError(
                    response?.message ||
                    "Failed to fetch attendance monthly summary."
                );
            }
        } catch (error) {
            console.error("Attendance monthly summary error:", error);
            setDailyAttendanceData([]);
            setError(
                error?.message ||
                "Failed to fetch daily attendance details."
            );
        } finally {
            setLoader(false);
        }
    }

    useEffect(() => {
        fetchDailyAttendanceDetails();
    }, [filters.month, filters.year]);

    return (
        <Layout>
            <div className="panel">
                <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="h5 mb-1 section-title">
                            <i className="bi bi-calendar-check me-2"></i>
                            Daily Attendance Details
                        </h2>
                        <p className="text-muted mb-0">
                            View employee daily attendance details.
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
                                style={{ width: "150px" }}
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
                                style={{ width: "130px" }}
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
                            <button
                                type="button"
                                className="btn-clear-filters"
                                onClick={handleClearFilters}
                            >
                                <i className="bi bi-x-lg me-1"></i>
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="px-3 pt-3">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        )}
                    </div>


                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Sr. No.</th>
                                    <th scope="col">Employee Name</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">1st Punch In</th>
                                    <th scope="col">1st Punch Out</th>
                                    <th scope="col">2nd Punch In</th>
                                    <th scope="col">2nd Punch Out</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dailyAttendanceData.length > 0 ? (
                                    dailyAttendanceData.map((item, index) => (
                                        <tr key={`${item.username}-${item.month}-${item.year}-${index}`}>
                                            <td>{index + 1}</td>

                                            <td>
                                                <div className="d-flex align-items-center gap-2">

                                                    <span className="fw-semibold">
                                                        {item.username || "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>{formatDate(item.date) || "-"}</td>
                                            <td>{item.firstPunchIn || "-"}</td>
                                            <td>
                                                {/* <span className="badge bg-secondary rounded-pill px-3 py-2"> */}
                                                {item.firstPunchOut || "-"}
                                                {/* </span> */}
                                            </td>

                                            <td>
                                                {/* <span className="badge bg-success rounded-pill px-3 py-2"> */}
                                                {item.secondPunchIn || "-"}
                                                {/* </span> */}
                                            </td>

                                            <td>
                                                {/* <span className="badge bg-danger rounded-pill px-3 py-2"> */}
                                                {item.secondPunchOut || "-"}
                                                {/* </span> */}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="text-muted">
                                                <i
                                                    className="bi bi-calendar-x d-block mb-2"
                                                    style={{ fontSize: "2rem" }}
                                                ></i>
                                                No attendance records found.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
                <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
                    <div className="text-muted small">
                        Showing{" "}
                        <strong>{dailyAttendanceData.length}</strong>{" "}
                        attendance record{dailyAttendanceData.length !== 1 ? "s" : ""}
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={fetchDailyAttendanceDetails}
                        >
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Refresh
                        </button>
                    </div>

                </div>
            </div>
        </Layout>
    )
}

export default DailyAttendanceDetails;