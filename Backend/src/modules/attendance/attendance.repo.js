const oracledb = require("oracledb");
const { executeQuery } = require("../../db/queryExecutor");
const { executeProcedure } = require("../../db/procedureExecutor");

async function attendanceButtonFlagRepo(payload) {
  const statement = `
    BEGIN
      aorts.AORTS_ATTENDANCE_BUTTON_FLAG
      (
        :IN_USERID,
        :IN_ULBID,
        :OUT_PUNCHIN_FLAG,
        :OUT_PUNCHOUT_FLAG,
        :OUT_ERRCODE,
        :OUT_ERRMSG,
        :OUT_PUNCHINTIME
      );
    END;
  `;

  const binds = {
    IN_USERID: payload.userId,

    IN_ULBID: payload.ulbId,

    OUT_PUNCHIN_FLAG: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 100,
    },

    OUT_PUNCHOUT_FLAG: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 100,
    },

    OUT_ERRCODE: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    OUT_ERRMSG: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 1000,
    },

    OUT_PUNCHINTIME: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 1000,
    },
  };

  const result = await executeProcedure({
    statement,
    binds,
    useTx: false,
  });

  const out = result.outBinds || {};

  return {
    punchInFlag: out.OUT_PUNCHIN_FLAG,
    punchOutFlag: out.OUT_PUNCHOUT_FLAG,
    errorCode: out.OUT_ERRCODE,
    message: out.OUT_ERRMSG,
    punchInTime: out.OUT_PUNCHINTIME
  };
}

async function attendanceInsRepo(payload) {
  const statement = `
    BEGIN
      aorts.AORTS_ATTENDANCE_INS
      (
        :in_USERID,
        :in_empid,
        :in_mode,
        :in_lat,
        :in_LONG,
        :IN_PHOTO,
        :IN_ULBID,
        :IN_DEVICEID,
        :OUT_ERRCODE,
        :OUT_ERRMSG
      );
    END;
  `;

  const binds = {
    in_USERID: payload.userId,

    in_empid: payload.empId,

    in_mode: payload.mode,

    in_lat: payload.lat,

    in_LONG: payload.long,

    IN_PHOTO: {
      val: payload.photo
        ? Buffer.from(payload.photo, "base64")
        : null,
      type: oracledb.BLOB,
    },

    IN_ULBID: Number(payload.ulbId),

    IN_DEVICEID: payload.deviceId,

    OUT_ERRCODE: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    OUT_ERRMSG: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 1000,
    },
  };

  const result = await executeProcedure({
    statement,
    binds,
    useTx: false,
  });

  const out = result.outBinds || {};

  return {
    errorCode: out.OUT_ERRCODE,
    message: out.OUT_ERRMSG,
  };
}

async function attendanceMonthlySummaryRepo(month, year) {
  let sql = `
    SELECT
      LISTAGG(a, '$') WITHIN GROUP (ORDER BY a) AS RESULT
    FROM (
      SELECT
        var_user_username
        || '~' || var_attendance_month
        || '~' || var_attendance_year
        || '~' || total_days
        || '~' || total_present
        || '~' || total_absent AS a
      FROM (
        SELECT
          var_user_username,
          var_attendance_month,
          var_attendance_year,
          total_days,
          total_present,
          total_days - total_present AS total_absent
        FROM (
          SELECT
            var_user_username,
            var_attendance_month,
            var_attendance_year,

            TO_NUMBER(
              TO_CHAR(
                LAST_DAY(
                  TO_DATE(
                    TRUNC(dat_attend_insdt),
                    'DD-MM-YYYY'
                  )
                ),
                'DD'
              )
            ) AS total_days,

            SUM(
              CASE
                WHEN dat_attend_punchin_time IS NOT NULL
                THEN 1
                ELSE 0
              END
            ) AS total_present

          FROM aorts_attendance_mas

          INNER JOIN admins.aoma_user_def d
            ON d.num_user_userid = var_attend_empid

          WHERE 1 = 1
  `;

  const binds = {};

  // Month filter
  if (month && month !== "ALL") {
    sql += `
      AND var_attendance_month = :month
    `;

    binds.month = month;
  }

  // Year filter
  if (year && year !== "ALL") {
    sql += `
      AND var_attendance_year = :year
    `;

    binds.year = year;
  }

  sql += `
          GROUP BY
            var_user_username,
            var_attendance_month,
            var_attendance_year,
            TRUNC(dat_attend_insdt)
        )
      )
    )
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  return rows;
}

async function attendanceMonthlySummaryRepoWeb(month, year) {
  let sql = `
    SELECT
      var_user_username AS username,
      var_attendance_month AS month,
      var_attendance_year AS year,

      total_days AS "totalDays",
      total_present AS "totalPresent",
      total_days - total_present AS "totalAbsent"

    FROM (
      SELECT
        var_user_username,
        var_attendance_month,
        var_attendance_year,

        MAX(
          TO_NUMBER(
            TO_CHAR(
              LAST_DAY(
                TO_DATE(
                  TRUNC(dat_attend_insdt),
                  'DD-MM-YYYY'
                )
              ),
              'DD'
            )
          )
        ) AS total_days,

        SUM(
          CASE
            WHEN dat_attend_punchin_time IS NOT NULL
            THEN 1
            ELSE 0
          END
        ) AS total_present

      FROM aorts_attendance_mas

      INNER JOIN admins.aoma_user_def d
        ON d.num_user_userid = var_attend_empid

      WHERE 1 = 1
  `;

  const binds = {};

  // Month filter
  if (month && month !== "ALL") {
    sql += `
      AND var_attendance_month = :month
    `;

    binds.month = month;
  }

  // Year filter
  if (year && year !== "ALL") {
    sql += `
      AND var_attendance_year = :year
    `;

    binds.year = year;
  }

  sql += `
      GROUP BY
        var_user_username,
        var_attendance_month,
        var_attendance_year
    )
    ORDER BY
      var_user_username
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  return rows;
}

