import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { useLoader } from "../../context/LoaderContext";

const AttendanceDailySummary = () => {
  const { setLoader } = useLoader();

  const [filters, setFilters] = useState({
    date: "",
  });

  const [attendanceData, setAttendanceData] = useState({
    totalEmp: 0,
    totalPresent: 0,
    employees: [],
  });

  const [error, setError] = useState("");

  // Convert native date value (YYYY-MM-DD)
  // to API format (DD-MMM-YYYY)
  const formatDateForApi = (value) => {
    if (!value) return "";

    const [year, month, day] = value.split("-");

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${day}-${months[Number(month) - 1]}-${year}`;
  };

  // Convert API date (DD-MMM-YYYY)
  // to native date input value (YYYY-MM-DD)
  const formatDateForInput = (value) => {
    if (!value) return "";

    const [day, monthName, year] = value.split("-");

    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const month = months[monthName];

    if (!month) return "";

    return `${year}-${month}-${day}`;
  };

  const getTodayApiDate = () => {
    const today = new Date();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${String(today.getDate()).padStart(2, "0")}-${
      months[today.getMonth()]
    }-${today.getFullYear()}`;
  };

  const parseResult = (result) => {
    if (!result || typeof result !== "string") {
      return {
        totalEmp: 0,
        totalPresent: 0,
        employees: [],
      };
    }

    /*
      Existing API format:

      5~3$Pritam~Present$Rahul~Present

      First record:
      totalEmp~totalPresent

      Remaining records:
      username~status
    */

    const records = result.split("$").filter(Boolean);

    if (!records.length) {
      return {
        totalEmp: 0,
        totalPresent: 0,
        employees: [],
      };
    }

    const countParts = records[0].split("~");

    const totalEmp = Number(countParts[0] || 0);
    const totalPresent = Number(countParts[1] || 0);

    const employees = records.slice(1).map((item) => {
      const parts = item.split("~");

      return {
        username: parts[0] || "",
        status: parts[1] || "",
      };
    });

    return {
      totalEmp,
      totalPresent,
      employees,
    };
  };

  const normalizeResponse = (response) => {
    const data = response?.data?.data ?? response?.data ?? [];

    // Existing API response:
    // [{ RESULT: "5~3$Pritam~Present$Rahul~Present" }]
    if (Array.isArray(data)) {
      const result =
        data?.[0]?.RESULT ??
        data?.[0]?.result ??
        data?.[0]?.A ??
        data?.[0]?.a;

      if (typeof result === "string") {
        return parseResult(result);
      }

      // Also support direct JSON response:
      // {
      //   count: {
      //     totalEmp: 5,
      //     totalPresent: 3
      //   },
      //   employees: [...]
      // }
      if (data?.[0]?.count || data?.[0]?.employees) {
        return {
          totalEmp: Number(
            data[0]?.count?.totalEmp ??
              data[0]?.count?.totalEMP ??
              data[0]?.count?.TOTAL_EMP ??
              0
          ),
          totalPresent: Number(
            data[0]?.count?.totalPresent ??
              data[0]?.count?.totalPRESENT ??
              data[0]?.count?.TOTAL_PRESENT ??
              0
          ),
          employees: Array.isArray(data[0]?.employees)
            ? data[0].employees.map((item) => ({
                username:
                  item.username ??
                  item.USERNAME ??
                  item.var_user_username ??
                  "",
                status: item.status ?? item.STATUS ?? "",
              }))
            : [],
        };
      }

      return {
        totalEmp: 0,
        totalPresent: 0,
        employees: data.map((item) => ({
          username:
            item.username ??
            item.USERNAME ??
            item.var_user_username ??
            "",
          status: item.status ?? item.STATUS ?? "",
        })),
      };
    }

    if (typeof data === "object" && data !== null) {
      const result =
        data?.RESULT ??
        data?.result ??
        data?.A ??
        data?.a;

      if (typeof result === "string") {
        return parseResult(result);
      }

      if (data?.count || data?.employees) {
        return {
          totalEmp: Number(
            data?.count?.totalEmp ??
              data?.count?.totalEMP ??
              data?.count?.TOTAL_EMP ??
              0
          ),
          totalPresent: Number(
            data?.count?.totalPresent ??
              data?.count?.totalPRESENT ??
              data?.count?.TOTAL_PRESENT ??
              0
          ),
          employees: Array.isArray(data?.employees)
            ? data.employees.map((item) => ({
                username:
                  item.username ??
                  item.USERNAME ??
                  item.var_user_username ??
                  "",
                status: item.status ?? item.STATUS ?? "",
              }))
            : [],
        };
      }
    }

    return {
      totalEmp: 0,
      totalPresent: 0,
      employees: [],
    };
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchAttendanceSummary = async (dateValue = filters.date) => {
    try {
      setError("");
      setLoader(true);

      const payload = {
        date: dateValue,
        userId: "",
      };

      const response = await apiClient.post(
        "/attendance/attendanceDailySummary-web",
        payload
      );

      if (response?.success) {
        setAttendanceData(normalizeResponse(response));
      } else {
        setAttendanceData({
          totalEmp: 0,
          totalPresent: 0,
          employees: [],
        });

        setError(
          response?.message ||
            "Failed to fetch attendance daily summary."
        );
      }
    } catch (err) {
      console.error("Attendance daily summary error:", err);

      setAttendanceData({
        totalEmp: 0,
        totalPresent: 0,
        employees: [],
      });

      setError(
        err?.message ||
          "Failed to fetch attendance daily summary."
      );
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    const today = getTodayApiDate();

    setFilters({
      date: today,
    });

    fetchAttendanceSummary(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClearFilters = () => {
    const today = getTodayApiDate();

    setFilters({
      date: today,
    });

    fetchAttendanceSummary(today);
  };

  const totalEmp = attendanceData.totalEmp;
  const totalPresent = attendanceData.totalPresent;

  const presentPercentage =
    totalEmp > 0
      ? Math.round((totalPresent / totalEmp) * 100)
      : 0;

  return (
    <Layout>
      <div className="panel">
        <div className="panel-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="h5 mb-1 section-title">
              <i className="bi bi-calendar-check me-2"></i>
              Daily Attendance Summary
            </h2>

            <p className="text-muted mb-0">
              View employee attendance summary date-wise.
            </p>
          </div>

          <div className="filter-bar d-flex align-items-end gap-3 flex-wrap">
            <div className="filter-group">
              <label htmlFor="date">Date</label>

              <input
                id="date"
                name="date"
                type="date"
                className="filter-select"
                value={formatDateForInput(filters.date)}
                onChange={(e) => {
                  const apiDate = formatDateForApi(e.target.value);

                  setFilters((prev) => ({
                    ...prev,
                    date: apiDate,
                  }));

                  fetchAttendanceSummary(apiDate);
                }}
                style={{ width: "170px" }}
              />
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
        </div>

        {/* Count Boxes - same panel/card style */}
        <div className="row g-3 px-3 pt-3">
          <div className="col-12 col-md-6">
            <div
              className="border rounded-3 bg-white h-100"
              style={{
                minHeight: "80px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <div className="d-flex align-items-center p-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#eef4ff",
                  }}
                >
                  <i
                    className="bi bi-people"
                    style={{
                      fontSize: "1.4rem",
                      color: "#2563eb",
                    }}
                  ></i>
                </div>

                <div>
                  <div
                    className="fw-semibold text-uppercase"
                    style={{
                      color: "#2563eb",
                      fontSize: "13px",
                      letterSpacing: "0.4px",
                    }}
                  >
                    Total Employees
                  </div>

                  <div
                    className="fw-bold text-dark"
                    style={{
                      fontSize: "18px",
                      lineHeight: "20px",
                    }}
                  >
                    {totalEmp}
                  </div>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    All Employees
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="border rounded-3 bg-white h-100"
              style={{
                minHeight: "80px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <div className="d-flex align-items-center p-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#fff0f0",
                  }}
                >
                  <i
                    className="bi bi-person-check"
                    style={{
                      fontSize: "1.4rem",
                      color: "#16a34a",
                    }}
                  ></i>
                </div>

                <div>
                  <div
                    className="fw-semibold text-uppercase"
                    style={{
                      color: "#16a34a",
                      fontSize: "13px",
                      letterSpacing: "0.4px",
                    }}
                  >
                    Present Employees
                  </div>

                  <div
                    className="fw-bold text-dark"
                    style={{
                      fontSize: "18px",
                      lineHeight: "20px",
                    }}
                  >
                    {totalPresent}
                  </div>

                  <div
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {presentPercentage}% Present
                  </div>
                </div>
              </div>
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

        <div className="table-responsive mt-3">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Sr. No.</th>
                <th scope="col">Employee Name</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.employees.length > 0 ? (
                attendanceData.employees.map((item, index) => (
                  <tr key={`${item.username}-${index}`}>
                    <td>{index + 1}</td>

                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">
                          {item.username || "-"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          String(item.status).toLowerCase() === "present"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-5">
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
            <strong>{attendanceData.employees.length}</strong>{" "}
            attendance record
            {attendanceData.employees.length !== 1 ? "s" : ""}
          </div>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => fetchAttendanceSummary()}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceDailySummary;
