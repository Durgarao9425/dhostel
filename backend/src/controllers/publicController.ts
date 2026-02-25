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
      <title>Registration - ${hostel.hostel_name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8FAFC; padding: 20px; margin: 0; color: #1E293B; }
        .container { max-width: 500px; margin: 0 auto; background: #FFF; padding: 24px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h2 { text-align: center; color: #0F172A; margin-top: 0; }
        p { text-align: center; color: #64748B; margin-bottom: 24px; }
        label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; }
        input { width: 100%; box-sizing: border-box; padding: 12px; margin-bottom: 16px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 16px; }
        button { width: 100%; padding: 14px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
        button:hover { background: #2563EB; }
        .success { display: none; text-align: center; padding: 40px 20px; }
        .success-icon { font-size: 48px; margin-bottom: 16px; }
        #recordForm { display: block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div id="recordForm">
          <h2>Welcome! 👋</h2>
          <p>Register as a tenant at <b>${hostel.hostel_name}</b></p>
          <form id="regForm">
            <label>First Name *</label>
            <input type="text" id="first_name" required placeholder="John">
            
            <label>Last Name</label>
            <input type="text" id="last_name" placeholder="Doe">
            
            <label>Phone Number *</label>
            <input type="tel" id="phone" required placeholder="10-digit mobile number">
            
            <label>Email Address</label>
            <input type="email" id="email" placeholder="Optional">

            <button type="submit" id="submitBtn">Submit Registration</button>
          </form>
        </div>
        <div class="success" id="successMsg">
          <div class="success-icon">🎉</div>
          <h2>Registration Successful</h2>
          <p>Your details have been submitted to the hostel manager.</p>
        </div>
      </div>

      <script>
        document.getElementById('regForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = document.getElementById('submitBtn');
          btn.disabled = true;
          btn.innerText = 'Submitting...';

          try {
            const res = await fetch('/api/public/register/${hostelId}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                first_name: document.getElementById('first_name').value,
                last_name: document.getElementById('last_name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value
              })
            });

            const data = await res.json();
            if(data.success) {
              document.getElementById('recordForm').style.display = 'none';
              document.getElementById('successMsg').style.display = 'block';
            } else {
              alert(data.error || 'Registration failed');
              btn.disabled = false;
              btn.innerText = 'Submit Registration';
            }
          } catch(err) {
            alert('Connection failed. Please try again.');
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
    const { first_name, last_name, phone, email } = req.body;

    if (!first_name || !phone) {
        return res.status(400).json({ success: false, error: 'First name and phone are required' });
    }

    try {
        const trx = await db.transaction();
        try {
            const [studentId] = await trx('students').insert({
                hostel_id: hostelId,
                first_name,
                last_name,
                phone,
                email,
                status: 0, // 0 = Inactive
                registration_date: new Date()
            });

            // Record status history
            await trx('student_status_history').insert({
                student_id: studentId,
                hostel_id: hostelId,
                status: 0,
                changed_by: null,
                notes: 'Registered via Public Form'
            });

            await trx.commit();

            res.status(201).json({ success: true, message: 'Registration successful' });
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Submit Registration Error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit registration' });
    }
};
