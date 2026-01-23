# 🚀 PipelineHQ - CRM Frontend

A modern, full-featured Customer Relationship Management (CRM) system built with React for managing sales leads, tracking pipeline progress, and analyzing sales performance. PipelineHQ helps sales teams organize leads, assign agents, track status, and visualize sales data.

## 🌐 Live Demo

**🔗 [Live Application](https://pipelinehq-crm-frontend.vercel.app/)**

## 📱 Features

### 🏠 Core Functionality

- **Lead Management** - Create, view, update, and delete sales leads
- **Sales Agent Assignment** - Assign leads to specific sales representatives
- **Lead Status Tracking** - Track leads through predefined stages (New, Contacted, Qualified, Proposal Sent, Closed)
- **Priority Management** - Set and manage lead priorities (High, Medium, Low)
- **Tagging System** - Categorize leads with custom tags (e.g., High Value, Follow-up)

### 📊 Views & Organization

- **Lead List View** - Comprehensive list of all leads with filtering options
- **Lead Details** - Detailed view of individual leads with all information
- **Lead Status View** - Group and visualize leads by their current status
- **Sales Agent View** - View leads grouped by assigned sales agent
- **Comments Section** - Add updates and track lead progress with timestamped comments

### 🔍 Advanced Filtering

- **URL-based Filtering** - Filter leads using URL query parameters
  - Filter by Sales Agent: `/leads?salesAgent=John`
  - Filter by Status: `/leads?status=Qualified`
  - Filter by Source: `/leads?source=Referral`
  - Filter by Tags: `/leads?tags=High Value`
  - Filter by Priority: `/leads?priority=High`
  - Combine filters: `/leads?salesAgent=John&status=Proposal Sent`
- **Sorting Options** - Sort by estimated closing date or priority
- **Real-time Updates** - UI updates based on URL query parameters

### 📈 Reports & Visualizations

- **Leads Closed Last Week** - Bar charts showing recently closed deals
- **Total Leads in Pipeline** - Current pipeline count visualization
- **Lead Status Distribution** - Pie chart showing distribution across stages
- **Leads by Sales Agent** - Performance statistics per agent
- **Interactive Charts** - Built with Chart.js for dynamic data visualization

### 🎨 User Experience

- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Intuitive Navigation** - Easy-to-use interface with clear information hierarchy
- **Real-time Feedback** - Toast notifications for user actions
- **Modern UI** - Clean, professional design for business use

## 🛠️ Tech Stack

### Frontend

- **React.js** - UI library
- **React Router** - Client-side routing and URL-based filtering
- **Chart.js** - Data visualization and charts
- **JavaScript (ES6+)** - Programming language
- **HTML5 & CSS3** - Markup and styling

### Deployment

- **Vercel** - Cloud platform for frontend hosting

## 🏗️ Project Structure

```
pipelinehq-crm-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── LeadForm.jsx     # Form for creating/editing leads
│   │   ├── LeadList.jsx     # List view with filtering
│   │   ├── LeadDetails.jsx  # Detailed lead information
│   │   ├── LeadStatusView.jsx    # Status-grouped view
│   │   ├── SalesAgentView.jsx    # Agent-grouped view
│   │   └── Reports.jsx      # Charts and visualizations
│   ├── context/             # React context for state management
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static files
├── package.json             # Frontend dependencies
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pipelinehq-crm-frontend.git
cd pipelinehq-crm-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://pipelinehq-crm-backend.vercel.app
# For local development:
# VITE_API_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📋 Key Components

### LeadForm

- Create new leads with fields:
  - Lead Name
  - Lead Source (Website, Referral, Cold Call)
  - Assigned Sales Agent
  - Lead Status
  - Tags (multi-select)
  - Time to Close (days)
  - Priority (High, Medium, Low)

### LeadList

- Display all leads with filtering by:
  - Sales Agent
  - Lead Status
  - Tags
  - Source
  - Priority
- URL-based filtering
- Sorting by date or priority

### LeadDetails

- Complete lead information display
- Comments section with timestamps
- Update lead status and details
- Reassign sales agents

### LeadStatusView

- Group leads by status
- Filter within status groups
- Quick overview of pipeline stages

### SalesAgentView

- Group leads by assigned agent
- Track agent workload
- Performance monitoring

### Reports

- Visual analytics with Chart.js
- Leads closed last week
- Pipeline statistics
- Status distribution
- Agent performance metrics

## 🎯 Usage Examples

### Filtering Leads

```javascript
// Filter by sales agent
/leads?salesAgent=64c34512f7a60e36df44

// Filter by status
/leads?status=Qualified

// Combine multiple filters
/leads?salesAgent=John&status=Proposal Sent&priority=High
```

### Creating a Lead

1. Navigate to the Lead Form
2. Fill in all required fields
3. Select sales agent from dropdown
4. Add relevant tags
5. Set priority and estimated time to close
6. Submit to create the lead

### Tracking Lead Progress

1. Open Lead Details page
2. Add comments to document interactions
3. Update status as lead progresses
4. Reassign agent if needed
5. Close lead when deal is won/lost

## 👨‍💻 Author

**Pranav Tripathi** - [@aboutpranav](https://github.com/aboutpranav)

## 🔗 Related Repositories

- **Backend API**: [pipelinehq-crm-backend](https://github.com/yourusername/pipelinehq-crm-backend)
- **Live Backend**: [https://pipelinehq-crm-backend.vercel.app/](https://pipelinehq-crm-backend.vercel.app/)

## 📞 Support

If you have any questions or run into issues, please create an issue on GitHub.

---

⭐ If you found this project helpful, please consider giving it a star on GitHub!