async function attendanceDailySummaryRepo(date, userId) {
  let sql = `
    SELECT
      LISTAGG(a, '$') WITHIN GROUP (ORDER BY a) AS RESULT
    FROM (
      SELECT
        total_emp || '~' || total_present AS a
      FROM (
        SELECT
          COUNT(DISTINCT e.num_user_userid) AS total_emp,
          COUNT(DISTINCT var_attend_empid) AS total_present
        FROM aorts_attendance_mas m
        INNER JOIN admins.aoma_user_def d
          ON d.num_user_userid = m.var_attend_empid
        INNER JOIN admins.aoma_user_def e
          ON d.num_user_deptid = e.num_user_deptid
        WHERE TRUNC(m.dat_attend_insdt) =
              TO_DATE(:p_date, 'DD-MON-YYYY', 'NLS_DATE_LANGUAGE=English')
  `;

  const binds = {
    p_date: date,
  };

  if (userId && userId !== "ALL") {
    sql += `
      AND e.num_user_userid = :p_user_id
    `;

    binds.p_user_id = userId;
  }

  sql += `
      )

      UNION ALL

      SELECT
        var_user_username || '~' || Present AS a
      FROM (
        SELECT DISTINCT
          d.var_user_username,
          'Present' AS Present
        FROM aorts_attendance_mas m
        INNER JOIN admins.aoma_user_def d
          ON d.num_user_userid = m.var_attend_empid
        INNER JOIN admins.aoma_user_def e
          ON e.num_user_deptid = d.num_user_deptid
        WHERE TRUNC(m.dat_attend_insdt) =
              TO_DATE(:p_date, 'DD-MON-YYYY', 'NLS_DATE_LANGUAGE=English')
  `;

  if (userId && userId !== "ALL") {
    sql += `
        AND e.num_user_userid = :p_user_id
    `;
  }

  sql += `
      )
    )
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  return rows;
}

async function attendanceDailySummaryRepoWeb(date, userId) {
  let sql = `
    SELECT
      total_emp || '~' || total_present AS a
    FROM (
      SELECT
        COUNT(DISTINCT e.num_user_userid) AS total_emp,
        COUNT(DISTINCT var_attend_empid) AS total_present
      FROM aorts_attendance_mas m

      INNER JOIN admins.aoma_user_def d
        ON d.num_user_userid = m.var_attend_empid

      INNER JOIN admins.aoma_user_def e
        ON d.num_user_deptid = e.num_user_deptid

      WHERE TRUNC(m.dat_attend_insdt) =
            TO_DATE(
              :p_date,
              'DD-MON-YYYY',
              'NLS_DATE_LANGUAGE=English'
            )
  `;

  const binds = {
    p_date: date,
  };

  if (userId && userId !== "ALL") {
    sql += `
      AND e.num_user_userid = :p_user_id
    `;

    binds.p_user_id = userId;
  }

  sql += `
    )

    UNION ALL

    SELECT
      var_user_username || '~' || Present AS a
    FROM (
      SELECT DISTINCT
        d.var_user_username,
        'Present' AS Present

      FROM aorts_attendance_mas m

      INNER JOIN admins.aoma_user_def d
        ON d.num_user_userid = m.var_attend_empid

      INNER JOIN admins.aoma_user_def e
        ON e.num_user_deptid = d.num_user_deptid

      WHERE TRUNC(m.dat_attend_insdt) =
            TO_DATE(
              :p_date,
              'DD-MON-YYYY',
              'NLS_DATE_LANGUAGE=English'
            )
  `;

  if (userId && userId !== "ALL") {
    sql += `
      AND e.num_user_userid = :p_user_id
    `;
  }

  sql += `
    )
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  // First row = count
  const countRow = rows[0]?.A?.split("~") || [];

  const response = {
    count: {
      totalEmp: Number(countRow[0] || 0),
      totalPresent: Number(countRow[1] || 0),
    },

    employees: rows.slice(1).map((row) => {
      const data = row.A?.split("~") || [];

      return {
        username: data[0] || "",
        status: data[1] || "",
      };
    }),
  };

  return response;
}

