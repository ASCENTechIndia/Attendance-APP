import Layout from "../../components/Layout";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../services/apiClient";
import { useLoader } from "../../context/LoaderContext";
import * as XLSX from 'xlsx';

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

const AttendanceMonthlySummary = () => {
  const { setLoader } = useLoader();

  const [filters, setFilters] = useState({
    month: "ALL",
    year: "ALL",
  });

  const [attendanceData, setAttendanceData] = useState([]);
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
      const result = data?.[0]?.RESULT ?? data?.[0]?.result;

      if (typeof result === "string") {
        return parseResult(result);
      }

      // Also support direct JSON rows if the API is changed later.
      return data.map((item) => ({
        username: item.username ?? item.USERNAME ?? "",
        month: item.month ?? item.MONTH ?? "",
        year: item.year ?? item.YEAR ?? "",
        totalDays: Number(item.totalDays ?? item.TOTALDAYS ?? 0),
        totalPresent: Number(item.totalPresent ?? item.TOTALPRESENT ?? 0),
        totalAbsent: Number(item.totalAbsent ?? item.TOTALABSENT ?? 0),
      }));
    }

    if (typeof data?.RESULT === "string") {
      return parseResult(data.RESULT);
    }

    return [];
  };

  const fetchAttendanceSummary = async () => {
    try {
      setError("");
      setLoader(true);

      const payload = {
        month: filters.month,
        year: filters.year,
      };

      const response = await apiClient.post('/attendance/attendanceMonthlySummary-web', payload);

      if (response?.success) {
        setAttendanceData(normalizeResponse(response));
      } else {
        setAttendanceData([]);
        setError(
          response?.message ||
            "Failed to fetch attendance monthly summary."
        );
      }
    } catch (err) {
      console.error("Attendance monthly summary error:", err);
      setAttendanceData([]);
      setError(
        err?.message ||
          "Failed to fetch attendance monthly summary."
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();
  }, [filters.month, filters.year]);

  const handleExportExcel = () => 
  {
    if(!attendanceData.length)
    {
      return;
    }

    const exportData = attendanceData.map((item,index)=>({
      "Sr. No.": index + 1,
    "Employee Name": item.username || "-",
    "Month": item.month || "-",
    "Year": item.year || "-",
    "Total Days": item.totalDays,
    "Present": item.totalPresent,
    "Absent": item.totalAbsent,
    }))

    const workSheet = XLSX.utils.json_to_sheet(exportData);

    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workBook,
      workSheet,
      "Monthly Attendance"
    )

    XLSX.writeFile(
      workBook,
      `Monthly_Attendance_${filters.month}_${filters.year}.xlsx`
    );
  }

  return (
    <Layout>
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-calendar-check me-2"></i>
              Monthly Attendance Summary
            </h2>

            <p className="text-muted mb-0">
              View employee attendance summary month-wise.
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

<div className="filter-group">
   <button
  type="button"
  className="btn btn-success"
  onClick={handleExportExcel}
  disabled={!attendanceData.length}
  title="Export to Excel"
>
  <i className="bi bi-file-earmark-excel"></i>
</button>
</div>
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
                <th scope="col">Month</th>
                <th scope="col">Year</th>
                <th scope="col">Total Days</th>
                <th scope="col">Present</th>
                <th scope="col">Absent</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((item, index) => (
                  <tr key={`${item.username}-${item.month}-${item.year}-${index}`}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">

                        <span className="fw-semibold">
                          {item.username || "-"}
                        </span>
                      </div>
                    </td>

                    <td>{item.month || "-"}</td>
                    <td>{item.year || "-"}</td>
                    <td>
                      <span className="badge bg-secondary rounded-pill px-3 py-2">
                        {item.totalDays}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-success rounded-pill px-3 py-2">
                        {item.totalPresent}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-danger rounded-pill px-3 py-2">
                        {item.totalAbsent}
                      </span>
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

        <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
          <div className="text-muted small">
            Showing{" "}
            <strong>{attendanceData.length}</strong>{" "}
            attendance record{attendanceData.length !== 1 ? "s" : ""}
          </div>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={fetchAttendanceSummary}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceMonthlySummary;