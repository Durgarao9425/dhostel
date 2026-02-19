export interface DocumentationSection {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'success';
}

export interface FeatureDocumentation {
  title: string;
  sections: DocumentationSection[];
}

export const ownerDocumentation: Record<string, FeatureDocumentation> = {
  dashboard: {
    title: 'Owner Dashboard Guide',
    sections: [
      {
        title: 'Welcome to Your Dashboard',
        content: `
          <p>Your dashboard provides a comprehensive overview of your hostel's performance. Here you can monitor:</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Total Rooms:</strong> Number of rooms in your hostel</li>
            <li><strong>Total Students:</strong> Current number of students staying</li>
            <li><strong>Monthly Income:</strong> Revenue generated this month</li>
            <li><strong>Monthly Expenses:</strong> Total expenses for the month</li>
            <li><strong>Occupancy Rate:</strong> Percentage of beds occupied</li>
            <li><strong>Net Profit:</strong> Income minus expenses</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Understanding Your Metrics',
        content: `
          <p><strong>Occupancy Rate:</strong> This shows how many beds are currently occupied. A higher occupancy rate means better utilization of your hostel.</p>
          <p class="mt-2"><strong>Net Profit:</strong> This is calculated as Monthly Income - Monthly Expenses. Monitor this to ensure your hostel is profitable.</p>
        `,
        type: 'success',
      },
      {
        title: 'Quick Actions',
        content: `
          <p>From your dashboard, you can quickly navigate to:</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>Manage Rooms</li>
            <li>Add/View Students</li>
            <li>Collect Fees</li>
            <li>Track Expenses</li>
            <li>Generate Reports</li>
          </ul>
        `,
      },
    ],
  },

  rooms: {
    title: 'Room Management Guide',
    sections: [
      {
        title: 'Managing Your Rooms',
        content: `
          <p>The Rooms page allows you to manage all rooms in your hostel effectively.</p>
          <h4 class="font-semibold mt-3">Key Features:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Add New Room:</strong> Create rooms with specific capacity and rent</li>
            <li><strong>Room Types:</strong> Single, Double, Triple, or Dormitory</li>
            <li><strong>View Occupancy:</strong> See which beds are occupied or available</li>
            <li><strong>Set Rent:</strong> Define rent per bed for each room</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Adding a New Room',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Click on "Add New Room" button</li>
            <li>Enter Room Number (e.g., 101, 102)</li>
            <li>Select Room Type (Single/Double/Triple/Dorm)</li>
            <li>Set Total Capacity (number of beds)</li>
            <li>Set Rent Per Bed (monthly)</li>
            <li>Add amenities if needed (AC, Attached Bathroom, etc.)</li>
            <li>Click "Save" to create the room</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Best Practices',
        content: `
          <ul class="list-disc ml-5 space-y-1">
            <li>Use consistent room numbering (e.g., Floor + Room: 101, 102, 201, 202)</li>
            <li>Keep rent competitive with market rates</li>
            <li>Update room status when maintenance is needed</li>
            <li>Regular inspection ensures better student satisfaction</li>
          </ul>
        `,
        type: 'warning',
      },
    ],
  },

  students: {
    title: 'Student Management Guide',
    sections: [
      {
        title: 'Managing Students',
        content: `
          <p>Track all students staying at your hostel, their room assignments, and payment status.</p>
          <h4 class="font-semibold mt-3">Key Features:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Add New Student:</strong> Register students with personal details</li>
            <li><strong>Room Assignment:</strong> Assign students to available beds</li>
            <li><strong>Fee Status:</strong> Track paid/pending fees</li>
            <li><strong>Contact Information:</strong> Store emergency contacts</li>
            <li><strong>Documents:</strong> Upload ID proof, photos, etc.</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Adding a New Student',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Click "Add New Student" button</li>
            <li>Enter student's full name and contact number</li>
            <li>Add emergency contact details</li>
            <li>Select room and bed number</li>
            <li>Set joining date and advance payment</li>
            <li>Upload ID proof (Aadhar/Passport/Student ID)</li>
            <li>Add parent/guardian information</li>
            <li>Click "Save" to register</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Important Notes',
        content: `
          <ul class="list-disc ml-5 space-y-1">
            <li>Always verify ID proofs before admitting students</li>
            <li>Collect advance payment (typically 1-2 months rent)</li>
            <li>Maintain accurate emergency contact information</li>
            <li>Update checkout dates when students leave</li>
          </ul>
        `,
        type: 'warning',
      },
    ],
  },

  fees: {
    title: 'Fee Management Guide',
    sections: [
      {
        title: 'Fee Collection & Tracking',
        content: `
          <p>Manage monthly rent collection, track payments, and handle pending dues efficiently.</p>
          <h4 class="font-semibold mt-3">Key Features:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Collect Monthly Rent:</strong> Record payments from students</li>
            <li><strong>Payment History:</strong> View all past transactions</li>
            <li><strong>Pending Dues:</strong> Track who needs to pay</li>
            <li><strong>Receipt Generation:</strong> Auto-generate payment receipts</li>
            <li><strong>Payment Methods:</strong> Cash, UPI, Bank Transfer</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Collecting Monthly Rent',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Go to "Fees" section</li>
            <li>Select the student from the list</li>
            <li>Click "Collect Payment"</li>
            <li>Enter amount received</li>
            <li>Select payment method (Cash/UPI/Bank)</li>
            <li>Add payment date</li>
            <li>Add notes if needed (discount, partial payment, etc.)</li>
            <li>Generate and print receipt</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Managing Pending Dues',
        content: `
          <p>The system automatically highlights students with pending dues:</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><span class="text-red-600 font-semibold">Red:</span> Overdue by more than 5 days</li>
            <li><span class="text-yellow-600 font-semibold">Yellow:</span> Due within 3 days</li>
            <li><span class="text-green-600 font-semibold">Green:</span> Paid/No dues</li>
          </ul>
          <p class="mt-2">Send payment reminders to students with pending dues.</p>
        `,
        type: 'warning',
      },
    ],
  },

  expenses: {
    title: 'Expense Management Guide',
    sections: [
      {
        title: 'Tracking Hostel Expenses',
        content: `
          <p>Record and categorize all hostel expenses to maintain accurate financial records.</p>
          <h4 class="font-semibold mt-3">Expense Categories:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Utilities:</strong> Electricity, Water, Gas bills</li>
            <li><strong>Maintenance:</strong> Repairs, cleaning, painting</li>
            <li><strong>Salaries:</strong> Staff wages, cook, cleaner</li>
            <li><strong>Groceries:</strong> Food items for mess</li>
            <li><strong>Supplies:</strong> Toiletries, bedding, furniture</li>
            <li><strong>Other:</strong> Miscellaneous expenses</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Adding an Expense',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Click "Add New Expense"</li>
            <li>Select expense category</li>
            <li>Enter expense description</li>
            <li>Enter amount</li>
            <li>Select date of expense</li>
            <li>Upload bill/receipt (optional but recommended)</li>
            <li>Add notes if needed</li>
            <li>Click "Save"</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Financial Tips',
        content: `
          <ul class="list-disc ml-5 space-y-1">
            <li>Always upload bills/receipts for audit purposes</li>
            <li>Review monthly expenses to identify cost-saving opportunities</li>
            <li>Set monthly budgets for each category</li>
            <li>Compare expenses month-over-month</li>
            <li>Keep emergency fund for unexpected repairs</li>
          </ul>
        `,
        type: 'warning',
      },
    ],
  },

  reports: {
    title: 'Reports & Analytics Guide',
    sections: [
      {
        title: 'Generate Business Reports',
        content: `
          <p>Access detailed reports to analyze your hostel's performance and make informed decisions.</p>
          <h4 class="font-semibold mt-3">Available Reports:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Income Report:</strong> Monthly/Yearly revenue breakdown</li>
            <li><strong>Expense Report:</strong> Category-wise expense analysis</li>
            <li><strong>Profit & Loss:</strong> Net profit/loss for selected period</li>
            <li><strong>Occupancy Report:</strong> Room utilization trends</li>
            <li><strong>Student Report:</strong> Active/Inactive students</li>
            <li><strong>Payment Report:</strong> Collected vs Pending fees</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'How to Generate Reports',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Select report type from dropdown</li>
            <li>Choose date range (This Month, Last Month, Custom)</li>
            <li>Apply filters if needed (Room Type, Payment Status, etc.)</li>
            <li>Click "Generate Report"</li>
            <li>View report on screen</li>
            <li>Download as PDF or Excel</li>
            <li>Print if needed</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Understanding Your Reports',
        content: `
          <p><strong>Income Report:</strong> Shows all fee collections with payment method breakdown.</p>
          <p class="mt-2"><strong>Expense Report:</strong> Categorized expenses with graphs for easy visualization.</p>
          <p class="mt-2"><strong>P&L Statement:</strong> Shows profit margins and helps identify loss-making areas.</p>
          <p class="mt-2">Use these reports for tax filing, loan applications, or investor presentations.</p>
        `,
        type: 'warning',
      },
    ],
  },

  settings: {
    title: 'Settings & Configuration',
    sections: [
      {
        title: 'Manage Your Hostel Settings',
        content: `
          <p>Configure your hostel details, notification preferences, and system settings.</p>
          <h4 class="font-semibold mt-3">Settings Sections:</h4>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Hostel Profile:</strong> Update name, address, contact info</li>
            <li><strong>Owner Profile:</strong> Personal information and credentials</li>
            <li><strong>Notifications:</strong> Email/SMS alert preferences</li>
            <li><strong>Payment Methods:</strong> Configure UPI, Bank details</li>
            <li><strong>Late Fee Rules:</strong> Set penalties for late payments</li>
            <li><strong>Backup & Data:</strong> Export/Import data</li>
          </ul>
        `,
        type: 'info',
      },
      {
        title: 'Updating Your Profile',
        content: `
          <ol class="list-decimal ml-5 space-y-2">
            <li>Go to Settings > Owner Profile</li>
            <li>Click "Edit Profile"</li>
            <li>Update your information</li>
            <li>Change password if needed</li>
            <li>Upload profile photo</li>
            <li>Click "Save Changes"</li>
          </ol>
        `,
        type: 'success',
      },
      {
        title: 'Security Best Practices',
        content: `
          <ul class="list-disc ml-5 space-y-1">
            <li>Use a strong password with letters, numbers, and symbols</li>
            <li>Change your password every 3 months</li>
            <li>Never share your login credentials</li>
            <li>Enable two-factor authentication if available</li>
            <li>Log out when using shared computers</li>
            <li>Regularly backup your data</li>
          </ul>
        `,
        type: 'warning',
      },
    ],
  },
};