async function attendanceDailyDetailsRepo(userId, month, year) {
  let sql = `
    SELECT
      LISTAGG(a, '#') WITHIN GROUP (ORDER BY a) AS RESULT
    FROM (
      SELECT
        emp_name
        || '~' || atten_date
        || '!' || punchin_time
        || '~' || punchout_time
        || '!' || punchin_time_2
        || '~' || punchout_time_2 AS a

      FROM (
        SELECT
          d.var_user_username AS emp_name,

          TRUNC(dat_attend_punchin_time) AS atten_date,

          TO_CHAR(
            dat_attend_punchin_time,
            'HH12.MI'
          ) || ' ' ||
          TO_CHAR(
            dat_attend_punchin_time,
            'AM'
          ) AS punchin_time,

          TO_CHAR(
            dat_attend_punchout_time,
            'HH12.MI'
          ) || ' ' ||
          TO_CHAR(
            dat_attend_punchout_time,
            'AM'
          ) AS punchout_time,

          TO_CHAR(
            dat_attend_punchin_2_time,
            'HH12.MI'
          ) || ' ' ||
          TO_CHAR(
            dat_attend_punchin_2_time,
            'AM'
          ) AS punchin_time_2,

          TO_CHAR(
            dat_attend_punchout_2_time,
            'HH12.MI'
          ) || ' ' ||
          TO_CHAR(
            dat_attend_punchout_2_time,
            'AM'
          ) AS punchout_time_2

        FROM aorts_attendance_mas

        INNER JOIN admins.aoma_user_def d
          ON d.num_user_userid = var_attend_empid

        WHERE 1 = 1
  `;

  const binds = {};

  // User filter
  if (userId && userId !== "ALL") {
    sql += `
      AND d.num_user_userid = :userId
    `;

    binds.userId = userId;
  }

  // Month filter
  if (month && month !== "ALL") {
    sql += `
      AND UPPER(var_attendance_month) = UPPER(:month)
    `;

    binds.month = month;
  }

  // Year filter
  if (year && year !== "ALL") {
    sql += `
      AND var_attendance_year = :year
    `;

    binds.year = year;
  }

  sql += `
      )
    )
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  return rows;
}

async function attendanceDailyDetailsRepoWeb(userId, month, year) {
  let sql = `
    SELECT
      d.var_user_username AS username,

      TRUNC(dat_attend_punchin_time) AS "attendanceDate",

      TO_CHAR(
        dat_attend_punchin_time,
        'HH12.MI'
      ) || ' ' ||
      TO_CHAR(
        dat_attend_punchin_time,
        'AM'
      ) AS "punchInTime",

      TO_CHAR(
        dat_attend_punchout_time,
        'HH12.MI'
      ) || ' ' ||
      TO_CHAR(
        dat_attend_punchout_time,
        'AM'
      ) AS "punchOutTime",

      TO_CHAR(
        dat_attend_punchin_2_time,
        'HH12.MI'
      ) || ' ' ||
      TO_CHAR(
        dat_attend_punchin_2_time,
        'AM'
      ) AS "punchInTime2",

      TO_CHAR(
        dat_attend_punchout_2_time,
        'HH12.MI'
      ) || ' ' ||
      TO_CHAR(
        dat_attend_punchout_2_time,
        'AM'
      ) AS "punchOutTime2"

    FROM aorts_attendance_mas

    INNER JOIN admins.aoma_user_def d
      ON d.num_user_userid = var_attend_empid

    WHERE 1 = 1
  `;

  const binds = {};

  // User filter
  if (userId && userId !== "ALL") {
    sql += `
      AND d.num_user_userid = :userId
    `;

    binds.userId = userId;
  }

  // Month filter
  if (month && month !== "ALL") {
    sql += `
      AND UPPER(var_attendance_month) = UPPER(:month)
    `;

    binds.month = month;
  }

  // Year filter
  if (year && year !== "ALL") {
    sql += `
      AND var_attendance_year = :year
    `;

    binds.year = year;
  }

  sql += `
    ORDER BY
      d.var_user_username,
      TRUNC(dat_attend_punchin_time)
  `;

  const result = await executeQuery(sql, binds);

  const rows = result.rows || [];

  return rows;
}

async function attendanceMonthlyRegisterRepo(payload) {
  const statement = `
    BEGIN
      aorts.AORTS_attendance_MONTHLY_REGISTER(
        :P_USERID,
        :P_MONTH,
        :P_YEAR,
        :P_SHIFT_ID,
        :P_RESULT,
        :OUT_ERRCODE,
        :OUT_ERRMSG
      );
    END;
  `;

  const binds = {
    P_USERID: payload.userId,

    P_MONTH: payload.month,

    P_YEAR: payload.year,

    P_SHIFT_ID: payload.shiftId,

    P_RESULT: {
      dir: oracledb.BIND_OUT,
      type: oracledb.CURSOR,
    },

    OUT_ERRCODE: {
      dir: oracledb.BIND_OUT,
      type: oracledb.NUMBER,
    },

    OUT_ERRMSG: {
      dir: oracledb.BIND_OUT,
      type: oracledb.STRING,
      maxSize: 1000,
    },
  };

  const result = await executeProcedure({
    statement,
    binds,
    useTx: false,
  });

  const out = result.outBinds || {};

  return {
    data: out.P_RESULT || [],
    errorCode: out.OUT_ERRCODE,
    message: out.OUT_ERRMSG,
  };
}

module.exports = {
  attendanceButtonFlagRepo,
  attendanceInsRepo,
  attendanceMonthlySummaryRepo,
  attendanceDailySummaryRepo,
  attendanceMonthlySummaryRepoWeb,
  attendanceDailySummaryRepoWeb,
  attendanceDailyDetailsRepo,
  attendanceDailyDetailsRepoWeb,
  attendanceMonthlyRegisterRepo
};
