import pool from '../src/config/db';

async function verifyDatabase() {
  console.log('🧪 Starting Database Verification Checks...');
  let passedChecks = 0;
  let failedChecks = 0;

  const runTest = async (testName: string, queryFn: () => Promise<any>, shouldFail: boolean = false) => {
    try {
      await queryFn();
      if (shouldFail) {
        console.error(`❌ FAIL: ${testName} (Expected failure, but operation succeeded)`);
        failedChecks++;
      } else {
        console.log(`✅ PASS: ${testName}`);
        passedChecks++;
      }
    } catch (error: any) {
      if (shouldFail) {
        console.log(`✅ PASS: ${testName} (Failed as expected: ${error.message.split('\n')[0]})`);
        passedChecks++;
      } else {
        console.error(`❌ FAIL: ${testName} (Unexpected error: ${error.message})`);
        failedChecks++;
      }
    }
  };

  try {
    // 1. Table Existence Check
    await runTest('Check All 9 Tables Exist', async () => {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'companies', 'skills', 'jobs', 'resumes', 'applications', 'saved_jobs', 'user_skills', 'notifications');
      `);
      if (result.rows.length !== 9) {
        throw new Error(`Expected 9 tables, found ${result.rows.length}`);
      }
    });

    // 2. Seed Records Existence Check
    await runTest('Check Seed Data Counts', async () => {
      const usersRes = await pool.query('SELECT count(*) FROM users');
      const companiesRes = await pool.query('SELECT count(*) FROM companies');
      const skillsRes = await pool.query('SELECT count(*) FROM skills');
      const jobsRes = await pool.query('SELECT count(*) FROM jobs');
      const appsRes = await pool.query('SELECT count(*) FROM applications');
      
      if (parseInt(usersRes.rows[0].count) < 6) throw new Error('Insufficient users');
      if (parseInt(companiesRes.rows[0].count) < 3) throw new Error('Insufficient companies');
      if (parseInt(skillsRes.rows[0].count) < 15) throw new Error('Insufficient skills');
      if (parseInt(jobsRes.rows[0].count) < 10) throw new Error('Insufficient jobs');
      if (parseInt(appsRes.rows[0].count) < 4) throw new Error('Insufficient applications');
    });

    // 3. Test Constraint: Duplicate Application Insertion (MUST FAIL)
    await runTest(
      'Duplicate Application Insertion (MUST FAIL)',
      async () => {
        // Job d0000000-0000-4000-8000-000000000001 and Student a0000000-0000-4000-8000-000000000004 already exists in seed
        await pool.query(`
          INSERT INTO applications (job_id, student_id, status)
          VALUES ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'APPLIED');
        `);
      },
      true // shouldFail = true
    );

    // 4. Test Constraint: Duplicate Saved Job Insertion (MUST FAIL)
    await runTest(
      'Duplicate Saved Job Insertion (MUST FAIL)',
      async () => {
        // Student a0000000-0000-4000-8000-000000000004 and Job d0000000-0000-4000-8000-000000000004 already in saved_jobs
        await pool.query(`
          INSERT INTO saved_jobs (student_id, job_id)
          VALUES ('a0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000004');
        `);
      },
      true
    );

    // 5. Test Constraint: Invalid Role (MUST FAIL)
    await runTest(
      'Invalid User Role Insertion (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO users (first_name, last_name, email, password_hash, role)
          VALUES ('Test', 'User', 'testinvalidrole@test.dev', 'hash', 'super_hacker');
        `);
      },
      true
    );

    // 6. Test Constraint: Invalid Job Type (MUST FAIL)
    await runTest(
      'Invalid Job Type Insertion (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO jobs (company_id, recruiter_id, title, description, job_type, work_mode)
          VALUES (
            'b0000000-0000-4000-8000-000000000001',
            'a0000000-0000-4000-8000-000000000002',
            'Invalid Job',
            'Desc',
            'SUPER_TIME',
            'REMOTE'
          );
        `);
      },
      true
    );

    // 7. Test Constraint: Invalid Work Mode (MUST FAIL)
    await runTest(
      'Invalid Work Mode Insertion (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO jobs (company_id, recruiter_id, title, description, job_type, work_mode)
          VALUES (
            'b0000000-0000-4000-8000-000000000001',
            'a0000000-0000-4000-8000-000000000002',
            'Invalid Job',
            'Desc',
            'FULL_TIME',
            'TELEPATHIC'
          );
        `);
      },
      true
    );

    // 8. Test Constraint: Invalid Application Status (MUST FAIL)
    await runTest(
      'Invalid Application Status Insertion (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO applications (job_id, student_id, status)
          VALUES (
            'd0000000-0000-4000-8000-000000000002',
            'a0000000-0000-4000-8000-000000000004',
            'PROMOTED_TO_CEO'
          );
        `);
      },
      true
    );

    // 9. Test Constraint: Invalid Salary (salary_max < salary_min) (MUST FAIL)
    await runTest(
      'Invalid Salary Range (salary_max < salary_min) (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO jobs (company_id, recruiter_id, title, description, job_type, work_mode, salary_min, salary_max)
          VALUES (
            'b0000000-0000-4000-8000-000000000001',
            'a0000000-0000-4000-8000-000000000002',
            'Invalid Salary Job',
            'Desc',
            'FULL_TIME',
            'REMOTE',
            100000.00,
            50000.00
          );
        `);
      },
      true
    );

    // 10. Test Constraint: Negative Salary (MUST FAIL)
    await runTest(
      'Negative Salary Value (MUST FAIL)',
      async () => {
        await pool.query(`
          INSERT INTO jobs (company_id, recruiter_id, title, description, job_type, work_mode, salary_min)
          VALUES (
            'b0000000-0000-4000-8000-000000000001',
            'a0000000-0000-4000-8000-000000000002',
            'Negative Salary Job',
            'Desc',
            'FULL_TIME',
            'REMOTE',
            -500.00
          );
        `);
      },
      true
    );

    // 11. Test Updated_at Trigger
    await runTest('Automatic updated_at Trigger Test', async () => {
      const userRes = await pool.query("SELECT updated_at FROM users WHERE id = 'a0000000-0000-4000-8000-000000000001'");
      const originalUpdatedAt = userRes.rows[0].updated_at;
      
      // Sleep 50ms to ensure timestamp difference
      await new Promise(r => setTimeout(r, 50));

      await pool.query("UPDATE users SET bio = 'Updated bio for trigger test' WHERE id = 'a0000000-0000-4000-8000-000000000001'");
      
      const updatedRes = await pool.query("SELECT updated_at FROM users WHERE id = 'a0000000-0000-4000-8000-000000000001'");
      const newUpdatedAt = updatedRes.rows[0].updated_at;

      if (new Date(newUpdatedAt).getTime() <= new Date(originalUpdatedAt).getTime()) {
        throw new Error('updated_at timestamp was not updated by trigger');
      }
    });

    console.log(`\n📊 Verification Summary: ${passedChecks} Passed, ${failedChecks} Failed`);
    if (failedChecks > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Verification error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyDatabase();
