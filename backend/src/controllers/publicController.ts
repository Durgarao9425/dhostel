import { Response, Request } from 'express';
import db from '../config/database.js';

export const renderRegistrationForm = async (req: Request, res: Response) => {
  const { hostelId } = req.params;

  try {
    const hostel = await db('hostel_master').where('hostel_id', hostelId).first();
    if (!hostel) return res.status(404).send('Hostel not found');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Tenant Registration - ${hostel.hostel_name}</title>
      <style>
        :root { --primary: #FF6B6B; --primary-dark: #EE5253; --bg: #FFF5F5; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); padding: 15px; margin: 0; color: #1F2937; }
        .container { max-width: 500px; margin: 20px auto; background: #FFF; padding: 28px; border-radius: 24px; box-shadow: 0 10px 25px rgba(255, 107, 107, 0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 64px; height: 64px; background: var(--primary); border-radius: 18px; margin: 0 auto 16px; display: flex; alignItems: center; justifyContent: center; color: #FFF; fontSize: 32px; fontWeight: bold; font-family: sans-serif; }
        h2 { color: #111827; margin: 0; fontSize: 24px; fontWeight: 800; }
        p { color: #6B7280; fontSize: 14px; margin-top: 8px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
        input, select, textarea { width: 100%; box-sizing: border-box; padding: 14px; border: 2px solid #F3F4F6; border-radius: 12px; font-size: 16px; transition: all 0.2s; background: #FAFAFA; }
        input:focus, select:focus { border-color: var(--primary); outline: none; background: #FFF; box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.1); }
        .row { display: flex; gap: 15px; }
        .row > div { flex: 1; }
        button { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 10px; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3); }
        button:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: 0 6px 15px rgba(255, 107, 107, 0.4); }
        button:disabled { background: #E5E7EB; color: #9CA3AF; cursor: not-allowed; box-shadow: none; }
        .success { display: none; text-align: center; padding: 60px 20px; }
        .success-icon { width: 80px; height: 80px; background: #DEF7EC; color: #059669; border-radius: 40px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        #recordForm { display: block; }
        .required { color: var(--primary); }
      </style>
    </head>
    <body>
      <div class="container">
        <div id="recordForm">
          <div class="header">
            <div class="logo">H</div>
            <h2>Register as Tenant</h2>
            <p>Welcome to <b>${hostel.hostel_name}</b></p>
          </div>
          <form id="regForm">
            <div class="row">
              <div class="form-group">
                <label>First Name <span class="required">*</span></label>
                <input type="text" id="first_name" required placeholder="John">
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="last_name" placeholder="Doe">
              </div>
            </div>
            
            <div class="form-group">
              <label>Phone Number <span class="required">*</span></label>
              <input type="tel" id="phone" required placeholder="10-digit mobile number" pattern="[0-9]{10}">
            </div>

            <div class="form-group">
              <label>Gender <span class="required">*</span></label>
              <select id="gender" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="email" placeholder="Optional">
            </div>

            <div class="form-group">
                <label>Aadhar / ID Number <span class="required">*</span></label>
                <input type="text" id="id_proof_number" required placeholder="12-digit Aadhar number" pattern="[0-9]{12}">
            </div>

            <div class="form-group">
                <label>Father / Guardian Name <span class="required">*</span></label>
                <input type="text" id="guardian_name" required placeholder="Full Name">
            </div>

            <div class="form-group">
                <label>Father / Guardian Phone <span class="required">*</span></label>
                <input type="tel" id="guardian_phone" required placeholder="10-digit mobile number" pattern="[0-9]{10}">
            </div>

            <div class="form-group">
                <label>Permanent Address</label>
                <textarea id="permanent_address" placeholder="Enter Full Address" rows="3" style="resize:none;"></textarea>
            </div>

            <button type="submit" id="submitBtn">Submit Registration</button>
          </form>
        </div>
        <div class="success" id="successMsg">
          <div class="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Your details have been securely submitted to the hostel manager.</p>
          <button onclick="window.location.reload()" style="background: #F3F4F6; color: #374151; box-shadow: none; margin-top: 30px;">Register Another</button>
        </div>
      </div>

      <script>
        document.getElementById('regForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = document.getElementById('submitBtn');
          btn.disabled = true;
          btn.innerText = 'Processing...';

          const payload = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            gender: document.getElementById('gender').value,
            id_proof_number: document.getElementById('id_proof_number').value,
            guardian_name: document.getElementById('guardian_name').value,
            guardian_phone: document.getElementById('guardian_phone').value,
            permanent_address: document.getElementById('permanent_address').value
          };

          try {
            const res = await fetch('/api/public/register/${hostelId}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            if(data.success) {
              document.getElementById('recordForm').style.display = 'none';
              document.getElementById('successMsg').style.display = 'block';
              window.scrollTo(0, 0);
            } else {
              alert(data.error || 'Registration failed');
              btn.disabled = false;
              btn.innerText = 'Submit Registration';
            }
          } catch(err) {
            alert('Connection failed. Please check your internet and try again.');
            btn.disabled = false;
            btn.innerText = 'Submit Registration';
          }
        });
      </script>
    </body>
    </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

export const submitRegistration = async (req: Request, res: Response) => {
  const { hostelId } = req.params;
  const {
    first_name, last_name, phone, email,
    gender, id_proof_number, guardian_name,
    guardian_phone, permanent_address
  } = req.body;

  if (!first_name || !phone || !guardian_phone || !id_proof_number) {
    return res.status(400).json({ success: false, error: 'All mandatory fields are required' });
  }

  try {
    const trx = await db.transaction();
    try {
      const aadharType = await trx('id_proof_types').where('name', 'like', '%Aadhar%').first();
      const [studentId] = await trx('students').insert({
        hostel_id: hostelId,
        first_name,
        last_name: last_name || '',
        phone,
        email: email || '',
        gender: gender || 'Other',
        id_proof_type: aadharType ? aadharType.id : null,
        id_proof_number,
        guardian_name,
        guardian_phone,
        permanent_address: permanent_address || '',
        status: 0, // 0 = Inactive
        registration_date: new Date(),
        admission_date: new Date().toISOString().split('T')[0], // Default to today
        admission_fee: 0,
        admission_status: 0,
        monthly_rent: 0,
        created_at: new Date()
      });

      // Record status history
      await trx('student_status_history').insert({
        student_id: studentId,
        hostel_id: hostelId,
        status: 0,
        changed_by: null,
        notes: 'Registered via Public Form (QR Scan)'
      });

      await trx.commit();
      res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Submit Registration Error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit registration. Please ensure all details are correct.' });
  }
};
